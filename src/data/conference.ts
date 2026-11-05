// Conference content. Source: iccmm26_website_data.md
// Guests: data/guests/ · Schedule: data/schedule.ts (both from the organisers' November documents)
// Edit this file to update the site; sections only handle presentation.

export const meta = {
  acronym: 'ICCMM-26',
  edition: '1st International Conference on',
  title: 'Next-Gen Computing: Converging Microelectronics and Mechatronics for Transformative Solutions',
  titleShort: 'Next-Gen Computing',
  titleRest: 'Converging Microelectronics and Mechatronics for Transformative Solutions',
  dates: '20-21 November, 2026',
  // Start time is not specified in the source; midnight IST on day one is used for the countdown.
  startsAt: '2026-11-20T00:00:00+05:30',
  conferenceId: '66375',
  pdfExpressId: '66375X',
  institution: 'Muffakham Jah College of Engineering and Technology (MJCET)',
  address: 'Mount Pleasant, 8-2-249 to 267, Road No. 3, Banjara Hills, Hyderabad - 500 034, Telangana State, India',
  email: 'iccmm@mjcollege.ac.in',
  website: 'https://iccmm.mjcollege.ac.in/',
  // Contact numbers. The first was printed as 98889810626 in the brochure; corrected to 8889810626.
  phones: ['+91 8889810626', '+91 9959129564', '+91 9948439301'],
  copyright: 'Copyright ©2025 ICCMM-2026. All Rights Reserved.',
};

// Header logo (ITRLY / iTriply). Drop the original file into public/assets/logos/ and set it here, e.g.
// { src: 'assets/logos/logo-itrly.png', width: 480, height: 160, alt: 'ITRLY' }. Height is fixed in CSS; width follows the aspect ratio.
export const brandLogo = null as null | { src: string; width: number; height: number; alt: string };

export const links = {
  cmt: 'https://cmt3.research.microsoft.com/ICCMM2026',
  ieeeTemplates: 'https://www.ieee.org/conferences/publishing/templates',
  aiReportForm: 'https://forms.gle/hJTAHkTAThpgi4Zt6',
  // INTEGRATION POINT (Google Form): the source mentions a "Conference Registration Form" but gives no URL.
  // Set this to the live Google Form URL (e.g. the forms.gle link) and every registration button,
  // including the form on the Registration page, switches to it automatically.
  registrationForm: null as string | null,
  // Optional: the Google Form's pre-fill field ids (Form menu → "Get pre-filled link"), e.g. 'entry.123456789'.
  // When set, the Full Name and Mobile Number entered on the Registration page are carried into the Google Form.
  registrationFormFields: { name: null as string | null, mobile: null as string | null },
  maps: 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Muffakham Jah College of Engineering and Technology, Road No. 3, Banjara Hills, Hyderabad 500034'),
  mapsEmbed: 'https://maps.google.com/maps?q=' +
    encodeURIComponent('Muffakham Jah College of Engineering and Technology, Banjara Hills, Hyderabad') +
    '&z=15&output=embed',
};

export const about = {
  lead: 'The 1st International Conference on Next-Gen Computing: Converging Microelectronics and Mechatronics for Transformative Solutions (ICCMM-26) is being organized to address emerging challenges and promote the development of intelligent, future-ready solutions.',
  body: [
    'The conference is technically co-sponsored by the IEEE Hyderabad Section, AICTE, Shodhguru and is approved by IEEE with Conference ID: #66375. The conference spotlights cutting-edge research and technological advancements. This conference offers a unique platform for academic and industrial communities to explore new trends, challenges, and emerging technologies relevant to today’s rapidly evolving fields, including computing, microelectronics, and mechatronics.',
    'ICCMM-26 features keynote addresses, invited talks, peer-reviewed paper and poster presentations, product exhibitions, and panel discussions. Its goal is to foster collaboration and dynamic discussions to address critical research issues and facilitate the exchange of innovative ideas. By focusing on specific engineering disciplines, the conference allows speakers to engage deeply with topics set to impact the near future.',
    'The fields of engineering and technology are both compelling and essential. To stay at the forefront, one must remain vigilant in monitoring the latest trends, identifying key challenges, and engaging in independent research. The primary aim of this two-day conference is to unite experts, researchers, and innovators from academia, research and development, and industry across various engineering and technology sectors.',
    'This forum will provide a platform for attendees to learn about current research developments, identify and conceptualize new ideas, and share their valuable insights and findings. Additionally, the conference will feature distinguished keynote speakers to inspire young graduates to consider research as a potential career path. It will also promote interdisciplinary collaboration among researchers, helping to bridge gaps between different fields.',
  ],
  formats: ['Keynote addresses', 'Invited talks', 'Peer-reviewed paper presentations', 'Poster presentations', 'Product exhibitions', 'Panel discussions'],
  disciplines: ['Computing', 'Microelectronics', 'Mechatronics'],
};

export const sponsorsLine = [
  { role: 'Technically Sponsored by', name: 'IEEE Hyderabad Section' },
  { role: 'Technically Co-Sponsored by', name: 'SHODHGURU Research Labs' },
  { role: 'Financially Supported by', name: 'AICTE' },
];

export const organizers = {
  ieee: {
    name: 'IEEE Hyderabad Section',
    paragraphs: [
      'The IEEE Hyderabad Section stands out as one of the most vibrant and active sections of the IEEE community in India. Its journey began in June 1981, when a dedicated group of engineers in Hyderabad took the initiative to establish an IEEE sub-section. Their hard work and determination led to the rapid advancement of this sub-section, which became a full-fledged section in 1984, coinciding with the centenary celebrations of IEEE.',
      'Today, the IEEE Hyderabad Section proudly encompasses all IEEE members residing in the Indian states of Telangana and Andhra Pradesh, with the exception of those living in the Vizag Bay area. For those interested in learning more about the Section’s endeavors and accomplishments, the official website of the IEEE Hyderabad Section provides comprehensive information about its activities and milestones.',
    ],
    marks: [
      { value: '1981', label: 'Sub-section established (June)' },
      { value: '1984', label: 'Full-fledged section, IEEE centenary' },
    ],
  },
  mjcet: {
    name: 'MJCET',
    fullName: 'Muffakham Jah College of Engineering and Technology',
    paragraphs: [
      'Muffakham Jah College of Engineering and Technology (MJCET) was established in the year 1980 by Sultan-ul-Uloom Education Society (SUES) which is formed by a group of visionaries and intellectuals from various walks of life. Today that tiny acorn has developed into a mighty oak.',
      'MJCET is a premier Minority Autonomous Institution affiliated to Osmania University and approved by AICTE. The college is accredited with NAAC A+ (2024), and its major undergraduate programs-Civil Engineering, Computer Science and Engineering, Electronics and Communication Engineering, and Mechanical Engineering are accredited by NBA for the period 2024–2027. Located in the prime area of Banjara Hills and spread across a picturesque 25-acre campus, MJCET offers a conducive academic environment with state-of-the-art infrastructure and modern laboratories.',
      'The college offers four-year B.E. programs across multiple branches, including Artificial Intelligence, Data Science, and Machine Learning, and M.E/MTech programs in Computer Science, Embedded System, and VLSI Design. MJCET recently received autonomous status from UGC for 2025-26 to 2034-35, allowing it to innovate curriculum, examination systems, and administration.',
      'With a focus on holistic development, MJCET emphasizes industry interaction, internships, and skill development programs to enhance student employability. Over the years, the college has built a legacy of nurturing talented engineers who contribute significantly to science, technology, and society.',
    ],
    marks: [
      { value: '1980', label: 'Established under SUES' },
      { value: 'A+', label: 'NAAC accreditation (2024)' },
      { value: '25', label: 'Acre campus, Banjara Hills' },
    ],
  },
};

export const tracks = [
  {
    no: '01',
    title: 'Next-Gen Intelligent Computing and Pervasive Networking',
    key: 'Computing',
    summary: 'AI and machine learning, edge, cloud and fog architectures, quantum and neuromorphic computing, IoT and digital twins.',
    icon: 'network',
    topics: [
      'Artificial Intelligence and Machine Learning',
      'Deep Learning, Federated Learning, and Edge AI',
      'Quantum and Neuromorphic Computing',
      'Cloud, Edge, and Fog Computing Architectures',
      'Cyber-Physical Systems and Digital Twins',
      'Data Analytics, Visualization, and Knowledge Engineering',
      'Internet of Things (IoT) and Industrial IoT',
      'IoT Security and Blockchain Integration',
      'Edge Devices for Smart Environments',
      'Green IoT and Sustainable Microcontrollers',
    ],
  },
  {
    no: '02',
    title: 'Microelectronics and Embedded Systems',
    key: 'Microelectronics',
    summary: 'VLSI and SoC design, MEMS and sensor integration, low-power circuits, semiconductor fabrication, embedded control and 5G/6G antennas.',
    icon: 'chip',
    topics: [
      'VLSI and SoC Design (Analog, Digital, and Mixed-Signal)',
      'MEMS, NEMS, and Sensor Integration',
      'Low-Power and High-Performance Circuits',
      'Semiconductor Materials and Fabrication Techniques',
      'Embedded Systems for Real-Time Control',
      'Hardware Security and Fault-Tolerant Design',
      'Reconfigurable Antennas and Arrays for 5G/6G',
      'Applications of Metamaterials and Metasurfaces',
      'Microwave Photonics',
    ],
  },
  {
    no: '03',
    title: 'Mechatronics, Intelligent Automation, and Sustainable Energy Systems',
    key: 'Mechatronics',
    summary: 'Robotics, control and motion systems, autonomous vehicles and drones, Industry 4.0 / 5.0 automation, energy storage and electric mobility.',
    icon: 'robot',
    topics: [
      'Robotics Design, Kinematics, and Dynamics',
      'Control Systems, Nonlinear Feedback, and Optimization',
      'Autonomous Vehicles and Drones',
      'Industrial Automation (Industry 4.0 / 5.0)',
      'Smart Actuators, Motion Control, and Servo Systems',
      'Human–Machine Interaction and Assistive Robotics',
      'Energy Storage and Management Systems',
      'Electric Mobility (EVs, Charging Infrastructure)',
      'Nanoscale material manipulation and fabrication techniques',
      'Recyclable materials and circular economy in manufacturing',
      'Additive manufacturing using eco-friendly materials',
      'Micro-Electro-Mechanical Systems (MEMS) for wearable devices',
    ],
  },
  {
    no: '04',
    title: 'Applied Computational Technologies and Interdisciplinary Applications',
    key: 'Interdisciplinary',
    summary: 'Computational modelling, AI-driven design, smart manufacturing, biomedical mechatronics, smart cities, space robotics and 5G/6G research.',
    icon: 'converge',
    topics: [
      'Computational Modelling in Micro-Mechatronics',
      'Finite Element and Multibody Dynamics',
      'Digital Fabrication and Additive Manufacturing',
      'AI-Driven Design Optimization',
      'Smart Materials and Adaptive Control',
      'Biomedical Mechatronics and Wearable Devices',
      'Smart Manufacturing and Digital Factories',
      'Autonomous Systems in Agriculture and Transportation',
      'Smart Cities and Sustainable Infrastructures',
      'Space Robotics and Aerospace Systems',
      'Cognitive and Soft Computing in Engineering',
      '5G/6G Research & Beyond',
      'Advances in Antennas and Sensors for Health and Medical Applications',
      'Integrated Sensing and Communications',
    ],
  },
];

export const callForPapers = {
  intro: 'The conference is open for both academicians (researchers, professors, research associates, doctoral students and other members of student’s community) and industry delegates. Original Research Papers and Case Studies are invited on the conference theme in the area of Computing, Microelectronics, and Mechatronics.',
  note: 'Other relevant research papers may also be considered after extensive review for presentation and publication.',
  publication: 'All accepted and presented papers will be included in ICCMM-26 Conference Proceedings and will be submitted to IEEE Conference Quality and Ethics review. The conference proceedings will be submitted to the IEEE Xplore digital library for publication. (IEEE Xplore is Scopus and Google Scholar Indexed).',
  invitation: 'The General Chairs, along with the entire team cordially invite you to take part in this upcoming event and together we flourish it into a most memorable experience. ICCMM-26 will no doubt be proven to be exhilarating and educative.',
};

// `past` holds earlier dates that were superseded (shown struck through on the original site).
export const importantDates = [
  { label: 'Full Paper Submission Deadline', past: ['30th April', '30th May'], date: '30th June, 2026', iso: '2026-06-30' },
  { label: 'Review Notification', date: '31st August, 2026', iso: '2026-08-31' },
  { label: 'Early Bird Registration Deadline', date: '1st September, 2026', iso: '2026-09-01' },
  { label: 'Registration Deadline', past: ['10th September'], date: '10th October, 2026', iso: '2026-10-10' },
  { label: 'Submission of Camera Ready Paper', past: ['10th September'], date: '10th October, 2026', iso: '2026-10-10' },
  { label: 'Submission of Electronic IEEE Copyright Form', date: '10th October, 2026', iso: '2026-10-10' },
  { label: 'Release of Final Conference Program', date: '30th October, 2026', iso: '2026-10-30' },
  { label: 'Conference', date: '20-21 November, 2026', iso: '2026-11-20', isEvent: true },
];

export const posterDates = [
  { label: 'Thesis & Poster Abstract Submission Deadline', past: ['1st July', '15th October'], date: '10th November 2026', iso: '2026-11-10' },
  { label: 'Thesis & Poster Acceptance Notification', past: ['31st August', '20th October'], date: '12th November 2026', iso: '2026-11-12' },
  { label: 'Thesis & Poster Registration Deadline', past: ['1st October', '30th October'], date: '15th November 2026', iso: '2026-11-15' },
  { label: 'Poster Presentation', date: '21st November 2026', iso: '2026-11-21', isEvent: true },
];

export const posterSession = {
  intro: 'The IEEE ICCMM-26 organizing committee invites students, research scholars, academicians, and industry professionals to submit posters for a Special Poster Session as part of the conference. The poster session aims to provide a platform for early-stage research, innovative ideas, prototypes, and proof-of-concept work, encouraging visual and interactive presentation of research aligned with emerging technologies and sustainability goals.',
  focus: 'Posters should highlight innovative technological solutions that contribute to sustainability, societal impact, and the United Nations Sustainable Development Goals (SDGs).',
  theme: 'Sustainable and Intelligent Technologies for Transformative Solutions',
  tracks: [
    'AI & Intelligent Computing for Sustainability',
    'Green and Energy-Efficient Computing Systems',
    'Sustainable Microelectronics and Embedded Systems',
    'Mechatronics and Automation for Smart & Sustainable Systems',
    'Smart Energy, Renewable Energy, and Energy Management Systems',
    'IoT, Sensors, and Edge Computing for Environmental Monitoring',
    'Technology for Smart Agriculture, Healthcare, and Smart Cities',
    'Interdisciplinary Applications Supporting SDGs',
  ],
  guidelines: [
    ['Poster Size', 'A0 – 84.1 × 118.9 cm (33.1 × 46.8 inches).'],
    ['Orientation', 'Portrait preferred.'],
    ['Resolution', '300 DPI preferred for high-quality images.'],
    ['File Format', 'PDF for digital submission along with 1 page writeup to be published in ICCMM-26 conference souvenir.'],
    ['Title', 'Clear, concise and prominently displayed.'],
    ['Author Details', 'Student name(s), project guide (not mandatory), department and institution name.'],
    ['Content', 'Introduction, problem statement, objectives, methodology, results, conclusion, future scope and references.'],
    ['Visuals', 'Include relevant flowcharts, system architecture, graphs, tables or prototype images.'],
    ['Font Sizes', 'Title 72–100 pt; headings 32–40 pt; body text 24–30 pt.'],
    ['Design', 'Use 2–4 complementary colours, readable fonts, proper alignment and sufficient white space.'],
    ['Research Quality', 'Highlight novelty, practical applications and genuine results. Cite all references and external images.'],
    ['Presentation', 'Ensure the poster is clear, well-organised and readable from a distance.'],
    ['Originality', 'Plagiarism-free content and accurate data are mandatory.'],
    ['Judging Criteria', 'Research content, innovation, methodology, visual design, clarity of presentation and responses to questions.'],
  ],
  presentation: [
    'Selected authors must present their posters in person during the conference.',
    'Poster format and dimensions will be communicated after acceptance.',
    'Best posters will be recognized with awards/certificates.',
  ],
  audience: ['Undergraduate & postgraduate students', 'Research scholars', 'Early-career researchers', 'Innovators and industry practitioners'],
};

export const authorGuide = {
  general: [
    'Prospective authors are encouraged to submit a full paper for review before the paper submission deadline, in PDF or Word format. Each paper should be written in English.',
    'Only registered delegates are permitted to attend and present at the conference.',
    'The abstract should not exceed 400 words and have a maximum of five keywords.',
    'Authors are requested to submit a full paper of 4-6 pages for oral presentation (More than 6 pages will be charged accordingly).',
    'Only original, unpublished research work, not currently under review by any other conference/journal, should be sent.',
    'All figures, tables, and equations must be clear, legible, and properly formatted.',
    'At least one author must register and present the paper at the conference.',
    'Certificates will be issued only to registered participants who attend or present.',
  ],
  review: [
    'Authors are encouraged to submit their papers using Microsoft CMT.',
    'Each paper will undergo peer review by at least three independent referees from the conference review panel.',
    'All submissions will be checked for plagiarism (as per IEEE plagiarism policy).',
    'Papers should be prepared in IEEE two-column format using Word (.doc) or PDF (.pdf).',
    'Do not prefix author names with titles (e.g., Dr., Prof., etc.).',
    'Templates are available for download from IEEE.',
    'Accepted papers will be notified by email.',
    'Authors of accepted papers must sign the IEEE copyright release form online and must present the paper at the conference.',
  ],
  publication: 'All accepted and presented papers that comply with IEEE standards will be published in the Conference Proceedings and indexed in IEEE Xplore (SCOPUS).',
  cameraReady: [
    'The final camera-ready copy must strictly follow the IEEE format. Do not modify the layout or margins of the conference template.',
    'Ensure that the similarity index is less than 20%, excluding references.',
    'Similarity from any single source must not exceed 4%.',
    'Incorporate the corrections suggested by the reviewers, as communicated by email.',
    'Equations must be prepared using an equation editor or MathType.',
    'Include the affiliations and email addresses of all authors.',
    'Ensure that all author information is identical to that in the initial submission.',
    'Revise the paper thoroughly to eliminate typographical and grammatical errors.',
    'Graphs, figures, and diagrams must have good resolution; 300 dpi is preferable. Avoid copying and pasting diagrams; use standard software to prepare them.',
    'Tables must be created in editable text format and must not be inserted as images.',
    'Do not include page numbers.',
    'The manuscript may contain a maximum of six pages.',
    'Recommended naming format- paperid_firstauthorlastname.pdf',
    'The AI-generated content or AI-related plagiarism score must be less than 20%, as required by the conference and Turnitin report is only acceptable.',
    'Submit the IEEE e-Copyright Form through CMT after submitting the camera-ready paper. Verify the paper title and all author details before final submission.',
  ],
  formatting: [
    'Use Times New Roman throughout the manuscript, paying particular attention to paragraph formatting from the Abstract through the References section.',
    'Set the paper title in 24-point regular font; it should not be bold or italicized.',
    'Use 9-point regular font for author names. Do not use salutations such as Dr., Mr., Mrs., Prof., Research Scholar, or Student.',
    'Format the word “Abstract” in 9-point bold italic font. Format the abstract text in 9-point bold, non-italic font.',
    'Format “Keywords” in 9-point bold italic font, with keywords separated by commas.',
    'Use 10-point regular font for main headings, with the first letter capitalized and the headings centred. Precede headings with Roman numerals.',
    'Ensure that every in-text citation has a corresponding entry in the References section and vice versa.',
    'Arrange citations in ascending numerical order rather than in random order.',
    'Do not cite references in the Abstract or Conclusion sections.',
    'Avoid the use of first-person expressions such as “our,” “we,” and “us.”',
    'Use 10-point italic font for subheadings and align them to the left. Label subheadings using capital letters such as A, B, and so on.',
    'Use subsequent levels such as 1), 2), and further levels such as a), b), with appropriate indentation.',
    'Use “Fig.” rather than “Figure.” Figure numbers and captions must be in 8-point regular font and properly justified.',
    'Format table captions in 8-point regular font and centre them. Use Roman numerals for table numbers without a dash or hyphen between the number and caption.',
    'Format references in 8-point font using the prescribed format, with the reference number followed by a tab and the reference details.',
  ],
  copyrightNotices: [
    { who: 'All authors employed by the US government', notice: 'U.S. Government work not protected by U.S. copyright' },
    { who: 'All authors employed by a Crown government (UK, Canada, and Australia)', notice: '979-8-3315-4613-7/26/$31.00 ©2026 Crown' },
    { who: 'All authors employed by the European Union', notice: '979-8-3315-4613-7/26/$31.00 ©2026 European Union' },
    { who: 'All other papers', notice: '979-8-3315-4613-7/26/$31.00 ©2026 IEEE' },
  ],
  steps: [
    {
      title: 'Prepare the Final Camera-Ready Paper',
      body: ['Prepare the final camera-ready paper after considering all the requirements above and incorporating the reviewer comments.'],
    },
    {
      title: 'Insert the IEEE Copyright Notice',
      body: ['Place the appropriate copyright notice at the bottom of the first page of each paper. Replace the copyright notice in the camera-ready version with one of the notices listed below, as applicable.'],
      notices: true,
    },
    {
      title: 'Complete the IEEE PDF eXpress Check',
      body: [
        'Access the IEEE PDF eXpress website and log in to the portal. Conference ID: 66375X.',
        'New users must register; existing users may use their current login credentials.',
        'For each conference paper, select “Create New Title.” Enter identifying information for the paper. The paper title is recommended but not mandatory.',
        'Select “Submit PDF for Checking” or “Submit Source Files for Conversion.” Select the platform and source-file type, if applicable, browse to the file, and select “Upload File.”',
        'You will receive online and email confirmation after the upload. If you submitted a PDF for checking, review the result shown in the email. The PDF must pass the IEEE PDF eXpress compatibility test. Repeat the process until the file passes.',
      ],
    },
    {
      title: 'Submit the Camera-Ready Paper',
      body: ['Submit the camera-ready paper through the CMT author console after it has passed the IEEE PDF eXpress check. Before uploading to CMT, rename the checked PDF to PID_firstauthorlastname, where PID represents the CMT paper ID (eg: 44_Singh.pdf). Also upload the doc file of the paper (eg: 44_Singh.doc). Retain the original paper title in the final manuscript. The author list and author order from the original submission must not be changed in the final manuscript.'],
    },
    {
      title: 'Submit the IEEE e-Copyright Form',
      body: ['After uploading the camera-ready paper, which must have passed the IEEE PDF eXpress check, select “Submit IEEE Copyright Form” to access the IEEE e-Copyright Form submission page in CMT. The corresponding author may complete the copyright forms on behalf of all authors. After completing the form on the IEEE website, download the completed form and upload it to CMT.'],
    },
    {
      title: 'Upload the AI-generated content report',
      body: ['Additionally, please upload the AI-generated content report using the form linked below.'],
      link: 'aiReportForm',
    },
  ],
  cmtAck: 'CMT ACKNOWLEDGMENT: The Microsoft CMT service was used for managing the peer-reviewing process for this conference. This service was provided for free by Microsoft and they bore all expenses, including costs for Azure cloud services as well as for software development and support.',
};

// Regular fees. `usd: null` means the source lists no international fee for that row.
export const fees = {
  headers: { inr: 'Regular (Indian) + 18% GST in INR*', usd: 'Regular (International) in USD*' },
  rows: [
    { id: 'student', label: 'Student', member: false, inr: 9499, usd: 125 },
    { id: 'student', label: 'Student (IEEE Member)', member: true, inr: 8260, usd: 100 },
    { id: 'academician', label: 'Academician', member: false, inr: 12213, usd: 175 },
    { id: 'academician', label: 'Academician (IEEE member)', member: true, inr: 10620, usd: 150 },
    { id: 'researcher', label: 'Researcher/Industrialist', member: false, inr: 13570, usd: 200 },
    { id: 'researcher', label: 'Researcher/Industrialist (IEEE member)', member: true, inr: 11800, usd: null },
  ],
  accommodation: { label: 'Accommodation- (for 2 night)', inr: 17700, usd: 250 },
  profiles: [
    { id: 'student', label: 'Student' },
    { id: 'academician', label: 'Academician' },
    { id: 'researcher', label: 'Researcher / Industrialist' },
  ],
  // Technical event fees (INR). Poster Presentation is one total fee per team of up to 3 participants.
  other: [
    { label: 'Attendee', amount: 1000, unit: 'per person', note: null },
    { label: 'Poster Presentation', amount: 3000, unit: 'per team', note: 'Up to 3 participants' },
    { label: 'Best PhD / M.Tech Thesis Presentation', amount: 1000, unit: 'per person', note: null },
  ] as { label: string; amount: number; unit: 'per person' | 'per team'; note: string | null }[],
  gstNote: '* : excluding GST',
  extraPages: 'The regular fee will be charged upto 6 pages and after that extra fee charges will be applicable beyond 6 pages (up to 2 additional pages). The extra page charge: 1200/page (for Indian Author) and $25/page ( for Foreign authors).',
};

// Display form of a technical event fee: "₹1,000 per person", "₹3,000 / Team"
export const eventFee = (f: (typeof fees.other)[number]) => ({
  price: `₹${f.amount.toLocaleString('en-IN')}`,
  unit: f.unit === 'per team' ? '/ Team' : 'per person',
});

export const committee = [
  { role: 'Chief Patron', people: [['Janab Zafar Javeed', 'Hony Secretary, SUES']] },
  { role: 'Patron', people: [['S. Srinivasa Rao', 'MJCET, Hyderabad'], ['MGPL Narayana', 'Chair-IEEE Hyderabad Section, Hyderabad']] },
  { role: 'Co Patron', people: [['K.V Narsimha Rao', 'MJCET'], ['Syed Ferhathullah Hussainy', 'MJCET, Hyderabad'], ['Mohd. Hamraj', 'MJCET, Hyderabad']] },
  { role: 'General Chairs', people: [['Tasneem Bano Rehman', 'CSED, MJCET, Hyderabad'], ['Marina Tropmann Frick', 'University of Applied Science (HAW), Hamburg, Germany']] },
  { role: 'General Co Chairs', people: [['Ayesha Naaz', 'ECED, MJCET, Hyderabad'], ['G. Sailaja', 'MED, MJCET, Hyderabad'], ['Fernando Ortiz Rodriguez', 'Universidad Autonoma de Tamaulipas, Mexico']] },
  { role: 'Conference Chairs', people: [['Syed Shabbeer Ahmed', 'CSED, MJCET, Hyderabad'], ['Viquar Mohiuddin', 'MED, MJCET, Hyderabad'], ['Arif Sohel', 'Head, Research and Development, ACES India'], ['Jehad Ali', 'Ajou University, South Korea']] },
  { role: 'Conference Co Chair', people: [['Sabir Hussain', 'ECED, MJCET, Hyderabad'], ['Ishrat Meera Mirzana', 'MED, MJCET, Hyderabad'], ['A. H. Abdul Hafez', 'King Faisal University, Al Hofuf, KSA']] },
  { role: 'Track Chairs', people: [
    ['Meenu Chawala', 'MANIT, Bhopal'],
    ['M A Jabbar', 'Vardhaman College of Engineering, Hyderabad'],
    ['Dr. K. Jaya Sankar', 'Dean - Industry Partnerships and Outreach, Methodist College of Engineering and Technology (MCET)'],
    ['P Koti Lakshmi', 'Osmania Uinversity, Hyderabad'],
    ['Saraswathamma', 'Department of Mechanical Engineering Osmania University, Hyderabad.'],
    ['C. Thirmal', 'Assistant Professor, Dept. Of Physics, VNRVJIET, Chair, IEEE-NTC, Hyderabad Section.'],
    ['Durgesh Mishra', 'Chairman IEEE Computer Society (MP), Director Symbiosis University of Applied Sciences, Indore'],
    ['Rupam Sharma', 'Rajiv Gandhi University, Arunachal Pradesh'],
  ] },
  { role: 'Finance Chairs', people: [['Maniza Hijab', 'CSED, MJCET, Hyderabad'], ['Nazeerunissa', 'ECED, MJCET, Hyderabad'], ['Sanju Tiwari', 'Sharda University, Greater Noida, UP and TIB Hannover, Germany'], ['Qutubuddin S M', 'PDA College of Engineering, Gulbarga']] },
  { role: 'Publication Chairs', people: [['Jyoti Singhai', 'MANIT, Bhopal'], ['Arshad Mohammed', 'EED, MJCET, Hyderabad'], ['Gouri R Patil', 'CSED, Hyderabad'], ['Irfan Sadaq', 'MED, MJCET, Hyderabad']] },
  { role: 'Advisory/Steering Committee', people: [
    ['C Krishna Mohan', 'IIT, Hyderabad'], ['Debajyoty Banik', 'Anurag University, Hyderabad'], ['Uma Dulhare', 'IEEE Hyderabad Section'],
    ['Murtuza Rizvi', 'NITTTR, Bhopal'], ['JVR Ravindra', 'IEEE CAS/EDS Society'], ['Ghanshyam Singh', 'NIT Jaipur'],
    ['Mohan Raidu', 'IEEE Computer Society'], ['M Farukh Hashmi', 'NIT, Warangal'], ['Ahmed A Kishk', 'Concordia University, Montreal, Canada'],
    ['Ahad Ali', 'Lawrence Technological University, Michigan, USA'], ['Adekunle Ibrahim Musa', 'Olabisi Onabanjo University, Nigeria'],
    ['M A Raheem', 'ECED, MJCET, Hyderabad'], ['G Krishnamohan', 'JNTU, Hyderabad'], ['Ajay Kumar', 'Bennette University, Greater Noida'],
  ] },
  { role: 'Technical Program Committee', people: [
    ['Fahmina Taranum', 'CSED, MJCET, Hyderabad'], ['Nazia Parveen', 'ECED, MJCET, Hyderabad'], ['Phani R.Katuru', 'Director SAP Consulting, KEA Tech Solutions LLC, Dallas, USA'],
    ['Santhosh Kumar Gugulothu', 'NIT, Andhra Pradesh'], ['Mushtaq Ahmed', 'NIT, Jaipur'], ['Arshia Azam', 'MANUU, Hyderabad'],
    ['Mona Z Saleh', 'Ain Shams University, Egypt'], ['Amandeep Kaur', 'GTBIT, New Delhi'], ['Renu Mishra', 'Sharda University, Greater Noida'],
  ] },
  { role: 'Publicity Committee', people: [
    ['Hashim Ali', 'MED, MJCET, Hyderabad'], ['Iftekharuddin', 'ECED, MJCET, Hyderabad'], ['Sayyada Hajera Begum', 'CSED, Hyderabad'],
    ['P.Yagnasri', 'School of Engineering University of Greenwich, Greenwich, London'], ['Anazida Bt Zinal', 'Universiti Teknologi, Malaysia'], ['Gourav Shrivastava', 'Sage University, Bhopal'],
  ] },
];

export const organizingCommittee = [
  'Dr. Shabbeer Ahmad', 'Mr. Syed Azher Ali', 'Mr. J.E. Muralidhar',
  'Dr. Fahmina Taranum', 'Mr. Mohammed Afroze', 'Mr. P. Sai Krishna',
  'Dr. M. Upendra Kumar', 'Ms. Gadala Suhasini', 'Dr. Arshad Mohammed',
  'Dr. Maniza Hijab', 'Ms. Samatha Konda', 'Dr. Md. Viquar Mohiuddin',
  'Ms. Afreen Sultana', 'Dr. Uma N Dulhare', 'Dr. Ishrat M. Mirzana',
  'Mr. Syed Mohiuddin', 'Dr. Md. Asrar Ahmed', 'Dr. Prasanna Kumar',
  'Mr. Syed Md. Akbar Hashmi', 'Mr. Asad Hussain Syed', 'Dr. K. Hema Latha',
  'Ms. Naimoonisa Begum', 'Mr. Mohammed Abdul Khader', 'Dr. Naseema',
  'Mr. Ahmed', 'Dr. M. Mohd Sabir Hussain', 'Dr. Irfan Sadaq',
  'Ms. Manjusha Kalekuri', 'Dr. Mohammed Abdul Raheem', 'Dr. Syed Khader Basha',
  'Mr. Md. Zainnuddin Naveed', 'Dr. Salma Fouzia', 'Dr. Abdul Raheem Junaidi',
  'Mr. Khaja Zahooruddin Ahmed', 'Mr. Mohd. Muneeruddin', 'Mr. Dharam Singh V',
  'Mr. Mohammed Shabaz Hussain', 'Dr. Nazeerunnisa', 'Dr. Hasham Ali',
  'Ms. Syeda Shaista Naqvi', 'Dr. Afshan Kaleem', 'Dr. Ahmed Abdul Muneem',
  'Ms. Razia Begum', 'Ms. Sucharitha', 'Mr. Khader',
  'Ms. Sumrana Siddiqui', 'Dr. Hakeem Aejaz Aslam', 'Dr. Moinuddin Ahmed',
  'Dr. Gouri R Patil', 'Ms. Shubhangi Saxena', 'Dr. Qamar Sultana',
  'Dr. Rafi U Zaman', 'Dr. Maliha Naaz', 'Mr. V. Narsi Reddy Sagili',
  'Dr. S Fouzia Sayeedunnisa', 'Mr. Sasidhar',
  'Ms. Sayyada Hajera Begum', 'Dr. Md. Haseeb Khan',
];

export const sponsorTiers = [
  { tier: 'Platinum', amount: 'Rs. 5,00,000/-', benefits: ['60 Minutes Tutorial Session', 'Nominate up to two participants', 'Show casing of Products for all two days', 'Company firm logo in certificate', 'Display on conference Website', 'Flyer in Registration Kit', 'Presence during Inaugural session'] },
  { tier: 'Diamond', amount: 'Rs. 2,50,000/-', benefits: ['Nominate up to two participants', 'Show casing of Products for all two days', 'Company firm logo in certificate', 'Flyer in Registration Kit', 'Presence during Inaugural session'] },
  { tier: 'Gold', amount: 'Rs. 1,00,000/-', benefits: ['Nominate up to one participant', 'Show casing of Products for all two days', 'Flyer in Registration Kit', 'Presence during Inaugural session'] },
  { tier: 'Silver', amount: 'Rs. 50,000/-', benefits: ['Show casing of Products for all two days', 'Flyer in Registration Kit', 'Presence during Inaugural session'] },
  { tier: 'Bronze', amount: 'Rs. 25,000/-', benefits: ['Show casing of Products for first day', 'Flyer in Registration Kit', 'Presence during Inaugural session'] },
  { tier: 'Brass', amount: 'Rs. 15,000/-', benefits: ['Flyer in Registration Kit', 'Presence during Inaugural session'] },
];


// Questions are framing only; every answer is quoted or condensed from the source document.
export const faq = [
  { q: 'Who can submit a paper?', a: 'The conference is open for both academicians (researchers, professors, research associates, doctoral students and other members of the student community) and industry delegates. Original Research Papers and Case Studies are invited in the area of Computing, Microelectronics, and Mechatronics.' },
  { q: 'Where will accepted papers be published?', a: 'All accepted and presented papers will be included in the ICCMM-26 Conference Proceedings and submitted to IEEE Conference Quality and Ethics review. The proceedings will be submitted to the IEEE Xplore digital library (Scopus and Google Scholar indexed).' },
  { q: 'How long can my paper be?', a: 'Full papers of 4-6 pages for oral presentation. Pages beyond 6 are charged extra (up to 2 additional pages): 1200/page for Indian authors and $25/page for foreign authors.' },
  { q: 'How are papers reviewed?', a: 'Each paper undergoes peer review by at least three independent referees from the conference review panel, and every submission is checked for plagiarism as per IEEE plagiarism policy.' },
  { q: 'What similarity limits apply to the camera-ready paper?', a: 'Similarity index below 20% excluding references, no more than 4% from any single source, and an AI-generated content score below 20% (only a Turnitin report is acceptable).' },
  { q: 'Do I need to register to present?', a: 'Yes. Only registered delegates are permitted to attend and present, at least one author must register and present the paper, and certificates are issued only to registered participants who attend or present.' },
  { q: 'Where can I find the programme and the keynote speakers?', a: 'The day-by-day schedule is on the Programme & Event Flow page. The keynote speakers are on the Speakers page, and the inaugural guests and session chairs are on the Guests page.' },
];

// Short homepage copy, condensed from the "About the Conference" text above.
export const aboutShort =
  'ICCMM-26 is organised to address emerging challenges and promote intelligent, future-ready solutions. Over two days it unites experts, researchers and innovators from academia, R&D and industry across computing, microelectronics and mechatronics.';

// Portraits supplied with the site assets whose identity is confirmed
// (file name or nameplate) and who appear in the ICCMM-26 committee.
export const portraits = {
  'Syed Ferhathullah Hussainy': 'assets/images/portrait-syed-ferhathullah-hussainy.webp',
  'Mohd. Hamraj': 'assets/images/portrait-mohd-hamraj.webp',
  // From the official MJCET website (mjcollege.ac.in): the Principal page and the department faculty lists.
  // Each was matched by name and department, then cropped to a 256 px square. See docs/committee-photo-sources.md.
  'S. Srinivasa Rao': 'assets/images/committee/s-srinivasa-rao.webp',
  'Tasneem Bano Rehman': 'assets/images/committee/tasneem-bano-rehman.webp',
  'Ayesha Naaz': 'assets/images/committee/ayesha-naaz.webp',
  'G. Sailaja': 'assets/images/committee/g-sailaja.webp',
  'Syed Shabbeer Ahmed': 'assets/images/committee/syed-shabbeer-ahmed.webp',
  'Viquar Mohiuddin': 'assets/images/committee/viquar-mohiuddin.webp',
  'Sabir Hussain': 'assets/images/committee/sabir-hussain.webp',
  'Ishrat Meera Mirzana': 'assets/images/committee/ishrat-meera-mirzana.webp',
  'Maniza Hijab': 'assets/images/committee/maniza-hijab.webp',
  'Nazeerunissa': 'assets/images/committee/nazeerunissa.webp',
  'Arshad Mohammed': 'assets/images/committee/arshad-mohammed.webp',
  'Gouri R Patil': 'assets/images/committee/gouri-r-patil.webp',
  'Irfan Sadaq': 'assets/images/committee/irfan-sadaq.webp',
  'M A Raheem': 'assets/images/committee/m-a-raheem.webp',
  'Fahmina Taranum': 'assets/images/committee/fahmina-taranum.webp',
  'Nazia Parveen': 'assets/images/committee/nazia-parveen.webp',
  'Hashim Ali': 'assets/images/committee/hashim-ali.webp',
  'Iftekharuddin': 'assets/images/committee/iftekharuddin.webp',
  'Sayyada Hajera Begum': 'assets/images/committee/sayyada-hajera-begum.webp',
  'Uma Dulhare': 'assets/images/committee/uma-dulhare.webp',
};

// Committee members who are also published ICCMM-26 guests (same name and institution in both sources).
// Their organiser-supplied guest portrait is reused; see data/guests/image-sources.ts for its source record.
export const committeeGuestIds: Record<string, string> = {
  'Janab Zafar Javeed': 'zafar-javeed',
  'MGPL Narayana': 'mgpl-narayana',
  'Marina Tropmann Frick': 'marina-tropmann-frick',
  'M A Jabbar': 'ma-jabbar',
  'Dr. K. Jaya Sankar': 'k-jaya-sankar',
  'C. Thirmal': 'c-thirmal',
  'Sanju Tiwari': 'sanju-tiwari',
  'Jyoti Singhai': 'jyoti-singhai',
};

export const supporters = [
  { role: 'Technically Sponsored by', name: 'IEEE Hyderabad Section', logo: 'assets/logos/logo-ieee-hyderabad-section.webp', w: 370, h: 128 },
  { role: 'Technically Co-Sponsored by', name: 'SHODHGURU Research Labs', logo: 'assets/logos/logo-shodhguru.webp', w: 640, h: 178, dark: true },
  { role: 'Financially Supported by', name: 'AICTE', logo: 'assets/logos/logo-aicte.webp', w: 316, h: 316 },
  { role: 'Host Institution', name: 'Muffakham Jah College of Engineering and Technology', logo: 'assets/logos/logo-mjcet.webp', w: 900, h: 234 },
];

// IEEE Student Branch photographs supplied with the site assets (past activities at MJCET, not ICCMM-26 sessions).
export const ieeeGallery = [
  { src: 'assets/images/ieee-sb-01', w: 1200, h: 900, alt: 'Students and faculty at an MJCET IEEE Student Branch session, with the MJCET and IEEE Student Branch logos on screen' },
  { src: 'assets/images/ieee-sb-02', w: 1200, h: 914, alt: 'Participants seated and standing for a group photograph in a seminar hall' },
  { src: 'assets/images/ieee-sb-03', w: 1200, h: 595, alt: 'Banner of the IEEE AP-S COPE Workshop organised by IEEE MTT-S MJCET SBC on 11 November 2024, beside a group of participants' },
  { src: 'assets/images/ieee-sb-04', w: 1200, h: 798, alt: 'Group of students and faculty at an outdoor IEEE Student Branch activity' },
  { src: 'assets/images/ieee-sb-05', w: 1200, h: 900, alt: 'Students gathered for a group photograph under a tree during an IEEE activity' },
  { src: 'assets/images/ieee-sb-06', w: 1200, h: 900, alt: 'A presenter addressing students in a computer laboratory session' },
];
