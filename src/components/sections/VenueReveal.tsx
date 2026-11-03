import { useEffect, useRef } from 'react';
import { meta, links } from '../../data/conference';
import { href } from '../../utils/routes';
import { gsap } from '../../animations/motion';
import { Eyebrow } from '../shared/Typography';
import { Img } from '../shared/Img';
import { LiquidGlass } from '../glass/LiquidGlass';
import { LiquidButton } from '../buttons/LiquidButton';

/* Venue: pinned campus photograph that opens to full screen as you scroll (reversible scrub) */
export function VenueSection() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: '.venue-pin', start: 'top top', end: '+=120%', scrub: true, pin: true } });
        tl.fromTo('.venue-frame', { clipPath: 'inset(18% 22% 18% 22% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
          .fromTo('.venue-frame img', { scale: 1.35 }, { scale: 1, ease: 'none' }, 0)
          .fromTo('.venue-word', { yPercent: 0, opacity: 1 }, { yPercent: -60, opacity: 0, ease: 'none' }, 0)
          .fromTo('.venue-card', { y: 80, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0.55);
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section className="venue" id="venue" ref={ref} aria-labelledby="venue-title">
      <div className="venue-pin">
        <p className="venue-word" aria-hidden="true">Hyderabad</p>
        <div className="venue-frame">
          <Img src="assets/images/campus-2000.webp" w={2000} h={946} alt="Muffakham Jah College of Engineering and Technology campus building with lawns and a fountain, Banjara Hills, Hyderabad" />
        </div>
        <div className="wrap venue-card-wrap">
          <LiquidGlass tint="frost" className="venue-card" refraction={26} blur={8}>
            <Eyebrow>Venue</Eyebrow>
            <h2 className="venue-name" id="venue-title">{meta.institution}</h2>
            <address>{meta.address}</address>
            <div className="venue-actions">
              <LiquidButton href={links.maps} external size="sm">Open in Google Maps</LiquidButton>
              <a className="link-arrow" href={href('venue')}>Venue &amp; travel →</a>
            </div>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
}
