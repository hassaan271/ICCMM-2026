import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../animations/motion';
import { LiquidGlass } from '../glass/LiquidGlass';
import { RegisterButton } from '../buttons/LiquidButton';

/* Persistent registration capsule (bottom centre): appears after the opening, hides over the footer */
export function FloatingRegister() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const inner = el.firstElementChild as HTMLElement;
    const show = (v: boolean) => {
      gsap.to(el, { autoAlpha: v ? 1 : 0, y: v ? 0 : 24, duration: 0.5, ease: 'power3.out', overwrite: true });
      // liquid entry: a compressed droplet stretches into the capsule
      gsap.fromTo(inner, { scaleX: v ? 0.35 : 1, scaleY: v ? 0.8 : 1 }, { scaleX: v ? 1 : 0.6, scaleY: 1, duration: v ? 0.9 : 0.4, ease: v ? 'elastic.out(1, 0.7)' : 'power2.in', overwrite: true });
    };
    gsap.set(el, { autoAlpha: 0, y: 24 });
    const st = ScrollTrigger.create({
      start: () => window.innerHeight * 0.7,
      endTrigger: '.footer', end: 'top bottom',
      onToggle: (self) => show(self.isActive),
    });
    return () => st.kill();
  }, []);
  return (
    <div className="float-cta" ref={ref}>
      <LiquidGlass className="float-cta-inner" tint="frost" refraction={22} blur={3} bezel={22}>
        <span className="float-cta-meta"><strong>20–21 Nov 2026</strong> · MJCET, Hyderabad</span>
        <RegisterButton size="sm" />
      </LiquidGlass>
    </div>
  );
}
