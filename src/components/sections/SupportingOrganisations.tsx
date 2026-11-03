import { useEffect, useRef, useState } from 'react';
import { supporters, ieeeGallery, organizers } from '../../data/conference';
import { href } from '../../utils/routes';
import { gsap, ScrollTrigger, finePointer } from '../../animations/motion';
import { Eyebrow, Heading } from '../shared/Typography';
import { Img } from '../shared/Img';
import { GlassPanel } from '../glass/GlassPanel';
import { LiquidButton } from '../buttons/LiquidButton';

/* Supporting organisations, host institution and technical sponsor, IEEE student branch gallery */
export function SupportingOrganisations() {
  const rail = useRef<HTMLUListElement>(null);
  const [openOrg, setOpenOrg] = useState<string | null>(null);
  useEffect(() => {
    const el = rail.current!;
    // Gallery drifts sideways with vertical scroll; drag to browse on desktop
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { x: 0 }, { x: () => -(el.scrollWidth - el.clientWidth) * 0.5, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
    if (!finePointer()) return () => ctx.revert();
    let down = false, sx = 0, sl = 0;
    const pd = (e: PointerEvent) => { down = true; sx = e.clientX; sl = el.parentElement!.scrollLeft; el.classList.add('is-drag'); };
    const pu = () => { down = false; el.classList.remove('is-drag'); };
    const pm = (e: PointerEvent) => { if (down) el.parentElement!.scrollLeft = sl - (e.clientX - sx); };
    el.addEventListener('pointerdown', pd); window.addEventListener('pointerup', pu); el.addEventListener('pointermove', pm);
    return () => { ctx.revert(); el.removeEventListener('pointerdown', pd); window.removeEventListener('pointerup', pu); el.removeEventListener('pointermove', pm); };
  }, []);
  return (
    <section className="section orgs" id="organizers" aria-labelledby="orgs-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <Eyebrow>Sponsors &amp; supporting organisations</Eyebrow>
            <Heading text="Supporting" accent="organisations." id="orgs-title" />
          </div>
          <div data-reveal=""><LiquidButton href={href('sponsors')} variant="glass">Sponsorship categories</LiquidButton></div>
        </div>
        <ul className="sup-grid">
          {supporters.map((s) => (
            <GlassPanel kind="light" as="li" className="sup" key={s.name} data-reveal="" data-tilt="">
              <span className="sup-role label">{s.role}</span>
              <span className={`sup-logo${'dark' in s && s.dark ? ' sup-logo--dark' : ''}`}><img src={s.logo} width={s.w} height={s.h} alt={`${s.name} logo`} loading="lazy" /></span>
              <span className="sup-name">{s.name}</span>
            </GlassPanel>
          ))}
        </ul>
        <div className="org-duo">
          {[organizers.mjcet, organizers.ieee].map((o) => {
            const open = openOrg === o.name;
            return (
              <GlassPanel kind="light" as="article" className="orgcard" key={o.name} data-reveal="">
                <p className="label">{o === organizers.mjcet ? 'Host institution' : 'Technical sponsor'}</p>
                <h3 className="orgcard-name">{(o as { fullName?: string }).fullName ?? o.name}</h3>
                <div className="orgcard-marks">{o.marks.map((m) => <div key={m.label}><span className="orgcard-v">{m.value}</span><span className="orgcard-l">{m.label}</span></div>)}</div>
                <p className="orgcard-lead">{o.paragraphs[0]}</p>
                <div className={`ch-topics${open ? ' is-open' : ''}`}><div><div className="orgcard-more">{o.paragraphs.slice(1).map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div></div></div>
                <button className="more-btn" type="button" aria-expanded={open} onClick={() => { setOpenOrg(open ? null : o.name); setTimeout(() => ScrollTrigger.refresh(), 650); }}>{open ? 'Show less' : 'Read more'}</button>
                {o === organizers.mjcet && <img className="orgcard-acc" src="assets/logos/mjcet-accreditations.webp" width={1335} height={167} alt="Accreditation and approval marks: AICTE, Osmania University, NBA, NAAC A+ and Institution's Innovation Council" loading="lazy" />}
              </GlassPanel>
            );
          })}
        </div>
        <div className="gallery" aria-labelledby="gal-title">
          <div className="gallery-head">
            <h3 className="h3" id="gal-title" data-reveal="">IEEE Student Branch at MJCET</h3>
            <p className="muted small" data-reveal="">Past student branch activities on campus.</p>
          </div>
          <div className="gallery-scroller" tabIndex={0} aria-label="IEEE Student Branch photographs">
            <ul className="gallery-rail" ref={rail}>
              {ieeeGallery.map((g, i) => (
                <li className={`gallery-item gallery-item--${i % 3}`} key={g.src}><figure><Img src={g.src} w={g.w} h={g.h} alt={g.alt} sizes="(max-width: 700px) 80vw, 40vw" /></figure></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
