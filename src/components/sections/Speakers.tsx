import { keynoteIds, guestById, displayName, guests } from '../../data/guests';
import { href } from '../../utils/routes';
import { Eyebrow, Heading } from '../shared/Typography';
import { GlassPanel } from '../glass/GlassPanel';
import { LiquidButton } from '../buttons/LiquidButton';
import { Portrait } from '../guests/Portrait';
import { rolesOf, profileHref } from '../guests/guest-roles';

// Home preview: the keynote speakers only. Guests (inaugural, IEEE, session chairs) have their own page.
const featured = keynoteIds.map((id) => guestById(id)!);

export function SpeakerShowcase() {
  return (
    <section className="section speakers" id="speakers" aria-labelledby="speakers-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <Eyebrow>Speakers</Eyebrow>
            <Heading text="Keynote" accent="speakers." id="speakers-title" />
          </div>
          <p className="section-intro" data-reveal="">One keynote address opens each day of the conference. The inaugural session, IEEE Hyderabad Section and session chairs bring {guests.length - keynoteIds.length} further confirmed guests.</p>
        </div>
        <ul className="speaker-grid speaker-grid--keynotes">
          {featured.map((g) => {
            const r = rolesOf(g).find((x) => x.label === 'Keynote Speaker') ?? rolesOf(g)[0];
            return (
              <li className="speaker" key={g.id} data-reveal="">
                <a href={profileHref(g.id)} className="speaker-link" aria-label={`${displayName(g)}, profile`}>
                  <figure className="speaker-photo"><Portrait id={g.id} sizes="(max-width: 560px) 90vw, (max-width: 900px) 45vw, 40vw" /></figure>
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
        <div className="actions mt-s" data-reveal="">
          <LiquidButton href={href('speakers')}>Meet the speakers</LiquidButton>
          <LiquidButton href={href('guests')} variant="glass">Meet the guests</LiquidButton>
        </div>
      </div>
    </section>
  );
}
