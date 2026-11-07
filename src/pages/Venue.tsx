import { useEffect, useRef, useState } from 'react';
import { meta, links, organizers, pageText, fillText } from '../data/conference';
import { Eyebrow, Heading } from '../components/shared/Typography';
import { GlassPanel } from '../components/glass/GlassPanel';
import { Img } from '../components/shared/Img';
import { LiquidButton } from '../components/buttons/LiquidButton';
import { PageHeader } from '../components/shared/PageHeader';
import { CopyButton } from '../components/shared/Controls';
import { Phones } from '../components/footer/ConferenceFooter';

/* Google Map, loaded automatically as the section approaches the viewport (no click needed).
   Cross-origin iframes give no error event, so a load that has not completed within 15 s, or a browser
   that is offline, shows a fallback with a direct Google Maps link instead of an empty frame. */
function VenueMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  useEffect(() => {
    const el = ref.current!;
    const start = () => setState((s) => (s === 'idle' ? (navigator.onLine === false ? 'failed' : 'loading') : s));
    if (!('IntersectionObserver' in window)) { start(); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { start(); io.disconnect(); } }, { rootMargin: '600px 0px' });
    io.observe(el);
    // Safety net for browsers that never report the intersection: load anyway once the page has settled
    const t = window.setTimeout(start, 3500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  useEffect(() => {
    if (state !== 'loading') return;
    const t = window.setTimeout(() => setState((s) => (s === 'loading' ? 'failed' : s)), 15000);
    return () => clearTimeout(t);
  }, [state]);
  return (
    <div ref={ref}>
    <GlassPanel kind="light" className={`map is-${state}`}>
      <div className="map-poster" aria-hidden="true">
        <svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#C9D3DB" strokeWidth="1.2">{Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M-20 ${30 + i * 34} C 200 ${i * 34}, 520 ${70 + i * 34}, 820 ${i * 34 + 10}`} />)}</g>
          <circle cx="420" cy="210" r="8" fill="#0A6FA5" /><circle cx="420" cy="210" r="26" fill="none" stroke="#0A6FA5" strokeOpacity=".4" className="map-ping" />
        </svg>
      </div>
      {(state === 'loading' || state === 'loaded') && (
        <iframe src={links.mapsEmbed} title="Map: Muffakham Jah College of Engineering and Technology, Banjara Hills, Hyderabad"
          referrerPolicy="no-referrer-when-downgrade" allowFullScreen onLoad={() => setState('loaded')} />
      )}
      {state === 'failed' && (
        <GlassPanel kind="clear" className="map-load" role="status" refraction={14} blur={2}>
          <span className="label">Map unavailable</span>
          <span className="map-load-t">The map could not be loaded here.</span>
          <LiquidButton href={links.maps} external size="sm">Open in Google Maps</LiquidButton>
        </GlassPanel>
      )}
    </GlassPanel>
    </div>
  );
}

export function Venue() {
  return (
    <>
      <PageHeader eyebrow={pageText.venue.eyebrow} title={pageText.venue.title} accent={pageText.venue.accent} crumbs={[{ text: 'Venue & Contact' }]}
        intro={fillText(pageText.venue.intro)}
        subnav={[{ id: 'campus', text: 'Campus' }, { id: 'map', text: 'Map' }, { id: 'contact-us', text: 'Contact us' }]} />

      <section className="section" id="campus" aria-labelledby="campus-title">
        <div className="wrap">
          <figure className="wide-img" data-clip-reveal="">
            <div data-parallax=""><Img src="assets/images/campus-2000.webp" w={2000} h={946} alt="Muffakham Jah College of Engineering and Technology campus building with lawns and a fountain" /></div>
          </figure>
          <div className="cols-2 mt">
            <div><Eyebrow>Our college location</Eyebrow><Heading text="Muffakham Jah College" accent="of Engineering and Technology." id="campus-title" /></div>
            <div data-reveal="">
              <address className="lead">{meta.address}</address>
              <div className="actions"><LiquidButton href={links.maps} external>Open in Google Maps</LiquidButton></div>
              <p className="muted mt-s">{organizers.mjcet.paragraphs[1]}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint" id="map" aria-labelledby="map-title">
        <div className="wrap">
          <Eyebrow>Map</Eyebrow>
          <h2 className="visually-hidden" id="map-title">Map</h2>
          <VenueMap />
        </div>
      </section>

      <section className="section" id="contact-us" aria-labelledby="contact-title">
        <div className="wrap">
          <Eyebrow>Contact us</Eyebrow>
          <Heading text="Get in" accent="touch." id="contact-title" />
          <div className="contact-grid">
            <GlassPanel kind="light" className="contact-card" data-reveal="">
              <p className="label">Email us</p>
              <a className="contact-card-mail" href={`mailto:${meta.email}`}>{meta.email}</a>
              <CopyButton text={meta.email} label="Copy address" aria="Copy email address" />
            </GlassPanel>
            <GlassPanel kind="frost" className="contact-card" data-reveal=""><p className="label">Contact No.</p><Phones /></GlassPanel>
            <GlassPanel kind="frost" className="contact-card" data-reveal="">
              <p className="label">Website</p>
              <a className="link" href={meta.website}>{meta.website.replace('https://', '').replace(/\/$/, '')}</a>
              <p className="label mt-s">Address</p>
              <address>{meta.address}</address>
            </GlassPanel>
          </div>
        </div>
      </section>
    </>
  );
}
