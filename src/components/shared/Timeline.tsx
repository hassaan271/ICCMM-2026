import { useEffect, useRef } from 'react';
import { GlassPanel } from '../glass/GlassPanel';

type DateItem = { label: string; date: string; iso: string; past?: string[]; isEvent?: boolean };

// Dates as published (superseded entries struck through), with statuses relative to today in IST
export function Timeline({ items }: { items: DateItem[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const todayIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const today = new Date(todayIso + 'T00:00:00');
  let nextFound = false, lastPast = -1;
  const rows = items.map((d, i) => {
    const days = Math.round((new Date(d.iso + 'T00:00:00').getTime() - today.getTime()) / 86400000);
    let status = '', cls = '';
    if (days < 0) { status = d.isEvent ? 'Concluded' : 'Passed'; cls = 'is-past'; lastPast = i; }
    else {
      const when = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;
      if (!nextFound) { nextFound = true; cls = 'is-next'; status = `Next · ${when}`; } else status = when;
    }
    return { d, status, cls };
  });
  const fill = lastPast < 0 ? 0 : ((lastPast + 0.5) / items.length) * 100;
  useEffect(() => { ref.current?.style.setProperty('--fill', `${fill}%`); }, [fill]);
  return (
    <ol className="timeline" ref={ref}>
      <span className="timeline-line" aria-hidden="true"><span className="timeline-fill" /></span>
      {rows.map(({ d, status, cls }) => (
        <li key={d.label} className={`tl-item ${cls} ${d.isEvent ? 'tl-item--event' : ''}`}>
          <span className="tl-node" aria-hidden="true" />
          <div className="tl-when">
            {d.past && <span className="tl-past"><span className="visually-hidden">Previously listed as </span>{d.past.map((p) => <s key={p}>{p}</s>)}</span>}
            <span className="tl-date">{d.date}</span>
          </div>
          <div className="tl-what"><span className="tl-label">{d.label}</span><span className="tl-status">{status}</span></div>
        </li>
      ))}
    </ol>
  );
}

export const datesCaveat =
  'These dates are reproduced as published on the conference website, where several were extended (earlier dates are struck through). Some differ from the conference brochure, so please confirm deadlines with the organisers at iccmm@mjcollege.ac.in.';

export const Caveat = () => (
  <GlassPanel kind="light" className="caveat" data-reveal=""><span className="caveat-ico" aria-hidden="true">i</span><p>{datesCaveat}</p></GlassPanel>
);
