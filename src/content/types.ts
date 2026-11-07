// Shape of all editable site content. The CMS (/admin) edits this; the public site reads it at load time
// (see src/content/store.ts). src/content/seed.ts holds the content as it was when the CMS was added and is
// the fallback whenever the content service cannot be reached.

export type DateEntry = { label: string; past?: string[]; date: string; iso: string; isEvent?: boolean };
export type Mark = { value: string; label: string };
export type Organizer = { name: string; fullName?: string; paragraphs: string[]; marks: Mark[] };

export type Track = { no: string; title: string; key: string; summary: string; icon: string; topics: string[] };

export type FeeRow = { id: string; label: string; member: boolean; inr: number; usd: number | null };
export type OtherFee = { label: string; amount: number; unit: 'per person' | 'per team'; note: string | null };

export type CommitteeMember = { name: string; affiliation: string; photo?: string; guestId?: string };
export type CommitteeGroup = { role: string; people: CommitteeMember[] };

export type Supporter = { role: string; name: string; logo: string; w: number; h: number; dark?: boolean };
export type GalleryImage = { src: string; w: number; h: number; alt: string };
export type Poster = { src: string; caption: string; alt: string; w?: number; h?: number };
export type DocumentFile = { title: string; description?: string; file: string; size?: number };

export type GuestCategory = 'inaugural' | 'ieee' | 'academic';
export type GuestRole = { item: string; label: string };
export type GuestPhoto = {
  /** Main file (≤720 px wide, 4:5) */
  src: string;
  /** Optional 360 px wide variant */
  src360?: string;
  w: number;
  h: number;
  focus?: string;
  lowRes?: boolean;
  source?: string;
  license?: string;
  verification?: string;
};
export type Guest = {
  id: string;
  honorific: string | null;
  name: string;
  designation: string | null;
  organization: string;
  location?: string;
  bio: string | null;
  category: GuestCategory;
  roles: GuestRole[];
  verify?: string[];
  placeholder?: boolean;
  photo?: GuestPhoto | null;
};
export type GuestCategoryInfo = { id: GuestCategory; title: string; accent: string; intro: string };

export type ItemKind = 'registration' | 'ceremony' | 'keynote' | 'technical' | 'break' | 'panel' | 'social';
export type Person = { name: string; detail?: string; role?: string; guest?: string };
export type Paper = { start: string; end: string; id: number; title: string; authors: string };
export type Lane = {
  title: string; track?: string; online?: boolean; room?: string; incharge?: string;
  chair?: Person; coChair?: Person; people?: Person[]; papers?: Paper[];
};
export type ScheduleItem = {
  id: string; start: string; end: string; title: string; kind: ItemKind;
  summary?: string; people?: Person[]; lanes?: Lane[]; pending?: string;
};
export type Day = { id: string; label: string; date: string; iso: string; items: ScheduleItem[] };

export type PageText = { eyebrow: string; title: string; accent?: string; intro?: string };
export type PageKeyText = 'about' | 'tracks' | 'speakers' | 'guests' | 'programme' | 'cfp' | 'registration' | 'committee' | 'events' | 'sponsors' | 'venue';

export type SiteContent = {
  meta: {
    acronym: string; edition: string; title: string; titleShort: string; titleRest: string; dates: string;
    startsAt: string; conferenceId: string; pdfExpressId: string; institution: string; address: string;
    email: string; website: string; phones: string[]; copyright: string;
  };
  links: { cmt: string; ieeeTemplates: string; aiReportForm: string; registrationForm: string; maps: string; mapsEmbed: string };
  brandLogo: { src: string; width: number; height: number; alt: string } | null;
  about: { lead: string; body: string[]; formats: string[]; disciplines: string[] };
  aboutShort: string;
  sponsorsLine: { role: string; name: string }[];
  organizers: { ieee: Organizer; mjcet: Organizer };
  tracks: Track[];
  callForPapers: { intro: string; note: string; publication: string; invitation: string };
  importantDates: DateEntry[];
  posterDates: DateEntry[];
  posterSession: {
    intro: string; focus: string; theme: string; tracks: string[];
    guidelines: { title: string; text: string }[]; presentation: string[]; audience: string[];
  };
  authorGuide: {
    general: string[]; review: string[]; publication: string; cameraReady: string[]; formatting: string[];
    copyrightNotices: { who: string; notice: string }[];
    steps: { title: string; body: string[]; notices?: boolean; link?: string }[];
    cmtAck: string;
  };
  fees: {
    headers: { inr: string; usd: string };
    rows: FeeRow[];
    accommodation: { label: string; inr: number; usd: number };
    profiles: { id: string; label: string }[];
    other: OtherFee[];
    gstNote: string;
    extraPages: string;
  };
  committee: CommitteeGroup[];
  organizingCommittee: string[];
  sponsorTiers: { tier: string; amount: string; benefits: string[] }[];
  faq: { q: string; a: string }[];
  supporters: Supporter[];
  ieeeGallery: GalleryImage[];
  posters: Poster[];
  documents: DocumentFile[];
  guestCategories: GuestCategoryInfo[];
  guests: Guest[];
  keynoteIds: string[];
  schedule: Day[];
  paperGuideline: string;
  scheduleGaps: string[];
  pages: Record<PageKeyText, PageText>;
};

export type SectionKey = keyof SiteContent;
