// Conference content. Edited in the CMS at /admin; the values come from src/content/store.ts
// (live content, falling back to src/content/seed.ts). Sections only handle presentation.
import { site } from '../content/store';
import type { OtherFee } from '../content/types';

const c = site();

export const meta = c.meta;
export const brandLogo = c.brandLogo;
export const links = c.links;
export const about = c.about;
export const sponsorsLine = c.sponsorsLine;
export const organizers = c.organizers;
export const tracks = c.tracks;
export const callForPapers = c.callForPapers;
// `past` holds earlier dates that were superseded (shown struck through).
export const importantDates = c.importantDates;
export const posterDates = c.posterDates;
export const posterSession = {
  ...c.posterSession,
  guidelines: c.posterSession.guidelines.map((g) => [g.title, g.text] as [string, string]),
};
export const authorGuide = c.authorGuide;
// Regular fees. `usd: null` means no international fee for that row.
export const fees = c.fees;

// Display form of a technical event fee: "₹1,000 per person", "₹3,000 / Team"
export const eventFee = (f: OtherFee) => ({
  price: `₹${f.amount.toLocaleString('en-IN')}`,
  unit: f.unit === 'per team' ? '/ Team' : 'per person',
});

export const committee = c.committee.map((g) => ({ role: g.role, people: g.people.map((p) => [p.name, p.affiliation] as [string, string]) }));
export const organizingCommittee = c.organizingCommittee;
export const sponsorTiers = c.sponsorTiers;
export const faq = c.faq;
export const aboutShort = c.aboutShort;

// Committee portraits and committee members who are also published guests, by member name.
export const portraits: Record<string, string> = Object.fromEntries(c.committee.flatMap((g) => g.people.filter((p) => p.photo).map((p) => [p.name, p.photo!])));
export const committeeGuestIds: Record<string, string> = Object.fromEntries(c.committee.flatMap((g) => g.people.filter((p) => p.guestId).map((p) => [p.name, p.guestId!])));

export const supporters = c.supporters;
export const ieeeGallery = c.ieeeGallery;
export const posters = c.posters;
export const documents = c.documents;

/** Page header copy. `{institution}` and `{guestCount}` in an intro are filled in on the page. */
export const pageText = c.pages;
export const fillText = (s: string | undefined, vars: Record<string, string | number> = {}) =>
  (s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : k === 'institution' ? meta.institution : m));
