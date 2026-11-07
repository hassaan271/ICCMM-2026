import { links } from '../../data/conference';
import { href } from '../../utils/routes';
import { GlassPanel } from '../glass/GlassPanel';

/* Quick links: paper submission, author guidelines and the poster session */
export function RegistrationSection() {
  return (
    <section className="section info" id="information" aria-label="Paper submission, guidelines and poster session">
      <div className="wrap">
        <div className="info-cards">
          <GlassPanel kind="light" as="a" className="icard" href={links.cmt} target="_blank" rel="noopener noreferrer" data-reveal="">
            <span className="label">Paper submission</span><span className="icard-t">Microsoft CMT</span><span className="icard-d">Submit 4–6 page papers in IEEE two-column format.</span><span className="icard-go" aria-hidden="true">↗</span>
          </GlassPanel>
          <GlassPanel kind="light" as="a" className="icard" href={href('cfp', 'submission')} data-reveal="">
            <span className="label">Guidelines</span><span className="icard-t">Author instructions</span><span className="icard-d">Submission, review, camera-ready and e-copyright.</span><span className="icard-go" aria-hidden="true">→</span>
          </GlassPanel>
          <GlassPanel kind="light" as="a" className="icard" href={href('events')} data-reveal="">
            <span className="label">Technical event</span><span className="icard-t">Special Poster Session</span><span className="icard-d">Sustainable and Intelligent Technologies for Transformative Solutions.</span><span className="icard-go" aria-hidden="true">→</span>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
}
