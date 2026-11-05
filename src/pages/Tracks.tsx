import { useEffect, useState } from 'react';
import { tracks } from '../data/conference';
import { trackSessions, fmtTime, weekday } from '../data/schedule';
import { href } from '../utils/routes';
import { Eyebrow, Words } from '../components/shared/Typography';
import { PageHeader } from '../components/shared/PageHeader';
import { GlassPanel } from '../components/glass/GlassPanel';
import { TrackIcon } from '../components/shared/Icons';
import { LiquidButton } from '../components/buttons/LiquidButton';

export function Tracks() {
  const [active, setActive] = useState('');
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.trk').forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <PageHeader eyebrow="Technical tracks" title="Four tracks," accent="one convergence." crumbs={[{ text: 'Technical Tracks' }]}
        intro="Original research papers and case studies are invited in computing, microelectronics and mechatronics. Each track below lists its research areas and the sessions in which it is presented."
        subnav={tracks.map((t) => ({ id: `track-${t.no}`, text: `Track ${t.no}` }))} />

      <section className="section" aria-label="Technical tracks">
        <div className="wrap trk-layout">
          <GlassPanel kind="light" as="aside" className="role-index trk-index" aria-label="Tracks">
            <p className="label">Tracks</p>
            <ul>{tracks.map((t) => <li key={t.no}><a href={`#track-${t.no}`} className={active === `track-${t.no}` ? 'is-active' : ''}>{t.key}<span>{t.no}</span></a></li>)}</ul>
          </GlassPanel>
          <div className="trk-list">
            {tracks.map((t) => {
              const sessions = trackSessions(t.no);
              return (
                <article className="trk" id={`track-${t.no}`} key={t.no} aria-labelledby={`trk-${t.no}-t`}>
                  <div className="trk-head">
                    <span className="trk-no" aria-hidden="true">{t.no}</span>
                    <span className="trk-ico is-active"><TrackIcon kind={t.icon} /></span>
                  </div>
                  <Eyebrow>Track {t.no} · {t.key}</Eyebrow>
                  <h2 className="trk-title" id={`trk-${t.no}-t`} data-split=""><Words text={t.title} /></h2>
                  <p className="lead" data-reveal="">{t.summary}</p>
                  <div className="trk-grid">
                    <div data-reveal="">
                      <h3 className="h3">Research areas <span className="muted">({t.topics.length})</span></h3>
                      <ul className="trk-topics">{t.topics.map((x) => <li key={x}>{x}</li>)}</ul>
                    </div>
                    <div data-reveal="">
                      <h3 className="h3">In the programme</h3>
                      {sessions.length ? (
                        <ul className="trk-sessions">
                          {sessions.map(({ day, item, lane }) => (
                            <li key={lane.title}>
                              <a href={href('programme', item.id)} className="trk-session">
                                <span className="label">{day.label} · {weekday(day.iso)} {day.date.replace(' 2026', '')}</span>
                                <span className="trk-session-t">{lane.title}</span>
                                <span className="trk-session-m">{fmtTime(item.start)} – {fmtTime(item.end)}</span>
                                {lane.chair && <span className="trk-session-m">Chair: {lane.chair.name} ({lane.chair.detail})</span>}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="muted">No session for this track is listed in the schedule yet.</p>}
                    </div>
                  </div>
                  <div className="actions">
                    <LiquidButton href={href('cfp', 'track-' + t.no)} variant="glass" size="sm">Call for papers</LiquidButton>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
