// Conference schedule, Day 1 and Day 2.
// Source: "Conference Schedule for Day1&2-29th Oct.docx" (issued by the organisers, 29 October 2026);
// technical sessions (times, rooms, chairs, in-charges, papers) from "All Track Schedule ICCMM-26.pdf" (November 2026).
// Times, titles and names are as printed. Three people listed in the schedule are marked "NO" in the later
// Guest Info document (Joginder Tanikella, Sreenivas Jasti, Bala Prasad Peddigari); they are left out here
// and the affected slots say that further names are to be confirmed. See docs/content-verification.md.

export type ItemKind = 'registration' | 'ceremony' | 'keynote' | 'technical' | 'break' | 'panel' | 'social';

export type Person = { name: string; detail?: string; role?: string; guest?: string };

/** One paper presentation slot */
export type Paper = { start: string; end: string; id: number; title: string; authors: string };

export type Lane = {
  title: string;
  /** Research track of the session, e.g. "Track 1 · Next Gen". Used only on the Tracks page;
      the programme and event flow deliberately do not show track labels. */
  track?: string;
  online?: boolean;
  room?: string;
  /** Session in-charge (organising faculty member) */
  incharge?: string;
  chair?: Person;
  coChair?: Person;
  people?: Person[];
  papers?: Paper[];
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
const VCE = 'Vardhaman College of Engineering';

/* Paper slots from "All Track Schedule ICCMM-26.pdf" (organisers, November 2026): consecutive 15-minute
   slots from the session start (12 min presentation + 3 min Q&A). Titles and authors as printed. */
const papers = (start: string, list: [number, string, string][]): Paper[] => {
  const [h, m] = start.split(':').map(Number);
  const at = (n: number) => { const t = h * 60 + m + n * 15; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
  return list.map(([id, title, authors], i) => ({ start: at(i), end: at(i + 1), id, title, authors }));
};

const POSTER: Lane = {
  title: 'Poster Presentation', track: 'Special Poster Session',
  people: [
    { name: 'Dr Marina Tropmann-Frick', detail: 'Hamburg University of Applied Sciences, Germany', guest: 'marina-tropmann-frick' },
    { name: 'Ishrat Meera Mirzana', detail: MJCET },
    { name: 'Dr. Arshad Mohammed' },
  ],
};

export const paperGuideline = 'Each paper has a 15-minute slot: 12 minutes of presentation and 3 minutes of questions. Slides should focus on the major contribution.';

export const schedule: Day[] = [
  {
    id: 'day-1', label: 'Day 01', date: '20 November 2026', iso: '2026-11-20',
    items: [
      { id: 'd1-registration', start: '09:30', end: '10:30', title: 'Registration', kind: 'registration' },
      {
        id: 'd1-inaugural', start: '10:30', end: '11:30', title: 'Inaugural Session', kind: 'ceremony',
        summary: 'Opening of ICCMM-26 with the guests of honour, special guest and distinguished guests.',
        people: [
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
        id: 'd1-track-1', start: '14:00', end: '15:30', title: 'Technical Session', kind: 'technical',
        lanes: [
          {
            title: 'Session 1', track: 'Track 1 · Next Gen', room: 'Room 1106, Block 1', incharge: 'Mrs Naimoonisa Begum',
            chair: { name: 'Dr. R. Sridevi', detail: 'JNTUH', guest: 'sridevi' }, coChair: { name: 'Dr. Maniza Hijab', detail: MJCET },
            papers: papers('14:00', [
              [13, 'Design and Implementation of a Decentralized Exchange (DEX) for Token Swapping on Ethereum', 'Pavankumar Patil'],
              [144, 'Explainable Trust-Adaptive Human-in-the-Loop Framework for Industrial Automation Systems', 'Daraqshan Fatima; Shifa Chishti; Ommi Zainab Alquaiti; Mohammad Pasha; Mohd Umar Farooq; Zareen Begum'],
              [163, 'Fine-tuned Feature Enhancement & Extraction EfficientNetB5 with a Deep Classification Head (FFEE-EffNet-DeepHead) Hybrid Model for Emotion Detection', 'Arhan Agarwal; Saira B. Shaik; Ayush Goyal; Sanju Tiwari; Emmanuel Umoh'],
              [186, 'Text-Based Emotion Detection Using RoBERTa: A Comparative Study', 'Husna Mehween; Sayyada Mubeen'],
              [255, 'Fairness Under Distribution Shift: An Empirical Cross-Model Analysis on Tabular Benchmarks', 'Mohammed Abdul Rafe Sajid; Mukassir Ahmed Farooqui'],
              [260, 'Carbon-Intelligent WWPA-DRL: Achieving Net-Zero Cloud Operations Through Multi-Objective Sustainable Scheduling', 'Saleha Farha; Kummari Venkatesh; J Madhavan'],
            ]),
          },
        ],
      },
      {
        id: 'd1-track-3', start: '15:30', end: '17:00', title: 'Technical Sessions', kind: 'technical',
        lanes: [
          {
            title: 'Session 2', track: 'Track 1 · Next Gen', room: 'Conference Room, Block 5', incharge: 'Mrs Rana Ambareen',
            chair: { name: 'Dr. Y. Vijayalatha Reddy', detail: VCE, guest: 'vijay-latha' }, coChair: { name: 'Dr. Uma N. Dulhare', detail: MJCET },
            papers: papers('15:30', [
              [271, 'Leveraging AI for Personalized Learning to Improve Educational Outcomes in Underserved Schools', 'D R. Shri Varshini'],
              [315, 'SkillRadar: A Unified AI-Driven Career Command Center for Predictive Skill Gap Analysis and Semantic Interview Simulation', 'Pallavi Lanke; Asrith Sai Lakshmipatruni; Pavani Durga Loya; Chaitanya Sai Sindhu Koki; Rahul Kotagiri'],
              [379, 'An Integrated AI Framework for Emergency Department Decision Support: Simulation, Counterfactuals, and Reinforcement Learning', 'Mohammad Pasha; Nuha Mushtaq; Tabassum Fathima; Zareen Begum; Mohd Umar Farooq; Nazia Tabassum'],
              [393, 'Beyond Retrieval: Execution Intelligence for Hierarchical Agentic Retrieval', 'Mohammed Moid; Syed Liyaqat Ahmed Ali; Syeda Fayeqa Nabeel'],
              [396, 'PoisonGuard: Cross-Learning Based Detection of Data Poisoning Attacks in Distributed Machine Learning Systems', 'Mohammed Hussain Abid Khan; Mohammad Sanaullah Qaseem; Mohammed Abdul Rawoof; Anam Shaik; Sarah Ali'],
              [404, 'IncidentMind: A Retrieval-Augmented Architecture for What-If Recovery Decision Support in Incident Management for IoMT-Enabled Healthcare Systems Using Deep Learning', 'Sowjanya P; Rahil Ahmed'],
            ]),
          },
          {
            title: 'Session 3', track: 'Track 3 · Mechatronics', room: 'Room 1107, Block 1', incharge: 'Dr Bharath Kumar Talluri',
            chair: { name: 'Dr. C. Thirmal', detail: 'VNR VJIT', guest: 'c-thirmal' }, coChair: { name: 'Dr. Viquar Mohiuddin', detail: MJCET },
            papers: papers('15:30', [
              [212, 'Optimization of Surface Roughness in BEMRF of Ti6Al4V Alloy Using RSM and Machine Learning', 'Fadia Naji'],
              [267, 'Thermal Stability and Flammability Behavior of Composite Materials Using TGA and Flammability Tests', 'Aravind K'],
              [320, 'Smart Electric Vehicle Battery Charging Through Photovoltaic Technique For Home Energy Management System', 'Dr. Hari Naidu; Vaishnavi Khedkar'],
              [506, 'Experimental and Explicit-Dynamic Crashworthiness of a Honeycomb Structured Automotive Front Car Bumper', 'Suvarna Kumar Veernau; Md Viquar Mohiuddin; Mohammed Ameer Ali'],
              [507, 'An Assessment of Glass Fiber Reinforced Composite Open Pressure Vessel using Simulation and ANOVA', 'Dharam Singh; Aneesa Firdos; Khaja Azher Ali Siddiqui; Venkata Narsireddy'],
            ]),
          },
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
        summary: 'Four paper sessions, one of them online, in parallel with the poster presentation.',
        lanes: [
          {
            title: 'Session 4', track: 'Track 1 · Next Gen', room: 'Room 1107, Block 1', incharge: 'Mrs Sumrana Siddiqui',
            chair: { name: 'Dr. M. A. Jabbar', detail: VCE, guest: 'ma-jabbar' }, coChair: { name: 'Dr. Fahmina Taranum', detail: MJCET },
            papers: papers('10:15', [
              [444, 'Cognitive Edge-Cloud Security: A Resource-Aware IDS For IoT', 'Mohammad Pasha; Reifa Zain; Nazia Tabassum; Khaleel Ur Rahman Khan; Mariyam Malik; Mohd Umar Farooq'],
              [445, 'Supply Chain & Material Passport Tracking: An Optimized Framework using Merkle-AVL (M-AVL) Tree Architecture', 'Mohammad Pasha; Khair Unnisa; Nazia Tabassum; Mohammed Sirajuddin; Safia Khanam; Mohd Umar Farooq'],
              [446, 'DT-FedStorm: A Digital Twin-Assisted Federated Reinforcement Learning Framework for Proactive Broadcast Storm Prevention in High-Density VANETs', 'Mohammad Pasha; Syeda Umaima Amatul Mateen; Mohd Umar Farooq; Nazia Tabassum'],
              [449, 'GNN-StormShield: Graph Attention Network and Blockchain-Based Trust Scoring for Adversarial Broadcast Storm Suppression in Vehicular Ad Hoc Networks', 'Mohammad Pasha; Syeda Aashna Fathima; Mohd Umar Farooq'],
              [468, 'A Comparative Analysis of Indirect Prompt Injection Vulnerabilities in Commercial Large Language Model Agents', 'Alisha Ahmed'],
              [512, 'Edge-Based Smart Intravenous Infusion Monitoring System Using ESP32-CAM, TFMini-S LiDAR, and Servo-Assisted Flow Control', 'Syed Shah Omer Hussaini'],
            ]),
          },
          {
            title: 'Session 5', track: 'Track 2 · Microelectronics', room: 'Room 1106, Block 1', incharge: 'Dr Salma Fauzia',
            chair: { name: 'Dr. K. Jaya Sankar', detail: 'Methodist College of Engineering and Technology', guest: 'k-jaya-sankar' }, coChair: { name: 'Dr. Nazia Parveen', detail: MJCET },
            papers: papers('10:15', [
              [136, 'Design and implementation of 16 bit single cycle MIPS processor', 'RPVG Ashok Reddy; Thilak Sirisani; Siddavatham Vishnu Vardhan; Shaik Ayesha; Nagiripati Munendra; Shaik Ghouse Lazam'],
              [218, 'Design and Analysis of a Threshold Inverter Quantization Comparator in 90 nm CMOS Technology', 'Chandrasekhar E; Talpa Sai Sri Charan Puvvula; Devi Keerthana Peruri; Shanthan T'],
              [230, 'Smart and Secure Mutual Authentication Protocol for Low-Power IoT Devices', 'Madhurya Lingam; Varun Dyapa; Mani Charan Reddy Vavilla sai; Phani Vidyadhar R'],
              [237, 'Implementation of Enhanced 4-BIT ALU Using BNN Employing VTEAM for Advanced AI/ML Processing', 'MD Noorullah Khan; E Srinivas; Sami Ahmed; Mohd Rafeh Alaf Khan; Bushra Fatima Masih'],
              [287, 'A Hybrid Attention-Based Multi-Scale Edge U-Net for Robust Road Extraction from Satellite Images', 'Dr. Dasari Subhashini'],
              [374, 'UAV-Based Multi-Sensor Integrated Survivor Detection System for Post-Disaster Search and Rescue Operations', 'Shirisha Palnati'],
            ]),
          },
          {
            title: 'Session 6', online: true, incharge: 'Mrs Rubeena Rab',
            chair: { name: 'Dr Salman Abdul Moiz', detail: 'UoH', guest: 'moiz-m' }, coChair: { name: 'Dr. Gouri R Patil', detail: MJCET },
            papers: papers('10:15', [
              [138, 'Design and Development of a Charge Pump for a Full-Custom Phase-Locked Loop for Bluetooth Applications using SCL180nm Technology', 'Chinthareddy Satvika; Nagateja Adulapuram; Mohd. Z. Jahangir; Ponnala Srinidhi Reddy'],
              [199, 'Benchmarking Primality Testing Algorithms: A Bibliometric and Computational Study', 'Vandna Paul'],
              [353, 'An Explainable TabTransformer Framework for Medical Device Risk Assessment Using FDA Regulatory Records', 'Sandeep Deshmukh'],
              [452, 'Deep Hybrid Learning for Sentiment Analysis of Text Reviews', 'Shubhangi Saxena; Mohammed Nadeem; Tabrez Ali Khan; Mohammed Talha'],
            ]),
          },
          {
            title: 'Session 7', track: 'Track 4 · Applied Computational', room: 'Conference Room, Block 5', incharge: 'Mrs Razia Begum',
            chair: { name: 'Dr. Sanju Tiwari', detail: 'Sharda University, Noida', guest: 'sanju-tiwari' }, coChair: { name: 'Dr. Asrar Ahmed', detail: MJCET },
            papers: papers('10:15', [
              [436, 'Uncertainty-Aware Explainable CNN for Brain Tumor Classification Using ResNet50, Grad-CAM, and Monte Carlo Dropout', 'Mohammad Pasha; Sabina Amreen; Mohd Umar Farooq; Nazia Tabassum; Safia Khanam; Syeda Raziuddin'],
              [448, 'Explainable AI-Based Multimodal Interview Assessment Using LPU-Accelerated SemanticAcoustic Fusion', 'Mohammad Pasha; Rahath Sufiya; Nasir Ahmed; Mahabubul Haq Atif'],
              [491, 'Deep Learning Methods for Traffic Violation Detection: A Review for Smart Road Safety Solutions', 'Shubhangi Saxena; Mohammed Nadeem; Tabrez Ali Khan; Mohammed Talha'],
              [493, 'Applied Computational Intelligence for Next-Generation Smart Infrastructure: A Comprehensive Review of AI, Digital Twins, Edge Intelligence, and Autonomous Self-Healing Systems', 'Mohammed Abbu Bakar; Ayesha Fatima'],
              [500, 'Toward Earlier Referral: Sequential Risk-Trajectory Modeling for ASHA Collected Antenatal Care Data in Low-Resource Settings', 'Aayaan Shahwaiz Shaik Mohammed; Afiya Fatima; Vijayalata Y'],
              [503, 'Non functional requirements trade-offs and conflicts in software engineering: a systematic review of multi objective optimization approaches and decision making frameworks', 'Purvi Sankhe; Minakshi Ghorpade; Monisha Linkesh; Pratibha Prasad'],
            ]),
          },
          POSTER,
        ],
      },
      { id: 'd2-tea', start: '11:45', end: '12:00', title: 'Tea Break', kind: 'break' },
      {
        id: 'd2-parallel-b', start: '12:00', end: '13:30', title: 'Parallel technical sessions', kind: 'technical',
        summary: 'Second block of parallel paper sessions, alongside the poster presentation.',
        lanes: [
          {
            title: 'Session 8', track: 'Track 4 · Applied Computational', room: 'Room 1107, Block 1', incharge: 'Ms. Syeda Shaista Naqvi',
            chair: { name: 'Dr. Sanju Tiwari', detail: 'Sharda University, Noida', guest: 'sanju-tiwari' }, coChair: { name: 'Dr. Syed Shabbeer Ahmad', detail: MJCET },
            papers: papers('12:00', [
              [82, 'LegalBuddy: A Retrieval-augmented Multilingual AI Framework for Civil Law Document Understanding', 'RPVG Ashok Reddy; Thilak Sirisani; Siddavatham Vishnu Vardhan; Shaik Ayesha; Nagiripati Munendra; Shaik Ghouse Lazam'],
              [238, 'FYP: A Location-Based Local Product Discovery Platform for Enhancing Local Vendor Connectivity', 'Dr. Harpreet Kaur; MD Adeeb; Ankur Sharma; Naveen Chadda; Ankita Chadda'],
              [258, 'Adaptive Multi-Objective Optimization for Engineering Management Systems: A Hybrid Lyapunov–Pareto Framework With Observer-Based Disturbance Compensation and Risk-Constrained Resource Allocation', 'Manish Gupta'],
              [283, 'Novel Fuzzy mRMR–Guided Binary Rain Optimizer for Accurate Cancer Prediction', 'Bibhuprasad Sahu; Swagattika Dalai; Abhaya Kumar Panda; Amrutanshu Panigrahi; Abhilash Pati; P.V. Vinitha'],
              [295, 'NeuroSearch: A Neuro-Symbolic Clinical Decision Support System via Hybrid Retrieval-Augmented Generation for Mitigating Medical AI Hallucinations', 'Karthik Jeyapal; Narasimhan Dasarathy'],
              [314, 'Ancient Tamil Inscription Recognition Using a Hybrid CNN–Transformer Deep Learning Framework', 'Omana J'],
            ]),
          },
          {
            title: 'Session 9', track: 'Track 2 · Microelectronics', room: 'Conference Room, Block 5', incharge: 'Dr Maliha Naaz',
            chair: { name: 'Dr. Jyoti Singhai', detail: 'NIT, Bhopal', guest: 'jyoti-singhai' }, coChair: { name: 'Dr. M. Mohd. Sabir Hussain', detail: MJCET },
            papers: papers('12:00', [
              [391, 'Approximate 4:2 Compressors for Energy-Efficient Edge-AI Multipliers on the Zynq-7000 FPGA', 'Kazi Nikhat Parvin Murtujaali'],
              [392, 'Energy-Efficient AES-256 Architecture for Secure Communication in Low-Power IoT and Embedded Systems', 'Dr. Vandana; M Nithin; J Yamani; K Nandini; V Harigopal'],
              [411, 'Design of a High-Throughput Parallel Compute-In-Memory Architecture for Multi-Bitwise Operations with Popcount-Based Similarity Detection', 'Chevula Sivamani; Dharmini Vikas; Byagari Panav Paartha; Rajendar Sandiri'],
              [422, 'Harris Hawks Optimization-Based 2-D FIR Filter with CSD/CSE Multipliers for Efficient VLSI Design', 'Venkata Krishna Odugu; Harish Gade; Anirudh Reddy R; Merina Jaladi; Bapuji Banothu'],
              [504, 'A Review of Ultra-Low-Jitter Phase Locked Loop Architectures for RF, mmWave, and 5G Systems', 'Subhanvali Shaik; G.M Anitha Priyadarshini; S Thulsi Prasad'],
              [527, 'A Compact 2-Bit Reconfigurable Intelligent Surface with Phase Control for Ka-Band Wireless Communications', 'Shaik Asrar Ulhaq; Mohammed Abdul Raheem Khan; Mohammed Khaja Uddin Ahmed; Mohammed Abdul Haseeb; Nazeerunnisa Qureshey'],
            ]),
          },
          POSTER,
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

/** Details the schedule does not yet give (open items for the organisers; no longer shown on the site) */
export const scheduleGaps = [
  'Keynote and panel discussion titles',
  'Track for the online Session 6',
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
