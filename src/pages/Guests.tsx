import { useEffect, useRef, useState } from 'react';
import { guests, guestCategories, keynoteIds, guestById, displayName, type Guest } from '../data/guests';
import { portraitOf } from '../data/guests/image-sources';
import { href } from '../utils/routes';
import { gsap, finePointer, prefersReduced } from '../animations/motion';
import { Eyebrow, Heading } from '../components/shared/Typography';
import { PageHeader } from '../components/shared/PageHeader';
import { GlassPanel } from '../components/glass/GlassPanel';
import { LiquidButton } from '../components/buttons/LiquidButton';
import { Portrait } from '../components/guests/Portrait';
import { GuestDialog } from '../components/guests/GuestDialog';
import { rolesOf, leadRole, profileHref } from '../components/guests/guest-roles';
import { useProfileDialog } from '../components/guests/useProfileDialog';

// Keynote speakers have their own page; their inaugural roles are noted there and linked from here
const cat = (id: Guest['category']) => guestCategories.find((c) => c.id === id)!;
const inCat = (id: Guest['category']) => guests.filter((g) => g.category === id && !keynoteIds.includes(g.id));
const Designation = ({ g }: { g: Guest }) => (g.designation ? <>{g.designation}</> : <span className="is-pending">Designation to be confirmed</span>);

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
        {list.map((g) => {
          const open = openId === g.id;
          const roles = rolesOf(g);
          return (
            <li key={g.id} id={`guest-${g.id}`} className={`ed-row${open ? ' is-open' : ''}`} onPointerEnter={() => setHover(g.id)}>
              <div data-reveal="">
              <h3 className="ed-h">
                <button type="button" className="ed-btn" aria-expanded={open} aria-controls={`ed-${g.id}`} onClick={() => setOpenId(open ? null : g.id)}>
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
  const { openId, open, close } = useProfileDialog();

  const inaugural = inCat('inaugural');
  const ieee = inCat('ieee');
  const academic = inCat('academic');
  const total = guests.length - keynoteIds.length;
  // Keynote speakers who also hold an inaugural-session role
  const alsoInaugural = keynoteIds.map((id) => guestById(id)!).map((g) => ({ g, r: rolesOf(g).find((x) => x.item === 'd1-inaugural') })).filter((x) => x.r);

  return (
    <div>
      <PageHeader eyebrow="Guests" title="Distinguished" accent="guests." crumbs={[{ text: 'Guests' }]}
        intro={`Guests of the inaugural and valedictory sessions, IEEE Hyderabad Section dignitaries and the academic representatives chairing the technical sessions: ${total} confirmed guests across both days. The keynote speakers are listed on the Speakers page.`}
        subnav={[{ id: 'inaugural', text: 'Inaugural session' }, { id: 'ieee', text: 'IEEE Hyderabad Section' }, { id: 'academic', text: 'Academic representatives' }]} />

      <section className="section section--tint" id="inaugural" aria-labelledby="ina-title">
        <div className="wrap">
          <div className="section-head">
            <div><Eyebrow>{cat('inaugural').title} session</Eyebrow><Heading text="Guests of the" accent="inaugural session." id="ina-title" /></div>
            <p className="section-intro" data-reveal="">{cat('inaugural').intro}</p>
          </div>
          <Gallery list={inaugural} open={open} />
          {alsoInaugural.length > 0 && (
            <p className="also-note" data-reveal="">
              Also joining the inaugural session, from the Speakers page:{' '}
              {alsoInaugural.map(({ g, r }, i) => (
                <span key={g.id}>{i > 0 && ' and '}<a href={profileHref(g.id)}>{displayName(g)}</a> ({r!.label})</span>
              ))}.
            </p>
          )}
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
