import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, finePointer } from '../../animations/motion';
import { links } from '../../data/conference';
import { LiquidGlass } from '../glass/LiquidGlass';
import { ArrowIcon } from '../shared/Icons';

/* Buttons share one shape and motion:
   primary      blue capsule with a convex highlight; the fill floods from the cursor's entry point
   glass        clear liquid-glass capsule (lens refraction where supported)
   light        white capsule for the blue registration band
   ghost-light  outline capsule for the blue registration band
   All are magnetic toward the cursor and press down on click. */
export type ButtonVariant = 'primary' | 'glass' | 'light' | 'ghost-light';
type BtnProps = { href: string; children: ReactNode; variant?: ButtonVariant; size?: 'sm' | ''; external?: boolean; className?: string };

export function LiquidButton({ href: url, children, variant = 'primary', size = '', external = false, className = '' }: BtnProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer()) return;
    const qx = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    const blob = el.querySelector<HTMLElement>('.lq-blob');
    const bx = blob ? gsap.quickTo(blob, 'x', { duration: 0.45, ease: 'power3.out' }) : () => {};
    const by = blob ? gsap.quickTo(blob, 'y', { duration: 0.45, ease: 'power3.out' }) : () => {};
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const lx = e.clientX - r.left, ly = e.clientY - r.top;
      qx((lx - r.width / 2) * 0.22);
      qy((ly - r.height / 2) * 0.32);
      bx(lx); by(ly);
    };
    const enter = (e: PointerEvent) => { const r = el.getBoundingClientRect(); if (blob) gsap.set(blob, { x: e.clientX - r.left, y: e.clientY - r.top }); };
    const leave = () => { qx(0); qy(0); };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointerenter', enter); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, []);
  const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a ref={ref} className={`lbtn lbtn--${variant}${size ? ' lbtn--' + size : ''} ${className}`} href={url} {...ext}>
      {variant === 'glass'
        ? <LiquidGlass as="span" className="lq-glass" tint="clear" refraction={9} blur={1.5} aria-hidden="true" />
        : <span className="lq" aria-hidden="true"><span className="lq-base" /><span className="lq-blob" /></span>}
      <span className="lbtn-label">{children}</span>
      <ArrowIcon external={external} />
    </a>
  );
}

// Registration CTA: opens the official Google Form in a new tab
export const RegisterButton = ({ variant = 'primary', size = '', children = 'Register Now' }: { variant?: ButtonVariant; size?: BtnProps['size']; children?: ReactNode }) =>
  <LiquidButton href={links.registrationForm} variant={variant} size={size} external>{children}</LiquidButton>;
