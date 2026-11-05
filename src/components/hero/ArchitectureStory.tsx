import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { meta, about, aboutShort, tracks, supporters } from '../../data/conference';
import { href } from '../../utils/routes';
import { gsap, ScrollTrigger, prefersReduced, isMobile, onBootDone, signalBoot } from '../../animations/motion';
import { story, keys, poseAt } from '../../animations/story';
import { Eyebrow, Words } from '../shared/Typography';
import { LiquidButton, RegisterButton } from '../buttons/LiquidButton';
import { TrackIcon } from '../shared/Icons';
import { LiquidGlass } from '../glass/LiquidGlass';

const ProcessorScene = lazy(() => import('../processor/ProcessorScene'));

// The 3D scene is optional: if WebGL is unavailable or the chunk fails to load, the stage keeps its
// lit backdrop and the rest of the page carries on, instead of the whole app unmounting.
class SceneBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail(); }
  render() { return this.state.failed ? null : this.props.children; }
}

// Same keys/text as LABELS in Processor.tsx; positioned every frame from the 3D anchors
const chipLabels = [
  ['ihs', 'Heat Spreader'], ['die', 'Silicon Die'], ['interconnect', 'Interconnect Layer'],
  ['substrate', 'Semiconductor Substrate'], ['pads', 'Contact Array'],
];

type Track = (typeof tracks)[number];
const byNo = (no: string) => tracks.find((t) => t.no === no)!;

// Chapters that run over the processor, in the order the layers are revealed
// (about → heat spreader, 02 → interconnect, 01 → silicon die, 03 → substrate and contacts, 04 → reassembly)
const chapters: { id: string; name: string; side: 'left' | 'right'; dark?: boolean; track?: Track }[] = [
  { id: 'about', name: 'About', side: 'right' },
  { id: 'track-02', name: 'Track 02', side: 'left', track: byNo('02') },
  { id: 'track-01', name: 'Track 01', side: 'right', dark: true, track: byNo('01') },
  { id: 'track-03', name: 'Track 03', side: 'left', dark: true, track: byNo('03') },
  { id: 'track-04', name: 'Track 04', side: 'right', track: byNo('04') },
];

function TrackChapter({ t }: { t: Track }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="ch-head">
        <span className="ch-ico"><TrackIcon kind={t.icon} /></span>
        <p className="ch-kicker">Track {t.no}</p>
      </div>
      <h2 className="ch-title" data-blur-reveal="">{t.title}</h2>
      <p className="ch-text">{t.summary}</p>
      <div className={`ch-topics${open ? ' is-open' : ''}`} id={`topics-${t.no}`}>
        <div><ul>{t.topics.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
      <div className="ch-actions">
        <button className="more-btn" type="button" aria-expanded={open} aria-controls={`topics-${t.no}`} onClick={() => { setOpen((o) => !o); setTimeout(() => ScrollTrigger.refresh(), 650); }}>
          {open ? 'Hide research areas' : 'Show all research areas'}
        </button>
        <a className="link-arrow" href={href('cfp', 'track-' + t.no)}>Call for papers →</a>
      </div>
    </>
  );
}

function AboutChapter() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Eyebrow>About ICCMM-26</Eyebrow>
      <h2 className="ch-title ch-title--xl" data-blur-reveal="">Where computing, microelectronics and mechatronics <em>converge.</em></h2>
      <p className="ch-text">{aboutShort}</p>
      <ul className="ch-chips">{about.formats.map((f) => <li key={f}>{f}</li>)}</ul>
      <div className={`ch-topics${open ? ' is-open' : ''}`} id="about-full">
        <div><div className="ch-full">{about.body.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}</div></div>
      </div>
      <button className="more-btn" type="button" aria-expanded={open} aria-controls="about-full" onClick={() => { setOpen((o) => !o); setTimeout(() => ScrollTrigger.refresh(), 650); }}>
        {open ? 'Show less' : 'Read the full description'}
      </button>
    </>
  );
}

const letters = (w: string) => [...w].map((c, i) => <span className="hero-char" key={i}><span className="hero-char-i">{c}</span></span>);

export function ArchitectureStory() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  // Release the loading screen straight away rather than waiting for a scene that won't arrive
  const onSceneFail = useCallback(() => { setSceneFailed(true); signalBoot('scene'); }, []);

  // Starting the 3D scene (evaluating its chunk, creating the WebGL context) is heavy main-thread work.
  // Behind the loading screen it starts at once; on a repeat visit or refresh (no loading screen) it
  // waits until the title has animated in, then fades in, so the opening never stutters.
  const [sceneGo, setSceneGo] = useState(false);

  useLayoutEffect(() => {
    story.mobile = isMobile();
    story.reduced = prefersReduced();
    setReady(true);
    const covered = !!document.getElementById('boot') && !(window as unknown as { __bootDone?: boolean }).__bootDone;
    if (covered || story.reduced) setSceneGo(true);
  }, []);

  useEffect(() => {
    const el = root.current!;
    const st = stage.current!;
    let stopBoot = () => {};
    const ctx = gsap.context(() => {
      // Map each chapter's centre to a pose key, so the 3D sequence lines up with the text
      const measure = () => {
        const total = el.offsetHeight - window.innerHeight;
        el.querySelectorAll<HTMLElement>('[data-chapter]').forEach((c, i) => {
          const center = c.offsetTop + c.offsetHeight / 2 - window.innerHeight / 2;
          if (keys[i + 1]) keys[i + 1].p = Math.min(0.999, Math.max(0.02, center / total));
        });
      };
      measure();
      const html = document.documentElement;
      // Progress: drives every pose deterministically, so scrolling up replays the sequence in reverse
      ScrollTrigger.create({
        trigger: el, start: 'top top', end: 'bottom bottom',
        onRefresh: measure,
        onUpdate: (self) => {
          story.progress = self.progress;
          const pose = poseAt(self.progress);
          st.style.setProperty('--dark', pose.dark.toFixed(3));
          // Fade the stage away during the final stretch as the next section slides over
          st.style.setProperty('--out', Math.min(1, Math.max(0, (self.progress - 0.97) / 0.03)).toFixed(3));
          // Lets the navigation switch to dark glass while it floats over the dark chapters
          html.classList.toggle('nav-on-dark', pose.dark > 0.5 && self.progress < 0.97);
        },
      });
      // Visibility: separate from progress. It starts before the page top ('top bottom'), so reaching
      // scroll 0 never counts as leaving; the scene only pauses once the story is fully scrolled past.
      ScrollTrigger.create({
        trigger: el, start: 'top bottom', end: 'bottom top',
        onToggle: (self) => { setActive(self.isActive); st.classList.toggle('is-off', !self.isActive); },
      });

      // Opening sequence: lights up, camera settles, title resolves, details follow
      const tl = gsap.timeline({ delay: 0.15, paused: true });
      stopBoot = onBootDone(() => tl.play());
      tl.call(() => setSceneGo(true), undefined, 1.5);
      if (story.reduced) {
        story.intro = 1;
        gsap.set('.hero-char-i', { y: 0, yPercent: 0 });
        el.querySelectorAll('.hero [data-intro]').forEach((n) => n.classList.add('is-in'));
      } else {
        tl.fromTo(st, { '--veil': 1 }, { '--veil': 0, duration: 1.4, ease: 'power2.out' }, 0)
          .to(story, { intro: 1, duration: 2.6, ease: 'expo.out' }, 0)
          .fromTo('.hero-char-i', { y: 0, yPercent: 105, filter: 'blur(10px)' }, { y: 0, yPercent: 0, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out', stagger: 0.06 }, 0.35)
          .add(() => el.querySelectorAll('.hero [data-intro]').forEach((n, i) => setTimeout(() => n.classList.add('is-in'), i * 110)), 0.7);
      }

      // Hero copy drifts up and dissolves as the lid starts to lift
      // explicit start values + no immediate render, so the intro fade-in isn't captured as the start
      gsap.fromTo('.hero-copy, .hero-count, .hero-supporters', { y: 0, opacity: 1 }, {
        y: -80, opacity: 0, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 30%', scrub: true },
      });

      // Chapter text resolves from blur, line by line
      el.querySelectorAll<HTMLElement>('[data-chapter] .ch-panel').forEach((p) => {
        gsap.fromTo(p.querySelectorAll('.eyebrow, .ch-head, .ch-title, .ch-text, .ch-chips, .ch-actions, .more-btn'),
          { opacity: 0, y: 34, filter: 'blur(12px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.08, ease: 'power3.out', duration: 1,
            scrollTrigger: { trigger: p, start: 'top 78%', toggleActions: 'play none none reverse' } });
      });
    }, el);
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('load', onResize);
    return () => { stopBoot(); ctx.revert(); window.removeEventListener('load', onResize); document.documentElement.classList.remove('nav-on-dark'); };
  }, []);

  return (
    <div className="story" ref={root} id="top">
      {/* Fixed stage: lighting backdrop, grid and the WebGL processor */}
      <div className="stage" ref={stage} aria-hidden="true">
        <div className="stage-bg" />
        <div className="stage-grid" data-depth="0.12" />
        <div className="stage-glow" data-depth="0.6" />
        {ready && sceneGo && !sceneFailed && (
          <SceneBoundary onFail={onSceneFail}>
            <Suspense fallback={null}>
              <ProcessorScene active={active} onFail={onSceneFail} />
            </Suspense>
          </SceneBoundary>
        )}
        <div className="chip-labels">
          {chipLabels.map(([k, t]) => (
            <div className="chip-label" data-chip-label={k} key={k}><span className="chip-label-dot" />{t}</div>
          ))}
        </div>
        <div className="stage-veil" />
      </div>


      {/* Chapter 0: conference identity */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            {/* Acronym first, then the full title as an editorial block, then the dates */}
            <h1 className="hero-title" id="hero-title">
              <span className="visually-hidden">{meta.acronym}: {meta.edition} {meta.title}</span>
              <span className="hero-acr" aria-hidden="true">{letters('ICCMM')}<span className="hero-char hero-dash"><span className="hero-char-i">-26</span></span></span>
            </h1>
            <div className="hero-name" aria-hidden="true" data-intro="">
              <p className="hero-edition">{meta.edition}</p>
              <p className="hero-theme"><em>{meta.titleShort}:</em> {meta.titleRest}</p>
            </div>
            <p className="hero-date" data-intro=""><time dateTime="2026-11-20">20–21 November 2026</time></p>
            <div className="hero-meta" data-intro="">
              <dl className="hero-facts">
                <div><dt>Venue</dt><dd>Muffakham Jah College of Engineering and Technology, Hyderabad</dd></div>
              </dl>
              <LiquidGlass as="dl" className="hero-id" tint="clear" refraction={10} blur={1.5}>
                <dt>Conference ID</dt>
                <dd>{meta.conferenceId}</dd>
              </LiquidGlass>
            </div>
            <div className="hero-ctas" data-intro="">
              <RegisterButton />
              <LiquidButton href={href('cfp')} variant="glass">Call for Papers</LiquidButton>
            </div>
          </div>
          <Countdown />
        </div>
        <div className="hero-supporters" data-intro="">
          <div className="wrap hero-supporters-inner">
            {supporters.slice(0, 3).map((s) => (
              <div className="hs-item" key={s.name}>
                <span className="hs-role">{s.role}</span>
                <span className={`hs-logo${'dark' in s && s.dark ? ' hs-logo--dark' : ''}`}><img src={s.logo} width={s.w} height={s.h} alt={s.name} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {chapters.map((c, i) => (
        <section key={c.id} id={c.id === 'track-02' ? 'tracks' : c.id} className={`chapter chapter--${c.side}${c.dark ? ' chapter--dark' : ''}`} data-chapter aria-label={c.name}>
          {c.id === 'track-02' && <span id="track-02" />}
          <div className="wrap chapter-inner">
            <LiquidGlass as="article" tint={c.dark ? 'dark' : 'frost'} className="ch-panel" refraction={30} blur={9} bezel={34}>
              {c.track ? <TrackChapter t={c.track} /> : <AboutChapter />}
            </LiquidGlass>
          </div>
        </section>
      ))}
    </div>
  );
}

function Countdown() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const end = new Date(meta.startsAt).getTime();
    const units = ref.current!.querySelectorAll<HTMLElement>('[data-u]');
    const tick = () => {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      [d, h, m, s].forEach((v, i) => { const t = String(v).padStart(2, '0'); if (units[i].textContent !== t) units[i].textContent = t; });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <LiquidGlass as="aside" tint="light" className="hero-count" refraction={22} blur={4} aria-label="Countdown to the conference" data-intro="">
      <p className="label">Conference begins in</p>
      <div className="count" role="timer" ref={ref}>
        {['Days', 'Hours', 'Min', 'Sec'].map((l) => <div className="count-cell" key={l}><span className="count-num" data-u>00</span><span className="count-lbl">{l}</span></div>)}
      </div>
    </LiquidGlass>
  );
}

