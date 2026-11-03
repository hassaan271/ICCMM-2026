// Page URLs are relative so the build works from any folder it is deployed to.
export type PageKey = 'home' | 'cfp' | 'registration' | 'committee' | 'events' | 'sponsors' | 'venue';

export const pages: Record<PageKey, string> = {
  home: './',
  cfp: 'call-for-papers.html',
  registration: 'registration.html',
  committee: 'committee.html',
  events: 'events.html',
  sponsors: 'sponsors.html',
  venue: 'venue.html',
};

export const href = (page: PageKey, hash = '') =>
  page === 'home' ? `./${hash ? '#' + hash : ''}` : `${pages[page]}${hash ? '#' + hash : ''}`;
