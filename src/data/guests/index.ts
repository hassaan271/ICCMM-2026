// Guests and speakers of ICCMM-26. Edited in the CMS at /admin (Guests section); values come from
// src/content/store.ts. `designation: null` renders as "Designation to be confirmed"; `placeholder` marks an
// empty slot for a guest still to be announced; `verify` notes are for the organisers and never shown.
import { site } from '../../content/store';
import type { Guest } from '../../content/types';

export type { Guest, GuestRole, GuestCategory } from '../../content/types';

const c = site();

export const guestCategories = c.guestCategories;
export const guests: Guest[] = c.guests;

/** Announced guests only (placeholders left out), for counts */
export const confirmedGuests = guests.filter((g) => !g.placeholder);

/** Keynote speakers, in programme order */
export const keynoteIds = c.keynoteIds.filter((id) => guests.some((g) => g.id === id));

export const guestById = (id: string) => guests.find((g) => g.id === id);
export const displayName = (g: Guest) => (g.honorific ? `${g.honorific} ${g.name}` : g.name);
export const initials = (g: Guest) => g.name.split(/[\s.\-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
