import { useState } from 'react';
import { meta, links, organizers } from '../data/conference';
import { Eyebrow, Heading } from '../components/shared/Typography';
import { GlassPanel } from '../components/glass/GlassPanel';
import { Img } from '../components/shared/Img';
import { LiquidButton } from '../components/buttons/LiquidButton';
import { PageHeader } from '../components/shared/PageHeader';
import { CopyButton } from '../components/shared/Controls';
import { Phones } from '../components/footer/ConferenceFooter';

export function Venue() {
  const [mapOn, setMapOn] = useState(false);
  return (
    <>
      <PageHeader eyebrow="Venue & travel" title="Venue" accent="& contact." crumbs={[{ text: 'Venue & Contact' }]}
        intro={`ICCMM-26 takes place at ${meta.institution}, Banjara Hills, Hyderabad, on 20–21 November 2026.`}
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
          <GlassPanel kind="light" className="map">
            {mapOn ? (
              <iframe src={links.mapsEmbed} title="Map: Muffakham Jah College of Engineering and Technology, Banjara Hills, Hyderabad" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <>
                <div className="map-poster" aria-hidden="true">
                  <svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
                    <g fill="none" stroke="#C9D3DB" strokeWidth="1.2">{Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M-20 ${30 + i * 34} C 200 ${i * 34}, 520 ${70 + i * 34}, 820 ${i * 34 + 10}`} />)}</g>
                    <circle cx="420" cy="210" r="8" fill="#0A6FA5" /><circle cx="420" cy="210" r="26" fill="none" stroke="#0A6FA5" strokeOpacity=".4" className="map-ping" />
                  </svg>
                </div>
                <GlassPanel kind="clear" as="button" className="map-load" type="button" onClick={() => setMapOn(true)} refraction={14} blur={2}>
                  <span className="label">Interactive map</span><span className="map-load-t">Load Google Maps</span><span className="muted small">Loads content from Google</span>
                </GlassPanel>
              </>
            )}
          </GlassPanel>
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
