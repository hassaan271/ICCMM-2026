import { useEffect, type ReactElement } from 'react';
import type { PageKey } from './utils/routes';
import { initSmoothScroll, initPointer, initReveals, initGlassHighlights, initTilt, initDepthParallax, initClipReveals, initCounters, scrollToTarget, getLenis, ScrollTrigger, signalBoot } from './animations/motion';
import { ConferenceNavigation } from './components/navigation/ConferenceNavigation';
import { ConferenceFooter } from './components/footer/ConferenceFooter';
import { FloatingRegister } from './components/footer/FloatingRegister';
import { SvgFilters } from './components/shared/SvgFilters';
import { Home } from './pages/Home';
import { CallForPapers } from './pages/CallForPapers';
import { Registration } from './pages/Registration';
import { Committee } from './pages/Committee';
import { Events } from './pages/Events';
import { Sponsors } from './pages/Sponsors';
import { Venue } from './pages/Venue';
import { About } from './pages/About';
import { Tracks } from './pages/Tracks';
import { Speakers } from './pages/Speakers';
import { Guests } from './pages/Guests';
import { EventFlow } from './pages/EventFlow';

const PAGES: Record<PageKey, () => ReactElement> = {
  home: Home, about: About, tracks: Tracks, speakers: Speakers, guests: Guests, programme: EventFlow, cfp: CallForPapers, registration: Registration, committee: Committee, events: Events, sponsors: Sponsors, venue: Venue,
};

// Hash links pointing at the current page scroll smoothly instead of jumping
function useSamePageAnchors() {
  useEffect(() => {
    const norm = (p: string) => p.replace(/index\.html$/, '');
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || norm(url.pathname) !== norm(location.pathname) || url.hash.length < 2) return;
      const id = decodeURIComponent(url.hash.slice(1));
      const target = id === 'top' || id === 'main' ? null : document.getElementById(id);
      if (id !== 'top' && id !== 'main' && !target) return;
      e.preventDefault();
      scrollToTarget(target ?? 0);
      history.replaceState(null, '', url.hash);
      if (target) { if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

export function App({ page }: { page: PageKey }) {
  const Page = PAGES[page] ?? Home;
  useSamePageAnchors();
  useEffect(() => {
    initSmoothScroll();
    initPointer();
    const stopReveals = initReveals();
    const stopGlass = initGlassHighlights();
    initTilt();
    initDepthParallax();
    initClipReveals();
    initCounters();
    const settle = () => {
      ScrollTrigger.refresh();
      if (location.hash.length > 1) {
        const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (t) setTimeout(() => { const l = getLenis(); l ? l.scrollTo(t, { offset: -88, immediate: true }) : t.scrollIntoView(); }, 80);
      }
    };
    if (document.readyState === 'complete') settle(); else window.addEventListener('load', settle, { once: true });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    (window as unknown as { __iccmmReady: boolean }).__iccmmReady = true;
    signalBoot('app');
    return () => { stopReveals(); stopGlass(); };
  }, []);

  return (
    <>
      <SvgFilters />
      <ConferenceNavigation page={page} />
      <main id="main" data-page={page}>
        <Page />
      </main>
      <ConferenceFooter />
      <FloatingRegister />
    </>
  );
}
