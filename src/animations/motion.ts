import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const isCoarse = () => window.matchMedia('(pointer: coarse)').matches;
export const isMobile = () => isCoarse() || window.matchMedia('(max-width: 760px)').matches;

/* ───────── Smooth scrolling ───────── */
let lenis: Lenis | null = null;
export function initSmoothScroll() {
  if (lenis || prefersReduced() || isCoarse()) return lenis;
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
export const getLenis = () => lenis;
export function scrollToTarget(target: HTMLElement | number, offset = -88) {
  if (lenis) lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: prefersReduced() ? 'auto' : 'smooth' });
  else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: prefersReduced() ? 'auto' : 'smooth' });
}
export const lockScroll = (lock: boolean) => (lock ? lenis?.stop() : lenis?.start());

/* ───────── Shared pointer (normalised −1…1), read by the 3D scene and parallax layers ───────── */
export const pointer = { x: 0, y: 0, lastMove: 0, active: false };
let pointerBound = false;
export function initPointer() {
  if (pointerBound) return;
  pointerBound = true;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.lastMove = performance.now();
    pointer.active = true;
  }, { passive: true });
}

/* ───────── DOM-level effects applied after each page renders ───────── */
export function initReveals(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => el.querySelectorAll<HTMLElement>('.sw-i').forEach((w, i) => w.style.setProperty('--i', String(i))));
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const sibs = [...(el.parentElement?.children ?? [])].filter((c) => c.hasAttribute('data-reveal'));
    const idx = sibs.indexOf(el);
    if (idx > 0) el.style.setProperty('--d', `${Math.min(idx, 8) * 70}ms`);
  });
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  );
  root.querySelectorAll('[data-reveal], [data-split], [data-blur-reveal], .cfp-track').forEach((el) => io.observe(el));
  return () => io.disconnect();
}

// Liquid glass lighting follows the cursor: the rim light turns toward it (--la) and the specular lobe
// tracks it near the surface (--gx/--gy). Only glass currently on screen is measured; no React state.
export function initGlassHighlights() {
  if (!finePointer()) return () => {};
  const visible = new Set<HTMLElement>();
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) visible.add(en.target as HTMLElement); else visible.delete(en.target as HTMLElement);
  }));
  const scan = () => document.querySelectorAll<HTMLElement>('.lg').forEach((el) => io.observe(el));
  scan();
  const mo = new MutationObserver(scan);
  mo.observe(document.body, { childList: true, subtree: true });
  let raf = 0;
  let last: PointerEvent | null = null;
  const apply = () => {
    raf = 0;
    const e = last!;
    visible.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const ang = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
      el.style.setProperty('--la', `${ang.toFixed(1)}deg`);
      if (e.clientX >= r.left - 60 && e.clientX <= r.right + 60 && e.clientY >= r.top - 60 && e.clientY <= r.bottom + 60) {
        el.style.setProperty('--gx', `${e.clientX - r.left}px`);
        el.style.setProperty('--gy', `${e.clientY - r.top}px`);
      }
    });
  };
  const onMove = (e: PointerEvent) => { last = e; if (!raf) raf = requestAnimationFrame(apply); };
  window.addEventListener('pointermove', onMove, { passive: true });
  return () => { window.removeEventListener('pointermove', onMove); io.disconnect(); mo.disconnect(); };
}

export function initTilt(root: ParentNode = document) {
  if (!finePointer()) return;
  root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    if (el.dataset.tiltBound) return;
    el.dataset.tiltBound = '1';
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3' });
    gsap.set(el, { transformPerspective: 1000 });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 8);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

// Cursor depth parallax for decorative layers: [data-depth="0.5"] moves further than 0.1
export function initDepthParallax(root: ParentNode = document) {
  if (!finePointer()) return;
  const layers = [...root.querySelectorAll<HTMLElement>('[data-depth]')].map((el) => ({
    x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
    y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
    d: Number(el.dataset.depth) * 90,
  }));
  if (!layers.length) return;
  const onMove = (e: PointerEvent) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    layers.forEach((l) => { l.x(-nx * l.d); l.y(-ny * l.d); });
  };
  window.addEventListener('pointermove', onMove, { passive: true });
}

export function initClipReveals(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-clip-reveal]').forEach((el) => {
    gsap.fromTo(el, { '--clip': '8%', '--clip-r': '48px' }, {
      '--clip': '0%', '--clip-r': '0px', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 20%', scrub: true },
    });
  });
  root.querySelectorAll<HTMLElement>('[data-parallax] img').forEach((im) => {
    gsap.fromTo(im, { yPercent: -10, scale: 1.12 }, {
      yPercent: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: im.closest('[data-parallax]'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

export function initCounters(root: ParentNode = document) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target as HTMLElement;
    const end = Number(el.dataset.counter);
    const o = { v: el.dataset.raw === '1' ? end - 600 : 0 };
    gsap.to(o, { v: end, duration: 2, ease: 'expo.out', onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
  }), { threshold: 0.5 });
  root.querySelectorAll('[data-counter]').forEach((el) => io.observe(el));
}
