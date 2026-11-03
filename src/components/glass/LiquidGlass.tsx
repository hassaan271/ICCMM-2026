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
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
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
  return c.toDataURL();
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
    let raf = 0;
    const build = () => {
      raf = 0;
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (w < 4 || h < 4) return;
      const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
      const bz = bezel ?? Math.max(14, Math.min(40, Math.min(w, h) * 0.28));
      setGeo((g) => (g && g.w === w && g.h === h && g.r === r ? g : { w, h, r, map: displacementMap(w, h, r, bz, refraction) }));
    };
    const ro = new ResizeObserver(() => { if (!raf) raf = requestAnimationFrame(build); });
    ro.observe(el);
    build();
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
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
