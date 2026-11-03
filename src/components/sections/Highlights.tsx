import { useEffect, useRef } from 'react';
import { meta, links } from '../../data/conference';
import { gsap } from '../../animations/motion';
import { Eyebrow } from '../shared/Typography';
import { GlassPanel } from '../glass/GlassPanel';
import { LiquidButton } from '../buttons/LiquidButton';

/* Statement + conference highlights (first section after the processor story) */
export function ConferenceHighlights() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Statement resolves word by word from blur, scrubbed to scroll (reversible)
      gsap.fromTo('.statement .st-w', { opacity: 0.08, filter: 'blur(8px)' }, {
        opacity: 1, filter: 'blur(0px)', stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: '.statement', start: 'top 80%', end: 'bottom 55%', scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  const statement = ['Two days.', 'Four tracks.', 'One convergence.'];
  return (
    <section className="section highlights" id="highlights" ref={ref} aria-labelledby="hl-title">
      <div className="wrap">
        <p className="statement" aria-label={statement.join(' ')}>
          {statement.map((s, i) => <span className={`st-w${i === 2 ? ' st-w--accent' : ''}`} key={s} aria-hidden="true">{s} </span>)}
        </p>
        <Eyebrow>Conference highlights</Eyebrow>
        <h2 className="visually-hidden" id="hl-title">Conference highlights</h2>
        <div className="bento">
          <GlassPanel kind="light" className="tile tile--id" data-reveal="">
            <p className="label">IEEE Conference ID</p>
            <p className="tile-num"><span data-counter={meta.conferenceId} data-raw="1">{meta.conferenceId}</span></p>
            <p className="tile-cap">Approved by IEEE · PDF eXpress ID {meta.pdfExpressId}</p>
          </GlassPanel>
          <div className="tile" data-reveal=""><p className="label">Dates</p><p className="tile-num tile-num--s">20–21</p><p className="tile-cap">November 2026</p></div>
          <div className="tile" data-reveal=""><p className="label">Research tracks</p><p className="tile-num tile-num--s"><span data-counter="4">4</span></p><p className="tile-cap">Computing, microelectronics, mechatronics and interdisciplinary applications</p></div>
          <div className="tile tile--wide" data-reveal="">
            <p className="label">Publication</p>
            <p className="tile-text">Accepted and presented papers are included in the ICCMM-26 Conference Proceedings and submitted to the IEEE Xplore digital library (Scopus and Google Scholar indexed).</p>
          </div>
          <div className="tile" data-reveal=""><p className="label">Peer review</p><p className="tile-num tile-num--s"><span data-counter="3">3</span>+</p><p className="tile-cap">Independent referees review each paper</p></div>
          <div className="tile tile--formats" data-reveal="">
            <p className="label">Paper format</p>
            <p className="tile-text">4–6 pages, IEEE two-column format, submitted through Microsoft CMT.</p>
            <LiquidButton href={links.cmt} external size="sm">Submit via CMT</LiquidButton>
          </div>
        </div>
      </div>
    </section>
  );
}
