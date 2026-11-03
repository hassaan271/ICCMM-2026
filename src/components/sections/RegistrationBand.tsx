import { fees, links } from '../../data/conference';
import { href } from '../../utils/routes';
import { Eyebrow } from '../shared/Typography';
import { GlassPanel } from '../glass/GlassPanel';
import { LiquidButton, RegisterButton } from '../buttons/LiquidButton';

/* Blue registration band with fee summary, followed by quick links */
export function RegistrationSection() {
  const fee = (id: string, member: boolean) => fees.rows.find((r) => r.id === id && r.member === member)!;
  return (
    <section className="section info" id="information" aria-labelledby="info-title">
      <div className="wrap">
        <div className="info-band" data-reveal="">
          <div className="info-liquid" aria-hidden="true"><span /><span /><span /></div>
          <div className="info-head">
            <Eyebrow light>Registration &amp; participation</Eyebrow>
            <h2 className="title title--light" id="info-title">Present your research at <em>ICCMM-26.</em></h2>
            <p className="info-intro">Only registered delegates may attend and present. At least one author of every accepted paper must register and present it at the conference.</p>
            <div className="info-ctas">
              <RegisterButton variant="light" />
              <LiquidButton href={href('registration')} variant="ghost-light">Categories &amp; fees</LiquidButton>
            </div>
          </div>
          <ul className="info-fees">
            {fees.profiles.map((p) => {
              const r = fee(p.id, false), m = fee(p.id, true);
              return (
                <GlassPanel kind="dark" as="li" key={p.id}>
                  <p className="info-cat">{p.label}</p>
                  <p className="info-amt"><span className="info-cur">₹</span>{r.inr.toLocaleString('en-IN')}<span className="info-plus">+ GST</span></p>
                  <p className="info-sub">${r.usd} international · IEEE member ₹{m.inr.toLocaleString('en-IN')}</p>
                </GlassPanel>
              );
            })}
          </ul>
        </div>
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
