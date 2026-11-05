import { useCallback, useEffect, useRef, useState } from 'react';
import { guests, guestCategories, keynoteIds, guestById, displayName, type Guest } from '../data/guests';
import { portraitOf } from '../data/guests/image-sources';
import { href } from '../utils/routes';
import { gsap, finePointer, prefersReduced } from '../animations/motion';
import { Eyebrow, Heading, pad } from '../components/shared/Typography';
import { PageHeader } from '../components/shared/PageHeader';
import { GlassPanel } from '../components/glass/GlassPanel';
import { LiquidButton } from '../components/buttons/LiquidButton';
import { Portrait } from '../components/guests/Portrait';
import { GuestDialog } from '../components/guests/GuestDialog';
import { rolesOf, leadRole } from '../components/guests/guest-roles';

const cat = (id: Guest['category']) => guestCategories.find((c) => c.id === id)!;
const inCat = (id: Guest['category']) => guests.filter((g) => g.category === id && !keynoteIds.includes(g.id));
const Designation = ({ g }: { g: Guest }) => (g.designation ? <>{g.designation}</> : <span className="is-pending">Designation to be confirmed</span>);

/* Keynote speakers: large editorial spreads, portrait clipped in on scroll */
function Keynote({ g, i, open }: { g: Guest; i: number; open: (id: string) => void }) {
  const slot = rolesOf(g).find((r) => r.label === 'Keynote Speaker');
  return (
    <article className={`kn${i % 2 ? ' kn--flip' : ''}`} id={`guest-${g.id}`} aria-labelledby={`kn-${g.id}`}>
      <figure className="kn-photo" data-clip-reveal="">
        <span className="kn-photo-in" data-kn-parallax=""><Portrait id={g.id} sizes="(max-width: 900px) 92vw, 520px" /></span>
      </figure>
      <div className="kn-text">
        <p className="kn-no" aria-hidden="true">{pad(i + 1)}</p>
        <Eyebrow>Keynote {pad(i + 1)}{slot ? ` · ${slot.when}` : ''}</Eyebrow>
        <h3 className="kn-name" id={`kn-${g.id}`} data-reveal="">{displayName(g)}</h3>
        <p className="kn-role" data-reveal=""><Designation g={g} /><span>{g.organization}</span></p>
        {g.bio ? <p className="kn-bio" data-reveal="">{g.bio}</p> : <p className="kn-bio is-pending" data-reveal="">Biography and keynote title to be announced.</p>}
        <div className="actions" data-reveal="">
          <button type="button" className="more-btn" onClick={() => open(g.id)}>Full profile</button>
          {slot && <a className="link-arrow" href={href('programme', slot.item)}>{slot.itemTitle} in the programme →</a>}
        </div>
      </div>
    </article>
  );
}

/* Inaugural session: horizontal gallery of portrait cards */
function Gallery({ list, open }: { list: Guest[]; open: (id: string) => void }) {
  const rail = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  useEffect(() => {
    const el = rail.current!;
    const upd = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    upd();
    el.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    return () => { el.removeEventListener('scroll', upd); window.removeEventListener('resize', upd); };
  }, []);
  const go = (dir: 1 | -1) => {
    const el = rail.current!;
    const card = el.querySelector('li');
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 280) + 16) * 2, behavior: prefersReduced() ? 'auto' : 'smooth' });
  };
  return (
    <div className="gal">
      <ul className="gal-rail" ref={rail} aria-label="Inaugural session guests">
        {list.map((g, i) => (
          <li key={g.id} id={`guest-${g.id}`} className="gal-item" data-reveal="" style={{ ['--d' as string]: `${Math.min(i, 6) * 70}ms` }}>
            <button type="button" className="gcard" onClick={() => open(g.id)} aria-label={`${displayName(g)}, ${leadRole(g)}. Open profile`}>
              <span className="gcard-photo"><Portrait id={g.id} sizes="(max-width: 760px) 70vw, 300px" /></span>
              <span className="gcard-badge">{leadRole(g)}</span>
              <span className="gcard-name">{displayName(g)}</span>
              <span className="gcard-role"><Designation g={g} /></span>
            </button>
          </li>
        ))}
      </ul>
      <div className="gal-ctrl">
        <button type="button" className="gal-btn" onClick={() => go(-1)} disabled={edge.start} aria-label="Previous guests"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
        <button type="button" className="gal-btn" onClick={() => go(1)} disabled={edge.end} aria-label="Next guests"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg></button>
      </div>
    </div>
  );
}

/* IEEE Hyderabad Section: editorial name list; a portrait follows the cursor on hover, rows expand for the bio */
function EditorialList({ list }: { list: Guest[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const w = wrap.current!, f = float.current!;
    if (!finePointer()) return;
    const qx = gsap.quickTo(f, 'x', { duration: 0.6, ease: 'power3.out' });
    const qy = gsap.quickTo(f, 'y', { duration: 0.6, ease: 'power3.out' });
    const mv = (e: PointerEvent) => { const r = w.getBoundingClientRect(); qx(e.clientX - r.left); qy(e.clientY - r.top); };
    w.addEventListener('pointermove', mv);
    return () => w.removeEventListener('pointermove', mv);
  }, []);
  const hp = hover && hover !== openId ? portraitOf(hover) : null;
  return (
    <div className="ed" ref={wrap} onPointerLeave={() => setHover(null)}>
      <div className={`ed-float${hp ? ' is-on' : ''}`} ref={float} aria-hidden="true">
        {list.map((g) => <span key={g.id} className={hover === g.id ? 'is-cur' : ''}><Portrait id={g.id} sizes="220px" /></span>)}
      </div>
      <ol className="ed-list">
        {list.map((g, i) => {
          const open = openId === g.id;
          const roles = rolesOf(g);
          return (
            <li key={g.id} id={`guest-${g.id}`} className={`ed-row${open ? ' is-open' : ''}`} onPointerEnter={() => setHover(g.id)}>
              <div data-reveal="">
              <h3 className="ed-h">
                <button type="button" className="ed-btn" aria-expanded={open} aria-controls={`ed-${g.id}`} onClick={() => setOpenId(open ? null : g.id)}>
                  <span className="ed-no">{pad(i + 1)}</span>
                  <span className="ed-name">{displayName(g)}</span>
                  <span className="ed-meta"><span className="ed-role"><Designation g={g} /></span><span className="ed-org">{g.organization}</span></span>
                  <span className="acc-ico" aria-hidden="true" />
                </button>
              </h3>
              <div className="ed-panel" id={`ed-${g.id}`} role="region" aria-label={`${displayName(g)} profile`}>
                <div>
                  <div className="ed-body">
                    <span className="ed-photo"><Portrait id={g.id} sizes="200px" /></span>
                    <div>
                      {g.bio ? <p>{g.bio}</p> : <p className="is-pending">Biography to be announced.</p>}
                      {roles.length > 0 && (
                        <ul className="ed-roles">{roles.map((r) => <li key={r.item + r.label}><a href={href('programme', r.item)}><strong>{r.label}</strong> · {r.itemTitle} · {r.when}</a></li>)}</ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* Academic representatives: portrait grid; hover (or focus) lifts a glass panel with the session role */
function Grid({ list, open }: { list: Guest[]; open: (id: string) => void }) {
  return (
    <ul className="ggrid">
      {list.map((g) => {
        const r = rolesOf(g)[0];
        return (
          <li key={g.id} id={`guest-${g.id}`} data-reveal="">
            <button type="button" className="gtile" onClick={() => open(g.id)} aria-label={`${displayName(g)}. Open profile`}>
              <span className="gtile-photo"><Portrait id={g.id} sizes="(max-width: 560px) 90vw, (max-width: 1000px) 45vw, 400px" /></span>
              <GlassPanel kind="frost" as="span" className="gtile-info" refraction={12} blur={6}>
                <span className="gtile-name">{displayName(g)}</span>
                <span className="gtile-org">{g.organization}</span>
                {r && <span className="gtile-x"><span><span className="gtile-r">{r.label} · {r.when}</span></span></span>}
              </GlassPanel>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function Guests() {
  const [openId, setOpenId] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const open = useCallback((id: string) => { setOpenId(id); history.replaceState(null, '', `#guest-${id}`); }, []);
  const close = useCallback(() => { setOpenId(null); if (location.hash.startsWith('#guest-')) history.replaceState(null, '', location.pathname + location.search); }, []);

  // Deep link: guests.html#guest-<id> opens that profile
  useEffect(() => {
    const fromHash = () => { const id = location.hash.replace('#guest-', ''); if (location.hash.startsWith('#guest-') && guestById(id)) setOpenId(id); };
    const t = setTimeout(fromHash, 400);
    window.addEventListener('hashchange', fromHash);
    return () => { clearTimeout(t); window.removeEventListener('hashchange', fromHash); };
  }, []);

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
  const inaugural = inCat('inaugural');
  const ieee = inCat('ieee');
  const academic = inCat('academic');
  const total = guests.length;

  return (
    <div ref={root}>
      <PageHeader eyebrow="Speakers & guests" title="Distinguished" accent="speakers & guests." crumbs={[{ text: 'Speakers & Guests' }]}
        intro={`Keynote speakers, guests of the inaugural and valedictory sessions, IEEE Hyderabad Section dignitaries and the academic representatives chairing the technical sessions: ${total} confirmed guests across both days.`}
        subnav={[{ id: 'keynotes', text: 'Keynote speakers' }, { id: 'inaugural', text: 'Inaugural session' }, { id: 'ieee', text: 'IEEE Hyderabad Section' }, { id: 'academic', text: 'Academic representatives' }]} />

      <section className="section" id="keynotes" aria-labelledby="kn-title">
        <div className="wrap">
          <div className="section-head">
            <div><Eyebrow>Keynote speakers</Eyebrow><Heading text="Keynote" accent="addresses." id="kn-title" /></div>
            <p className="section-intro" data-reveal="">One keynote opens each day of the conference, on 20 and 21 November 2026.</p>
          </div>
          <div className="kn-list">{keynotes.map((g, i) => <Keynote key={g.id} g={g} i={i} open={open} />)}</div>
        </div>
      </section>

      <section className="section section--tint" id="inaugural" aria-labelledby="ina-title">
        <div className="wrap">
          <div className="section-head">
            <div><Eyebrow>{cat('inaugural').title} session</Eyebrow><Heading text="Guests of the" accent="inaugural session." id="ina-title" /></div>
            <p className="section-intro" data-reveal="">{cat('inaugural').intro} The keynote speakers above also join the session.</p>
          </div>
          <Gallery list={inaugural} open={open} />
        </div>
      </section>

      <section className="section" id="ieee" aria-labelledby="ieee-title">
        <div className="wrap">
          <div className="section-head">
            <div><Eyebrow>IEEE Hyderabad Section</Eyebrow><Heading text={cat('ieee').title} accent={cat('ieee').accent} id="ieee-title" /></div>
            <p className="section-intro" data-reveal="">{cat('ieee').intro} The Section Chair and Conference Committee Chair are listed with the inaugural session.</p>
          </div>
          <EditorialList list={ieee} />
        </div>
      </section>

      <section className="section section--tint" id="academic" aria-labelledby="ac-title">
        <div className="wrap">
          <div className="section-head">
            <div><Eyebrow>Session chairs</Eyebrow><Heading text={cat('academic').title} accent={cat('academic').accent} id="ac-title" /></div>
            <p className="section-intro" data-reveal="">{cat('academic').intro}</p>
          </div>
          <Grid list={academic} open={open} />
          <div className="actions mt" data-reveal=""><LiquidButton href={href('programme')}>See the event flow</LiquidButton></div>
        </div>
      </section>

      <GuestDialog id={openId} onClose={close} />
    </div>
  );
}
