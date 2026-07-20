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
  '/students/college-predictor': { Icon: FiSearch, accent: 'navy' },
  '/students/branch-predictor': { Icon: FiGitBranch, accent: 'navy' },
  '/students/course-fit-test': { Icon: FiBookOpen, accent: 'amber' },
  '/students/college-fit-test': { Icon: FiMapPin, accent: 'sky' },
  '/students/college-comparison': { Icon: FiColumns, accent: 'navy' },
  '/students/exam-predictor': { Icon: FiZap, accent: 'amber' },
  '/students/deadline-manager': { Icon: FiClock, accent: 'sky' },
};

const DEFAULT_HERO = { Icon: FiLayers, accent: 'orange' };

export function getHeroMeta(pathname) {
  if (HERO_META_BY_PATH[pathname]) return HERO_META_BY_PATH[pathname];
  if (pathname.startsWith('/students/rank-predictor/')) return HERO_META_BY_PATH['/students/rank-predictor'];
  return DEFAULT_HERO;
}

/** Tailwind tokens for hero icon tile — GuideXpert navy / orange family */
export const HERO_ACCENT_STYLES = {
  orange: 'bg-[#fff4ed] text-[#f27921] ring-1 ring-[#f27921]/15',
  emerald: 'bg-[#fff4ed] text-[#f27921] ring-1 ring-[#f27921]/15',
  navy: 'bg-[#041e30] text-white shadow-[0_10px_24px_-12px_rgba(4,30,48,0.55)]',
  rose: 'bg-[#fff4ed] text-[#e06810] ring-1 ring-[#f27921]/12',
  violet: 'bg-[#eef2f7] text-[#041e30] ring-1 ring-[#041e30]/08',
  amber: 'bg-[#fff8ed] text-[#c45a0c] ring-1 ring-[#f27921]/12',
  sky: 'bg-[#e8f1f8] text-[#0b3a5c] ring-1 ring-[#041e30]/08',
  indigo: 'bg-[#eef2f7] text-[#041e30] ring-1 ring-[#041e30]/08',
  lime: 'bg-[#fff4ed] text-[#f27921] ring-1 ring-[#f27921]/15',
  pink: 'bg-[#fff4ed] text-[#e06810] ring-1 ring-[#f27921]/12',
  blue: 'bg-[#e8f1f8] text-[#0b3a5c] ring-1 ring-[#041e30]/08',
  yellow: 'bg-[#fff8ed] text-[#c45a0c] ring-1 ring-[#f27921]/12',
};
