import { useEffect, useRef, useState } from 'react';
import { schedule, fmtTime, kindLabel } from '../../data/schedule';
import { href } from '../../utils/routes';
import { gsap } from '../../animations/motion';
import { Eyebrow, Heading } from '../shared/Typography';
import { Segmented } from '../shared/Controls';
import { GlassPanel } from '../glass/GlassPanel';
import { LiquidButton } from '../buttons/LiquidButton';

/* Programme at a glance: day selector over a scroll-drawn timeline; rows expand to a short summary */
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
  const d = schedule[Number(day)];
  const detail = (s: (typeof d.items)[number]) =>
    s.summary ?? (s.people?.length ? s.people.map((p) => p.name).join(', ') : s.lanes ? s.lanes.map((l) => l.title).join(', ') : null);
  return (
    <section className="section programme" id="programme" ref={ref} aria-labelledby="prog-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <Eyebrow>Conference programme</Eyebrow>
            <Heading text="Programme" accent="at a glance." id="prog-title" />
          </div>
          <p className="section-intro" data-reveal="">Schedule as issued by the organisers on 29 October 2026. Times are IST.</p>
        </div>
        <div className="prog-wave" aria-hidden="true">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none"><path pathLength={1} d="M0 70 C 150 20, 300 110, 450 64 S 750 20, 900 66 S 1100 100, 1200 50" /></svg>
          {schedule.map((p, i) => (
            <button key={p.label} type="button" tabIndex={-1} className={`prog-node${String(i) === day ? ' is-on' : ''}`} style={{ left: `${30 + i * 40}%` }} onClick={() => setDay(String(i))}>
              <span className="prog-node-dot" /><span className="prog-node-t">{p.label}</span><span className="prog-node-d">{p.date}</span>
            </button>
          ))}
        </div>
        <div className="prog-body">
          <Segmented mode="tab" label="Programme day" value={day} onChange={setDay} options={schedule.map((p, i) => ({ value: String(i), label: <>{p.label} <span className="seg-sub">{p.date.replace(' 2026', '')}</span></> }))} />
          <GlassPanel kind="light" className="prog-day" key={day} role="tabpanel">
            <div className="prog-day-head"><span className="prog-day-date">{d.date}</span><span className="label">{d.label}</span></div>
            <ol className="sched">
              {d.items.filter((s) => s.kind !== 'break').map((s) => {
                const open = openSession === s.id;
                const more = detail(s);
                return (
                  <li key={s.id} className={`sched-row sched-row--confirmed${open ? ' is-open' : ''}`}>
                    <button type="button" className="sched-btn" aria-expanded={more ? open : undefined} onClick={() => more && setOpenSession(open ? null : s.id)}>
                      <span className="sched-time">{fmtTime(s.start)}</span><span className="sched-title">{s.title}</span><span className="sched-type">{kindLabel[s.kind]}</span>
                    </button>
                    {more && <div className="sched-more"><div><p>{more}. <a className="link" href={href('programme', s.id)}>Details in the event flow</a></p></div></div>}
                  </li>
                );
              })}
            </ol>
            <p className="prog-note">Breaks are shown on the event-flow page.</p>
          </GlassPanel>
        </div>
        <div className="actions mt-s" data-reveal=""><LiquidButton href={href('programme')}>Open the full event flow</LiquidButton></div>
      </div>
    </section>
  );
}
