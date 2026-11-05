// Optical liquid glass: the single glass material used across the site.
//
// With `refraction > 0` (and a Chromium browser) the backdrop is bent by an SVG displacement filter whose
// map is generated from the element's own rounded-rect shape: the centre stays almost flat and the
// displacement rises steeply across a convex rim, so lines behind the glass curve at the edge like a lens.
// With `refraction = 0`, or in other browsers, the same material renders without the lens (blur, rim,
// specular highlight), so every glass surface shares one look.
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type GlassTint = 'clear' | 'frost' | 'light' | 'dark';

let refractionSupported: boolean | null = null;
export function supportsRefraction() {
  if (refractionSupported !== null) return refractionSupported;
  if (typeof window === 'undefined') return (refractionSupported = false);
  // SVG filters inside backdrop-filter render only in Chromium-based browsers
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands ?? [];
  const chromium = brands.some((b) => /Chromium/.test(b.brand));
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  refractionSupported = chromium && !coarse && !reduced && CSS.supports('backdrop-filter', 'url(#x)');
  if (refractionSupported) document.documentElement.classList.add('lg-refract');
  return refractionSupported;
}

// One shared <svg> holds every glass filter
let defsHost: SVGSVGElement | null = null;
function getDefsHost() {
  if (!defsHost) {
    defsHost = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    defsHost.setAttribute('aria-hidden', 'true');
    defsHost.setAttribute('width', '0');
    defsHost.setAttribute('height', '0');
    defsHost.style.position = 'absolute';
    document.body.appendChild(defsHost);
  }
  return defsHost;
}

/* Displacement map for a w×h rounded rectangle with corner radius r.
   Red/green encode x/y offsets (128 = none). Offsets point inward along the surface normal and grow
   with a convex profile across the bezel, so the rim magnifies and bends what lies behind it. */
function displacementMap(w: number, h: number, r: number, bezel: number, maxPx: number) {
  const s = 0.5; // half resolution is plenty; the filter scales it up
  const W = Math.max(2, Math.round(w * s)), H = Math.max(2, Math.round(h * s));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const hx = w / 2, hy = h / 2, rr = Math.min(r, hx, hy);
  // The flat centre has no displacement, so only the rim band (plus the rounded corners) is computed
  new Uint32Array(img.data.buffer).fill(0xff808080); // RGBA 128,128,128,255 (little-endian)
  const band = Math.ceil((bezel + 2) * s), corner = Math.ceil((rr + 2) * s);
  for (let j = 0; j < H; j++) {
    const edgeRow = j < Math.max(band, corner) || j >= H - Math.max(band, corner);
    for (let i = 0; i < W; i++) {
      if (!edgeRow && i >= band && i < W - band) { i = W - band - 1; continue; }
      const px = (i + 0.5) / s - hx, py = (j + 0.5) / s - hy;
      const qx = Math.abs(px) - (hx - rr), qy = Math.abs(py) - (hy - rr);
      // signed distance (negative inside) and outward normal of the rounded rect
      const dist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rr;
      let nx = 0, ny = 0;
      if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy) || 1; nx = (qx / l) * Math.sign(px); ny = (qy / l) * Math.sign(py); }
      else if (qx > qy) nx = Math.sign(px); else ny = Math.sign(py);
      const inside = -dist;
      let m = 0;
      if (inside > 0 && inside < bezel) m = Math.pow(1 - inside / bezel, 2.4) * maxPx; // flat centre, steep rim
      else if (inside <= 0) m = maxPx;
      const k = (j * W + i) * 4;
      img.data[k] = 128 - ((nx * m) / (2 * maxPx)) * 255;
      img.data[k + 1] = 128 - ((ny * m) / (2 * maxPx)) * 255;
      img.data[k + 2] = 128;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // Encoded off the main thread (toBlob is async; toDataURL would block while it compresses)
  return new Promise<string | null>((res) => c.toBlob((b) => res(b ? URL.createObjectURL(b) : null)));
}

/* Map builds are queued and run one at a time in idle periods, so mounting a page full of glass never
   blocks the first paint or the intro animation. Until its map is ready a panel renders without the lens. */
const queue: (() => void)[] = [];
let pumping = false;
const idle = (cb: (d?: IdleDeadline) => void) =>
  typeof requestIdleCallback === 'function' ? requestIdleCallback(cb, { timeout: 600 }) : setTimeout(() => cb(), 32);
function pump(deadline?: IdleDeadline) {
  pumping = true;
  const t0 = performance.now();
  // One map at minimum per slice, more while the idle period lasts
  do { queue.shift()?.(); } while (queue.length && (deadline ? deadline.timeRemaining() > 8 : performance.now() - t0 < 8));
  if (queue.length) idle(pump); else pumping = false;
}
function schedule(task: () => void) {
  queue.push(task);
  if (!pumping) { pumping = true; idle(pump); }
  return () => { const i = queue.indexOf(task); if (i >= 0) queue.splice(i, 1); };
}

type Props = {
  as?: ElementType;
  tint?: GlassTint;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** maximum lens displacement at the rim in px; 0 renders the same material without the lens */
  refraction?: number;
  /** width of the curved rim in px (default: 28% of the short side, 14–40px) */
  bezel?: number;
  /** blur of the backdrop inside the glass (px) */
  blur?: number;
} & Record<string, unknown>;

export function LiquidGlass({ as: Tag = 'div', tint = 'frost', className = '', style, children, refraction = 0, bezel, blur = 3, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const id = 'lg' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [geo, setGeo] = useState<{ w: number; h: number; r: number; map: string } | null>(null);
  const [on, setOn] = useState(false);

  useLayoutEffect(() => { setOn(refraction > 0 && supportsRefraction()); }, [refraction]);

  useEffect(() => {
    if (!on || !ref.current) return;
    const el = ref.current;
    let cancel = () => {};
    let near = false, live = true;
    let last = { w: 0, h: 0, r: -1 };
    const build = () => {
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (w < 4 || h < 4) return;
      const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
      const bz = bezel ?? Math.max(14, Math.min(40, Math.min(w, h) * 0.28));
      if (last.w === w && last.h === h && last.r === r) return;
      last = { w, h, r };
      displacementMap(w, h, r, bz, refraction).then((map) => {
        if (!live || !map) { if (map) URL.revokeObjectURL(map); return; }
        if (last.w !== w || last.h !== h || last.r !== r) { URL.revokeObjectURL(map); return; } // superseded by a resize
        setGeo((g) => { if (g) setTimeout(() => URL.revokeObjectURL(g.map), 1000); return { w, h, r, map }; });
      });
    };
    const request = () => { if (!near) return; cancel(); cancel = schedule(build); };
    // Only panels on or near the screen get a map; the rest are built as they scroll into range
    const io = new IntersectionObserver(([e]) => { near = e.isIntersecting; if (near) request(); }, { rootMargin: '50% 0px' });
    const ro = new ResizeObserver(request);
    io.observe(el);
    ro.observe(el);
    return () => { live = false; io.disconnect(); ro.disconnect(); cancel(); };
  }, [on, bezel, refraction]);

  const lens = on && geo;
  return (
    <>
      <Tag ref={ref} className={`lg lg--${tint}${lens ? ' lg--refract' : ''} ${className}`} style={lens ? { ...style, ['--lg-filter' as string]: `url(#${id})` } : style} {...rest}>
        <span className="lg-rim" aria-hidden="true" />
        <span className="lg-spec" aria-hidden="true" />
        {children}
      </Tag>
      {lens && createPortal(
        <filter id={id} x="0" y="0" width={geo.w} height={geo.h} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="soft" />
          <feImage href={geo.map} x="0" y="0" width={geo.w} height={geo.h} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="soft" in2="map" scale={refraction * 2} xChannelSelector="R" yChannelSelector="G" result="bent" />
          <feColorMatrix in="bent" type="saturate" values={tint === 'dark' ? '1.1' : '1.35'} />
        </filter>,
        getDefsHost()
      )}
    </>
  );
}
