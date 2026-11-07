// Field schema for every editable section. Used by the admin UI (to draw the forms) and by the server
// (to validate and clean every save), so both always agree on what is allowed.
import type { SectionKey, SiteContent } from './types';

export type ImageVariant = 'portrait' | 'pair' | 'poster' | 'single' | 'square';

type Base = {
  label?: string;
  help?: string;
  /** Key may be left out; an empty value removes it */
  opt?: boolean;
  /** Empty value is stored as null */
  nullable?: boolean;
  /** Narrow fields sit side by side in the form */
  half?: boolean;
};
export type Field =
  | (Base & { t: 'text'; max?: number; required?: boolean; pattern?: string; patternHelp?: string })
  | (Base & { t: 'textarea'; max?: number; rows?: number; required?: boolean })
  | (Base & { t: 'number'; int?: boolean; min?: number; max?: number })
  | (Base & { t: 'bool' })
  | (Base & { t: 'url'; required?: boolean; httpsOnly?: boolean })
  | (Base & { t: 'select'; options: { value: string; label: string }[] | 'guests' | 'scheduleItems' | 'trackKeys'; required?: boolean })
  | (Base & { t: 'date' })
  | (Base & { t: 'time' })
  | (Base & { t: 'image'; variant: ImageVariant; sets?: { w?: string; h?: string } })
  | (Base & { t: 'photo' })
  | (Base & { t: 'file'; accept: 'pdf' })
  | (Base & { t: 'list'; of: Field; itemLabel?: string; titleKey?: string | ((v: any, i: number) => string); max?: number; collapsed?: boolean; newItem?: () => unknown })
  | (Base & { t: 'object'; fields: Record<string, Field> });

export type SectionDef = {
  key: SectionKey;
  label: string;
  group: string;
  description: string;
  /** list = a page of items with search, sort and per-item editing; form = one form */
  kind: 'list' | 'form';
  field: Field;
  /** Public pages that show this content */
  shownOn: string[];
  list?: {
    title: (item: any) => string;
    subtitle?: (item: any) => string;
    thumb?: (item: any) => string | null;
    search: (item: any) => string;
    filters?: { label: string; options: { value: string; label: string; test: (item: any) => boolean }[] }[];
    sorts?: { label: string; key: (item: any) => string | number }[];
    newItem: (all: any[]) => any;
    /** Field that must be unique across items */
    unique?: string;
  };
};

const s = (label: string, extra: Partial<Extract<Field, { t: 'text' }>> = {}): Field => ({ t: 'text', label, ...extra });
const ta = (label: string, extra: Partial<Extract<Field, { t: 'textarea' }>> = {}): Field => ({ t: 'textarea', label, ...extra });
const strings = (label: string, itemLabel = 'Item', long = false): Field => ({ t: 'list', label, itemLabel, of: long ? { t: 'textarea', rows: 3 } : { t: 'text' }, newItem: () => '' });
const obj = (fields: Record<string, Field>, extra: Base = {}): Field => ({ t: 'object', fields, ...extra });

const ID_PATTERN = '^[a-z0-9][a-z0-9-]*$';
const ID_HELP = 'Lower-case letters, numbers and dashes only, e.g. "jane-doe". Used in links; change with care.';

const dateEntry = obj({
  label: s('Label', { required: true }),
  date: s('Date as shown', { required: true, half: true, help: 'e.g. "30th June, 2026"' }),
  iso: { t: 'date', label: 'Calendar date', half: true, help: 'Used for ordering and the "passed" state' },
  past: { ...strings('Earlier (superseded) dates', 'Earlier date'), opt: true, help: 'Shown struck through' } as Field,
  isEvent: { t: 'bool', label: 'This is the event itself', opt: true },
});

const person = obj({
  name: s('Name', { required: true }),
  detail: s('Detail / affiliation', { opt: true }),
  role: s('Role', { opt: true, help: 'e.g. "Guest of Honour"' }),
  guest: { t: 'select', label: 'Linked guest profile', options: 'guests', opt: true, help: 'Links the name to the guest card' },
});

const paper = obj({
  id: { t: 'number', label: 'Paper ID', int: true, half: true },
  start: { t: 'time', label: 'Start', half: true },
  end: { t: 'time', label: 'End', half: true },
  title: s('Title', { required: true, max: 400 }),
  authors: s('Authors', { max: 600, help: 'Separate names with semicolons' }),
});

const lane = obj({
  title: s('Lane / session title', { required: true }),
  track: s('Research track', { opt: true, help: 'e.g. "Track 1 · Next Gen". Shown only on the Tracks page.' }),
  room: s('Room', { opt: true }),
  online: { t: 'bool', label: 'Online session', opt: true },
  incharge: s('Session in-charge', { opt: true, help: 'Not shown on the public programme' }),
  chair: { ...person, label: 'Session chair', opt: true } as Field,
  coChair: { ...person, label: 'Co-chair', opt: true } as Field,
  people: { t: 'list', label: 'People', of: person, opt: true, titleKey: 'name', itemLabel: 'Person', collapsed: true, newItem: () => ({ name: '' }) },
  papers: { t: 'list', label: 'Papers', of: paper, opt: true, titleKey: (p) => `#${p.id ?? ''} ${p.title ?? ''}`, itemLabel: 'Paper', collapsed: true, help: 'Not shown on the public programme', newItem: () => ({ id: 0, start: '', end: '', title: '', authors: '' }) },
});

const KINDS = [
  { value: 'registration', label: 'Registration / arrival' }, { value: 'ceremony', label: 'Ceremony' }, { value: 'keynote', label: 'Keynote' },
  { value: 'technical', label: 'Technical sessions' }, { value: 'break', label: 'Break' }, { value: 'panel', label: 'Panel' }, { value: 'social', label: 'Evening / social' },
];

const scheduleItem = obj({
  id: s('Item ID', { required: true, pattern: ID_PATTERN, patternHelp: ID_HELP, half: true, help: 'Guests’ roles refer to this ID' }),
  kind: { t: 'select', label: 'Type', options: KINDS, required: true, half: true },
  start: { t: 'time', label: 'Start (IST)', half: true },
  end: { t: 'time', label: 'End (IST)', half: true },
  title: s('Title', { required: true }),
  summary: ta('Summary', { opt: true, rows: 2 }),
  pending: s('Pending note', { opt: true, help: 'e.g. "Keynote title to be announced."' }),
  people: { t: 'list', label: 'People', of: person, opt: true, titleKey: (p) => `${p.name ?? ''}${p.role ? ' · ' + p.role : ''}`, itemLabel: 'Person', collapsed: true, newItem: () => ({ name: '' }) },
  lanes: { t: 'list', label: 'Parallel lanes / sessions', of: lane, opt: true, titleKey: (l) => `${l.title ?? ''}${l.room ? ' · ' + l.room : ''}`, itemLabel: 'Lane', collapsed: true, newItem: () => ({ title: '' }) },
});

const guestPhoto: Field = { t: 'photo', label: 'Portrait photo', nullable: true, help: 'Any photo; it is cropped to 4:5 (720×900) with a 360 px copy. Remove to show the "Portrait to follow" plate.' };

const guestField = obj({
  id: s('Profile ID', { required: true, pattern: ID_PATTERN, patternHelp: ID_HELP, half: true }),
  category: { t: 'select', label: 'Category', options: [{ value: 'inaugural', label: 'Inaugural' }, { value: 'ieee', label: 'IEEE Hyderabad Section' }, { value: 'academic', label: 'Faculty / academic' }], required: true, half: true },
  placeholder: { t: 'bool', label: 'Placeholder (guest to be announced)', opt: true, help: 'Shows an empty portrait plate with no text. Untick once the guest is known.' },
  honorific: s('Honorific', { nullable: true, half: true, help: 'e.g. "Dr.", "Prof.", "Janab"' }),
  name: s('Name', { half: true }),
  designation: s('Designation', { nullable: true, help: 'Leave empty to show "Designation to be confirmed"' }),
  organization: s('Organisation'),
  location: s('Location', { opt: true, help: 'City and country, shown with a pin icon' }),
  bio: ta('Biography', { nullable: true, rows: 5, max: 4000 }),
  photo: guestPhoto,
  roles: {
    t: 'list', label: 'Programme roles', itemLabel: 'Role', titleKey: (r) => r.label || r.item || 'Role',
    help: 'Decides which Guests page section(s) the guest appears in (Inaugural, Keynote, Session chairs, Panel, Valedictory)',
    of: obj({
      item: { t: 'select', label: 'Programme item', options: 'scheduleItems', required: true },
      label: s('Role as printed', { help: 'e.g. "Guest of Honour", "Session Chair · Session 3"' }),
    }),
    newItem: () => ({ item: '', label: '' }),
  },
  verify: { ...strings('Notes for organisers (not shown on the site)', 'Note', true), opt: true } as Field,
});

const organizer = obj({
  name: s('Name', { required: true }),
  fullName: s('Full name', { opt: true }),
  paragraphs: strings('Paragraphs', 'Paragraph', true),
  marks: { t: 'list', label: 'Key figures', itemLabel: 'Figure', titleKey: (m) => `${m.value ?? ''} · ${m.label ?? ''}`, of: obj({ value: s('Value', { half: true }), label: s('Label', { half: true }) }), newItem: () => ({ value: '', label: '' }) },
});

const pageText = (intro = true, note = '') => obj({
  eyebrow: s('Small label above the title', { half: true }),
  title: s('Title', { half: true }),
  accent: s('Title accent (second line)', { opt: true }),
  ...(intro ? { intro: ta('Intro', { opt: true, rows: 3, help: note || 'Use {institution} for the institution name.' }) } : {}),
});

const iconOptions = [{ value: 'network', label: 'Network' }, { value: 'chip', label: 'Chip' }, { value: 'robot', label: 'Robot' }, { value: 'converge', label: 'Converge' }];

const pairImage = (help = ''): Field => ({ t: 'image', variant: 'pair', label: 'Image', sets: { w: 'w', h: 'h' }, help: help || 'Saved as 640 and 1200 px WebP copies' });

export const sections: SectionDef[] = [
  /* ── People ── */
  {
    key: 'guests', label: 'Guests & speakers', group: 'People', kind: 'list', shownOn: ['guests.html', 'speakers.html', 'index.html', 'programme.html'],
    description: 'Every guest profile: inaugural guests, keynote speakers, session chairs, panellists, valedictory guests and placeholders.',
    field: { t: 'list', of: guestField },
    list: {
      title: (g) => g.placeholder ? `Placeholder · ${g.id}` : [g.honorific, g.name].filter(Boolean).join(' '),
      subtitle: (g) => [g.designation, g.organization].filter(Boolean).join(' · ') || (g.roles ?? []).map((r: any) => r.item).join(', '),
      thumb: (g) => g.photo?.src360 || g.photo?.src || null,
      search: (g) => [g.id, g.honorific, g.name, g.designation, g.organization, g.location, g.bio, ...(g.roles ?? []).map((r: any) => r.label + ' ' + r.item)].join(' '),
      filters: [
        { label: 'Category', options: [
          { value: 'inaugural', label: 'Inaugural', test: (g) => g.category === 'inaugural' },
          { value: 'ieee', label: 'IEEE Hyderabad Section', test: (g) => g.category === 'ieee' },
          { value: 'academic', label: 'Faculty / academic', test: (g) => g.category === 'academic' },
        ] },
        { label: 'Status', options: [
          { value: 'confirmed', label: 'Confirmed', test: (g) => !g.placeholder },
          { value: 'placeholder', label: 'Placeholders', test: (g) => !!g.placeholder },
          { value: 'nophoto', label: 'No photo', test: (g) => !g.photo },
        ] },
      ],
      sorts: [{ label: 'Name', key: (g) => (g.name || '~').toLowerCase() }, { label: 'Organisation', key: (g) => (g.organization || '~').toLowerCase() }],
      newItem: (all) => ({ id: `new-guest-${all.length + 1}`, honorific: null, name: '', designation: null, organization: '', bio: null, category: 'inaugural', roles: [], photo: null }),
      unique: 'id',
    },
  },
  {
    key: 'keynoteIds', label: 'Keynote speakers', group: 'People', kind: 'form', shownOn: ['speakers.html', 'index.html'],
    description: 'Which guests are keynote speakers, in programme order.',
    field: { t: 'list', label: 'Keynote speakers', itemLabel: 'Speaker', of: { t: 'select', options: 'guests', required: true }, newItem: () => '' },
  },
  {
    key: 'guestCategories', label: 'Guest categories', group: 'People', kind: 'form', shownOn: ['guests.html'],
    description: 'Names and intros of the guest categories.',
    field: { t: 'list', label: 'Categories', itemLabel: 'Category', titleKey: 'title', of: obj({
      id: { t: 'select', label: 'Category', options: [{ value: 'inaugural', label: 'inaugural' }, { value: 'ieee', label: 'ieee' }, { value: 'academic', label: 'academic' }], required: true, half: true },
      title: s('Title', { half: true }), accent: s('Accent'), intro: ta('Intro', { rows: 2 }),
    }) },
  },
  {
    key: 'committee', label: 'Conference committee', group: 'People', kind: 'list', shownOn: ['committee.html'],
    description: 'Committee groups (patrons, chairs, committees) and their members, in display order.',
    field: { t: 'list', of: obj({
      role: s('Group name', { required: true, help: 'e.g. "General Chairs"' }),
      people: { t: 'list', label: 'Members', itemLabel: 'Member', titleKey: (p) => `${p.name ?? ''}${p.affiliation ? ' · ' + p.affiliation : ''}`, collapsed: true, newItem: () => ({ name: '', affiliation: '' }), of: obj({
        name: s('Name', { required: true, half: true }),
        affiliation: s('Affiliation', { half: true }),
        photo: { t: 'image', variant: 'square', label: 'Photo', opt: true, help: 'Cropped to a 256 px square' },
        guestId: { t: 'select', label: 'Same person as guest', options: 'guests', opt: true, help: 'Reuses the guest portrait and links to the guest card' },
      }) },
    }) },
    list: {
      title: (g) => g.role, subtitle: (g) => `${g.people?.length ?? 0} members · ${(g.people ?? []).slice(0, 3).map((p: any) => p.name).join(', ')}`,
      search: (g) => [g.role, ...(g.people ?? []).map((p: any) => `${p.name} ${p.affiliation}`)].join(' '),
      sorts: [{ label: 'Group name', key: (g) => g.role.toLowerCase() }, { label: 'Members', key: (g) => -(g.people?.length ?? 0) }],
      newItem: () => ({ role: '', people: [] }),
    },
  },
  {
    key: 'organizingCommittee', label: 'Organizing committee', group: 'People', kind: 'form', shownOn: ['committee.html'],
    description: 'Names in the organizing committee list, in display order.',
    field: strings('Members', 'Name'),
  },

  /* ── Programme ── */
  {
    key: 'schedule', label: 'Programme / schedule', group: 'Programme', kind: 'list', shownOn: ['programme.html', 'index.html', 'tracks.html', 'guests.html'],
    description: 'Conference days and every programme item: times, titles, people, parallel lanes, chairs and papers.',
    field: { t: 'list', of: obj({
      id: s('Day ID', { required: true, pattern: ID_PATTERN, patternHelp: ID_HELP, half: true }),
      label: s('Label', { half: true, help: 'e.g. "Day 01"' }),
      date: s('Date as shown', { half: true }),
      iso: { t: 'date', label: 'Calendar date', half: true },
      items: { t: 'list', label: 'Programme items', itemLabel: 'Item', collapsed: true, titleKey: (it) => `${it.start ?? ''}–${it.end ?? ''}  ${it.title ?? ''}`, of: scheduleItem, newItem: () => ({ id: '', start: '09:00', end: '10:00', title: '', kind: 'technical' }) },
    }) },
    list: {
      title: (d) => `${d.label} · ${d.date}`, subtitle: (d) => `${d.items?.length ?? 0} items`,
      search: (d) => JSON.stringify(d),
      newItem: (all) => ({ id: `day-${all.length + 1}`, label: `Day ${String(all.length + 1).padStart(2, '0')}`, date: '', iso: '', items: [] }),
      unique: 'id',
    },
  },
  { key: 'paperGuideline', label: 'Paper slot guideline', group: 'Programme', kind: 'form', shownOn: ['programme.html'], description: 'Note on paper presentation timing.', field: ta('Guideline', { rows: 3 }) },
  { key: 'scheduleGaps', label: 'Open programme notes', group: 'Programme', kind: 'form', shownOn: [], description: 'Internal list of details still to be confirmed (not shown on the site).', field: strings('Notes', 'Note') },

  /* ── Papers & posters ── */
  {
    key: 'tracks', label: 'Research tracks', group: 'Papers & posters', kind: 'list', shownOn: ['index.html', 'tracks.html', 'call-for-papers.html'],
    description: 'The technical tracks and their research areas.',
    field: { t: 'list', of: obj({
      no: s('Number', { required: true, half: true, help: 'e.g. "01"' }),
      key: s('Short name', { half: true }),
      title: s('Title', { required: true }),
      summary: ta('Summary', { rows: 2 }),
      icon: { t: 'select', label: 'Icon', options: iconOptions, half: true },
      topics: strings('Research areas', 'Topic'),
    }) },
    list: { title: (t) => `Track ${t.no} · ${t.title}`, subtitle: (t) => `${t.topics?.length ?? 0} research areas`, search: (t) => [t.no, t.title, t.key, t.summary, ...(t.topics ?? [])].join(' '), newItem: (all) => ({ no: String(all.length + 1).padStart(2, '0'), title: '', key: '', summary: '', icon: 'network', topics: [] }), unique: 'no' },
  },
  {
    key: 'callForPapers', label: 'Call for papers', group: 'Papers & posters', kind: 'form', shownOn: ['call-for-papers.html'],
    description: 'Call-for-papers introduction and publication text.',
    field: obj({ intro: ta('Intro', { rows: 4 }), note: ta('Note', { rows: 2 }), publication: ta('Publication', { rows: 3 }), invitation: ta('Invitation', { rows: 3 }) }),
  },
  {
    key: 'authorGuide', label: 'Author guidelines', group: 'Papers & posters', kind: 'form', shownOn: ['call-for-papers.html'],
    description: 'Submission rules, review process, camera-ready requirements, formatting and CMT steps.',
    field: obj({
      general: strings('General guidelines', 'Guideline', true),
      review: strings('Review process', 'Rule', true),
      publication: ta('Publication', { rows: 2 }),
      cameraReady: strings('Camera-ready requirements', 'Requirement', true),
      formatting: strings('Formatting requirements', 'Requirement', true),
      copyrightNotices: { t: 'list', label: 'IEEE copyright notices', itemLabel: 'Notice', titleKey: 'who', of: obj({ who: s('Who'), notice: s('Notice') }), newItem: () => ({ who: '', notice: '' }) },
      steps: { t: 'list', label: 'CMT submission steps', itemLabel: 'Step', titleKey: 'title', collapsed: true, of: obj({
        title: s('Title'), body: strings('Paragraphs', 'Paragraph', true),
        notices: { t: 'bool', label: 'Show the copyright notices table', opt: true },
        link: { t: 'select', label: 'Button', opt: true, options: [{ value: 'aiReportForm', label: 'AI-content report form' }] },
      }), newItem: () => ({ title: '', body: [] }) },
      cmtAck: ta('CMT acknowledgment', { rows: 3 }),
    }),
  },
  {
    key: 'importantDates', label: 'Important dates', group: 'Papers & posters', kind: 'list', shownOn: ['index.html', 'about.html', 'call-for-papers.html'],
    description: 'Paper deadlines and key dates.',
    field: { t: 'list', of: dateEntry },
    list: { title: (d) => d.label, subtitle: (d) => d.date + (d.past?.length ? ` (was ${d.past.join(', ')})` : ''), search: (d) => `${d.label} ${d.date}`, sorts: [{ label: 'Date', key: (d) => d.iso || '' }], newItem: () => ({ label: '', date: '', iso: '' }) },
  },
  {
    key: 'posterSession', label: 'Poster session', group: 'Papers & posters', kind: 'form', shownOn: ['events.html'],
    description: 'Special poster session: intro, theme, tracks, guidelines and audience.',
    field: obj({
      intro: ta('Intro', { rows: 4 }), focus: ta('Focus', { rows: 2 }), theme: s('Theme'),
      tracks: strings('Poster tracks', 'Track'),
      guidelines: { t: 'list', label: 'Guidelines', itemLabel: 'Guideline', titleKey: 'title', of: obj({ title: s('Title', { half: true }), text: s('Text') }), newItem: () => ({ title: '', text: '' }) },
      presentation: strings('Presentation', 'Point', true),
      audience: strings('Who should submit', 'Group'),
    }),
  },
  {
    key: 'posterDates', label: 'Poster dates', group: 'Papers & posters', kind: 'list', shownOn: ['events.html'],
    description: 'Poster submission and presentation dates.',
    field: { t: 'list', of: dateEntry },
    list: { title: (d) => d.label, subtitle: (d) => d.date, search: (d) => `${d.label} ${d.date}`, sorts: [{ label: 'Date', key: (d) => d.iso || '' }], newItem: () => ({ label: '', date: '', iso: '' }) },
  },
  {
    key: 'posters', label: 'Posters', group: 'Papers & posters', kind: 'list', shownOn: ['events.html'],
    description: 'Official posters on the Technical Events page (click to enlarge).',
    field: { t: 'list', of: obj({
      src: { t: 'image', variant: 'poster', label: 'Poster image', sets: { w: 'w', h: 'h' }, help: 'Saved as a full-size WebP plus a 560 px copy' },
      caption: s('Caption', { required: true }), alt: ta('Description for screen readers', { rows: 3 }),
      w: { t: 'number', label: 'Width', int: true, opt: true, half: true }, h: { t: 'number', label: 'Height', int: true, opt: true, half: true },
    }) },
    list: { title: (p) => p.caption, thumb: (p) => p.src ? `${p.src}-560.webp` : null, search: (p) => `${p.caption} ${p.alt}`, newItem: () => ({ src: '', caption: '', alt: '' }) },
  },
  {
    key: 'documents', label: 'Downloads (PDFs)', group: 'Papers & posters', kind: 'list', shownOn: ['call-for-papers.html'],
    description: 'Downloadable documents, listed under Publication on the Call for Papers page.',
    field: { t: 'list', of: obj({ title: s('Title', { required: true }), description: s('Description', { opt: true }), file: { t: 'file', accept: 'pdf', label: 'PDF file' }, size: { t: 'number', label: 'Size (bytes)', int: true, opt: true } }) },
    list: { title: (d) => d.title, subtitle: (d) => d.file, search: (d) => `${d.title} ${d.description ?? ''}`, newItem: () => ({ title: '', file: '' }) },
  },

  /* ── Registration & sponsors ── */
  {
    key: 'fees', label: 'Registration fees', group: 'Registration & sponsors', kind: 'form', shownOn: ['registration.html', 'events.html'],
    description: 'Fee table, accommodation, technical event fees and notes.',
    field: obj({
      headers: obj({ inr: s('INR column heading', { half: true }), usd: s('USD column heading', { half: true }) }, { label: 'Column headings' }),
      rows: { t: 'list', label: 'Fee rows', itemLabel: 'Row', titleKey: (r) => `${r.label ?? ''} · ₹${r.inr ?? ''} / $${r.usd ?? '—'}`, of: obj({
        label: s('Label', { required: true }),
        id: { t: 'select', label: 'Profile', options: [{ value: 'student', label: 'Student' }, { value: 'academician', label: 'Academician' }, { value: 'researcher', label: 'Researcher / Industrialist' }], half: true },
        member: { t: 'bool', label: 'IEEE member rate' },
        inr: { t: 'number', label: 'INR', min: 0, half: true },
        usd: { t: 'number', label: 'USD (empty = not offered)', min: 0, nullable: true, half: true },
      }), newItem: () => ({ id: 'student', label: '', member: false, inr: 0, usd: null }) },
      accommodation: obj({ label: s('Label'), inr: { t: 'number', label: 'INR', min: 0, half: true }, usd: { t: 'number', label: 'USD', min: 0, half: true } }, { label: 'Accommodation' }),
      profiles: { t: 'list', label: 'Fee-finder profiles', itemLabel: 'Profile', titleKey: 'label', of: obj({ id: s('ID', { half: true }), label: s('Label', { half: true }) }), newItem: () => ({ id: '', label: '' }) },
      other: { t: 'list', label: 'Technical event fees', itemLabel: 'Fee', titleKey: 'label', of: obj({
        label: s('Label', { required: true }), amount: { t: 'number', label: 'Amount (INR)', min: 0, half: true },
        unit: { t: 'select', label: 'Unit', options: [{ value: 'per person', label: 'per person' }, { value: 'per team', label: 'per team' }], half: true },
        note: s('Note', { nullable: true }),
      }), newItem: () => ({ label: '', amount: 0, unit: 'per person', note: null }) },
      gstNote: s('GST note'),
      extraPages: ta('Extra page charges', { rows: 3 }),
    }),
  },
  {
    key: 'sponsorTiers', label: 'Sponsorship tiers', group: 'Registration & sponsors', kind: 'list', shownOn: ['sponsors.html'],
    description: 'Sponsorship categories, amounts and benefits.',
    field: { t: 'list', of: obj({ tier: s('Tier', { required: true, half: true }), amount: s('Amount', { half: true }), benefits: strings('Benefits', 'Benefit') }) },
    list: { title: (t) => t.tier, subtitle: (t) => `${t.amount} · ${t.benefits?.length ?? 0} benefits`, search: (t) => `${t.tier} ${t.amount} ${(t.benefits ?? []).join(' ')}`, newItem: () => ({ tier: '', amount: '', benefits: [] }) },
  },
  {
    key: 'supporters', label: 'Supporter logos', group: 'Registration & sponsors', kind: 'list', shownOn: ['index.html', 'sponsors.html'],
    description: 'Sponsor and supporter logos with their roles.',
    field: { t: 'list', of: obj({
      name: s('Name', { required: true }), role: s('Role', { help: 'e.g. "Technically Sponsored by"' }),
      logo: { t: 'image', variant: 'single', label: 'Logo', sets: { w: 'w', h: 'h' } },
      w: { t: 'number', label: 'Width', int: true, half: true }, h: { t: 'number', label: 'Height', int: true, half: true },
      dark: { t: 'bool', label: 'Logo is light-on-dark (needs a dark plate)', opt: true },
    }) },
    list: { title: (x) => x.name, subtitle: (x) => x.role, thumb: (x) => x.logo || null, search: (x) => `${x.name} ${x.role}`, newItem: () => ({ role: '', name: '', logo: '', w: 0, h: 0 }) },
  },
  {
    key: 'sponsorsLine', label: 'Sponsor credits', group: 'Registration & sponsors', kind: 'form', shownOn: ['about.html'],
    description: 'Text credits such as "Technically Sponsored by IEEE Hyderabad Section".',
    field: { t: 'list', label: 'Credits', itemLabel: 'Credit', titleKey: (x) => `${x.role ?? ''} ${x.name ?? ''}`, of: obj({ role: s('Role', { half: true }), name: s('Name', { half: true }) }), newItem: () => ({ role: '', name: '' }) },
  },

  /* ── About & home ── */
  {
    key: 'about', label: 'About the conference', group: 'About & home', kind: 'form', shownOn: ['index.html', 'about.html'],
    description: 'Lead paragraph, description, formats and disciplines.',
    field: obj({ lead: ta('Lead', { rows: 3 }), body: strings('Description paragraphs', 'Paragraph', true), formats: strings('Formats', 'Format'), disciplines: strings('Disciplines', 'Discipline') }),
  },
  { key: 'aboutShort', label: 'Home page summary', group: 'About & home', kind: 'form', shownOn: ['index.html'], description: 'Short description on the home page.', field: ta('Summary', { rows: 4 }) },
  {
    key: 'organizers', label: 'Organisers', group: 'About & home', kind: 'form', shownOn: ['index.html', 'about.html', 'venue.html'],
    description: 'IEEE Hyderabad Section and MJCET blurbs and key figures.',
    field: obj({ ieee: { ...organizer, label: 'IEEE Hyderabad Section' } as Field, mjcet: { ...organizer, label: 'MJCET' } as Field }),
  },
  {
    key: 'ieeeGallery', label: 'Photo gallery', group: 'About & home', kind: 'list', shownOn: ['index.html'],
    description: 'IEEE Student Branch photographs on the home page.',
    field: { t: 'list', of: obj({ src: pairImage(), alt: ta('Description', { rows: 2, help: 'Describe the photo for screen readers' }), w: { t: 'number', label: 'Width', int: true, half: true }, h: { t: 'number', label: 'Height', int: true, half: true } }) },
    list: { title: (g) => g.alt?.slice(0, 80) || '(no description)', subtitle: (g) => `${g.w}×${g.h}`, thumb: (g) => g.src ? `${g.src}-640.webp` : null, search: (g) => g.alt ?? '', newItem: () => ({ src: '', w: 0, h: 0, alt: '' }) },
  },
  {
    key: 'faq', label: 'FAQ', group: 'About & home', kind: 'list', shownOn: [],
    description: 'Frequently asked questions.',
    field: { t: 'list', of: obj({ q: s('Question', { required: true }), a: ta('Answer', { rows: 3 }) }) },
    list: { title: (f) => f.q, search: (f) => `${f.q} ${f.a}`, newItem: () => ({ q: '', a: '' }) },
  },

  /* ── Site ── */
  {
    key: 'pages', label: 'Page headings', group: 'Site settings', kind: 'form', shownOn: ['all pages'],
    description: 'Title, label and intro at the top of each page.',
    field: obj({
      about: { ...pageText(true, 'Leave empty to use the About lead paragraph.'), label: 'About' } as Field,
      tracks: { ...pageText(), label: 'Technical tracks' } as Field,
      speakers: { ...pageText(), label: 'Speakers' } as Field,
      guests: { ...pageText(true, 'Use {guestCount} for the number of confirmed guests.'), label: 'Guests' } as Field,
      programme: { ...pageText(), label: 'Programme & event flow' } as Field,
      cfp: { ...pageText(true, 'Leave empty to use the Call for papers intro.'), label: 'Call for papers' } as Field,
      registration: { ...pageText(), label: 'Registration' } as Field,
      committee: { ...pageText(), label: 'Committee' } as Field,
      events: { ...pageText(true, 'Leave empty to use the Poster session intro.'), label: 'Technical events (posters)' } as Field,
      sponsors: { ...pageText(), label: 'Sponsors' } as Field,
      venue: { ...pageText(), label: 'Venue & contact' } as Field,
    }),
  },
  {
    key: 'meta', label: 'Conference details & contact', group: 'Site settings', kind: 'form', shownOn: ['all pages'],
    description: 'Name, dates, IDs, institution, address, email, phone numbers and copyright.',
    field: obj({
      acronym: s('Acronym', { half: true }), dates: s('Dates as shown', { half: true }),
      edition: s('Edition line'), title: ta('Full title', { rows: 2 }), titleShort: s('Title (first part)', { half: true }), titleRest: s('Title (rest)', { half: true }),
      startsAt: s('Countdown start', { help: 'ISO date-time with time zone, e.g. 2026-11-20T00:00:00+05:30' }),
      conferenceId: s('IEEE conference ID', { half: true }), pdfExpressId: s('PDF eXpress ID', { half: true }),
      institution: s('Institution'), address: ta('Address', { rows: 2 }),
      email: s('Email', { half: true, pattern: '^[^\\s@]+@[^\\s@]+$', patternHelp: 'Enter a valid email address' }), website: { t: 'url', label: 'Website', half: true },
      phones: strings('Phone numbers', 'Phone'),
      copyright: s('Copyright line'),
    }),
  },
  {
    key: 'links', label: 'Links (registration, CMT…)', group: 'Site settings', kind: 'form', shownOn: ['all pages'],
    description: 'Registration Google Form, Microsoft CMT, IEEE templates, AI report form and maps.',
    field: obj({
      registrationForm: { t: 'url', label: 'Registration form (every "Register" button)', required: true, httpsOnly: true },
      cmt: { t: 'url', label: 'Microsoft CMT submission site', required: true, httpsOnly: true },
      ieeeTemplates: { t: 'url', label: 'IEEE templates', httpsOnly: true },
      aiReportForm: { t: 'url', label: 'AI-content report form', httpsOnly: true },
      maps: { t: 'url', label: 'Google Maps link', httpsOnly: true },
      mapsEmbed: { t: 'url', label: 'Google Maps embed URL', httpsOnly: true, help: 'Must be a maps.google.com / google.com/maps embed address' },
    }),
  },
  {
    key: 'brandLogo', label: 'Header logo', group: 'Site settings', kind: 'form', shownOn: ['all pages'],
    description: 'Optional extra logo in the header (none set by default).',
    field: obj({ src: { t: 'image', variant: 'single', label: 'Logo', sets: { w: 'width', h: 'height' } }, alt: s('Alt text'), width: { t: 'number', label: 'Width', int: true, half: true }, height: { t: 'number', label: 'Height', int: true, half: true } }, { nullable: true }),
  },
];

export const sectionByKey = Object.fromEntries(sections.map((d) => [d.key, d])) as Record<SectionKey, SectionDef>;

/* ───────────── Validation (shared by server and client) ───────────── */

export class ValidationError extends Error {
  constructor(public path: string, message: string) { super(`${path || 'value'}: ${message}`); }
}

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|\.\/|#|assets\/)/i;
const MEDIA_PATH = /^(assets\/[\w./-]+|\/api\/media\/[\w.-]+|https:\/\/[\w.-]+\/[\w./%-]+)$/;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const isEmpty = (v: unknown) => v === undefined || v === null || v === '';

/** Returns the cleaned value, `undefined` for a removed optional key, or throws ValidationError. */
export function validate(f: Field, v: unknown, path = ''): unknown {
  if (isEmpty(v) || (Array.isArray(v) && v.length === 0 && f.opt)) {
    if (f.t === 'bool') return f.opt ? undefined : false;
    if (f.nullable) return null;
    if (f.opt) return undefined;
  }
  const str = (max: number) => {
    if (v === undefined || v === null) v = '';
    if (typeof v !== 'string') throw new ValidationError(path, 'must be text');
    const out = v.replace(CONTROL, '');
    if (out.length > max) throw new ValidationError(path, `is too long (max ${max} characters)`);
    return out;
  };
  switch (f.t) {
    case 'text': {
      const out = str(f.max ?? 600);
      if (f.required && !out.trim()) throw new ValidationError(path, 'is required');
      if (f.pattern && out && !new RegExp(f.pattern).test(out)) throw new ValidationError(path, f.patternHelp ?? 'has an invalid format');
      return out;
    }
    case 'textarea': {
      const out = str(f.max ?? 12000);
      if (f.required && !out.trim()) throw new ValidationError(path, 'is required');
      return out;
    }
    case 'url': {
      const out = str(2000).trim();
      if (!out) { if (f.required) throw new ValidationError(path, 'is required'); return out; }
      if (f.httpsOnly ? !/^https:\/\//i.test(out) : !SAFE_URL.test(out)) throw new ValidationError(path, f.httpsOnly ? 'must start with https://' : 'must be a web address (https://…), email (mailto:) or site path');
      if (/[\s<>"]/.test(out)) throw new ValidationError(path, 'contains invalid characters');
      return out;
    }
    case 'date': {
      const out = str(10);
      if (out && !/^\d{4}-\d{2}-\d{2}$/.test(out)) throw new ValidationError(path, 'must be a date (YYYY-MM-DD)');
      return out;
    }
    case 'time': {
      const out = str(5);
      if (out && !/^([01]\d|2[0-3]):[0-5]\d$/.test(out)) throw new ValidationError(path, 'must be a time (HH:MM, 24-hour)');
      return out;
    }
    case 'select': {
      const out = str(200);
      if (f.required && !out) throw new ValidationError(path, 'is required');
      if (Array.isArray(f.options) && out && !f.options.some((o) => o.value === out)) throw new ValidationError(path, 'is not one of the allowed choices');
      return out;
    }
    case 'number': {
      const n = typeof v === 'string' ? Number(v) : v;
      if (typeof n !== 'number' || !Number.isFinite(n)) throw new ValidationError(path, 'must be a number');
      if (f.int && !Number.isInteger(n)) throw new ValidationError(path, 'must be a whole number');
      if (f.min !== undefined && n < f.min) throw new ValidationError(path, `must be at least ${f.min}`);
      if (f.max !== undefined && n > f.max) throw new ValidationError(path, `must be at most ${f.max}`);
      return n;
    }
    case 'bool':
      if (typeof v !== 'boolean') throw new ValidationError(path, 'must be yes or no');
      return f.opt && !v ? undefined : v;
    case 'image':
    case 'file': {
      const out = str(1000).trim();
      if (out && !MEDIA_PATH.test(out)) throw new ValidationError(path, 'must be an uploaded file or a site asset path');
      return out;
    }
    case 'photo': {
      if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new ValidationError(path, 'must be a photo');
      const p = v as Record<string, unknown>;
      const src = validate({ t: 'image', variant: 'portrait' }, p.src, `${path}.src`);
      if (!src) return f.nullable ? null : undefined;
      const out: Record<string, unknown> = {
        src,
        w: validate({ t: 'number', int: true, min: 1, max: 4000 }, p.w, `${path}.w`),
        h: validate({ t: 'number', int: true, min: 1, max: 5000 }, p.h, `${path}.h`),
      };
      if (p.src360) out.src360 = validate({ t: 'image', variant: 'portrait' }, p.src360, `${path}.src360`);
      if (p.focus) out.focus = validate({ t: 'text', max: 40, pattern: '^[\\d.%\\s a-z]+$' }, p.focus, `${path}.focus`);
      if (p.lowRes) out.lowRes = true;
      for (const k of ['source', 'license', 'verification'] as const) if (p[k]) out[k] = validate({ t: 'text', max: 600 }, p[k], `${path}.${k}`);
      return out;
    }
    case 'list': {
      if (!Array.isArray(v)) throw new ValidationError(path, 'must be a list');
      if (v.length > (f.max ?? 2000)) throw new ValidationError(path, 'has too many items');
      return v.map((x, i) => validate(f.of, x, `${path}[${i + 1}]`));
    }
    case 'object': {
      if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new ValidationError(path, 'must be a group of fields');
      const out: Record<string, unknown> = {};
      for (const [k, sub] of Object.entries(f.fields)) {
        const r = validate(sub, (v as Record<string, unknown>)[k], path ? `${path}.${k}` : k);
        if (r !== undefined) out[k] = r;
      }
      return out;
    }
  }
}

/** Validates a whole section, including list-level rules (unique IDs). */
export function validateSection(key: SectionKey, value: unknown): SiteContent[SectionKey] {
  const def = sectionByKey[key];
  if (!def) throw new ValidationError(key, 'unknown section');
  const out = validate(def.field, value, '') as SiteContent[SectionKey];
  const uniq = def.list?.unique;
  if (uniq && Array.isArray(out)) {
    const seen = new Set<string>();
    out.forEach((it: any, i) => {
      const id = String(it[uniq] ?? '');
      if (seen.has(id)) throw new ValidationError(`[${i + 1}].${uniq}`, `"${id}" is used twice; each must be unique`);
      seen.add(id);
    });
  }
  if (key === 'schedule' && Array.isArray(out)) {
    const ids = new Set<string>();
    (out as any[]).forEach((d, di) => (d.items ?? []).forEach((it: any, ii: number) => {
      if (ids.has(it.id)) throw new ValidationError(`[${di + 1}].items[${ii + 1}].id`, `"${it.id}" is used twice; programme item IDs must be unique`);
      ids.add(it.id);
    }));
  }
  return out;
}
