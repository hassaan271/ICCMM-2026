import { useEffect, useRef } from 'react';
import { keynoteIds, guestById, displayName, type Guest } from '../data/guests';
import { href } from '../utils/routes';
import { gsap, prefersReduced } from '../animations/motion';
import { Eyebrow, Heading, pad } from '../components/shared/Typography';
import { pageText, fillText } from '../data/conference';
import { PageHeader } from '../components/shared/PageHeader';
import { LiquidButton } from '../components/buttons/LiquidButton';
import { Portrait } from '../components/guests/Portrait';
import { rolesOf } from '../components/guests/guest-roles';

const Designation = ({ g }: { g: Guest }) => (g.designation ? <>{g.designation}</> : <span className="is-pending">Designation to be confirmed</span>);

/* Keynote speakers: large editorial spreads, portrait clipped in on scroll */
function Keynote({ g, i }: { g: Guest; i: number }) {
  const slot = rolesOf(g).find((r) => r.label === 'Keynote Speaker');
  // Other programme roles (e.g. inaugural guest), shown so a second role is clear rather than duplicated on the Guests page
  const also = rolesOf(g).filter((r) => r.label !== 'Keynote Speaker' && r.label !== 'Poster Presentation');
  return (
    <article className={`kn${i % 2 ? ' kn--flip' : ''}`} id={`guest-${g.id}`} aria-labelledby={`kn-${g.id}`}>
      <figure className="kn-photo" data-clip-reveal="">
        <span className="kn-photo-in" data-kn-parallax=""><Portrait id={g.id} sizes="(max-width: 900px) 92vw, 520px" /></span>
      </figure>
      <div className="kn-text">
        <p className="kn-no" aria-hidden="true">{pad(i + 1)}</p>
        <Eyebrow>Keynote {pad(i + 1)}{slot ? ` · ${slot.when}` : ''}</Eyebrow>
        <h3 className="kn-name" id={`kn-${g.id}`} data-reveal="">{displayName(g)}</h3>
        <p className="kn-role" data-reveal=""><Designation g={g} /><span className="kn-org">{g.organization}</span>{g.location && <span className="kn-loc"><svg className="loc-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>{g.location}</span>}</p>
        {g.bio ? <p className="kn-bio" data-reveal="">{g.bio}</p> : <p className="kn-bio is-pending" data-reveal="">Biography and keynote title to be announced.</p>}
        {also.length > 0 && <p className="kn-also" data-reveal="">Also {also.map((r) => `${r.label} · ${r.itemTitle}`).join('; ')}.</p>}
        {slot && <div className="actions" data-reveal=""><a className="link-arrow" href={href('programme', slot.item)}>{slot.itemTitle} in the programme →</a></div>}
      </div>
    </article>
  );
}

export function Speakers() {
  const root = useRef<HTMLDivElement>(null);

  // Subtle parallax inside the keynote portraits
  useEffect(() => {
    if (prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-kn-parallax]').forEach((el) => {
        gsap.fromTo(el, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const keynotes = keynoteIds.map((id) => guestById(id)!);

  return (
    <div ref={root}>
      <PageHeader eyebrow={pageText.speakers.eyebrow} title={pageText.speakers.title} accent={pageText.speakers.accent} crumbs={[{ text: 'Speakers' }]}
        intro={fillText(pageText.speakers.intro)} />

      <section className="section" id="keynotes" aria-labelledby="kn-title">
        <div className="wrap">
          <div className="section-head">
            <div><Eyebrow>Keynote speakers</Eyebrow><Heading text="Keynote" accent="addresses." id="kn-title" /></div>
          </div>
          <div className="kn-list">{keynotes.map((g, i) => <Keynote key={g.id} g={g} i={i} />)}</div>
          <div className="actions mt" data-reveal="">
            <LiquidButton href={href('guests')}>Meet the guests</LiquidButton>
            <LiquidButton href={href('programme')} variant="glass">See the event flow</LiquidButton>
          </div>
        </div>
      </section>

    </div>
  );
}
