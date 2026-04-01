/** Mock data and deterministic helpers for Student Intelligence Dashboard (demo only). */

export const EXAM_OPTIONS = [
  { id: 'jee-main', label: 'JEE Main', scale: 1.0 },
  { id: 'jee-adv', label: 'JEE Advanced', scale: 0.85 },
  { id: 'bitsat', label: 'BITSAT', scale: 1.1 },
  { id: 'mhtcet', label: 'MHT-CET', scale: 1.25 },
  { id: 'kcet', label: 'KCET', scale: 1.2 },
];

export const STATES = [
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Telangana',
  'Delhi NCR',
  'West Bengal',
];

export const CATEGORIES = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS'];

export const COLLEGE_NAMES = [
  'VIT',
  'SRM Institute',
  'MIT Manipal',
  'BITS Pilani',
  'IIIT Hyderabad',
  'NIT Trichy',
  'RV College',
  'PES University',
];

/** Branches per college for branch predictor & college cards */
export const BRANCHES_BY_COLLEGE = {
  VIT: ['CSE', 'AI & ML', 'Data Science', 'Electronics', 'Mechanical'],
  'SRM Institute': ['CSE', 'AI & ML', 'Data Science', 'Electronics'],
  'MIT Manipal': ['CSE', 'IT', 'Electronics', 'Mechanical'],
  'BITS Pilani': ['CSE', 'ECE', 'EEE', 'M.Sc Economics'],
  'IIIT Hyderabad': ['CSE', 'CSD', 'ECD', 'AI'],
  'NIT Trichy': ['CSE', 'ECE', 'EEE', 'Mechanical'],
  'RV College': ['CSE', 'ISE', 'AIDS', 'ECE'],
  'PES University': ['CSE', 'ECE', 'EEE', 'Biotech'],
};

/** Comparison table stats (mock) */
export const COMPARISON_STATS = {
  VIT: {
    avgPackage: '12.5 LPA',
    fees: '₹9.5L / yr',
    placementPct: '92%',
    ranking: 'NIRF ~15 (private)',
    campusSize: 'Large (372 ac)',
  },
  'SRM Institute': {
    avgPackage: '9.2 LPA',
    fees: '₹8.0L / yr',
    placementPct: '88%',
    ranking: 'NIRF ~35',
    campusSize: 'Large',
  },
  'MIT Manipal': {
    avgPackage: '11.0 LPA',
    fees: '₹9.0L / yr',
    placementPct: '90%',
    ranking: 'NIRF ~25',
    campusSize: 'Large',
  },
  'BITS Pilani': {
    avgPackage: '18.5 LPA',
    fees: '₹9.5L / yr',
    placementPct: '98%',
    ranking: 'Top tier',
    campusSize: 'Large',
  },
  'IIIT Hyderabad': {
    avgPackage: '22.0 LPA',
    fees: '₹8.5L / yr',
    placementPct: '99%',
    ranking: 'Top IIIT',
    campusSize: 'Medium',
  },
  'NIT Trichy': {
    avgPackage: '16.0 LPA',
    fees: '₹2.5L / yr',
    placementPct: '95%',
    ranking: 'NIT Top 3',
    campusSize: 'Large',
  },
  'RV College': {
    avgPackage: '10.5 LPA',
    fees: '₹6.0L / yr',
    placementPct: '85%',
    ranking: 'State tier-1',
    campusSize: 'Medium',
  },
  'PES University': {
    avgPackage: '9.8 LPA',
    fees: '₹7.5L / yr',
    placementPct: '87%',
    ranking: 'NIRF ~50',
    campusSize: 'Medium',
  },
};

/** College fit: mock entries with city, campus, placement band */
export const COLLEGE_FIT_ENTRIES = [
  {
    name: 'VIT',
    city: 'Vellore',
    state: 'Tamil Nadu',
    budgetBand: 'high',
    campusSize: 'large',
    placementBand: 'high',
    fees: '₹9.5L/yr',
    placement: '92% placed',
  },
  {
    name: 'RV College',
    city: 'Bengaluru',
    state: 'Karnataka',
    budgetBand: 'medium',
    campusSize: 'medium',
    placementBand: 'high',
    fees: '₹6.0L/yr',
    placement: '85% placed',
  },
  {
    name: 'NIT Trichy',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    budgetBand: 'low',
    campusSize: 'large',
    placementBand: 'high',
    fees: '₹2.5L/yr',
    placement: '95% placed',
  },
  {
    name: 'IIIT Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    budgetBand: 'high',
    campusSize: 'medium',
    placementBand: 'high',
    fees: '₹8.5L/yr',
    placement: '99% placed',
  },
  {
    name: 'SRM Institute',
    city: 'Chennai',
    state: 'Tamil Nadu',
    budgetBand: 'high',
    campusSize: 'large',
    placementBand: 'medium',
    fees: '₹8.0L/yr',
    placement: '88% placed',
  },
  {
    name: 'PES University',
    city: 'Bengaluru',
    state: 'Karnataka',
    budgetBand: 'medium',
    campusSize: 'medium',
    placementBand: 'medium',
    fees: '₹7.5L/yr',
    placement: '87% placed',
  },
];

export const COURSE_FIT_QUESTIONS = [
  {
    id: 'q1',
    text: 'Do you enjoy mathematics?',
    options: [
      { value: 2, label: 'Love it' },
      { value: 1, label: 'Somewhat' },
      { value: 0, label: 'Not really' },
    ],
  },
  {
    id: 'q2',
    text: 'Do you enjoy building software?',
    options: [
      { value: 2, label: 'Yes' },
      { value: 1, label: 'Somewhat' },
      { value: 0, label: 'No' },
    ],
  },
  {
    id: 'q3',
    text: 'Do you prefer creativity or logic?',
    options: [
      { value: 0, label: 'Creativity' },
      { value: 1, label: 'Balanced' },
      { value: 2, label: 'Logic' },
    ],
  },
];

const COURSE_WEIGHTS = {
  'Computer Science': (s) => s.q2 * 2 + s.q3 * 2 + s.q1,
  'Data Science': (s) => s.q1 * 2 + s.q2 * 2 + s.q3,
  'Product Design': (s) => (2 - s.q3) * 2 + s.q2 + (2 - s.q1),
};

/**
 * Mock rank + percentile from marks (0–300 typical) and exam scale.
 */
export function mockRankFromMarks(marks, examId) {
  const exam = EXAM_OPTIONS.find((e) => e.id === examId) || EXAM_OPTIONS[0];
  const m = Math.max(0, Math.min(300, Number(marks) || 0));
  const scaled = m * exam.scale;
  const predictedRank = Math.max(1, Math.round(1500000 / (scaled + 12)));
  const percentile = Math.min(99.9, Math.max(40, 100 - predictedRank / 20000));
  return {
    predictedRank,
    percentile: Number(percentile.toFixed(1)),
  };
}

/** Hero mock stats (static demo): rank/percentile from rank flow; preferencesComplete illustrates course + college fit readiness */
export const HERO_MOCK_STATS = {
  predictedRank: 12430,
  percentile: 96.2,
  preferencesComplete: 80,
};

function hashChance(rank, category, state) {
  let h = 0;
  const s = `${rank}|${category}|${state}`;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h) % 3;
}

export function mockCollegesForRank(rank, category, state) {
  const r = Number(rank) || 50000;
  return COLLEGE_NAMES.slice(0, 5).map((name) => {
    const branches = BRANCHES_BY_COLLEGE[name] || ['CSE'];
    const slice = r < 15000 ? 3 : r < 50000 ? 2 : 1;
    const possibleBranches = branches.slice(0, slice);
    const ch = hashChance(r, category, String(state) + name);
    const chance = ch === 0 ? 'High' : ch === 1 ? 'Medium' : 'Low';
    return { name, possibleBranches, chance };
  });
}

export function branchesForCollege(collegeName) {
  return BRANCHES_BY_COLLEGE[collegeName] || ['CSE', 'AI & ML', 'Data Science', 'Electronics'];
}

export function scoreCourseFit(answers) {
  const scores = {
    q1: answers.q1 ?? 0,
    q2: answers.q2 ?? 0,
    q3: answers.q3 ?? 0,
  };
  const ranked = Object.entries(COURSE_WEIGHTS)
    .map(([course, fn]) => ({ course, score: fn(scores) }))
    .sort((a, b) => b.score - a.score);
  return ranked.slice(0, 3).map((x) => x.course);
}

export function filterCollegeFit({ budget, cityPreference, campusSize, placementPriority }) {
  const budgetMap = { low: 'low', medium: 'medium', high: 'high' };
  const want = budgetMap[budget] || 'medium';
  const cityMatch = (c) =>
    !cityPreference || c.state === cityPreference || c.city === cityPreference;
  const campusMatch = (c) => !campusSize || c.campusSize === campusSize;
  let list = COLLEGE_FIT_ENTRIES.filter(cityMatch).filter(campusMatch);
  list = list.filter((c) => {
    if (want === 'low') return c.budgetBand === 'low' || c.budgetBand === 'medium';
    if (want === 'high') return true;
    return c.budgetBand === 'medium' || c.budgetBand === 'low';
  });
  if (placementPriority === 'high') {
    list = [...list].sort(
      (a, b) => (b.placementBand === 'high' ? 1 : 0) - (a.placementBand === 'high' ? 1 : 0),
    );
  }
  if (list.length === 0) {
    list = COLLEGE_FIT_ENTRIES.slice(0, 4);
  }
  return list.slice(0, 4);
}
