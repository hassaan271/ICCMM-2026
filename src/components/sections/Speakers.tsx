import { speakers, pendingNotice } from '../../data/conference';
import { Eyebrow, Heading } from '../shared/Typography';
import { Img } from '../shared/Img';
import { GlassPanel } from '../glass/GlassPanel';

type Speaker = { name: string; designation: string; institution: string; bio?: string; photo: string };

/* Keynote speakers: portrait grid once announced, otherwise a placeholder layout with the official notice */
export function SpeakerShowcase() {
  const list = speakers as Speaker[];
  return (
    <section className="section speakers" id="speakers" aria-labelledby="speakers-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <Eyebrow>Keynote speakers</Eyebrow>
            <Heading text="Distinguished" accent="keynote speakers." id="speakers-title" />
          </div>
          <p className="section-intro" data-reveal="">Keynote speakers will inspire young graduates to consider research as a career and promote interdisciplinary collaboration.</p>
        </div>
        {list.length ? (
          <ul className="speaker-grid">
            {list.map((s) => (
              <li className="speaker" key={s.name} data-reveal="">
                <figure className="speaker-photo"><Img src={s.photo} w={600} h={750} alt={`Portrait of ${s.name}`} /></figure>
                <GlassPanel kind="frost" className="speaker-info" refraction={14} blur={6}>
                  <h3 className="speaker-name">{s.name}</h3>
                  <p className="speaker-role">{s.designation}</p>
                  <p className="speaker-inst">{s.institution}</p>
                  {s.bio && <p className="speaker-bio">{s.bio}</p>}
                </GlassPanel>
              </li>
            ))}
          </ul>
        ) : (
          <div className="speaker-pending" data-reveal="">
            <ul className="speaker-grid speaker-grid--empty" aria-hidden="true">
              {[0, 1, 2].map((i) => <li className="speaker" key={i}><div className="speaker-photo speaker-photo--empty"><span /></div></li>)}
            </ul>
            <GlassPanel kind="light" className="notice-card" refraction={16} blur={5}>
              <span className="notice-dot" aria-hidden="true" />
              <p className="label">Announcement</p>
              <p className="notice-text">{pendingNotice}</p>
              <p className="notice-sub">Speaker names, designations and institutions will appear here once confirmed by the organising committee.</p>
            </GlassPanel>
          </div>
        )}
      </div>
    </section>
  );
}
