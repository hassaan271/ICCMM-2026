// One-off migration: loads the original hardcoded data modules and writes every item into src/content/seed.ts.
// Run with: node scripts/cms-export-seed.mjs   (needs the pre-CMS data modules, i.e. git history before the CMS)
import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const conf = await server.ssrLoadModule('/src/data/conference.ts');
const sched = await server.ssrLoadModule('/src/data/schedule.ts');
const g = await server.ssrLoadModule('/src/data/guests/index.ts');
const imgs = await server.ssrLoadModule('/src/data/guests/image-sources.ts');
await server.close();

const committee = conf.committee.map((grp) => ({
  role: grp.role,
  people: grp.people.map(([name, affiliation]) => ({
    name, affiliation,
    ...(conf.portraits[name] ? { photo: conf.portraits[name] } : {}),
    ...(conf.committeeGuestIds[name] ? { guestId: conf.committeeGuestIds[name] } : {}),
  })),
}));

const guests = g.guests.map((x) => {
  const i = imgs.guestImages[x.id];
  const p = imgs.portraitOf(x.id);
  const photo = i && p ? {
    src: p.src,
    ...(i.w > 360 ? { src360: `assets/images/guests/${x.id}-360.webp` } : {}),
    w: i.w, h: i.h,
    ...(i.focus ? { focus: i.focus } : {}),
    ...(i.lowRes ? { lowRes: true } : {}),
    source: i.source, license: i.license, verification: i.verification,
  } : null;
  return { ...x, photo };
});

const pages = {
  about: { eyebrow: 'About the conference', title: 'About', accent: 'ICCMM-26.', intro: '' },
  tracks: { eyebrow: 'Technical tracks', title: 'Four tracks,', accent: 'one convergence.', intro: 'Original research papers and case studies are invited in computing, microelectronics and mechatronics. Each track below lists its research areas and the sessions in which it is presented.' },
  speakers: { eyebrow: 'Speakers', title: 'Keynote', accent: 'speakers.', intro: 'The confirmed keynote speakers of ICCMM-26. One keynote address opens each day of the conference, on 20 and 21 November 2026.' },
  guests: { eyebrow: 'Guests & speakers', title: 'Distinguished', accent: 'guests.', intro: 'Guests and speakers of ICCMM-26 in programme order: inaugural session, keynote sessions, session chairs, panel discussion and valedictory. {guestCount} confirmed guests across both days.' },
  programme: { eyebrow: 'Programme', title: 'Event', accent: 'flow.', intro: 'Two days at {institution}: the inaugural session and keynotes, parallel paper sessions, the poster presentation, a panel discussion and the valedictory. Times are IST, as issued by the organisers on 29 October 2026.' },
  cfp: { eyebrow: 'Call for Papers', title: 'Call for', accent: 'papers.', intro: '' },
  registration: { eyebrow: 'Registration', title: 'Registration', accent: 'categories & fees.', intro: 'Only registered delegates are permitted to attend and present at the conference. At least one author must register and present the paper.' },
  committee: { eyebrow: 'Committee', title: 'Conference', accent: 'committee.', intro: 'Patrons, chairs and committees of ICCMM-26, drawn from MJCET, the IEEE Hyderabad Section and institutions in India and abroad.' },
  events: { eyebrow: 'Technical event', title: 'Special', accent: 'poster session.', intro: '' },
  sponsors: { eyebrow: 'Sponsors & exhibitors', title: 'Sponsorship', accent: 'categories.', intro: 'Sponsorship categories for organisations that wish to exhibit and participate at ICCMM-26.' },
  venue: { eyebrow: 'Venue & travel', title: 'Venue', accent: '& contact.', intro: 'ICCMM-26 takes place at {institution}, Banjara Hills, Hyderabad, on 20–21 November 2026.' },
};

const posters = [
  { src: 'assets/images/call-for-posters', caption: 'Call for Posters', alt: 'ICCMM-26 Call for Posters, 20–21 November 2026: Sustainable and Intelligent Technologies for Transformative Solutions. Poster tracks, submission guidelines (250–300 word abstract to iccmm@mjcollege.ac.in), poster presentation, who should submit, and important dates: abstract deadline 10 November 2026, acceptance 12 November, registration 13 November, presentation 21 November 2026. Venue: MJCET, Banjara Hills, Hyderabad.' },
];

const seed = {
  meta: conf.meta,
  links: conf.links,
  brandLogo: conf.brandLogo,
  about: conf.about,
  aboutShort: conf.aboutShort,
  sponsorsLine: conf.sponsorsLine,
  organizers: conf.organizers,
  tracks: conf.tracks,
  callForPapers: conf.callForPapers,
  importantDates: conf.importantDates,
  posterDates: conf.posterDates,
  posterSession: { ...conf.posterSession, guidelines: conf.posterSession.guidelines.map(([title, text]) => ({ title, text })) },
  authorGuide: conf.authorGuide,
  fees: conf.fees,
  committee,
  organizingCommittee: conf.organizingCommittee,
  sponsorTiers: conf.sponsorTiers,
  faq: conf.faq,
  supporters: conf.supporters,
  ieeeGallery: conf.ieeeGallery,
  posters,
  documents: [],
  guestCategories: g.guestCategories,
  guests,
  keynoteIds: g.keynoteIds,
  schedule: sched.schedule,
  paperGuideline: sched.paperGuideline,
  scheduleGaps: sched.scheduleGaps,
  pages,
};

const body = `// Site content as it stood when the CMS was added (migrated from the original data modules by
// scripts/cms-export-seed.mjs). It seeds the CMS on first use and is the public site's fallback.
// Edit content in /admin, not here.
import type { SiteContent } from './types';

export const seed: SiteContent = ${JSON.stringify(seed, null, 2)};
`;
writeFileSync('src/content/seed.ts', body);
console.log('guests', guests.length, 'with photo', guests.filter((x) => x.photo).length, 'committee people', committee.reduce((n, c) => n + c.people.length, 0), 'items', sched.schedule.reduce((n, d) => n + d.items.length, 0));
