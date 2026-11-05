import { tracks, callForPapers, authorGuide, links, importantDates, meta } from '../data/conference';
import { Accordion, Rules } from '../components/shared/Controls';
import { Eyebrow, Heading, pad } from '../components/shared/Typography';
import { LiquidButton } from '../components/buttons/LiquidButton';
import { PageHeader } from '../components/shared/PageHeader';
import { Timeline, Caveat } from '../components/shared/Timeline';
import { CopyButton } from '../components/shared/Controls';
import { TrackIcon } from '../components/shared/Icons';
import { GlassPanel } from '../components/glass/GlassPanel';

const Steps = () => (
  <ol className="steps">
    {authorGuide.steps.map((s, i) => (
      <li className="step" key={s.title}>
        <span className="step-no">{pad(i + 1)}</span>
        <div className="step-body">
          <h4 className="step-title">Step {i + 1}: {s.title}</h4>
          {s.body.map((b) => <p key={b.slice(0, 30)}>{b}</p>)}
          {'notices' in s && s.notices && (
            <ul className="notices">
              {authorGuide.copyrightNotices.map((n) => (
                <li className="notice" key={n.notice}>
                  <span className="notice-who">{n.who}</span>
                  <code className="notice-code">{n.notice}</code>
                  <CopyButton text={n.notice} aria={`Copy notice: ${n.notice}`} />
                </li>
              ))}
            </ul>
          )}
          {'link' in s && s.link && <div className="actions"><LiquidButton href={links.aiReportForm} external size="sm">Upload AI-content report</LiquidButton></div>}
        </div>
      </li>
    ))}
  </ol>
);

export function CallForPapers() {
  return (
    <>
      <PageHeader eyebrow="Call for Papers" title="Call for" accent="papers." intro={callForPapers.intro} crumbs={[{ text: 'Call for Papers' }]}
        subnav={[{ id: 'tracks', text: 'Research tracks' }, { id: 'submission', text: 'Submission' }, { id: 'camera-ready', text: 'Camera-ready' }, { id: 'publication', text: 'Publication' }, { id: 'dates', text: 'Published dates' }]} />

      <section className="section" id="tracks" aria-labelledby="t-title">
        <div className="wrap">
          <Eyebrow>Research tracks</Eyebrow>
          <Heading text="Broad areas" accent="of interest." id="t-title" />
          <div className="cfp-tracks">
            {tracks.map((t) => (
              <GlassPanel kind="light" as="article" className="cfp-track" id={`track-${t.no}`} key={t.no} data-reveal="">
                <header className="cfp-track-head">
                  <span className="cfp-track-ico"><TrackIcon kind={t.icon} /></span>
                  <div><p className="label">Track {Number(t.no)}</p><h3 className="cfp-track-title">{t.title}</h3></div>
                </header>
                <ul className="cfp-topics">{t.topics.map((x) => <li key={x}>{x}</li>)}</ul>
              </GlassPanel>
            ))}
          </div>
          <p className="note" data-reveal=""><strong>Note:</strong> {callForPapers.note}</p>
        </div>
      </section>

      <section className="section section--tint" id="submission" aria-labelledby="s-title">
        <div className="wrap">
          <div className="section-head">
            <div><Eyebrow>Guidelines for paper submission</Eyebrow><Heading text="Submission" accent="& review." id="s-title" /></div>
            <div className="actions" data-reveal="">
              <LiquidButton href={links.cmt} external>Submit via Microsoft CMT</LiquidButton>
              <LiquidButton href={links.ieeeTemplates} external variant="glass">IEEE templates</LiquidButton>
            </div>
          </div>
          <div className="cols-2">
            <div data-reveal=""><h3 className="h3">General instructions</h3><Rules items={authorGuide.general} /></div>
            <div data-reveal="">
              <h3 className="h3">Submission and review process</h3><Rules items={authorGuide.review} />
              <p className="small muted mt-s">CMT: <a className="link" href={links.cmt} target="_blank" rel="noopener noreferrer">{links.cmt.replace('https://', '')}</a> · Templates: <a className="link" href={links.ieeeTemplates} target="_blank" rel="noopener noreferrer">ieee.org/conferences/publishing/templates</a></p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="camera-ready" aria-labelledby="c-title">
        <div className="wrap">
          <Eyebrow>Camera-ready and e-copyright</Eyebrow>
          <Heading text="Final" accent="camera-ready paper." id="c-title" />
          <p className="section-intro" data-reveal="">Please prepare your camera-ready paper by strictly following the guidelines given below.</p>
          <div className="kpis" data-reveal="">
            <div className="kpi"><span className="kpi-v">&lt;20%</span><span className="kpi-l">Similarity index, excluding references</span></div>
            <div className="kpi"><span className="kpi-v">≤4%</span><span className="kpi-l">Similarity from any single source</span></div>
            <div className="kpi"><span className="kpi-v">&lt;20%</span><span className="kpi-l">AI-generated content score (Turnitin)</span></div>
            <div className="kpi"><span className="kpi-v">6</span><span className="kpi-l">Maximum pages</span></div>
          </div>
          <div className="acc-group" data-reveal="">
            <Accordion no="01" title="General guidelines" defaultOpen><Rules items={authorGuide.cameraReady} /></Accordion>
            <Accordion no="02" title="Additional formatting requirements"><Rules items={authorGuide.formatting} /></Accordion>
            <Accordion no="03" title="Submission to the CMT portal (6 steps)">
              <p className="acc-lead">Follow the steps below to prepare and submit the final camera-ready paper and copyright form. IEEE PDF eXpress Conference ID: <strong>{meta.pdfExpressId}</strong>.</p>
              <Steps />
            </Accordion>
          </div>
        </div>
      </section>

      <section className="section section--tint" id="publication" aria-labelledby="p-title">
        <div className="wrap cols-2 cols-2--center">
          <div><Eyebrow>Publication</Eyebrow><Heading text="IEEE" accent="proceedings." id="p-title" /></div>
          <div data-reveal="">
            <p className="lead">{callForPapers.publication}</p>
            <p className="muted mt-s">{authorGuide.publication}</p>
            <p className="invite">{callForPapers.invitation}</p>
          </div>
        </div>
      </section>

      <section className="section" id="dates" aria-labelledby="d-title">
        <div className="wrap">
          <Eyebrow>Dates as published</Eyebrow>
          <Heading text="Published" accent="dates." id="d-title" />
          <Caveat />
          <div className="acc-group" data-reveal="">
            <Accordion no="01" title="Paper dates as listed on the conference website"><Timeline items={importantDates} /></Accordion>
          </div>
          <p className="cmt-ack">{authorGuide.cmtAck}</p>
        </div>
      </section>
    </>
  );
}
