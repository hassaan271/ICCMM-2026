import { schedule, fmtTime, weekday } from '../../data/schedule';
import { keynoteIds, type Guest } from '../../data/guests';
import { href } from '../../utils/routes';

/** Profile link: keynote speakers live on the Speakers page, everyone else on the Guests page */
export const profileHref = (id: string) => href(keynoteIds.includes(id) ? 'speakers' : 'guests', `guest-${id}`);

/** A guest's programme roles, resolved to day, time and session title */
export const rolesOf = (g: Guest) => g.roles.flatMap((r) => {
  for (const d of schedule) {
    const it = d.items.find((i) => i.id === r.item);
    if (it) return [{ ...r, day: d, itemTitle: it.title, when: `${d.label} · ${weekday(d.iso).slice(0, 3)} ${d.date.replace(' 2026', '')} · ${fmtTime(it.start)}` }];
  }
  return [];
}).filter((r, i, a) => a.findIndex((x) => x.item === r.item && x.label === r.label) === i);

/** The most prominent role, for card badges */
export const leadRole = (g: Guest) => g.roles[0]?.label.split(' · ')[0] ?? '';
