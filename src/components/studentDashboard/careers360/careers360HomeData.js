import { getRankPredictorExams } from '../../../utils/rankPredictor';
import { ADMISSION_PREDICTOR_TOOLS, FIT_TEST_TOOLS, COMPARE_TOOLS } from '../../../constants/studentWorkspaceTools';
import { TRENDING_COLLEGES } from '../landing/landingPageData';
import { WORKSPACE_IMAGES } from './studentWorkspaceImages';

export const HOME_TAGLINE = 'Empowering Students Building Futures';
export const HOME_SUBTITLE =
  'Rank predictors, college shortlists, and fit tests — one workspace for Indian entrance exams.';

export const POPULAR_PREDICTORS = [
  { label: 'JEE Main College Predictor', to: '/students/college-predictor', popular: true },
  { label: 'NEET College Predictor', to: '/students/college-predictor', popular: true },
  { label: 'JEE Main Rank Predictor', to: '/students/rank-predictor/jeemainmarks', popular: false },
  { label: 'AP EAMCET Rank', to: '/students/rank-predictor/apeamcet', popular: false },
];

export const HOME_BANNERS = [
  {
    id: 'rank',
    title: 'Turn marks into an estimated rank',
    subtitle: 'JEE, EAMCET, KCET, MHT CET and more on GuideXpert',
    to: '/students/rank-predictor',
    image: WORKSPACE_IMAGES.bannerRank,
  },
  {
    id: 'college',
    title: 'Shortlist colleges around your rank',
    subtitle: 'Cutoff-aware lists with category and preference filters',
    to: '/students/college-predictor',
    image: WORKSPACE_IMAGES.bannerCollege,
  },
  {
    id: 'niat',
    title: 'Discover NIAT and partner institutes',
    subtitle: 'Tech-focused pathways with industry-aligned programs',
    to: '/students/college-predictor',
    image: WORKSPACE_IMAGES.bannerNiat,
  },
];

/** Right-side hero feature carousel cards */
export const HERO_FEATURE_SLIDES = [
  {
    id: 'college-opportunities',
    title: 'Turn Your Score into College Opportunities',
    description:
      'Predict your admission chances across colleges based on exam performance, category, and preferences.',
    cta: 'Explore College Predictors',
    to: '/students/college-predictor',
    accent: 'from-[#1e3a5f] via-[#2d1b4e] to-[#3b1868]',
    badge: 'Verified Data',
    widget: 'Cutoff Trend',
  },
  {
    id: 'rank-clarity',
    title: 'Know Your Rank Before the Result',
    description:
      'Estimate ranks from marks using historical data across JEE Main, EAMCET, KCET, and more.',
    cta: 'Open Rank Predictors',
    to: '/students/rank-predictor',
    accent: 'from-[#0f2847] via-[#1a3a5c] to-[#243b6b]',
    badge: 'Live Models',
    widget: 'Rank Range',
  },
  {
    id: 'fit-path',
    title: 'Find Courses That Match You',
    description:
      'Run fit tests to map interests and strengths to engineering, science, and campus options.',
    cta: 'Try Fit Tests',
    to: '/students/tests',
    accent: 'from-[#1a2744] via-[#2a1f4d] to-[#4a1d6a]',
    badge: 'Personalized',
    widget: 'Fit Score',
  },
];

export const WORKSPACE_UPDATES = [
  {
    id: 1,
    tag: 'Updated',
    title: 'JEE Main rank model refreshed for the latest session trends',
    date: 'Jun 2026',
    to: '/students/rank-predictor/jeemainmarks',
    image: WORKSPACE_IMAGES.updateJee,
    imageId: 'update-jee',
  },
  {
    id: 2,
    tag: 'New data',
    title: 'AP & TS EAMCET cutoff sets added for 2026 shortlisting',
    date: 'Jun 2026',
    to: '/students/rank-predictor/apeamcet',
    image: WORKSPACE_IMAGES.updateEamcet,
    imageId: 'update-eamcet',
  },
  {
    id: 3,
    title: 'Compare up to four colleges on fees, placements, and campus',
    date: 'May 2026',
    to: '/students/college-comparison',
    image: WORKSPACE_IMAGES.updateCompare,
    imageId: 'update-compare',
  },
  {
    id: 4,
    title: 'Course fit test — map interests to engineering and science tracks',
    date: 'May 2026',
    to: '/students/course-fit-test',
    image: WORKSPACE_IMAGES.updateFitCourse,
    imageId: 'update-fit',
  },
  {
    id: 5,
    tag: 'Partner',
    title: 'NIAT programs now discoverable in the college predictor',
    date: 'Apr 2026',
    to: '/students/college-predictor',
    image: WORKSPACE_IMAGES.updateNiat,
    imageId: 'update-niat',
  },
];

export const DATA_STATS = [
  { value: '50,000+', label: 'Students on platform' },
  { value: '500+', label: 'Colleges indexed' },
  { value: '40k+', label: 'Cutoff data points' },
  { value: '10+', label: 'Exams supported' },
];

export const SECTION_COPY = {
  updates: {
    title: 'Workspace updates',
    subtitle: 'New predictors, data refreshes, and tools on GuideXpert',
  },
  guidance: {
    title: 'Guidance & discovery',
    description:
      'Start with short assessments when you are unsure about course or campus fit — then move to predictors with a clearer profile.',
  },
  data: {
    title: 'Colleges & cutoffs',
    description:
      'Explore institutes and entrance exams available in your workspace. Use these as starting points before running a predictor.',
  },
  predictors: {
    title: 'Tools that turn scores into decisions',
    description:
      'Each predictor answers a different admissions question—rank first, then colleges and branches—so you move from uncertainty to a clear plan.',
  },
  moreTools: {
    title: 'Alongside your predictions',
    description: 'Compare colleges, track deadlines, and run fit tests when you need more than a shortlist.',
  },
  outcomes: {
    title: 'Student outcomes',
    description: 'Examples of how GuideXpert predictions lined up with final admission choices.',
  },
  helpCta: {
    title: 'Not sure where to begin?',
    description: 'Take a fit test to narrow your options, or open the predictor hub for your exam.',
    cta: 'Open tool hub',
  },
};

export function getTopExamLinks() {
  return getRankPredictorExams().map((exam) => ({
    label: exam.name,
    to: `/students/rank-predictor/${exam.id}`,
  }));
}

export const TOP_COLLEGE_LINKS = TRENDING_COLLEGES.map((c) => ({
  label: c.name,
  to: c.to,
}));

export function getCollegePredictorLinks() {
  return [
    ...ADMISSION_PREDICTOR_TOOLS.map((t) => ({ label: t.title, to: t.to })),
    { label: 'College comparison', to: '/students/college-comparison' },
  ];
}

export function getRankPredictorLinks() {
  return getRankPredictorExams().map((exam) => ({
    label: `${exam.name} rank`,
    to: `/students/rank-predictor/${exam.id}`,
  }));
}

export const OTHER_PRODUCTS = [
  {
    id: 'compare',
    title: 'College compare',
    description: 'Fees, placements, and campus metrics side by side.',
    to: '/students/college-comparison',
    icon: 'compare',
  },
  {
    id: 'fit-course',
    title: 'Course fit test',
    description: 'Match programs to aptitude and interests.',
    to: '/students/course-fit-test',
    icon: 'fit',
  },
  {
    id: 'fit-college',
    title: 'College fit test',
    description: 'Filter campuses by budget, location, and goals.',
    to: '/students/college-fit-test',
    icon: 'fit',
  },
  {
    id: 'deadline',
    title: 'Deadline manager',
    description: 'Keep exam and admission dates in one list.',
    to: '/students/deadline-manager',
    icon: 'calendar',
  },
];

export const EXAM_STRIP_LINKS = [
  ...getRankPredictorExams().slice(0, 8).map((e) => ({ label: e.name, to: `/students/rank-predictor/${e.id}` })),
  { label: 'All exams', to: '/students/rank-predictor', highlight: true },
];

export { FIT_TEST_TOOLS, COMPARE_TOOLS };
