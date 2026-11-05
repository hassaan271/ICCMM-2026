import { useEffect, useRef, useState } from 'react';
import { meta, brandLogo } from '../../data/conference';
import { href, type PageKey } from '../../utils/routes';
import { gsap, finePointer, lockScroll } from '../../animations/motion';
import { Chevron } from '../shared/Icons';
import { RegisterButton } from '../buttons/LiquidButton';
import { LiquidGlass } from '../glass/LiquidGlass';
import { GlassPanel } from '../glass/GlassPanel';

type Item = { text: string; url: string; key: string; children?: { text: string; url: string; note: string }[] };
export const navTree: Item[] = [
  { text: 'About', url: href('about'), key: 'about' },
  {
    text: 'Call for Papers', url: href('cfp'), key: 'cfp', children: [
      { text: 'Research Tracks', url: href('cfp', 'tracks'), note: 'Four tracks and their research areas' },
      { text: 'Submission Guidelines', url: href('cfp', 'submission'), note: 'Format, review and Microsoft CMT' },
      { text: 'Camera-Ready & e-Copyright', url: href('cfp', 'camera-ready'), note: 'Final paper and IEEE copyright steps' },
      { text: 'Technical Events & Posters', url: href('events'), note: 'Special Poster Session' },
    ],
  },
  { text: 'Tracks', url: href('tracks'), key: 'tracks' },
  { text: 'Speakers', url: href('guests'), key: 'speakers' },
  { text: 'Programme', url: href('programme'), key: 'programme' },
  {
    text: 'Registration', url: href('registration'), key: 'registration', children: [
      { text: 'Categories & Fees', url: href('registration'), note: 'Indian and international delegates' },
      { text: 'Sponsors & Exhibitors', url: href('sponsors'), note: 'Sponsorship categories' },
    ],
  },
  {
    text: 'Committee', url: href('committee'), key: 'committee', children: [
      { text: 'Conference Committee', url: href('committee', 'conference-committee'), note: 'Patrons, chairs and committees' },
      { text: 'Organizing Committee', url: href('committee', 'organizing-committee'), note: 'MJCET organizing team' },
    ],
  },
  { text: 'Venue', url: href('venue'), key: 'venue' },
];

const currentKey: Partial<Record<PageKey, string>> = { home: 'home', about: 'about', tracks: 'tracks', guests: 'speakers', programme: 'programme', cfp: 'cfp', events: 'cfp', registration: 'registration', sponsors: 'registration', committee: 'committee', venue: 'venue' };

export function ConferenceNavigation({ page }: { page: PageKey }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lead = useRef<HTMLSpanElement>(null);
  const trail = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>(0);

  // Scroll-aware bar: glass after the first scroll, hides on the way down, returns on the way up
  useEffect(() => {
    const nav = navRef.current!;
    let last = window.scrollY, raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 24);
      if (!document.body.classList.contains('menu-open') && !nav.querySelector('.nav-item.is-open') && y > window.innerHeight * 0.8 && y > last + 4) nav.classList.add('is-hidden');
      if (y < last - 4 || y < 80) nav.classList.remove('is-hidden');
      last = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Liquid hover indicator: two pills with different lag, merged by the #goo filter, stretch between links
  useEffect(() => {
    const list = listRef.current;
    if (!list || !finePointer()) return;
    const L = { x: gsap.quickTo(lead.current, 'x', { duration: 0.35, ease: 'power3.out' }), w: gsap.quickTo(lead.current, 'width', { duration: 0.35, ease: 'power3.out' }) };
    const T = { x: gsap.quickTo(trail.current, 'x', { duration: 0.75, ease: 'power3.out' }), w: gsap.quickTo(trail.current, 'width', { duration: 0.75, ease: 'power3.out' }) };
    const go = (el: HTMLElement) => {
      const x = el.offsetLeft, w = el.offsetWidth;
      L.x(x); L.w(w); T.x(x); T.w(w);
      gsap.to([lead.current, trail.current], { opacity: 1, duration: 0.3 });
    };
    const over = (e: PointerEvent) => { const a = (e.target as HTMLElement).closest('.nav-link') as HTMLElement | null; if (a) go(a.parentElement as HTMLElement); };
    const leave = () => gsap.to([lead.current, trail.current], { opacity: 0, duration: 0.4 });
    list.addEventListener('pointerover', over);
    list.addEventListener('pointerleave', leave);
    return () => { list.removeEventListener('pointerover', over); list.removeEventListener('pointerleave', leave); };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    lockScroll(menuOpen);
    navRef.current?.classList.remove('is-hidden');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); setOpenDrop(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('[data-drop]')) setOpenDrop(null); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const hoverable = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  const cur = currentKey[page];

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="nav" ref={navRef}>
        <LiquidGlass className="nav-bar" tint="clear" refraction={22} blur={2} bezel={22}>
          <div className="nav-left">
            <a className="brand" href={href('home')} aria-label="ICCMM-26 home">
              {brandLogo && <img className="brand-logo" src={brandLogo.src} width={brandLogo.width} height={brandLogo.height} alt={brandLogo.alt} />}
              <span className="brand-text"><span className="brand-name">ICCMM-26</span></span>
            </a>
            <span className="brand-divider" aria-hidden="true" />
            <img className="brand-ieee" src="assets/logos/logo-ieee.webp" width={233} height={131} alt="IEEE" />
          </div>
          <nav className="nav-main" aria-label="Primary">
            <span className="nav-goo" aria-hidden="true"><span ref={trail} className="nav-blob" /><span ref={lead} className="nav-blob" /></span>
            <ul className="nav-list" ref={listRef}>
              {navTree.map((n) =>
                n.children ? (
                  <li key={n.key} className={`nav-item has-drop${openDrop === n.key ? ' is-open' : ''}`} data-drop
                    onPointerEnter={() => { if (hoverable) { clearTimeout(timer.current); setOpenDrop(n.key); } }}
                    onPointerLeave={() => { if (hoverable) timer.current = window.setTimeout(() => setOpenDrop((d) => (d === n.key ? null : d)), 180); }}
                    onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenDrop(null); }}>
                    <button className={`nav-link${cur === n.key ? ' is-current' : ''}`} type="button" aria-expanded={openDrop === n.key} aria-controls={`drop-${n.key}`} onClick={() => setOpenDrop((d) => (d === n.key ? null : n.key))}>
                      {n.text}<Chevron />
                    </button>
                    <GlassPanel kind="frost" className="drop" id={`drop-${n.key}`}>
                      <a className="drop-head" href={n.url}>{n.text} overview</a>
                      <ul>{n.children.map((c) => <li key={c.text}><a href={c.url}><span className="drop-t">{c.text}</span><span className="drop-n">{c.note}</span></a></li>)}</ul>
                    </GlassPanel>
                  </li>
                ) : (
                  <li key={n.key} className="nav-item"><a className={`nav-link${cur === n.key ? ' is-current' : ''}`} href={n.url} data-nav-link={n.key} aria-current={cur === n.key ? 'page' : undefined}>{n.text}</a></li>
                )
              )}
            </ul>
          </nav>
          <div className="nav-actions">
            <RegisterButton size="sm" />
            <button className="nav-burger" type="button" aria-expanded={menuOpen} aria-controls="menu" onClick={() => setMenuOpen((o) => !o)}>
              <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
              <span className="nav-burger-lines" aria-hidden="true"><i /><i /></span>
            </button>
          </div>
        </LiquidGlass>
      </header>

      <div className={`menu${menuOpen ? ' is-open' : ''}`} id="menu" aria-hidden={!menuOpen} inert={!menuOpen}>
        <div className="menu-inner">
          <nav aria-label="Mobile">
            <ul className="menu-list">
              {[{ text: 'Home', url: href('home'), key: 'home' } as Item, ...navTree].map((n, i) => (
                <li key={n.key} style={{ ['--i' as string]: i }}>
                  <a href={n.url} onClick={() => setMenuOpen(false)} className={cur === n.key ? 'is-current' : undefined} aria-current={cur === n.key ? 'page' : undefined}>{n.text}</a>
                  {n.children && <ul className="menu-sub">{n.children.map((c) => <li key={c.text}><a href={c.url} onClick={() => setMenuOpen(false)}>{c.text}</a></li>)}</ul>}
                </li>
              ))}
            </ul>
          </nav>
          <div className="menu-aside">
            <RegisterButton />
            <p className="label">Contact</p>
            <a className="menu-mail" href={`mailto:${meta.email}`}>{meta.email}</a>
            <p className="menu-addr">{meta.address}</p>
          </div>
        </div>
      </div>
    </>
  );
}
