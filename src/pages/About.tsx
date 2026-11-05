import { about, meta, organizers, sponsorsLine, importantDates } from '../data/conference';
import { schedule } from '../data/schedule';
import { guests } from '../data/guests';
import { href } from '../utils/routes';
import { Eyebrow, Heading, pad } from '../components/shared/Typography';
import { PageHeader } from '../components/shared/PageHeader';
import { GlassPanel } from '../components/glass/GlassPanel';
import { RegisterButton } from '../components/buttons/LiquidButton';
import { Timeline, Caveat } from '../components/shared/Timeline';
import { ArrowIcon } from '../components/shared/Icons';

const explore = [
  { url: href('programme'), label: 'Programme', t: 'Event flow', d: `Two days, ${schedule.reduce((n, d) => n + d.items.length, 0)} programme items, as issued by the organisers.` },
  { url: href('guests'), label: 'People', t: 'Speakers & guests', d: `${guests.length} confirmed guests, keynote speakers and session chairs.` },
  { url: href('tracks'), label: 'Research', t: 'Technical tracks', d: 'Four tracks across computing, microelectronics and mechatronics.' },
];

export function About() {
  return (
    <>
      <PageHeader eyebrow="About the conference" title="About" accent="ICCMM-26." intro={about.lead}
        crumbs={[{ text: 'About' }]}
        subnav={[{ id: 'overview', text: 'Overview' }, { id: 'organisers', text: 'Organisers' }, { id: 'key-dates', text: 'Key dates' }, { id: 'explore', text: 'Explore' }]} />

      <section className="section" id="overview" aria-labelledby="ov-title">
        <div className="wrap cols-2">
          <div>
            <Eyebrow>Overview</Eyebrow>
            <Heading text="Where three disciplines" accent="converge." id="ov-title" />
            <ul className="chips" data-reveal="">{about.disciplines.map((d) => <li className="chip" key={d}>{d}</li>)}</ul>
            <GlassPanel kind="light" as="dl" className="about-facts" data-reveal="">
              <div><dt className="label">Dates</dt><dd>{meta.dates}</dd></div>
              <div><dt className="label">Venue</dt><dd>{meta.institution}, Hyderabad</dd></div>
              <div><dt className="label">IEEE Conference ID</dt><dd>#{meta.conferenceId}</dd></div>
              {sponsorsLine.map((s) => <div key={s.role}><dt className="label">{s.role}</dt><dd>{s.name}</dd></div>)}
            </GlassPanel>
          </div>
          <div className="about-body">
            {about.body.map((p) => <p key={p.slice(0, 30)} data-reveal="">{p}</p>)}
            <h3 className="h3 mt" data-reveal="">What the programme includes</h3>
            <ul className="ptracks" data-reveal="">{about.formats.map((f, i) => <li key={f}><span className="ptracks-no">{pad(i + 1)}</span>{f}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="section section--tint" id="organisers" aria-labelledby="orgn-title">
        <div className="wrap">
          <Eyebrow>Organisers</Eyebrow>
          <Heading text="Hosted by MJCET with the" accent="IEEE Hyderabad Section." id="orgn-title" />
          <div className="org-duo">
            {[organizers.mjcet, organizers.ieee].map((o) => (
              <GlassPanel kind="light" as="article" className="orgcard" key={o.name} data-reveal="">
                <p className="label">{o === organizers.mjcet ? 'Host institution' : 'Technical sponsor'}</p>
                <h3 className="orgcard-name">{(o as { fullName?: string }).fullName ?? o.name}</h3>
                <div className="orgcard-marks">{o.marks.map((m) => <div key={m.label}><span className="orgcard-v">{m.value}</span><span className="orgcard-l">{m.label}</span></div>)}</div>
                <div className="orgcard-more">{o.paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="key-dates" aria-labelledby="kd-title">
        <div className="wrap">
          <Eyebrow>Dates as published</Eyebrow>
          <Heading text="Key" accent="dates." id="kd-title" />
          <Caveat />
          <div data-reveal=""><Timeline items={importantDates} /></div>
        </div>
      </section>

      <section className="section section--tint" id="explore" aria-labelledby="ex-title">
        <div className="wrap">
          <div className="section-head">
            <div><Eyebrow>Explore</Eyebrow><Heading text="Plan your" accent="two days." id="ex-title" /></div>
            <div data-reveal=""><RegisterButton /></div>
          </div>
          <div className="info-cards">
            {explore.map((c) => (
              <a className="icard" href={c.url} key={c.t} data-reveal="">
                <span className="label">{c.label}</span><span className="icard-t">{c.t}</span><span className="icard-d">{c.d}</span>
                <span className="icard-go" aria-hidden="true"><ArrowIcon /></span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
