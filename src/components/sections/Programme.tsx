import { useEffect, useRef, useState } from 'react';
import { programme, pendingNotice } from '../../data/conference';
import { href } from '../../utils/routes';
import { gsap } from '../../animations/motion';
import { Eyebrow, Heading } from '../shared/Typography';
import { Segmented } from '../shared/Controls';
import { GlassPanel } from '../glass/GlassPanel';

/* Programme: day selector over a scroll-drawn timeline; confirmed sessions expand for details */
export function ConferenceProgramme() {
  const [day, setDay] = useState('0');
  const [openSession, setOpenSession] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.prog-wave path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.prog-wave', start: 'top 85%', end: 'bottom 40%', scrub: true } });
    }, ref);
    return () => ctx.revert();
  }, []);
  const d = programme[Number(day)];
  return (
    <section className="section programme" id="programme" ref={ref} aria-labelledby="prog-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <Eyebrow>Conference programme</Eyebrow>
            <Heading text="Programme" accent="at a glance." id="prog-title" />
          </div>
          <p className="section-intro" data-reveal="">{pendingNotice}</p>
        </div>
        <div className="prog-wave" aria-hidden="true">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none"><path pathLength={1} d="M0 70 C 150 20, 300 110, 450 64 S 750 20, 900 66 S 1100 100, 1200 50" /></svg>
          {programme.map((p, i) => (
            <button key={p.label} type="button" tabIndex={-1} className={`prog-node${String(i) === day ? ' is-on' : ''}`} style={{ left: `${30 + i * 40}%` }} onClick={() => setDay(String(i))}>
              <span className="prog-node-dot" /><span className="prog-node-t">{p.label}</span><span className="prog-node-d">{p.date}</span>
            </button>
          ))}
        </div>
        <div className="prog-body">
          <Segmented mode="tab" label="Programme day" value={day} onChange={setDay} options={programme.map((p, i) => ({ value: String(i), label: <>{p.label} <span className="seg-sub">{p.date.replace(' 2026', '')}</span></> }))} />
          <GlassPanel kind="light" className="prog-day" key={day} role="tabpanel">
            <div className="prog-day-head"><span className="prog-day-date">{d.date}</span><span className="label">{d.label}</span></div>
            <ol className="sched">
              {d.sessions.map((s) => {
                const id = `${day}-${s.title}`;
                const open = openSession === id;
                return (
                  <li key={id} className={`sched-row sched-row--confirmed${open ? ' is-open' : ''}`}>
                    <button type="button" className="sched-btn" aria-expanded={open} onClick={() => setOpenSession(open ? null : id)}>
                      <span className="sched-time">{s.time ?? 'Time TBA'}</span><span className="sched-title">{s.title}</span><span className="sched-type">{s.type}</span>
                    </button>
                    <div className="sched-more"><div><p>Confirmed in the conference announcement for 21st November 2026. Session time and room will be published with the full programme. Poster details are on the <a className="link" href={href('events')}>Technical Events page</a>.</p></div></div>
                  </li>
                );
              })}
            </ol>
            {!d.sessions.length && <p className="prog-empty">The session schedule for this day will be announced.</p>}
            <p className="prog-note">{d.sessions.length ? 'Confirmed items are shown. The full schedule will be announced.' : pendingNotice}</p>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
}
