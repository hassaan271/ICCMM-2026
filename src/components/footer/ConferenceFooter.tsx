import { meta, supporters } from '../../data/conference';
import { href } from '../../utils/routes';

const tel = (p: string) => (/^\+91\d{10}$/.test(p.replace(/\s/g, '')) ? `tel:${p.replace(/\s/g, '')}` : null);

// Contact numbers as printed in the brochure; only valid 10-digit mobiles are dialable
export const Phones = () => (
  <ul className="phones">
    {meta.phones.map((p) => <li key={p}>{tel(p) ? <a href={tel(p)!}>{p}</a> : p}</li>)}
  </ul>
);

export function ConferenceFooter() {
  return (
    <footer className="footer" id="contact" aria-labelledby="footer-title">
      <div className="wrap footer-top">
        <div className="footer-id">
          <h2 className="footer-title" id="footer-title">ICCMM-26</h2>
          <p className="footer-theme">{meta.edition} {meta.title}</p>
          <p className="footer-date">20–21 November 2026 · MJCET, Hyderabad · IEEE Conference ID {meta.conferenceId}</p>
        </div>
        <div className="footer-col">
          <p className="label">Email us</p>
          <a className="footer-mail" href={`mailto:${meta.email}`}>{meta.email}</a>
          <p className="label">Contact No.</p>
          <Phones />
        </div>
        <div className="footer-col">
          <p className="label">Address</p>
          <address>{meta.address}</address>
        </div>
        <nav className="footer-col" aria-label="Footer">
          <p className="label">Conference</p>
          <ul className="footer-links">
            <li><a href={href('about')}>About the Conference</a></li>
            <li><a href={href('programme')}>Programme &amp; Event Flow</a></li>
            <li><a href={href('guests')}>Speakers &amp; Guests</a></li>
            <li><a href={href('tracks')}>Technical Tracks</a></li>
            <li><a href={href('cfp')}>Call for Papers</a></li>
            <li><a href={href('registration')}>Registration</a></li>
            <li><a href={href('events')}>Technical Events</a></li>
            <li><a href={href('committee')}>Committee</a></li>
            <li><a href={href('sponsors')}>Sponsors &amp; Exhibitors</a></li>
            <li><a href={href('venue')}>Venue &amp; Contact</a></li>
          </ul>
        </nav>
      </div>
      <div className="wrap footer-logos">
        {supporters.map((s) => (
          <span key={s.name} className={`footer-logo${'dark' in s && s.dark ? ' footer-logo--dark' : ''}`}><img src={s.logo} width={s.w} height={s.h} alt={s.name} loading="lazy" /></span>
        ))}
      </div>
      <div className="wrap footer-bar">
        <p>{meta.copyright}</p>
        <a href="#main" className="footer-top-link">Back to top ↑</a>
      </div>
    </footer>
  );
}
