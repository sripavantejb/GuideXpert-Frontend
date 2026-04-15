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
  '/students/rank-predictor': { Icon: FiTrendingUp, accent: 'lime' },
  '/students/college-predictor': { Icon: FiSearch, accent: 'pink' },
  '/students/branch-predictor': { Icon: FiGitBranch, accent: 'blue' },
  '/students/course-fit-test': { Icon: FiBookOpen, accent: 'yellow' },
  '/students/college-fit-test': { Icon: FiMapPin, accent: 'pink' },
  '/students/college-comparison': { Icon: FiColumns, accent: 'lime' },
  '/students/exam-predictor': { Icon: FiZap, accent: 'yellow' },
  '/students/deadline-manager': { Icon: FiClock, accent: 'blue' },
};

const DEFAULT_HERO = { Icon: FiLayers, accent: 'lime' };

export function getHeroMeta(pathname) {
  if (HERO_META_BY_PATH[pathname]) return HERO_META_BY_PATH[pathname];
  if (pathname.startsWith('/students/rank-predictor/')) return HERO_META_BY_PATH['/students/rank-predictor'];
  return DEFAULT_HERO;
}

/** Tailwind border/bg tokens for hero icon tile */
export const HERO_ACCENT_STYLES = {
  lime: 'border-[#c7f36b] bg-[#c7f36b]/15 text-[#c7f36b] shadow-[6px_6px_0_#c7f36b]',
  pink: 'border-[#F7B5B5] bg-[#F7B5B5]/15 text-[#F7B5B5] shadow-[6px_6px_0_#F7B5B5]',
  blue: 'border-[#B7E5FF] bg-[#B7E5FF]/15 text-[#B7E5FF] shadow-[6px_6px_0_#B7E5FF]',
  yellow: 'border-[#c7f36b] bg-[#c7f36b]/15 text-[#c7f36b] shadow-[6px_6px_0_#c7f36b]',
};
