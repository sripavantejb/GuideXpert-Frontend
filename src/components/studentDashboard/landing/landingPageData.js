export const TRUST_STATS = [
  { value: 50000, suffix: '+', label: 'Students Guided', decimals: 0 },
  { value: 500, suffix: '+', label: 'Colleges', decimals: 0 },
  { value: 95, suffix: '%', label: 'Prediction Accuracy', decimals: 0 },
  { value: 10, suffix: '+', label: 'Major Entrance Exams', decimals: 0 },
];

export const STUDENT_OUTCOMES = [
  {
    id: 1,
    rank: 'AIR 12,456',
    exam: 'JEE Main',
    colleges: ['VIT Chennai', 'SRM KTR', 'Amrita CSE'],
    accuracy: 96,
  },
  {
    id: 2,
    rank: 'Rank 8,240',
    exam: 'AP EAMCET',
    colleges: ['JNTU Hyderabad', 'CBIT', 'VNR VJIET'],
    accuracy: 94,
  },
  {
    id: 3,
    rank: 'Percentile 98.2',
    exam: 'JEE Main Percentile',
    colleges: ['NIT Warangal', 'IIIT Hyderabad', 'VNIT Nagpur'],
    accuracy: 97,
  },
  {
    id: 4,
    rank: 'Rank 3,180',
    exam: 'TS EAMCET',
    colleges: ['OU Engineering', 'CVR College', 'MGIT'],
    accuracy: 95,
  },
  {
    id: 5,
    rank: 'Rank 22,100',
    exam: 'KCET',
    colleges: ['RVCE Bangalore', 'BMSCE', 'MS Ramaiah'],
    accuracy: 93,
  },
  {
    id: 6,
    rank: 'NAT Qualified',
    exam: 'NIAT Admission Test',
    colleges: ['NIAT Hyderabad', 'Industry Tech Program', 'Campus Immersion'],
    accuracy: 98,
  },
];

/** Verified campus image URLs (primary + optional fallback) */
const CAMPUS_IMAGES = {
  iitHyd: [
    'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  ],
  iiitHyd: [
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
  ],
  nitW: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  ],
  vit: [
    'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80',
  ],
  bits: [
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
  ],
  srm: [
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  ],
  niat: [
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  ],
};

function imgSet(key, width = 600) {
  return CAMPUS_IMAGES[key].map((url) => url.replace('w=1200', `w=${width}`));
}

export const TRENDING_COLLEGES = [
  {
    id: 'iit-hyd',
    name: 'IIT Hyderabad',
    placement: '₹22 LPA avg package',
    location: 'Hyderabad',
    image: imgSet('iitHyd'),
    to: '/students/college-predictor',
  },
  {
    id: 'iiit-hyd',
    name: 'IIIT Hyderabad',
    placement: '₹28 LPA top offers',
    location: 'Hyderabad',
    image: imgSet('iiitHyd'),
    to: '/students/college-predictor',
  },
  {
    id: 'nit-w',
    name: 'NIT Warangal',
    placement: '₹18 LPA median CTC',
    location: 'Warangal',
    image: imgSet('nitW'),
    to: '/students/college-predictor',
  },
  {
    id: 'vit',
    name: 'VIT Vellore',
    placement: '₹9.8 LPA average',
    location: 'Vellore',
    image: imgSet('vit'),
    to: '/students/college-predictor',
  },
  {
    id: 'bits',
    name: 'BITS Pilani',
    placement: '₹30 LPA+ placements',
    location: 'Pilani',
    image: imgSet('bits'),
    to: '/students/college-predictor',
  },
  {
    id: 'srm',
    name: 'SRM Institute',
    placement: '₹10 LPA average CTC',
    location: 'Chennai',
    image: imgSet('srm'),
    to: '/students/college-predictor',
  },
  {
    id: 'niat',
    name: 'NIAT',
    placement: 'Industry-ready tech programs',
    location: 'Hyderabad',
    image: imgSet('niat'),
    to: '/students/college-predictor',
  },
];

export const CAMPUS_SHOWCASE = [
  {
    id: 'campus-1',
    name: 'IIT Hyderabad Campus',
    image: CAMPUS_IMAGES.iitHyd,
  },
  {
    id: 'campus-2',
    name: 'NIT Warangal',
    image: CAMPUS_IMAGES.nitW,
  },
  {
    id: 'campus-3',
    name: 'VIT Vellore',
    image: CAMPUS_IMAGES.vit,
  },
  {
    id: 'campus-4',
    name: 'BITS Pilani',
    image: CAMPUS_IMAGES.bits,
  },
  {
    id: 'campus-5',
    name: 'IIIT Hyderabad',
    image: CAMPUS_IMAGES.iiitHyd,
  },
  {
    id: 'campus-niat',
    name: 'NIAT Hyderabad',
    image: CAMPUS_IMAGES.niat,
  },
];

export const JOURNEY_STEPS = [
  { id: 'rank', label: 'Enter Rank', description: 'Add marks or rank from any major exam' },
  { id: 'predict', label: 'Predict Colleges', description: 'AI maps cutoffs to your profile' },
  { id: 'compare', label: 'Compare Options', description: 'Evaluate placements, fees & campus life' },
  { id: 'fit', label: 'Find Best Fit', description: 'Run fit tests for course & culture match' },
  { id: 'admit', label: 'Get Admission', description: 'Shortlist with confidence and clarity' },
];

export const COMPARE_PREVIEW = {
  left: { name: 'VIT', short: 'VIT Vellore' },
  right: { name: 'SRM', short: 'SRM KTR' },
  metrics: [
    { label: 'Placements', left: 82, right: 74 },
    { label: 'Fees', left: 45, right: 68 },
    { label: 'Campus', left: 88, right: 79 },
    { label: 'Faculty', left: 76, right: 72 },
    { label: 'Hostels', left: 80, right: 85 },
  ],
};

export const RECRUITER_LOGOS = [
  { name: 'Google', abbr: 'G', color: '#4285F4' },
  { name: 'Microsoft', abbr: 'MS', color: '#00A4EF' },
  { name: 'Amazon', abbr: 'a', color: '#FF9900' },
  { name: 'Adobe', abbr: 'Ad', color: '#FF0000' },
  { name: 'Salesforce', abbr: 'SF', color: '#00A1E0' },
  { name: 'Infosys', abbr: 'In', color: '#007CC3' },
  { name: 'TCS', abbr: 'TCS', color: '#001F8E' },
  { name: 'Accenture', abbr: 'Ac', color: '#A100FF' },
];

export const FIT_TEST_HIGHLIGHTS = [
  { title: 'Interest mapping', description: 'Match subjects and careers to your aptitude profile.' },
  { title: 'Campus culture fit', description: 'Budget, city preference, and lifestyle alignment.' },
  { title: 'AI-powered insights', description: 'Personalized recommendations in under 10 minutes.' },
];

/** Exam accent tokens for rank predictor cards */
export const EXAM_ACCENT_MAP = {
  jeeadvanced: { family: 'JEE', glow: 'group-hover:shadow-blue-500/25', ring: 'ring-blue-500/30', gradient: 'from-blue-500/20 via-blue-500/5', accent: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-300' },
  jeemainmarks: { family: 'JEE', glow: 'group-hover:shadow-blue-500/25', ring: 'ring-blue-500/30', gradient: 'from-blue-500/20 via-blue-500/5', accent: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-300' },
  jeemainpercentile: { family: 'JEE', glow: 'group-hover:shadow-blue-500/25', ring: 'ring-blue-500/30', gradient: 'from-blue-500/20 via-blue-500/5', accent: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-300' },
  apeamcet: { family: 'EAMCET', glow: 'group-hover:shadow-violet-500/25', ring: 'ring-violet-500/30', gradient: 'from-violet-500/20 via-violet-500/5', accent: 'text-violet-400', badge: 'bg-violet-500/15 text-violet-300' },
  tseamcet: { family: 'EAMCET', glow: 'group-hover:shadow-violet-500/25', ring: 'ring-violet-500/30', gradient: 'from-violet-500/20 via-violet-500/5', accent: 'text-violet-400', badge: 'bg-violet-500/15 text-violet-300' },
  kcet: { family: 'KCET', glow: 'group-hover:shadow-emerald-500/25', ring: 'ring-emerald-500/30', gradient: 'from-emerald-500/20 via-emerald-500/5', accent: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300' },
  keam: { family: 'KEAM', glow: 'group-hover:shadow-emerald-500/25', ring: 'ring-emerald-500/30', gradient: 'from-emerald-500/20 via-emerald-500/5', accent: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300' },
  mhcet: { family: 'MHT CET', glow: 'group-hover:shadow-emerald-500/25', ring: 'ring-emerald-500/30', gradient: 'from-emerald-500/20 via-emerald-500/5', accent: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300' },
  tnea: { family: 'TNEA', glow: 'group-hover:shadow-sky-500/25', ring: 'ring-sky-500/30', gradient: 'from-sky-500/20 via-sky-500/5', accent: 'text-sky-400', badge: 'bg-sky-500/15 text-sky-300' },
  wbjee: { family: 'WBJEE', glow: 'group-hover:shadow-amber-500/25', ring: 'ring-amber-500/30', gradient: 'from-amber-500/20 via-amber-500/5', accent: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-300' },
};

export const DEFAULT_EXAM_ACCENT = {
  family: 'Exam',
  glow: 'group-hover:shadow-emerald-500/25',
  ring: 'ring-emerald-500/30',
  gradient: 'from-emerald-500/20 via-emerald-500/5',
  accent: 'text-emerald-400',
  badge: 'bg-emerald-500/15 text-emerald-300',
};

export function getExamAccent(examId) {
  return EXAM_ACCENT_MAP[examId] || DEFAULT_EXAM_ACCENT;
}
