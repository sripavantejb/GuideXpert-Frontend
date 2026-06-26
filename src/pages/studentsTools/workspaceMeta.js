import {
  FiTrendingUp,
  FiSearch,
  FiGitBranch,
  FiBookOpen,
  FiMapPin,
  FiColumns,
  FiLayers,
  FiZap,
  FiClock,
} from 'react-icons/fi';

/** Hero icon tile + accent per route (ToolWorkspaceLayout) */
export const HERO_META_BY_PATH = {
  '/students/rank-predictor': { Icon: FiTrendingUp, accent: 'orange' },
  '/students/college-predictor': { Icon: FiSearch, accent: 'rose' },
  '/students/branch-predictor': { Icon: FiGitBranch, accent: 'violet' },
  '/students/course-fit-test': { Icon: FiBookOpen, accent: 'amber' },
  '/students/college-fit-test': { Icon: FiMapPin, accent: 'sky' },
  '/students/college-comparison': { Icon: FiColumns, accent: 'indigo' },
  '/students/exam-predictor': { Icon: FiZap, accent: 'amber' },
  '/students/deadline-manager': { Icon: FiClock, accent: 'sky' },
};

const DEFAULT_HERO = { Icon: FiLayers, accent: 'orange' };

export function getHeroMeta(pathname) {
  if (HERO_META_BY_PATH[pathname]) return HERO_META_BY_PATH[pathname];
  if (pathname.startsWith('/students/rank-predictor/')) return HERO_META_BY_PATH['/students/rank-predictor'];
  return DEFAULT_HERO;
}

/** Tailwind tokens for hero icon tile */
export const HERO_ACCENT_STYLES = {
  orange: 'bg-orange-50 text-orange-600',
  emerald: 'bg-orange-50 text-orange-600',
  rose: 'bg-rose-50 text-rose-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  lime: 'bg-orange-50 text-orange-600',
  pink: 'bg-rose-50 text-rose-600',
  blue: 'bg-sky-50 text-sky-600',
  yellow: 'bg-amber-50 text-amber-600',
};
