import { useEffect, useRef, useState } from 'react';
import { posterSession, posterDates, meta, fees, eventFee } from '../data/conference';
import { href } from '../utils/routes';
import { lockScroll } from '../animations/motion';
import { Accordion } from '../components/shared/Controls';
import { Eyebrow, Heading, Words, pad } from '../components/shared/Typography';
import { GlassPanel } from '../components/glass/GlassPanel';
import { LiquidButton } from '../components/buttons/LiquidButton';
import { PageHeader } from '../components/shared/PageHeader';
import { Timeline, Caveat } from '../components/shared/Timeline';

const posters = [
  { src: 'assets/images/call-for-posters', caption: 'Call for Posters', alt: 'ICCMM-26 Call for Posters, 20–21 November 2026: Sustainable and Intelligent Technologies for Transformative Solutions. Poster tracks, submission guidelines (250–300 word abstract to iccmm@mjcollege.ac.in), poster presentation, who should submit, and important dates: abstract deadline 10 November 2026, acceptance 12 November, registration 13 November, presentation 21 November 2026. Venue: MJCET, Banjara Hills, Hyderabad.' },
];

function Lightbox({ item, onClose }: { item: (typeof posters)[number]; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    lockScroll(true);
    close.current?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'Tab') { e.preventDefault(); close.current?.focus(); } };
    window.addEventListener('keydown', k);
    return () => { lockScroll(false); window.removeEventListener('keydown', k); };
  }, [onClose]);
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Poster preview: ${item.caption}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button className="lightbox-close" type="button" ref={close} onClick={onClose} aria-label="Close preview">×</button>
      <img src={`${item.src}.webp`} alt={item.alt} />
    </div>
  );
}

export function Events() {
  const posterFee = fees.other.find((f) => f.label === 'Poster Presentation')!;
  const thesisFee = fees.other.find((f) => f.label.startsWith('Best PhD'))!;
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement[]>([]);
  return (
    <>
      <PageHeader eyebrow="Technical event" title="Special" accent="poster session." intro={posterSession.intro}
        crumbs={[{ text: 'Call for Papers', url: href('cfp') }, { text: 'Technical Events' }]}
        subnav={[{ id: 'theme', text: 'Theme & tracks' }, { id: 'guidelines', text: 'Guidelines' }, { id: 'posters-official', text: 'Official poster' }, { id: 'poster-dates', text: 'Published dates' }]} />

      <section className="section" id="theme" aria-labelledby="theme-title">
        <div className="wrap">
          <Eyebrow>Poster theme</Eyebrow>
          <h2 className="title title--xl" id="theme-title" data-split=""><Words text="Sustainable and Intelligent Technologies" /> <span className="title-accent"><Words text="for Transformative Solutions" /></span></h2>
          <p className="lead" data-reveal="">{posterSession.focus}</p>
          <div className="cols-2 mt">
            <div data-reveal="">
              <h3 className="h3">Suggested poster tracks <span className="muted">(but not limited to)</span></h3>
              <ul className="ptracks">{posterSession.tracks.map((t, i) => <li key={t}><span className="ptracks-no">{pad(i + 1)}</span>{t}</li>)}</ul>
            </div>
            <div data-reveal="">
              <h3 className="h3">Who should submit?</h3>
              <ul className="chips">{posterSession.audience.map((a) => <li className="chip" key={a}>{a}</li>)}</ul>
              <h3 className="h3 mt">Poster presentation</h3>
              <ul className="plain-list">{posterSession.presentation.map((p) => <li key={p}>{p}</li>)}</ul>
              <GlassPanel kind="light" className="fee-mini">
                <p className="label">Registration fee (INR)</p>
                <p><strong>Poster Presentation:</strong> {eventFee(posterFee).price} {eventFee(posterFee).unit} · {posterFee.note}</p>
                <p><strong>Best PhD / M.Tech Thesis Presentation:</strong> {eventFee(thesisFee).price} {eventFee(thesisFee).unit}</p>
              </GlassPanel>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint" id="guidelines" aria-labelledby="g-title">
        <div className="wrap cols-2">
          <div>
            <Eyebrow>Submission guidelines</Eyebrow>
            <Heading text="Poster" accent="guidelines." id="g-title" />
            <GlassPanel kind="frost" className="contact-card" data-reveal="">
              <p className="label">Contact &amp; further information</p>
              <a className="contact-card-mail" href={`mailto:${meta.email}?subject=${encodeURIComponent('ICCMM-26 Poster Session')}`}>{meta.email}</a>
            </GlassPanel>
          </div>
          <div className="acc-group" data-reveal="">
            {posterSession.guidelines.map(([k, v], i) => <Accordion key={k} no={pad(i + 1)} title={k} defaultOpen={i === 0}><p>{v}</p></Accordion>)}
          </div>
        </div>
      </section>

      <section className="section" id="posters-official" aria-labelledby="op-title">
        <div className="wrap">
          <Eyebrow>Official poster</Eyebrow>
          <Heading text="Call for" accent="posters." id="op-title" />
          <p className="section-intro" data-reveal="">The official ICCMM-26 Call for Posters, reproduced as issued. Select the poster to view it full size.</p>
          <div className="poster-row">
            {posters.map((p, i) => (
              <figure className="poster-fig" key={p.src} data-reveal="">
                <button className="poster-btn" type="button" ref={(b) => { if (b) opener.current[i] = b; }} onClick={() => setOpen(i)} aria-label={`Enlarge: ${p.caption}`}>
                  <img src={`${p.src}-560.webp`} srcSet={`${p.src}-560.webp 560w, ${p.src}.webp 1131w`} sizes="(max-width: 700px) 90vw, 30vw" width={560} height={792} alt={p.alt} loading="lazy" />
                  <span className="poster-zoom" aria-hidden="true">Enlarge</span>
                </button>
                <figcaption>{p.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint" id="poster-dates" aria-labelledby="pd-title">
        <div className="wrap">
          <Eyebrow>Dates as published</Eyebrow>
          <Heading text="Thesis & poster" accent="dates." id="pd-title" />
          <Caveat />
          <div className="acc-group" data-reveal="">
            <Accordion no="01" title="Thesis and poster dates as listed on the conference website"><Timeline items={posterDates} /></Accordion>
          </div>
          <div className="actions mt-s"><LiquidButton href={`mailto:${meta.email}?subject=${encodeURIComponent('ICCMM-26 Poster Session')}`}>Contact the organisers</LiquidButton></div>
        </div>
      </section>

      {open !== null && <Lightbox item={posters[open]} onClose={() => { const i = open; setOpen(null); opener.current[i]?.focus(); }} />}
    </>
  );
}
