// Conference schedule, Day 1 and Day 2. Edited in the CMS at /admin (Programme section); values come from
// src/content/store.ts. Times are 24h "HH:MM", IST.
import { site } from '../content/store';
import type { ItemKind, Day } from '../content/types';

export type { ItemKind, Person, Paper, Lane, ScheduleItem, Day } from '../content/types';

const c = site();

export const paperGuideline = c.paperGuideline;
export const schedule: Day[] = c.schedule;

/** Details the schedule does not yet give (open items for the organisers; not shown on the site) */
export const scheduleGaps = c.scheduleGaps;

export const kindLabel: Record<ItemKind, string> = {
  registration: 'Arrival', ceremony: 'Ceremony', keynote: 'Keynote', technical: 'Technical sessions', break: 'Break', panel: 'Panel', social: 'Evening',
};

export const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
export const minutes = (a: string, b: string) => {
  const p = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  return p(b) - p(a);
};
export const weekday = (iso: string) => new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Asia/Kolkata' }).format(new Date(iso + 'T12:00:00+05:30'));

/** Programme items in which a track has sessions (for the Tracks page) */
export const trackSessions = (trackNo: string) => {
  const key = `Track ${Number(trackNo)}`;
  return schedule.flatMap((d) => d.items.flatMap((it) => (it.lanes ?? [])
    .filter((l) => l.track?.startsWith(key + ' '))
    .map((l) => ({ day: d, item: it, lane: l }))));
};
