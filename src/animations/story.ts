// Shared, mutable state for the scroll-driven processor story.
// Written by ScrollTrigger / GSAP, read every frame by the 3D scene. Never stored in React state.

export type Key = {
  p: number; // story progress where this pose is reached (measured from the DOM)
  explode: number; // 0 assembled → 1 fully exploded
  cam: [number, number, number];
  target: [number, number, number];
  rotY: number;
  shift: number; // horizontal screen offset of the model (−0.5…0.5 of width)
  dark: number; // 0 light stage → 1 dark stage
  focus: string; // layer to highlight
  lift?: number; // extra rise of the lid and TIM so the die can be seen from above
};

// Poses, one per chapter. `p` values are replaced at runtime from chapter positions.
export const keys: Key[] = [
  { p: 0, explode: 0, cam: [6.4, 5.2, 8.0], target: [0, 0.2, 0], rotY: -0.55, shift: 0.24, dark: 0, focus: '' },
  { p: 0.2, explode: 0.32, cam: [6.0, 5.0, 7.2], target: [0, 0.7, 0], rotY: -0.15, shift: -0.17, dark: 0, focus: 'ihs' },
  { p: 0.4, explode: 0.85, cam: [5.0, 2.8, 6.2], target: [0, 1.0, 0], rotY: 0.35, shift: 0.22, dark: 0.15, focus: 'interconnect' },
  { p: 0.6, explode: 1, cam: [2.9, 5.4, 4.6], target: [0, 1.45, 0], rotY: 0.62, shift: -0.17, dark: 1, focus: 'die', lift: 2.2 },
  { p: 0.8, explode: 1, cam: [6.0, 1.3, 5.0], target: [0, -0.1, 0], rotY: 1.15, shift: 0.22, dark: 1, focus: 'substrate' },
  { p: 1, explode: 0.04, cam: [7.2, 5.6, 8.6], target: [0, 0.2, 0], rotY: 1.9, shift: -0.2, dark: 0, focus: '' },
];

export const story = {
  progress: 0, // 0…1 through the story container
  intro: 0, // 0…1 opening sequence
  visible: true,
  mobile: false,
  reduced: false,
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Interpolated pose for a given progress (deterministic, so scrolling back reverses exactly)
export function poseAt(p: number) {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].p) i++;
  const a = keys[i], b = keys[i + 1];
  const t = smooth(Math.min(1, Math.max(0, (p - a.p) / Math.max(1e-4, b.p - a.p))));
  return {
    explode: lerp(a.explode, b.explode, t),
    cam: a.cam.map((v, j) => lerp(v, b.cam[j], t)) as [number, number, number],
    target: a.target.map((v, j) => lerp(v, b.target[j], t)) as [number, number, number],
    rotY: lerp(a.rotY, b.rotY, t),
    shift: lerp(a.shift, b.shift, t),
    dark: lerp(a.dark, b.dark, t),
    focus: t < 0.5 ? a.focus : b.focus,
    lift: lerp(a.lift ?? 0, b.lift ?? 0, t),
  };
}
