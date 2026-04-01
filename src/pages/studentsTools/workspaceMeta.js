import {
  FiTrendingUp,
  FiSearch,
  FiGitBranch,
  FiBookOpen,
  FiMapPin,
  FiColumns,
  FiLayers,
  FiHeart,
  FiBarChart2,
} from 'react-icons/fi';

/** Group-level icons for nav column headers */
export const GROUP_ICONS = {
  Predictors: FiLayers,
  'Fit Tests': FiHeart,
  Comparison: FiBarChart2,
};

/**
 * Nav structure with vector icons per tool (single source for ToolNavBar).
 */
export const NAV_GROUPS = [
  {
    label: 'Predictors',
    links: [
      { to: '/students/rank-predictor', label: 'Rank Predictor', icon: FiTrendingUp },
      { to: '/students/college-predictor', label: 'College Predictor', icon: FiSearch },
      { to: '/students/branch-predictor', label: 'Branch Predictor', icon: FiGitBranch },
    ],
  },
  {
    label: 'Fit Tests',
    links: [
      { to: '/students/course-fit-test', label: 'Course Fit Test', icon: FiBookOpen },
      { to: '/students/college-fit-test', label: 'College Fit Test', icon: FiMapPin },
    ],
  },
  {
    label: 'Comparison',
    links: [{ to: '/students/college-comparison', label: 'College Comparison', icon: FiColumns }],
  },
];

/** Hero icon tile + accent per route (ToolWorkspaceLayout) */
export const HERO_META_BY_PATH = {
  '/students/rank-predictor': { Icon: FiTrendingUp, accent: 'lime' },
  '/students/college-predictor': { Icon: FiSearch, accent: 'pink' },
  '/students/branch-predictor': { Icon: FiGitBranch, accent: 'blue' },
  '/students/course-fit-test': { Icon: FiBookOpen, accent: 'yellow' },
  '/students/college-fit-test': { Icon: FiMapPin, accent: 'pink' },
  '/students/college-comparison': { Icon: FiColumns, accent: 'lime' },
};

const DEFAULT_HERO = { Icon: FiLayers, accent: 'lime' };

export function getHeroMeta(pathname) {
  return HERO_META_BY_PATH[pathname] || DEFAULT_HERO;
}

/** Tailwind border/bg tokens for hero icon tile */
export const HERO_ACCENT_STYLES = {
  lime: 'border-[#C7F36B] bg-[#C7F36B]/15 text-[#C7F36B] shadow-[6px_6px_0_#C7F36B]',
  pink: 'border-[#F7B5B5] bg-[#F7B5B5]/15 text-[#F7B5B5] shadow-[6px_6px_0_#F7B5B5]',
  blue: 'border-[#B7E5FF] bg-[#B7E5FF]/15 text-[#B7E5FF] shadow-[6px_6px_0_#B7E5FF]',
  yellow: 'border-[#FFE89A] bg-[#FFE89A]/15 text-[#FFE89A] shadow-[6px_6px_0_#FFE89A]',
};
