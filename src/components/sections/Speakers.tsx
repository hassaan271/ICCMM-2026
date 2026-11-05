import { keynoteIds, guestById, displayName, guests } from '../../data/guests';
import { href } from '../../utils/routes';
import { Eyebrow, Heading } from '../shared/Typography';
import { GlassPanel } from '../glass/GlassPanel';
import { LiquidButton } from '../buttons/LiquidButton';
import { Portrait } from '../guests/Portrait';
import { rolesOf } from '../guests/guest-roles';

// Home preview: both keynote speakers and the IEEE Hyderabad Section Chair (Guest of Honour)
const featured = [...keynoteIds, 'mgpl-narayana'].map((id) => guestById(id)!);

export function SpeakerShowcase() {
  return (
    <section className="section speakers" id="speakers" aria-labelledby="speakers-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <Eyebrow>Speakers &amp; guests</Eyebrow>
            <Heading text="Distinguished" accent="speakers & guests." id="speakers-title" />
          </div>
          <p className="section-intro" data-reveal="">Two keynote addresses, an inaugural session with the IEEE Hyderabad Section and SUES, and {guests.length} confirmed guests across both days.</p>
        </div>
        <ul className="speaker-grid">
          {featured.map((g) => {
            const r = rolesOf(g).find((x) => x.label === 'Keynote Speaker') ?? rolesOf(g)[0];
            return (
              <li className="speaker" key={g.id} data-reveal="">
                <a href={href('guests', `guest-${g.id}`)} className="speaker-link" aria-label={`${displayName(g)}, profile`}>
                  <figure className="speaker-photo"><Portrait id={g.id} sizes="(max-width: 760px) 90vw, 30vw" /></figure>
                  <GlassPanel kind="frost" className="speaker-info" refraction={14} blur={6}>
                    {r && <p className="speaker-tag">{r.label} · {r.when.split(' · ')[0]}</p>}
                    <h3 className="speaker-name">{displayName(g)}</h3>
                    <p className="speaker-role">{g.designation ?? 'Designation to be confirmed'}</p>
                    <p className="speaker-inst">{g.organization}</p>
                  </GlassPanel>
                </a>
              </li>
            );
          })}
        </ul>
        <div className="actions mt-s" data-reveal=""><LiquidButton href={href('guests')}>Meet all speakers &amp; guests</LiquidButton></div>
      </div>
    </section>
  );
}
