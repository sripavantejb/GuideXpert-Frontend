import { Link, useLocation } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import {
  ADMISSION_PREDICTOR_TOOLS,
  COMPARE_TOOLS,
  FIT_TEST_TOOLS,
  getRankPredictorTools,
} from '../../../constants/studentWorkspaceTools';
import { swHubCard, swLinkCta, swSectionSubtitle, swSectionTitle } from './studentWorkspaceUi';

const SUGGESTION_POOL = [
  ...ADMISSION_PREDICTOR_TOOLS,
  ...COMPARE_TOOLS,
  ...FIT_TEST_TOOLS,
  ...getRankPredictorTools().slice(0, 4),
];

/**
 * Suggested tools for the current route (excludes the page you’re on).
 * Pass `tools` to override the default pool.
 * Used under tool heroes to lengthen the page with related predictors.
 */
export function getRelatedTools(pathname, { limit = 4, tools } = {}) {
  const pool = tools || SUGGESTION_POOL;
  return pool.filter((tool) => tool.to !== pathname).slice(0, limit);
}

export default function RelatedToolsSection({
  title = 'Explore other predictors',
  subtitle = 'Continue planning with these related GuideXpert tools.',
  tools,
  limit = 4,
}) {
  const { pathname } = useLocation();
  const items = tools || getRelatedTools(pathname, { limit });

  if (!items.length) return null;

  return (
    <section className="sw-fade-up border-t border-[#e4e9f0] pt-12 sm:pt-14" aria-labelledby="related-tools-heading">
      <div className="mb-8 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f27921]">
          Suggested for you
        </p>
        <h2 id="related-tools-heading" className={`mt-2 ${swSectionTitle}`}>
          {title}
        </h2>
        <p className={swSectionSubtitle}>{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.to} to={tool.to} className={`${swHubCard} !p-5`}>
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f27921]/50 to-transparent opacity-0 transition group-hover:opacity-100"
                aria-hidden
              />
              {Icon ? (
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tool.iconClass || 'bg-[#fff4ed] text-[#f27921]'}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
              ) : null}
              <h3 className="font-sw-display text-base font-bold tracking-tight text-[#041e30]">
                {tool.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5a6570]">{tool.description}</p>
              <span className={`${swLinkCta} !mt-4`}>
                {tool.cta || 'Open tool'} <LuArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
