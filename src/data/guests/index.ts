// Guests and speakers of ICCMM-26.
// Sources (both supplied by the organisers):
//   · "Guest Info.docx": names, designations, organisations, short bios, portraits
//   · "Conference Schedule for Day1&2-29th Oct.docx": session roles (inaugural, keynote, chairs, panel, valedictory)
// Rules applied:
//   · Guests marked "NO" in Guest Info (J. Tanikella, S. Jasti, B. P. Peddigari) are not published.
//   · `designation: null` renders as "Designation to be confirmed"; nothing is filled in from elsewhere.
//   · Bios are reproduced from Guest Info; edits are listed in `notes` (only typo/name fixes).
//   · Duplicates (M. G. P. L. Narayana in two tables) are consolidated into one profile.
//   · Open questions for the organisers are recorded in `verify` and in docs/content-verification.md.
// Portrait files and their rights status live separately in ./image-sources.ts.

export type GuestCategory = 'inaugural' | 'ieee' | 'academic';

export type GuestRole = {
  /** Programme item this role belongs to (matches `id` in data/schedule.ts) */
  item: string;
  /** Role as printed in the schedule, e.g. "Guest of Honour", "Session Chair" */
  label: string;
};

export type Guest = {
  id: string;
  honorific: string | null;
  name: string;
  designation: string | null;
  organization: string;
  bio: string | null;
  category: GuestCategory;
  roles: GuestRole[];
  /** Short notes for the organisers; not shown on the site */
  verify?: string[];
};

export const guestCategories: { id: GuestCategory; title: string; accent: string; intro: string }[] = [
  {
    id: 'inaugural',
    title: 'Inaugural',
    accent: 'session.',
    intro: 'Chief guest, guests of honour and distinguished guests of the inaugural session on 20 November 2026.',
  },
  {
    id: 'ieee',
    title: 'IEEE Hyderabad Section',
    accent: 'dignitaries & guests.',
    intro: 'Office bearers and guests associated with the IEEE Hyderabad Section, the technical sponsor of ICCMM-26.',
  },
  {
    id: 'academic',
    title: 'Faculty members &',
    accent: 'academic representatives.',
    intro: 'Academic representatives from partner universities and colleges, chairing the technical sessions.',
  },
];

export const guests: Guest[] = [
  /* ───────── Inaugural session ───────── */
  {
    id: 'abhishek-ranjan',
    honorific: 'Dr.',
    name: 'Abhishek Ranjan',
    designation: 'Innovation Officer',
    organization: 'AICTE',
    bio: null,
    category: 'inaugural',
    roles: [{ item: 'd1-inaugural', label: 'Chief Guest' }],
    verify: ['Listed in the schedule only; no Guest Info entry, bio or portrait supplied.'],
  },
  {
    id: 'mgpl-narayana',
    honorific: null,
    name: 'M. G. P. L. Narayana',
    designation: 'Chair, IEEE Hyderabad Section',
    organization: 'IEEE Hyderabad Section',
    bio: 'M. G. P. L. Narayana is a veteran technology professional with over 35 years of experience in the global software and services industry. He previously served as Vice President and Chief Scientist at Tata Consultancy Services (TCS), where he led innovation and research initiatives. He is an alumnus of the Indian Institute of Science (IISc), Bengaluru, and has held several leadership positions within IEEE.',
    category: 'inaugural',
    roles: [{ item: 'd1-inaugural', label: 'Guest of Honour' }],
    verify: [
      'Appears in both the IEEE table and the Inaugural table of Guest Info; consolidated into one profile (inaugural bio used, as it is the fuller one).',
      'Honorific differs: "Dr." in the IEEE table and schedule, "Mr." in the Inaugural table. Shown without an honorific until confirmed.',
    ],
  },
  {
    id: 'mohammed-waliullah',
    honorific: 'Janab',
    name: 'Mohammed Waliullah',
    designation: 'Chairman, Sultan-ul-Uloom Educational Society (SUES)',
    organization: 'Sultan-ul-Uloom Educational Society',
    bio: 'Chairman of Sultan-ul-Uloom Educational Society, associated with the management and development of educational institutions under the society.',
    category: 'inaugural',
    roles: [{ item: 'd1-inaugural', label: 'Guest of Honour' }],
  },
  {
    id: 'zafar-javeed',
    honorific: 'Janab',
    name: 'Zafar Javeed',
    designation: 'Honorary Secretary, SUES',
    organization: 'Sultan-ul-Uloom Educational Society',
    bio: 'Honorary Secretary of Sultan-ul-Uloom Educational Society, contributing to the administration, coordination, and institutional development of the society and its educational institutions.',
    category: 'inaugural',
    roles: [{ item: 'd1-inaugural', label: 'Guest of Honour' }],
  },
  {
    id: 'marina-tropmann-frick',
    honorific: 'Prof. Dr.-Ing.',
    name: 'Marina Tropmann-Frick',
    designation: 'Professor of Data Science',
    organization: 'Hamburg University of Applied Sciences (HAW Hamburg), Germany',
    bio: 'Prof. Dr.-Ing. Marina Tropmann-Frick is a Professor of Data Science at Hamburg University of Applied Sciences. Her areas of expertise include Artificial Intelligence, Machine Learning, Data Analytics, Data Mining, and Responsible AI. She is actively involved in national and international research collaborations, focusing on trustworthy AI systems and innovative digital technologies.',
    category: 'inaugural',
    roles: [
      { item: 'd1-inaugural', label: 'Special Guest' },
      { item: 'd2-keynote-2', label: 'Keynote Speaker' },
      { item: 'd2-parallel-a', label: 'Poster Presentation' },
      { item: 'd2-parallel-b', label: 'Poster Presentation' },
    ],
  },
  {
    id: 'merugu-lakshminarayana',
    honorific: 'Dr.',
    name: 'Merugu Lakshminarayana',
    designation: 'Conference Committee Chair, IEEE Hyderabad Section',
    organization: 'IEEE Hyderabad Section',
    bio: "Dr. Merugu Lakshminarayana is an experienced electronics and telecommunications professional with over 34 years of research and development experience at the Defence Electronics Research Laboratory (DRDO), Hyderabad. He previously served as Scientist 'H' and Associate Director at DLRL. He holds a PhD from Queen's University Belfast, UK, and has served as Chair of the IEEE Hyderabad Section.",
    category: 'inaugural',
    roles: [{ item: 'd1-inaugural', label: 'Distinguished Guest' }],
    verify: [
      'Guest Info also lists "Dr. Merugu Laxmi" (IEEE table) with the same role, a different portrait and a different bio. The schedule names Dr. Merugu Lakshminarayana, so only this entry is published; the "Merugu Laxmi" entry is held back until the organisers confirm whether it is a separate guest.',
    ],
  },
  {
    id: 'krishna-reddy-p',
    honorific: 'Prof.',
    name: 'Krishna Reddy P.',
    designation: 'Professor',
    organization: 'IIIT Hyderabad',
    bio: null,
    category: 'inaugural',
    roles: [
      { item: 'd1-inaugural', label: 'Distinguished Guest' },
      { item: 'd1-keynote-1', label: 'Keynote Speaker' },
    ],
    verify: ['Listed in the schedule only; no Guest Info entry, bio or portrait supplied.'],
  },
  {
    id: 'syed-aamer-javeed',
    honorific: 'Mr.',
    name: 'Syed Aamer Javeed',
    designation: 'Joint Secretary, SUES',
    organization: 'Sultan-ul-Uloom Educational Society',
    bio: "Mr. Syed Aamer Javeed serves as the Joint Secretary of Sultan-ul-Uloom Educational Society. He is involved in the society's institutional administration and educational initiatives, contributing to the management and development of its educational institutions.",
    category: 'inaugural',
    roles: [
      { item: 'd1-inaugural', label: 'Distinguished Guest' },
      { item: 'd2-valedictory', label: 'Guest of Honour' },
    ],
  },
  {
    id: 'syed-omer-javeed',
    honorific: 'Mr.',
    name: 'Syed Omer Javeed',
    designation: null,
    organization: 'Sultan-ul-Uloom Educational Society',
    bio: 'Mr. Syed Omer Javeed is associated with Sultan-ul-Uloom Educational Society and serves as a member of the Governing Body of Muffakham Jah College of Engineering and Technology.',
    category: 'inaugural',
    roles: [{ item: 'd1-inaugural', label: 'Distinguished Guest' }],
    verify: ['Guest Info: "Designation to be confirmed". The schedule lists "Treasurer, SUES". Not published until confirmed.'],
  },

  /* ───────── IEEE Hyderabad Section: dignitaries and guests ───────── */
  {
    id: 'n-venkatesh',
    honorific: 'Mr.',
    name: 'N. Venkatesh',
    designation: 'Secretary, IEEE Hyderabad Section; Senior Director',
    organization: 'Silicon Labs, Hyderabad',
    bio: 'N. Venkatesh is a Senior Director at Silicon Labs, Hyderabad, and serves as the Secretary of the IEEE Hyderabad Section. His professional experience spans the semiconductor and technology industries, with a focus on engineering leadership and innovation. He actively contributes to IEEE initiatives that promote professional collaboration and technological advancement.',
    category: 'ieee',
    roles: [
      { item: 'd2-panel', label: 'Panellist' },
      { item: 'd2-valedictory', label: 'Distinguished Guest' },
    ],
  },
  {
    id: 'krishna-kanth-avalur',
    honorific: 'Dr.',
    name: 'Krishna Kanth Avalur',
    designation: 'Chief Technology Officer (CTO)',
    organization: 'MOSart Semiconductors, Hyderabad',
    bio: 'Dr. Krishna Kanth Avalur is the Founder and Chief Technology Officer of MOSart Labs. His areas of expertise include Analog and Mixed-Signal IC Design, semiconductor technologies and integrated circuit development. He brings extensive industry experience in semiconductor research, product development and technological innovation.',
    category: 'ieee',
    roles: [
      { item: 'd2-panel', label: 'Panellist' },
      { item: 'd2-valedictory', label: 'Distinguished Guest' },
    ],
    verify: ['Organisation is "MOSart Semiconductors" in the table but "MOSart Labs" in the bio. Bio kept as supplied.'],
  },
  {
    id: 'moiz-m',
    honorific: 'Dr.',
    name: 'Moiz M.',
    designation: null,
    organization: 'University of Hyderabad (UOH)',
    bio: 'Dr. Moiz M. is an academic professional associated with the University of Hyderabad. His academic involvement contributes to higher education, research and the advancement of knowledge across technical and interdisciplinary domains.',
    category: 'ieee',
    roles: [{ item: 'd2-parallel-a', label: 'Session Chair · Session 6 (Online)' }],
    verify: [
      'Name appears incomplete. The schedule lists "Dr Salman Abdul Moiz, UoH" as Session 6 chair; assumed to be the same person. Please confirm the full name.',
      'Bio sentence "Further details regarding his department, research interests and professional contributions are to be confirmed." removed from display.',
    ],
  },
  {
    id: 'c-thirmal',
    honorific: 'Dr.',
    name: 'C. Thirmal',
    designation: null,
    organization: 'VNR Vignana Jyothi Institute of Engineering and Technology (VNRVJIET)',
    bio: 'Dr. C. Thirmal is an academic professional associated with VNR Vignana Jyothi Institute of Engineering and Technology (VNRVJIET). He is involved in academic activities and the promotion of engineering education and research. His participation provides an opportunity to encourage academic interaction and knowledge sharing among students, researchers and professionals.',
    category: 'ieee',
    roles: [{ item: 'd1-track-3', label: 'Session Chair · Session 3' }],
    verify: [
      'Guest Info bio says "Dr. Thurman"; corrected to "Dr. C. Thirmal" to match the table and schedule.',
      'Designation "to be confirmed" in Guest Info. The committee list on the site gives "Assistant Professor, Dept. of Physics, VNRVJIET; Chair, IEEE-NTC, Hyderabad Section". Not repeated here until confirmed.',
    ],
  },

  /* ───────── Faculty members and academic representatives ───────── */
  {
    id: 'sridevi',
    honorific: 'Dr.',
    name: 'Sridevi',
    designation: null,
    organization: 'Jawaharlal Nehru Technological University Hyderabad (JNTUH)',
    bio: "Dr. Sridevi is an academic professional associated with Jawaharlal Nehru Technological University Hyderabad (JNTUH). She is involved in academic activities and the advancement of technical education and research. Her participation reflects the university's commitment to fostering academic excellence and innovation.",
    category: 'academic',
    roles: [{ item: 'd1-track-1', label: 'Session Chair · Session 1' }],
    verify: ['Single name only; please confirm the full name.'],
  },
  {
    id: 'sanju-tiwari',
    honorific: 'Dr.',
    name: 'Sanju Tiwari',
    designation: null,
    organization: 'Sharda University',
    bio: 'Dr. Sanju Tiwari is a Professor at Sharda University, specializing in Computer Science and Applications. Her areas of expertise include Artificial Intelligence, Knowledge Graphs, Ontology Engineering and Semantic Web technologies. She is actively involved in academic research, international collaborations and advancing emerging technologies.',
    category: 'academic',
    roles: [{ item: 'd2-parallel-b', label: 'Session Chair · Session 7' }],
  },
  {
    id: 'ma-jabbar',
    honorific: 'Dr.',
    name: 'M. A. Jabbar',
    designation: null,
    organization: 'Vardhaman College of Engineering',
    bio: 'Dr. M. A. Jabbar is an academic professional associated with Vardhaman College of Engineering. He is involved in engineering education, academic development and research activities. His professional interests include promoting technical knowledge and encouraging innovation in higher education.',
    category: 'academic',
    roles: [{ item: 'd2-parallel-a', label: 'Session Chair · Session 4' }],
  },
  {
    id: 'vijay-latha',
    honorific: 'Dr.',
    name: 'Vijay Latha',
    designation: null,
    organization: 'Vardhaman College of Engineering',
    bio: 'Dr. Vijay Latha is an academic professional associated with Vardhaman College of Engineering. She is engaged in academic activities and the advancement of engineering education and research. Her academic involvement focuses on fostering technical learning, research and professional development.',
    category: 'academic',
    roles: [{ item: 'd1-track-1', label: 'Session Chair · Session 2' }],
    verify: ['Schedule spells the name "Dr. Vijayalata Reddy (VCE)". Please confirm the spelling.'],
  },
  {
    id: 'k-jaya-sankar',
    honorific: 'Dr.',
    name: 'K. Jaya Sankar',
    designation: null,
    organization: 'Methodist College of Engineering and Technology (MCET)',
    bio: 'Dr. K. Jaya Sankar is a Professor at Methodist College of Engineering and Technology (MCET), Hyderabad. His areas of expertise include Telecommunications, Electromagnetics, Antennas, Wireless Communications and Soft Computing. He has extensive experience in engineering education, academic administration and research.',
    category: 'academic',
    roles: [{ item: 'd2-parallel-a', label: 'Session Chair · Session 5' }],
    verify: ['Schedule spells the name "Dr. K. Jaya Shankar".'],
  },
  {
    id: 'jyoti-singhai',
    honorific: 'Dr.',
    name: 'Jyoti Singhai',
    designation: null,
    organization: 'National Institute of Technology (NIT) Bhopal',
    bio: 'Dr. Jyoti Singhai is an academic professional associated with the National Institute of Technology, Bhopal. She is involved in higher education and research, contributing to the academic and technological development of engineering disciplines. Her association reflects a commitment to academic excellence and innovation.',
    category: 'academic',
    roles: [{ item: 'd2-parallel-b', label: 'Session Chair · Session 8' }],
  },
];

/** Keynote speakers, in programme order */
export const keynoteIds = ['krishna-reddy-p', 'marina-tropmann-frick'];

export const guestById = (id: string) => guests.find((g) => g.id === id);
export const displayName = (g: Guest) => (g.honorific ? `${g.honorific} ${g.name}` : g.name);
export const initials = (g: Guest) => g.name.split(/[\s.\-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
