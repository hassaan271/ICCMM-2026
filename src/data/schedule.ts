// Conference schedule, Day 1 and Day 2.
// Source: "Conference Schedule for Day1&2-29th Oct.docx" (issued by the organisers, 29 October 2026).
// Times, titles and names are as printed. Three people listed in the schedule are marked "NO" in the later
// Guest Info document (Joginder Tanikella, Sreenivas Jasti, Bala Prasad Peddigari); they are left out here
// and the affected slots say that further names are to be confirmed. See docs/content-verification.md.

export type ItemKind = 'registration' | 'ceremony' | 'keynote' | 'technical' | 'break' | 'panel' | 'social';

export type Person = { name: string; detail?: string; role?: string; guest?: string };

export type Lane = {
  title: string;
  /** e.g. "Track 1 · Next Gen" */
  track?: string;
  online?: boolean;
  chair?: Person;
  coChair?: Person;
  people?: Person[];
};

export type ScheduleItem = {
  id: string;
  start: string; // 24h "HH:MM", IST
  end: string;
  title: string;
  kind: ItemKind;
  summary?: string;
  people?: Person[];
  lanes?: Lane[];
  pending?: string;
};

export type Day = { id: string; label: string; date: string; iso: string; items: ScheduleItem[] };

const MJCET = 'MJCET';

export const schedule: Day[] = [
  {
    id: 'day-1', label: 'Day 01', date: '20 November 2026', iso: '2026-11-20',
    items: [
      { id: 'd1-registration', start: '09:30', end: '10:30', title: 'Registration', kind: 'registration' },
      {
        id: 'd1-inaugural', start: '10:30', end: '11:30', title: 'Inaugural Session', kind: 'ceremony',
        summary: 'Opening of ICCMM-26 with the chief guest, guests of honour and distinguished guests.',
        people: [
          { name: 'Dr Abhishek Ranjan', detail: 'Innovation Officer, AICTE', role: 'Chief Guest', guest: 'abhishek-ranjan' },
          { name: 'Dr MGPL Narayana', detail: 'IEEE Hyderabad Section Chair', role: 'Guest of Honour', guest: 'mgpl-narayana' },
          { name: 'Janab Mohammed Waliullah', detail: 'Chairman, SUES', role: 'Guest of Honour', guest: 'mohammed-waliullah' },
          { name: 'Janab Zafar Javeed', detail: 'Honorary Secretary, SUES', role: 'Guest of Honour', guest: 'zafar-javeed' },
          { name: 'Dr Marina Tropmann-Frick', detail: 'Hamburg University of Applied Sciences, Germany', role: 'Special Guest', guest: 'marina-tropmann-frick' },
          { name: 'Dr. Merugu Lakshminarayana', detail: 'IEEE Hyderabad Section Conference Committee Chair', role: 'Distinguished Guest', guest: 'merugu-lakshminarayana' },
          { name: 'Dr. Krishna Reddy P', detail: 'Professor, IIIT Hyderabad', role: 'Distinguished Guest', guest: 'krishna-reddy-p' },
          { name: 'Mr. Syed Aamer Javeed', detail: 'Joint Secretary, SUES', role: 'Distinguished Guest', guest: 'syed-aamer-javeed' },
          { name: 'Mr. Syed Omer Javeed', detail: 'SUES', role: 'Distinguished Guest', guest: 'syed-omer-javeed' },
        ],
      },
      { id: 'd1-tea-1', start: '11:30', end: '11:45', title: 'Tea Break', kind: 'break' },
      {
        id: 'd1-keynote-1', start: '11:45', end: '12:45', title: 'Keynote Session 1', kind: 'keynote',
        people: [{ name: 'Prof Krishna Reddy P', detail: 'Professor, IIIT Hyderabad', role: 'Keynote Speaker', guest: 'krishna-reddy-p' }],
        pending: 'Keynote title to be announced.',
      },
      { id: 'd1-lunch', start: '12:45', end: '14:00', title: 'Lunch', kind: 'break' },
      {
        id: 'd1-track-1', start: '14:00', end: '15:30', title: 'Track 1 · Next Gen', kind: 'technical',
        summary: 'Two parallel paper sessions in Track 1, Next-Gen Intelligent Computing and Pervasive Networking.',
        lanes: [
          { title: 'Session 1', track: 'Track 1 · Next Gen', chair: { name: 'Dr. Sridevi', detail: 'JNTUH', guest: 'sridevi' }, coChair: { name: 'Dr. Maniza Hijab', detail: MJCET } },
          { title: 'Session 2', track: 'Track 1 · Next Gen', chair: { name: 'Dr. Vijayalata Reddy', detail: 'VCE', guest: 'vijay-latha' }, coChair: { name: 'Dr. Uma N. Dulhare', detail: MJCET } },
        ],
      },
      {
        id: 'd1-track-3', start: '15:30', end: '17:00', title: 'Track 3 · Mechatronics', kind: 'technical',
        summary: 'Paper session in Track 3, Mechatronics, Intelligent Automation, and Sustainable Energy Systems.',
        lanes: [
          { title: 'Session 3', track: 'Track 3 · Mechatronics', chair: { name: 'Dr. C. Thirmal', detail: 'VNR VJIT', guest: 'c-thirmal' }, coChair: { name: 'Dr. Viquar Mohinuddin', detail: MJCET } },
        ],
      },
      { id: 'd1-tea-2', start: '17:00', end: '17:30', title: 'Tea Break', kind: 'break' },
      { id: 'd1-cultural', start: '18:00', end: '19:30', title: 'Cultural Event', kind: 'social' },
      { id: 'd1-gala', start: '19:30', end: '21:30', title: 'Gala Dinner', kind: 'social' },
    ],
  },
  {
    id: 'day-2', label: 'Day 02', date: '21 November 2026', iso: '2026-11-21',
    items: [
      {
        id: 'd2-keynote-2', start: '09:30', end: '10:15', title: 'Keynote Session 2', kind: 'keynote',
        people: [{ name: 'Dr Marina Tropmann-Frick', detail: 'Hamburg University of Applied Sciences, Germany', role: 'Keynote Speaker', guest: 'marina-tropmann-frick' }],
        pending: 'Keynote title to be announced.',
      },
      {
        id: 'd2-parallel-a', start: '10:15', end: '11:45', title: 'Parallel technical sessions', kind: 'technical',
        summary: 'Tracks 4 and 2 run in parallel with the poster presentation and an online session.',
        lanes: [
          { title: 'Session 4', track: 'Track 4 · Applied Computational', chair: { name: 'Dr. M. A. Jabbar', detail: 'VCE', guest: 'ma-jabbar' }, coChair: { name: 'Dr. Fahmina Taranum', detail: MJCET } },
          { title: 'Session 5', track: 'Track 2 · Microelectronics', chair: { name: 'Dr. K. Jaya Shankar', detail: 'MCET', guest: 'k-jaya-sankar' }, coChair: { name: 'Dr. Nazia Parveen', detail: MJCET } },
          {
            title: 'Poster Presentation', track: 'Special Poster Session',
            people: [
              { name: 'Dr Marina Tropmann-Frick', detail: 'Hamburg University of Applied Sciences, Germany', guest: 'marina-tropmann-frick' },
              { name: 'Ishrat Meera Mirzana', detail: MJCET },
              { name: 'Dr. Arshad Mohammed' },
            ],
          },
          { title: 'Session 6', online: true, chair: { name: 'Dr Salman Abdul Moiz', detail: 'UoH', guest: 'moiz-m' }, coChair: { name: 'Dr. Gouri R Patil', detail: MJCET } },
        ],
      },
      { id: 'd2-tea', start: '11:45', end: '12:00', title: 'Tea Break', kind: 'break' },
      {
        id: 'd2-parallel-b', start: '12:00', end: '13:30', title: 'Parallel technical sessions', kind: 'technical',
        summary: 'Second block of parallel sessions in Tracks 4 and 2, the poster presentation and an online session.',
        lanes: [
          { title: 'Session 7', track: 'Track 4 · Applied Computational', chair: { name: 'Dr. Sanju Tiwari', detail: 'Sharda University, Noida', guest: 'sanju-tiwari' }, coChair: { name: 'Dr. Syed Shabbeer Ahmad', detail: MJCET } },
          { title: 'Session 8', track: 'Track 2 · Microelectronics', chair: { name: 'Dr. Jyoti Singhai', detail: 'NIT, Bhopal', guest: 'jyoti-singhai' }, coChair: { name: 'Dr. Sabir Hussain', detail: MJCET } },
          {
            title: 'Poster Presentation', track: 'Special Poster Session',
            people: [
              { name: 'Dr Marina Tropmann-Frick', detail: 'Hamburg University of Applied Sciences, Germany', guest: 'marina-tropmann-frick' },
              { name: 'Ishrat Meera Mirzana', detail: MJCET },
              { name: 'Dr. Arshad Mohammed' },
            ],
          },
          { title: 'Session 9', online: true, chair: { name: 'Dr Jehad Ali', detail: 'Ajou University, South Korea' }, coChair: { name: 'Dr. S Fouzia Sayeedunnisa', detail: MJCET } },
        ],
      },
      { id: 'd2-lunch', start: '13:30', end: '14:30', title: 'Lunch', kind: 'break' },
      {
        id: 'd2-panel', start: '14:30', end: '15:30', title: 'Panel Discussion', kind: 'panel',
        people: [
          { name: 'Mr N Venkatesh', detail: 'Secretary, IEEE Hyderabad Section & Sr. Director, Silicon Labs, Hyderabad', role: 'Panellist', guest: 'n-venkatesh' },
          { name: 'Dr. Krishna Kanth Avalur', detail: 'CTO, MOSart Semiconductors, Hyderabad, Telangana', role: 'Panellist', guest: 'krishna-kanth-avalur' },
        ],
        pending: 'Panel topic and further panellists to be confirmed.',
      },
      {
        id: 'd2-valedictory', start: '15:30', end: '17:00', title: 'Valedictory', kind: 'ceremony',
        summary: 'Closing session of ICCMM-26.',
        people: [
          { name: 'Mr. Syed Aamer Javeed', detail: 'Joint Secretary, SUES', role: 'Guest of Honour', guest: 'syed-aamer-javeed' },
          { name: 'Mr N Venkatesh', detail: 'Secretary, IEEE Hyderabad Section & Sr. Director, Silicon Labs, Hyderabad', role: 'Distinguished Guest', guest: 'n-venkatesh' },
          { name: 'Dr. Krishna Kanth Avalur', detail: 'CTO, MOSart Semiconductors, Hyderabad, Telangana', role: 'Distinguished Guest', guest: 'krishna-kanth-avalur' },
        ],
        pending: 'Chief guest to be confirmed.',
      },
      { id: 'd2-high-tea', start: '17:00', end: '18:00', title: 'High Tea', kind: 'break' },
    ],
  },
];

/** Details the schedule does not yet give; shown on the Event Flow page */
export const scheduleGaps = [
  'Halls and rooms for each session',
  'Paper titles and presentation order within each technical session',
  'Keynote and panel discussion titles',
  'Tracks for the online Sessions 6 and 9',
  'Chief guest of the valedictory session',
];

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
