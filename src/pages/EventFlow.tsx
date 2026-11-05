import { useEffect, useRef, useState } from 'react';
import { schedule, kindLabel, fmtTime, minutes, weekday, type ScheduleItem, type Person, type Lane } from '../data/schedule';
import { meta } from '../data/conference';
import { href } from '../utils/routes';
import { profileHref } from '../components/guests/guest-roles';
import { gsap, ScrollTrigger, scrollToTarget, prefersReduced } from '../animations/motion';
import { Eyebrow, Heading } from '../components/shared/Typography';
import { PageHeader } from '../components/shared/PageHeader';
import { GlassPanel } from '../components/glass/GlassPanel';
import { Segmented } from '../components/shared/Controls';

const dur = (a: string, b: string) => { const m = minutes(a, b); const h = Math.floor(m / 60); return h ? `${h} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`; };
const sessionCount = (items: ScheduleItem[]) => items.reduce((n, i) => n + (i.lanes?.length ?? 0), 0);

function Who({ p }: { p: Person }) {
  const name = p.guest ? <a className="ef-person-n" href={profileHref(p.guest)}>{p.name}</a> : <span className="ef-person-n">{p.name}</span>;
  return (
    <span className="ef-person">
      {p.role && <span className="ef-person-r">{p.role}</span>}
      {name}
      {p.detail ? <span className="ef-person-d">{p.detail}</span> : <span className="ef-person-d is-pending">Affiliation to be confirmed</span>}
    </span>
  );
}

function LaneCard({ l, open }: { l: Lane; open: boolean }) {
  return (
    <li className="ef-lane">
      <div className="ef-lane-head">
        <span className="ef-lane-t">{l.title}</span>
        {l.online && <span className="ef-tag ef-tag--online">Online</span>}
      </div>
      <span className="ef-lane-track">{l.track ?? 'Track to be confirmed'}</span>
      {l.chair && <p className="ef-lane-row"><span className="label">Chair</span><Who p={l.chair} /></p>}
      {l.people && <ul className="ef-lane-people">{l.people.map((p) => <li key={p.name}><Who p={p} /></li>)}</ul>}
      {l.coChair && <div className={`ef-more${open ? ' is-open' : ''}`}><div><p className="ef-lane-row"><span className="label">Co-chair</span><Who p={l.coChair} /></p></div></div>}
    </li>
  );
}

function Item({ it, open, toggle }: { it: ScheduleItem; open: boolean; toggle: () => void }) {
  if (it.kind === 'break') {
    return (
      <li className="ef-item ef-item--break" id={it.id} data-ef-item="">
        <div className="ef-time"><span className="ef-t">{fmtTime(it.start)}</span></div>
        <span className="ef-node" aria-hidden="true" />
        <div className="ef-break"><span className="ef-break-t">{it.title}</span><span className="ef-break-d">{fmtTime(it.start)} – {fmtTime(it.end)} · {dur(it.start, it.end)}</span></div>
      </li>
    );
  }
  const people = it.people ?? [];
  const preview = people.slice(0, 3);
  const hasMore = people.length > 3 || it.lanes?.some((l) => l.coChair);
  const detailsId = `${it.id}-details`;
  return (
    <li className={`ef-item ef-item--${it.kind}${open ? ' is-open' : ''}`} id={it.id} data-ef-item="">
      <div className="ef-time">
        <span className="ef-t">{fmtTime(it.start)}</span>
        <span className="ef-t2">to {fmtTime(it.end)}</span>
        <span className="ef-dur">{dur(it.start, it.end)}</span>
      </div>
      <button type="button" className="ef-node" onClick={toggle} aria-label={`${it.title}: ${open ? 'hide' : 'show'} details`} aria-controls={hasMore ? detailsId : undefined} aria-expanded={hasMore ? open : undefined} tabIndex={hasMore ? 0 : -1} />
      <GlassPanel kind="light" className="ef-card" data-reveal="">
        <div className="ef-card-head">
          <span className="ef-kind">{kindLabel[it.kind]}</span>
          <span className="ef-when-m">{fmtTime(it.start)} – {fmtTime(it.end)}</span>
        </div>
        <h3 className="ef-title">{it.title}</h3>
        {it.summary && <p className="ef-sum">{it.summary}</p>}

        {people.length > 0 && (
          <>
            <ul className="ef-people">{preview.map((p) => <li key={p.name}><Who p={p} /></li>)}</ul>
            {people.length > 3 && (
              <div className={`ef-more${open ? ' is-open' : ''}`} id={detailsId}>
                <div><ul className="ef-people">{people.slice(3).map((p) => <li key={p.name}><Who p={p} /></li>)}</ul></div>
              </div>
            )}
          </>
        )}

        {it.lanes && (
          <>
            {it.lanes.length > 1 && <p className="ef-par"><span className="ef-par-dot" aria-hidden="true" />{it.lanes.length} sessions in parallel</p>}
            <ul className={`ef-lanes ef-lanes--${Math.min(it.lanes.length, 4)}`} id={detailsId}>{it.lanes.map((l) => <LaneCard key={l.title} l={l} open={open} />)}</ul>
          </>
        )}

        {it.pending && <p className="ef-pending"><span aria-hidden="true">i</span>{it.pending}</p>}
        {hasMore && (
          <button type="button" className="more-btn" aria-expanded={open} aria-controls={detailsId} onClick={toggle}>
            {open ? 'Show less' : people.length > 3 ? `Show all ${people.length} guests` : 'Show co-chairs'}
          </button>
        )}
      </GlassPanel>
    </li>
  );
}

export function EventFlow() {
  const [day, setDay] = useState('day-1');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const root = useRef<HTMLDivElement>(null);
  const toggle = (id: string) => { setOpen((o) => ({ ...o, [id]: !o[id] })); setTimeout(() => ScrollTrigger.refresh(), 650); };

  useEffect(() => {
    const el = root.current!;
    // Deep link to a programme item opens it
    const id = decodeURIComponent(location.hash.slice(1));
    if (schedule.some((d) => d.items.some((i) => i.id === id))) setOpen({ [id]: true });
    if (id === 'day-2') setDay('day-2');

    const ctx = gsap.context(() => {
      // Spine fills with scroll progress through each day
      el.querySelectorAll<HTMLElement>('.ef-line').forEach((line) => {
        gsap.fromTo(line.querySelector('.ef-spine-fill'), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: line, start: 'top 60%', end: 'bottom 60%', scrub: prefersReduced() ? false : 0.4 } });
      });
      // Day header numerals drift slightly
      if (!prefersReduced()) el.querySelectorAll<HTMLElement>('.ef-day-no').forEach((n) => {
        gsap.fromTo(n, { yPercent: 18 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: n.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, el);

    // The item crossing the reading line lights its node (a data attribute, so React re-renders don't clear it); the day in view drives the day switcher
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.toggleAttribute('data-active', e.isIntersecting)), { rootMargin: '-45% 0px -50% 0px' });
    el.querySelectorAll('[data-ef-item]').forEach((n) => io.observe(n));
    const dio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setDay(e.target.id); }), { rootMargin: '-50% 0px -49% 0px' });
    el.querySelectorAll('.ef-day').forEach((n) => dio.observe(n));
    return () => { ctx.revert(); io.disconnect(); dio.disconnect(); };
  }, []);

  const jump = (id: string) => { setDay(id); const t = document.getElementById(id); if (t) scrollToTarget(t, -150); };

  return (
    <div ref={root}>
      <PageHeader eyebrow="Programme" title="Event" accent="flow." crumbs={[{ text: 'Programme & Event Flow' }]}
        intro={`Two days at ${meta.institution}: the inaugural session and keynotes, paper sessions across the four tracks, the poster presentation, a panel discussion and the valedictory. Times are IST, as issued by the organisers on 29 October 2026.`} />

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
        </div>
      </section>

      <div className="ef-daynav">
        <div className="wrap">
          <Segmented label="Jump to day" value={day} onChange={jump} options={schedule.map((d) => ({ value: d.id, label: <>{d.label} <span className="seg-sub">{d.date.replace(' November 2026', ' Nov')}</span></> }))} />
        </div>
      </div>

      {schedule.map((d) => (
        <section className="section ef-day" id={d.id} key={d.id} aria-labelledby={`${d.id}-title`}>
          <div className="wrap">
            <header className="ef-day-head">
              <span className="ef-day-no" aria-hidden="true">{d.label.replace('Day ', '')}</span>
              <div>
                <Eyebrow>{d.label}</Eyebrow>
                <Heading text={weekday(d.iso)} accent={d.date + '.'} id={`${d.id}-title`} />
              </div>
            </header>
            <div className="ef-line">
              <span className="ef-spine" aria-hidden="true"><span className="ef-spine-fill" /></span>
              <ol className="ef-items">{d.items.map((it) => <Item key={it.id} it={it} open={!!open[it.id]} toggle={() => toggle(it.id)} />)}</ol>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
