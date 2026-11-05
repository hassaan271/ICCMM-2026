// Page URLs are relative so the build works from any folder it is deployed to.
// Each page is its own .html entry (see vite.config.ts), so direct links, refresh and back/forward all work natively.
export type PageKey = 'home' | 'about' | 'tracks' | 'speakers' | 'guests' | 'programme' | 'cfp' | 'registration' | 'committee' | 'events' | 'sponsors' | 'venue';

export const pages: Record<PageKey, string> = {
  home: './',
  about: 'about.html',
  tracks: 'tracks.html',
  speakers: 'speakers.html',
  guests: 'guests.html',
  programme: 'programme.html',
  cfp: 'call-for-papers.html',
  registration: 'registration.html',
  committee: 'committee.html',
  events: 'events.html',
  sponsors: 'sponsors.html',
  venue: 'venue.html',
};

export const href = (page: PageKey, hash = '') =>
  page === 'home' ? `./${hash ? '#' + hash : ''}` : `${pages[page]}${hash ? '#' + hash : ''}`;
