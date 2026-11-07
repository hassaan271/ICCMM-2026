import { useEffect, useRef, useState } from 'react';
import { guests, confirmedGuests, displayName, type Guest, type GuestRole } from '../data/guests';
import { pageText, fillText } from '../data/conference';
import { portraitOf } from '../data/guests/image-sources';
import { href } from '../utils/routes';
import { gsap, finePointer, prefersReduced } from '../animations/motion';
import { Eyebrow, Heading, pad } from '../components/shared/Typography';
import { PageHeader } from '../components/shared/PageHeader';
import { GlassPanel } from '../components/glass/GlassPanel';
import { LiquidButton } from '../components/buttons/LiquidButton';
import { Portrait } from '../components/guests/Portrait';
import { GuestDialog } from '../components/guests/GuestDialog';
import { rolesOf } from '../components/guests/guest-roles';
import { useProfileDialog } from '../components/guests/useProfileDialog';

const Designation = ({ g }: { g: Guest }) => (g.designation ? <>{g.designation}</> : <span className="is-pending">Designation to be confirmed</span>);

type Resolved = ReturnType<typeof rolesOf>[number];
type Entry = { g: Guest; role: Resolved };

// Guests and speakers are listed in programme order: inaugural, keynotes, session chairs, panel, valedictory.
// Someone with several roles appears in each session they take part in.
const sessions: { id: string; eyebrow: string; title: string; accent: string; intro: string; match: (r: GuestRole) => boolean; view: 'gallery' | 'grid' | 'list' }[] = [
  { id: 'inaugural', eyebrow: 'Inaugural session', title: 'Inaugural', accent: 'session.', view: 'gallery', match: (r) => r.item === 'd1-inaugural',
    intro: 'Guests of honour, special guest and distinguished guests of the inaugural session on 20 November 2026.' },
  { id: 'keynote', eyebrow: 'Keynote sessions', title: 'Keynote', accent: 'speakers.', view: 'gallery', match: (r) => r.label === 'Keynote Speaker',
    intro: 'One keynote address opens each day of the conference.' },
  { id: 'session-chairs', eyebrow: 'Technical sessions', title: 'Session', accent: 'chairs.', view: 'grid', match: (r) => r.label.startsWith('Session Chair'),
    intro: 'Academic representatives and IEEE Hyderabad Section members chairing the technical sessions, in session order.' },
  { id: 'panel', eyebrow: 'Panel discussion', title: 'Panel', accent: 'discussion.', view: 'list', match: (r) => r.item === 'd2-panel',
    intro: 'Panellists of the panel discussion on 21 November 2026.' },
  { id: 'valedictory', eyebrow: 'Valedictory', title: 'Valedictory', accent: 'session.', view: 'gallery', match: (r) => r.item === 'd2-valedictory',
    intro: 'Guests of the valedictory session closing the conference on 21 November 2026.' },
];

const sessionNo = (label: string) => Number(/Session (\d+)/.exec(label)?.[1] ?? 99);

const entriesFor = (match: (r: GuestRole) => boolean, sortBySession: boolean): Entry[] => {
  const list = guests.flatMap((g) => {
    const role = rolesOf(g).find((r) => match(r));
    return role ? [{ g, role }] : [];
  });
  return sortBySession ? list.sort((a, b) => sessionNo(a.role.label) - sessionNo(b.role.label)) : list;
};

/* Horizontal gallery of portrait cards */
function Gallery({ list, open, label, anchor }: { list: Entry[]; open: (id: string) => void; label: string; anchor: (id: string) => string | undefined }) {
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
      <ul className="gal-rail" ref={rail} aria-label={label}>
        {list.map(({ g, role }, i) => (
          <li key={g.id} id={anchor(g.id)} className="gal-item" data-reveal="" style={{ ['--d' as string]: `${Math.min(i, 6) * 70}ms` }}>
            {g.placeholder ? (
              <div className="gcard gcard--tba">
                <span className="gcard-photo"><Portrait id={g.id} sizes="(max-width: 760px) 70vw, 300px" /></span>
              </div>
            ) : (
            <button type="button" className="gcard" onClick={() => open(g.id)} aria-label={`${displayName(g)}, ${role.label}. Open profile`}>
              <span className="gcard-photo"><Portrait id={g.id} sizes="(max-width: 760px) 70vw, 300px" /></span>
              <span className="gcard-badge">{role.label.split(' · ')[0]}</span>
              <span className="gcard-name">{displayName(g)}</span>
              <span className="gcard-role"><Designation g={g} /></span>
              {g.location && <span className="gcard-loc"><svg className="loc-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>{g.location}</span>}
            </button>
            )}
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

/* Editorial name list; a portrait follows the cursor on hover, rows expand for the bio */
function EditorialList({ list, anchor }: { list: Entry[]; anchor: (id: string) => string | undefined }) {
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
        {list.map(({ g }) => <span key={g.id} className={hover === g.id ? 'is-cur' : ''}><Portrait id={g.id} sizes="220px" /></span>)}
      </div>
      <ol className="ed-list">
        {list.map(({ g }) => {
          const open = openId === g.id;
          const roles = rolesOf(g);
          return (
            <li key={g.id} id={anchor(g.id)} className={`ed-row${open ? ' is-open' : ''}`} onPointerEnter={() => setHover(g.id)}>
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

/* Portrait grid; hover (or focus) lifts a glass panel with the session role */
function Grid({ list, open, anchor }: { list: Entry[]; open: (id: string) => void; anchor: (id: string) => string | undefined }) {
  return (
    <ul className="ggrid">
      {list.map(({ g, role }) => (
        <li key={g.id} id={anchor(g.id)} data-reveal="">
          <button type="button" className="gtile" onClick={() => open(g.id)} aria-label={`${displayName(g)}, ${role.label}. Open profile`}>
            <span className="gtile-photo"><Portrait id={g.id} sizes="(max-width: 560px) 90vw, (max-width: 1000px) 45vw, 400px" /></span>
            <GlassPanel kind="frost" as="span" className="gtile-info" refraction={12} blur={6}>
              <span className="gtile-name">{displayName(g)}</span>
              <span className="gtile-org">{g.organization}</span>
              {g.location && <span className="gtile-org">{g.location}</span>}
              <span className="gtile-x"><span><span className="gtile-r">{role.label} · {role.when}</span></span></span>
            </GlassPanel>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Guests() {
  const { openId, open, close } = useProfileDialog();

  const blocks = sessions.map((s) => ({ ...s, list: entriesFor(s.match, s.id === 'session-chairs') })).filter((s) => s.list.length > 0);
  // Profile links point at #guest-<id>; only the first appearance carries the anchor.
  // Worked out once here (not during child renders, which can repeat) so the ids stay stable.
  const owner = new Map<string, string>();
  blocks.forEach((s) => s.list.forEach(({ g }) => { if (!owner.has(g.id)) owner.set(g.id, s.id); }));
  const anchorFor = (section: string) => (id: string) => (owner.get(id) === section ? `guest-${id}` : undefined);

  return (
    <div>
      <PageHeader eyebrow={pageText.guests.eyebrow} title={pageText.guests.title} accent={pageText.guests.accent} crumbs={[{ text: 'Guests' }]}
        intro={fillText(pageText.guests.intro, { guestCount: confirmedGuests.length })}
        subnav={blocks.map((s) => ({ id: s.id, text: s.eyebrow }))} />

      {blocks.map((s, i) => (
        <section className={`section${i % 2 === 0 ? ' section--tint' : ''}`} id={s.id} aria-labelledby={`${s.id}-title`} key={s.id}>
          <div className="wrap">
            <div className="section-head">
              <div><Eyebrow>{pad(i + 1)} · {s.eyebrow}</Eyebrow><Heading text={s.title} accent={s.accent} id={`${s.id}-title`} /></div>
              <p className="section-intro" data-reveal="">{s.intro}</p>
            </div>
            {s.view === 'gallery' && <Gallery list={s.list} open={open} label={`${s.eyebrow}: guests`} anchor={anchorFor(s.id)} />}
            {s.view === 'grid' && <Grid list={s.list} open={open} anchor={anchorFor(s.id)} />}
            {s.view === 'list' && <EditorialList list={s.list} anchor={anchorFor(s.id)} />}
            {s.id === 'keynote' && <div className="actions mt" data-reveal=""><LiquidButton href={href('speakers')} variant="glass">Keynote speakers page</LiquidButton></div>}
            {i === blocks.length - 1 && <div className="actions mt" data-reveal=""><LiquidButton href={href('programme')}>See the event flow</LiquidButton></div>}
          </div>
        </section>
      ))}

      <GuestDialog id={openId} onClose={close} />
    </div>
  );
}
