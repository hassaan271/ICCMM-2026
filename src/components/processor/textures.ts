// Procedural surface maps for the processor. Everything is generated at runtime on <canvas>,
// so the model ships without downloading texture files.
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';

type Ctx = CanvasRenderingContext2D;
const canvas = (w: number, h = w) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d', { willReadFrequently: true })!] as const;
};
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const tex = (c: HTMLCanvasElement, srgb = false, aniso = 8): Texture => {
  const t = new CanvasTexture(c);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.anisotropy = aniso;
  return t;
};

// Height map (grayscale canvas) → tangent-space normal map (Sobel)
function normalFromHeight(src: HTMLCanvasElement, strength = 2) {
  const w = src.width, h = src.height;
  const s = src.getContext('2d')!.getImageData(0, 0, w, h).data;
  const [c, ctx] = canvas(w, h);
  const out = ctx.createImageData(w, h);
  const H = (x: number, y: number) => s[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      out.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return c;
}

/* ───────── Silicon die: a plausible multi-core floorplan ───────── */
export function dieMaps(size: number) {
  const W = size, H = Math.round(size * (1.5 / 2.2));
  const [cc, c] = canvas(W, H); // colour
  const [hc, h] = canvas(W, H); // height
  const [rc, r] = canvas(W, H); // roughness (g channel)
  const rand = rng(7);
  const k = W / 1000;

  c.fillStyle = '#20262c'; c.fillRect(0, 0, W, H);
  h.fillStyle = '#404040'; h.fillRect(0, 0, W, H);
  r.fillStyle = 'rgb(0,120,0)'; r.fillRect(0, 0, W, H);

  const block = (x: number, y: number, w: number, hh: number, col: string, hv: number, rough: number) => {
    c.fillStyle = col; c.fillRect(x * k, y * k, w * k, hh * k);
    h.fillStyle = `rgb(${hv},${hv},${hv})`; h.fillRect(x * k, y * k, w * k, hh * k);
    r.fillStyle = `rgb(0,${rough},0)`; r.fillRect(x * k, y * k, w * k, hh * k);
  };
  // SRAM arrays: dense banding at two pitches
  const sram = (x: number, y: number, w: number, hh: number, tint = '#2f4050') => {
    block(x, y, w, hh, tint, 150, 70);
    const pitch = Math.max(1, 2.2 * k);
    for (let yy = y * k; yy < (y + hh) * k; yy += pitch * 2) {
      c.fillStyle = 'rgba(190,214,230,0.10)'; c.fillRect(x * k, yy, w * k, pitch);
      h.fillStyle = 'rgba(255,255,255,0.35)'; h.fillRect(x * k, yy, w * k, pitch);
    }
    const sub = 24;
    for (let xx = x; xx < x + w; xx += sub) {
      c.fillStyle = 'rgba(10,20,28,0.45)'; c.fillRect(xx * k, y * k, 1.2 * k, hh * k);
      h.fillStyle = '#202020'; h.fillRect(xx * k, y * k, 1.2 * k, hh * k);
    }
  };
  // Standard-cell logic: fine rows with random density
  const logic = (x: number, y: number, w: number, hh: number) => {
    block(x, y, w, hh, '#353d45', 110, 140);
    const row = 3.2 * k;
    for (let yy = y * k; yy < (y + hh) * k; yy += row) {
      for (let xx = x * k; xx < (x + w) * k;) {
        const cw = (2 + rand() * 9) * k;
        const v = 40 + rand() * 40;
        c.fillStyle = `rgba(${v + 20},${v + 32},${v + 44},0.9)`; c.fillRect(xx, yy, cw - 0.6 * k, row - 0.8 * k);
        h.fillStyle = `rgb(${90 + rand() * 60},${90},${90})`; h.fillRect(xx, yy, cw - 0.6 * k, row - 0.8 * k);
        xx += cw;
      }
    }
  };
  const outline = (x: number, y: number, w: number, hh: number) => {
    c.strokeStyle = 'rgba(200,215,226,0.28)'; c.lineWidth = 1.4 * k; c.strokeRect(x * k, y * k, w * k, hh * k);
    h.strokeStyle = '#e0e0e0'; h.lineWidth = 1.6 * k; h.strokeRect(x * k, y * k, w * k, hh * k);
  };

  // 8 cores (2 × 4) around a shared last-level cache, IO and memory controllers on the edges
  const margin = 40, coreW = 205, coreH = 230, gap = 14;
  const cacheY = margin + coreH + gap;
  const cacheH = (H / k) - 2 * (margin + coreH + gap);
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 4; i++) {
      const x = margin + 60 + i * (coreW + gap);
      const y = row === 0 ? margin : (H / k) - margin - coreH;
      logic(x, y, coreW, coreH);
      // L1/L2 inside each core
      const l2y = row === 0 ? y + coreH - 78 : y + 8;
      sram(x + 8, l2y, coreW - 16, 70, '#2c3d4c');
      sram(x + 10, row === 0 ? y + 12 : y + coreH - 52, 60, 40, '#33465a');
      sram(x + 80, row === 0 ? y + 12 : y + coreH - 52, 60, 40, '#33465a');
      // register file / execution clusters
      block(x + 150, row === 0 ? y + 20 : y + coreH - 110, 44, 90, '#3e4750', 170, 160);
      outline(x, y, coreW, coreH);
    }
  }
  // last-level cache slices
  for (let i = 0; i < 8; i++) {
    const x = margin + 60 + i * ((4 * (coreW + gap) - gap) / 8);
    sram(x + 2, cacheY, (4 * (coreW + gap) - gap) / 8 - 6, cacheH, i % 2 ? '#2b3c4b' : '#2e4253');
  }
  outline(margin + 60, cacheY, 4 * (coreW + gap) - gap, cacheH);
  // memory controller / PHY strips (left and right)
  logic(margin - 20, margin, 64, (H / k) - 2 * margin);
  logic(1000 - margin - 44 - 10, margin, 64, (H / k) - 2 * margin);
  for (let yy = margin + 6; yy < (H / k) - margin; yy += 18) {
    block(margin - 16, yy, 56, 10, '#4b5560', 190, 90);
    block(1000 - margin - 50, yy, 56, 10, '#4b5560', 190, 90);
  }
  // seal ring + scribe line
  c.strokeStyle = 'rgba(205,218,228,0.55)'; c.lineWidth = 3 * k; c.strokeRect(10 * k, 10 * k, W - 20 * k, H - 20 * k);
  h.strokeStyle = '#ffffff'; h.lineWidth = 4 * k; h.strokeRect(10 * k, 10 * k, W - 20 * k, H - 20 * k);
  // alignment marks
  c.fillStyle = 'rgba(214,226,235,0.7)';
  [[22, 22], [978, 22], [22, H / k - 22], [978, H / k - 22]].forEach(([x, y]) => { c.fillRect((x - 6) * k, (y - 1) * k, 12 * k, 2 * k); c.fillRect((x - 1) * k, (y - 6) * k, 2 * k, 12 * k); });

  return { map: tex(cc, true), normalMap: tex(normalFromHeight(hc, 3)), roughnessMap: tex(rc) };
}

/* ───────── Package substrate (top face): dark laminate, fan-out routing, capacitor land ───────── */
export function substrateMaps(size: number, label: string) {
  const [cc, c] = canvas(size);
  const [hc, h] = canvas(size);
  const k = size / 4; // world units → px (substrate is 4 × 4)
  const P = (u: number) => (u + 2) * k;
  const rand = rng(23);
  c.fillStyle = '#1a2126'; c.fillRect(0, 0, size, size);
  h.fillStyle = '#505050'; h.fillRect(0, 0, size, size);
  // glass-weave texture
  for (let i = 0; i < size; i += 3) {
    c.fillStyle = `rgba(255,255,255,${0.012 + rand() * 0.012})`; c.fillRect(i, 0, 1, size); c.fillRect(0, i, size, 1);
  }
  // fan-out traces from the die shadow to the edges
  c.lineCap = 'round';
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < 46; i++) {
      const o = -1.0 + (2.0 * i) / 45;
      const pts: [number, number][] = [[1.25, o * 0.7], [1.45, o * 0.7], [1.45 + Math.abs(o) * 0.25, o * 0.95], [1.92, o * 0.95]];
      const rot = (side * Math.PI) / 2;
      const tp = pts.map(([u, v]) => [Math.cos(rot) * u - Math.sin(rot) * v, Math.sin(rot) * u + Math.cos(rot) * v]);
      [c, h].forEach((ctx, j) => {
        ctx.strokeStyle = j ? '#9a9a9a' : 'rgba(150,170,184,0.26)';
        ctx.lineWidth = 0.006 * k * 4;
        ctx.beginPath(); tp.forEach(([x, y], n) => (n ? ctx.lineTo(P(x), P(y)) : ctx.moveTo(P(x), P(y)))); ctx.stroke();
      });
    }
  }
  // capacitor land patterns and vias
  for (let i = 0; i < 420; i++) {
    const x = -1.85 + rand() * 3.7, y = -1.85 + rand() * 3.7;
    if (Math.abs(x) < 1.3 && Math.abs(y) < 1.0) continue;
    c.fillStyle = 'rgba(170,186,198,0.35)'; c.beginPath(); c.arc(P(x), P(y), 0.012 * k, 0, Math.PI * 2); c.fill();
  }
  // die keep-out outline and pin-1 triangle
  c.strokeStyle = 'rgba(180,196,208,0.35)'; c.lineWidth = 0.008 * k;
  c.strokeRect(P(-1.2), P(-0.86), 2.4 * k, 1.72 * k);
  c.fillStyle = 'rgba(220,228,234,0.75)'; c.beginPath(); c.moveTo(P(-1.88), P(-1.88)); c.lineTo(P(-1.66), P(-1.88)); c.lineTo(P(-1.88), P(-1.66)); c.fill();
  // silkscreen marking
  c.fillStyle = 'rgba(214,224,232,0.6)';
  c.font = `600 ${0.075 * k}px Inter, Arial, sans-serif`;
  c.fillText(label, P(-1.84), P(1.86));
  return { map: tex(cc, true), normalMap: tex(normalFromHeight(hc, 1.5)) };
}

/* ───────── Nickel-plated heat spreader: brushed finish + laser marking ───────── */
export function ihsMaps(size: number) {
  const [rc, r] = canvas(size); // roughness
  const [mc, m] = canvas(size); // albedo (etched marking darker)
  const [hc, h] = canvas(size); // micro-scratch height
  const rand = rng(91);
  r.fillStyle = 'rgb(0,80,0)'; r.fillRect(0, 0, size, size);
  h.fillStyle = '#808080'; h.fillRect(0, 0, size, size);
  // concentric lapping marks
  const cx = size / 2;
  for (let i = 0; i < 900; i++) {
    const rad = rand() * size * 0.75;
    const a0 = rand() * Math.PI * 2;
    const g = 60 + rand() * 50;
    r.strokeStyle = `rgba(0,${g},0,0.35)`; r.lineWidth = 0.6 + rand();
    r.beginPath(); r.arc(cx, cx, rad, a0, a0 + 0.2 + rand() * 1.4); r.stroke();
    h.strokeStyle = `rgba(${rand() > 0.5 ? 255 : 0},0,0,0.06)`; h.lineWidth = 0.8;
    h.beginPath(); h.arc(cx, cx, rad, a0, a0 + 0.2 + rand() * 1.4); h.stroke();
  }
  m.fillStyle = '#ffffff'; m.fillRect(0, 0, size, size);
  // laser-etched marking (top plateau spans ~ the centre 80%)
  const k = size / 1000;
  m.fillStyle = 'rgba(70,78,86,0.55)'; r.fillStyle = 'rgb(0,175,0)';
  const text = (t: string, x: number, y: number, px: number, w = 600, f = 'Inter, Arial') => {
    m.font = `${w} ${px * k}px ${f}`; r.font = m.font;
    m.fillText(t, x * k, y * k); r.fillText(t, x * k, y * k);
  };
  text('ICCMM-26', 190, 400, 66, 700);
  text('IEEE Conference ID 66375', 190, 460, 30, 500);
  const map = tex(mc, true), roughnessMap = tex(rc), normalMap = tex(normalFromHeight(hc, 1));
  return { map, roughnessMap, normalMap };
}

/* ───────── Interconnect (BEOL) metal layer: Manhattan routing on transparent ───────── */
export function interconnectMap(size: number, seed: number, horizontal: boolean) {
  const [cc, c] = canvas(size, Math.round(size * (1.7 / 2.4)));
  const rand = rng(seed);
  const W = cc.width, H = cc.height;
  c.clearRect(0, 0, W, H);
  c.lineCap = 'square';
  const tracks = 140;
  for (let i = 0; i < tracks; i++) {
    const pos = ((i + 0.5) / tracks) * (horizontal ? H : W);
    let t = 0;
    while (t < (horizontal ? W : H)) {
      const len = 20 + rand() * 180;
      if (rand() > 0.28) {
        c.strokeStyle = `rgba(255,255,255,${0.55 + rand() * 0.45})`;
        c.lineWidth = rand() > 0.9 ? 3 : 1.6;
        c.beginPath();
        if (horizontal) { c.moveTo(t, pos); c.lineTo(t + len, pos); } else { c.moveTo(pos, t); c.lineTo(pos, t + len); }
        c.stroke();
        if (rand() > 0.6) { c.fillStyle = '#fff'; horizontal ? c.fillRect(t + len - 2, pos - 2, 4, 4) : c.fillRect(pos - 2, t + len - 2, 4, 4); }
      }
      t += len + 6 + rand() * 30;
    }
  }
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 6; c.strokeRect(3, 3, W - 6, H - 6);
  return tex(cc);
}

/* ───────── Solder TIM: soft mottled metal ───────── */
export function timMaps(size: number) {
  const [hc, h] = canvas(size);
  const rand = rng(5);
  h.fillStyle = '#808080'; h.fillRect(0, 0, size, size);
  for (let i = 0; i < 2600; i++) {
    const v = rand() > 0.5 ? 255 : 0;
    h.fillStyle = `rgba(${v},${v},${v},0.06)`;
    h.beginPath(); h.arc(rand() * size, rand() * size, 2 + rand() * 14, 0, Math.PI * 2); h.fill();
  }
  const n = tex(normalFromHeight(hc, 2.5));
  n.wrapS = n.wrapT = RepeatWrapping;
  return { normalMap: n };
}

export type { Ctx };
