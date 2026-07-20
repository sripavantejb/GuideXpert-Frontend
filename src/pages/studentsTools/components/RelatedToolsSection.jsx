import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LuArrowRight, LuSearch, LuRocket, LuZap, LuScale, LuGraduationCap, LuMapPin, LuCalendar } from 'react-icons/lu';
import { swSectionSubtitle, swSectionTitle } from './studentWorkspaceUi';

/** Static suggestions — avoid module-init side effects from exam helpers. */
const DEFAULT_SUGGESTIONS = [
  {
    title: 'College Predictor',
    description: 'Shortlist colleges that match your rank, category, and preferences.',
    to: '/students/college-predictor',
    icon: LuSearch,
    iconClass: 'bg-rose-50 text-rose-600',
  },
  {
    title: 'Branch Predictor',
    description: 'See which branches you can get at your target institutions.',
    to: '/students/branch-predictor',
    icon: LuRocket,
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'Exam Predictor',
    description: 'Suggest suitable exams based on your profile and strengths.',
    to: '/students/exam-predictor',
    icon: LuZap,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'College Comparison',
    description: 'Compare institutions side-by-side on key admission metrics.',
    to: '/students/college-comparison',
    icon: LuScale,
    iconClass: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Course Fit Test',
    description: 'Discover courses aligned with your interests and learning style.',
    to: '/students/course-fit-test',
    icon: LuGraduationCap,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'College Fit Test',
    description: 'Find campuses that match your lifestyle, budget, and goals.',
    to: '/students/college-fit-test',
    icon: LuMapPin,
    iconClass: 'bg-sky-50 text-sky-600',
  },
  {
    title: 'Rank Predictors',
    description: 'Estimate rank or percentile from marks for your entrance exam.',
    to: '/students/rank-predictor',
    icon: LuZap,
    iconClass: 'bg-orange-50 text-orange-600',
  },
  {
    title: 'Deadline Manager',
    description: 'Track important exam and admission deadlines at a glance.',
    to: '/students/deadline-manager',
    icon: LuCalendar,
    iconClass: 'bg-indigo-50 text-indigo-600',
  },
];

export function getRelatedTools(pathname, { limit = 4, tools } = {}) {
  const pool = Array.isArray(tools) && tools.length > 0 ? tools : DEFAULT_SUGGESTIONS;
  const normalized = String(pathname || '').replace(/\/$/, '') || '/';
  return pool
    .filter((tool) => {
      const dest = String(tool.to || '').replace(/\/$/, '');
      return dest && dest !== normalized;
    })
    .slice(0, limit);
}

export default function RelatedToolsSection({
  title = 'Explore other predictors',
  subtitle = 'Continue planning with these related GuideXpert tools.',
  tools,
  limit = 4,
}) {
  const { pathname } = useLocation();
  const items = useMemo(
    () => getRelatedTools(pathname, { limit, tools }),
    [pathname, limit, tools]
  );

  if (!items.length) return null;

  return (
    <section
      className="sw-fade-up border-t border-[#e4e9f0] !py-0 pt-12 sm:pt-14"
      aria-labelledby="related-tools-heading"
    >
      <div className="mb-8 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f27921]">
          Suggested for you
        </p>
        <h2 id="related-tools-heading" className={`mt-2 ${swSectionTitle}`}>
          {title}
        </h2>
        <p className={swSectionSubtitle}>{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.to}
              to={tool.to}
              className="group relative z-10 flex min-h-[11.5rem] w-full min-w-0 flex-col rounded-2xl border border-[#dce3ec] bg-white p-5 shadow-[0_1px_0_rgba(4,30,48,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f27921]/45 hover:shadow-[0_12px_32px_-16px_rgba(4,30,48,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f27921]/35 focus-visible:ring-offset-2"
            >
              {Icon ? (
                <div
                  className={`mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tool.iconClass || 'bg-[#fff4ed] text-[#f27921]'}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
              ) : null}
              <h3 className="font-sw-display text-base font-bold tracking-tight text-[#041e30]">
                {tool.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5a6570]">{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#f27921] transition duration-300 group-hover:gap-2.5">
                Open tool <LuArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
