import { useEffect, useRef, useState } from 'react';
import { schedule, kindLabel, fmtTime, minutes, weekday, paperGuideline, type ScheduleItem, type Person, type Lane, type Day } from '../data/schedule';
import { meta, pageText, fillText } from '../data/conference';
import { profileHref } from '../components/guests/guest-roles';
import { scrollToTarget } from '../animations/motion';
import { Eyebrow, Heading } from '../components/shared/Typography';
import { PageHeader } from '../components/shared/PageHeader';
import { GlassPanel } from '../components/glass/GlassPanel';
import { Segmented } from '../components/shared/Controls';

/* Event flow as an editorial conference programme: a time column and a content column per entry,
   grouped into morning / afternoon / evening, separated by hairlines. Ceremonies and keynotes sit on
   a subtle glass surface; breaks are single quiet lines. No connector line, nodes or progress markers. */

const dur = (a: string, b: string) => { const m = minutes(a, b); const h = Math.floor(m / 60); return h ? `${h} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`; };
const paperSessions = (it: ScheduleItem) => it.lanes?.filter((l) => l.papers).length ?? 0;
const sessionCount = (items: ScheduleItem[]) => items.reduce((n, i) => n + paperSessions(i), 0);

const PARTS = [
  { id: 'morning', label: 'Morning', until: 12 * 60 },
  { id: 'afternoon', label: 'Afternoon', until: 18 * 60 },
  { id: 'evening', label: 'Evening', until: 24 * 60 },
];
const partsOf = (d: Day) => {
  const at = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  return PARTS.map((p, i) => ({ ...p, items: d.items.filter((it) => at(it.start) < p.until && at(it.start) >= (i ? PARTS[i - 1].until : 0)) })).filter((p) => p.items.length);
};

function Who({ p, showRole = true }: { p: Person; showRole?: boolean }) {
  return (
    <span className="pg-person">
      {showRole && p.role && <span className="pg-person-r">{p.role}</span>}
      {p.guest ? <a className="pg-person-n" href={profileHref(p.guest)}>{p.name}</a> : <span className="pg-person-n">{p.name}</span>}
      {p.detail ? <span className="pg-person-d">{p.detail}</span> : <span className="pg-person-d is-pending">Affiliation to be confirmed</span>}
    </span>
  );
}

function Session({ l }: { l: Lane }) {
  return (
    <li className="pg-session">
      <p className="pg-session-t">{l.title}{l.online && <span className="pg-online">Online</span>}</p>
      <dl className="pg-session-roles">
        {(l.room || l.online) && <div><dt>Room</dt><dd className="pg-session-v">{l.room ?? 'Online session'}</dd></div>}
        {l.chair && <div><dt>Chair</dt><dd><Who p={l.chair} showRole={false} /></dd></div>}
        {l.coChair && <div><dt>Co-chair</dt><dd><Who p={l.coChair} showRole={false} /></dd></div>}
        {l.people && <div><dt>Judges</dt><dd className="pg-session-people">{l.people.map((p) => <Who key={p.name} p={p} showRole={false} />)}</dd></div>}
      </dl>
    </li>
  );
}

function Entry({ it }: { it: ScheduleItem }) {
  const time = (
    <div className="pg-time">
      <time className="pg-t" dateTime={it.start}>{fmtTime(it.start)}</time>
      {it.kind !== 'break' && <span className="pg-t2">to {fmtTime(it.end)}</span>}
    </div>
  );
  if (it.kind === 'break') {
    return (
      <li className="pg-entry pg-entry--break" id={it.id}>
        {time}
        <p className="pg-break"><span className="pg-break-t">{it.title}</span><span className="pg-break-d">{dur(it.start, it.end)}</span></p>
      </li>
    );
  }
  const featured = it.kind === 'ceremony' || it.kind === 'keynote';
  const people = it.people ?? [];
  const body = (
    <>
      <p className="pg-kind">
        {[
          // the category is left out where the title already says it (e.g. "Technical Session 2")
          !it.title.toLowerCase().includes(kindLabel[it.kind].toLowerCase().replace(/s$/, '')) && kindLabel[it.kind],
          paperSessions(it) > 1 && `${paperSessions(it)} paper sessions in parallel`,
          dur(it.start, it.end),
        ].filter(Boolean).map((t, i) => <span key={i} className={i ? 'pg-kind-sub' : undefined}>{i ? ' · ' : ''}{t}</span>)}
      </p>
      <h4 className="pg-title">{it.title}</h4>
      {it.summary && <p className="pg-sum">{it.summary}</p>}
      {people.length > 0 && <ul className={`pg-people${people.length > 2 ? ' pg-people--grid' : ''}`}>{people.map((p) => <li key={p.name}><Who p={p} /></li>)}</ul>}
      {it.lanes && <ul className={`pg-sessions pg-sessions--${Math.min(it.lanes.length, 4)}`}>{it.lanes.map((l) => <Session key={l.title} l={l} />)}</ul>}
      {it.pending && <p className="pg-pending">{it.pending}</p>}
    </>
  );
  return (
    <li className={`pg-entry pg-entry--${it.kind}${featured ? ' pg-entry--featured' : ''}`} id={it.id} data-reveal="">
      {time}
      {featured ? <GlassPanel kind="light" className="pg-body pg-card">{body}</GlassPanel> : <div className="pg-body">{body}</div>}
    </li>
  );
}

export function EventFlow() {
  const [day, setDay] = useState('day-1');
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    if (location.hash === '#day-2') setDay('day-2');
    // The day in view drives the day switcher
    const dio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setDay(e.target.id); }), { rootMargin: '-50% 0px -49% 0px' });
    el.querySelectorAll('.pg-day').forEach((n) => dio.observe(n));
    return () => dio.disconnect();
  }, []);

  const jump = (id: string) => { setDay(id); const t = document.getElementById(id); if (t) scrollToTarget(t, -150); };

  return (
    <div ref={root}>
      <PageHeader eyebrow={pageText.programme.eyebrow} title={pageText.programme.title} accent={pageText.programme.accent} crumbs={[{ text: 'Programme & Event Flow' }]}
        intro={fillText(pageText.programme.intro)} />

      <section className="section ef-intro" aria-labelledby="efo-title">
        <div className="wrap">
          <h2 className="visually-hidden" id="efo-title">Days at a glance</h2>
          <div className="ef-overview">
            {schedule.map((d) => (
              <a key={d.id} href={`#${d.id}`} className="ef-ov" data-reveal="" onClick={(e) => { e.preventDefault(); jump(d.id); history.replaceState(null, '', `#${d.id}`); }}>
                <span className="label">{d.label}</span>
                <span className="ef-ov-date">{weekday(d.iso)}, {d.date}</span>
                <span className="ef-ov-span">{fmtTime(d.items[0].start)} – {fmtTime(d.items[d.items.length - 1].end)}</span>
                <span className="ef-ov-stats">
                  <span><b>{d.items.filter((i) => i.kind !== 'break').length}</b> programme items</span>
                  <span><b>{sessionCount(d.items)}</b> technical sessions</span>
                  <span><b>{d.items.filter((i) => i.kind === 'keynote').length}</b> keynote</span>
                </span>
              </a>
            ))}
          </div>
          <div className="pg-doc" data-reveal="">
            <p className="pg-doc-t">{paperGuideline}</p>
          </div>
        </div>
      </section>

      <div className="ef-daynav">
        <div className="wrap">
          <Segmented label="Jump to day" value={day} onChange={jump} options={schedule.map((d) => ({ value: d.id, label: <>{d.label} <span className="seg-sub">{d.date.replace(' November 2026', ' Nov')}</span></> }))} />
        </div>
      </div>

      {schedule.map((d) => (
        <section className="section pg-day" id={d.id} key={d.id} aria-labelledby={`${d.id}-title`}>
          <div className="wrap">
            <header className="pg-day-head">
              <div>
                <Eyebrow>{d.label}</Eyebrow>
                <Heading text={weekday(d.iso)} accent={d.date + '.'} id={`${d.id}-title`} />
              </div>
              <p className="pg-day-meta">{fmtTime(d.items[0].start)} – {fmtTime(d.items[d.items.length - 1].end)} IST<span>MJCET, Hyderabad</span></p>
            </header>
            {partsOf(d).map((p) => (
              <div className="pg-part" key={p.id} aria-labelledby={`${d.id}-${p.id}`} role="group">
                <h3 className="pg-part-h" id={`${d.id}-${p.id}`}>{p.label}</h3>
                <ol className="pg-list">{p.items.map((it) => <Entry key={it.id} it={it} />)}</ol>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
