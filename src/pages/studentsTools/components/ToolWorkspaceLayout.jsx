import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import { LAYOUT } from '../../../components/studentDashboard/careers360/careers360Theme';
import { swPageShell } from './studentWorkspaceUi';
import RelatedToolsSection from './RelatedToolsSection';

const BREADCRUMB_CATEGORY = {
  '/students/college-predictor': {
    label: 'College Predictors',
    to: '/students/predictors',
  },
  '/students/branch-predictor': {
    label: 'College Predictors',
    to: '/students/predictors',
  },
  '/students/exam-predictor': {
    label: 'College Predictors',
    to: '/students/predictors',
  },
  '/students/college-comparison': {
    label: 'Compare',
    to: '/students/college-comparison',
  },
  '/students/rank-predictor': {
    label: 'Rank Predictors',
    to: '/students/rank-predictor',
  },
  '/students/course-fit-test': { label: 'Fit Tests', to: '/students/tests' },
  '/students/college-fit-test': { label: 'Fit Tests', to: '/students/tests' },
  '/students/deadline-manager': {
    label: 'Deadlines',
    to: '/students/deadline-manager',
  },
};

function resolveBreadcrumbCategory(pathname) {
  if (BREADCRUMB_CATEGORY[pathname]) return BREADCRUMB_CATEGORY[pathname];
  if (
    pathname.startsWith('/students/rank-predictor/') ||
    pathname.startsWith('/rank-predictor/')
  ) {
    return pathname.startsWith('/rank-predictor/')
      ? { label: 'Rank Predictors', to: '/rank-predictor' }
      : BREADCRUMB_CATEGORY['/students/rank-predictor'];
  }
  return { label: 'Predictors & Tools', to: '/students/predictors' };
}

function featureItems({ howItWorks, whatThisToolDoes }) {
  const defaultTitles = ['Match criteria', 'Personal filters', 'Coverage'];

  if (howItWorks?.length) {
    return howItWorks.slice(0, 3).map((text, index) => ({
      title: defaultTitles[index] || `Step ${index + 1}`,
      detail: text,
    }));
  }
  if (whatThisToolDoes?.length) {
    return whatThisToolDoes.slice(0, 3).map((text, index) => {
      const [head, ...rest] = text.split(/[.!]/);
      const title = head?.trim() || defaultTitles[index];
      const detail = rest.join('.').trim() || text;
      return { title, detail };
    });
  }
  return [
    { title: 'Match criteria', detail: 'Rank, quota & category based matching.' },
    { title: 'Personal filters', detail: 'Branch, fees, location and more.' },
    { title: 'Coverage', detail: 'All India and state-level colleges.' },
  ];
}

export default function ToolWorkspaceLayout({
  title,
  subtitle,
  howItWorks,
  children,
  results,
  insights,
  whatThisToolDoes,
  trustBadge = 'Trusted by 500K+ students',
  relatedTools,
  showRelatedTools = true,
  preview: _preview,
  inputGuide: _inputGuide,
  compactHero: _compactHero,
  afterHero = null,
  homeTo = '/students',
}) {
  const { pathname } = useLocation();
  const category = resolveBreadcrumbCategory(pathname);
  const features = featureItems({ howItWorks, whatThisToolDoes });
  const hasResultsBand = Boolean(afterHero || results || insights);

  return (
    <main className={swPageShell}>
      <section className="sw-gx-tool-hero-band relative overflow-hidden">
        <div className={`relative ${LAYOUT.container} pb-10 pt-8 sm:pb-12 sm:pt-10 lg:pb-14 lg:pt-12`}>
          <nav
            className="sw-fade-up mb-8 flex flex-wrap items-center gap-1.5 text-[13px] text-white/65"
            aria-label="Breadcrumb"
          >
            <Link
              to={homeTo}
              className="inline-flex items-center gap-1 text-white/65 transition hover:text-white"
            >
              <FiHome className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Home</span>
            </Link>
            <FiChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
            <Link to={category.to} className="text-white/65 transition hover:text-white">
              {category.label}
            </Link>
            <FiChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
            <span className="font-medium text-white">{title}</span>
          </nav>

          <div className="sw-fade-up grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)] lg:items-end lg:gap-12">
            <div className="min-w-0">
              <p className="font-sw-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f27921]">
                GuideXpert
              </p>
              <div className="mt-3 flex gap-4">
                <span
                  className="mt-1 hidden h-[3.25rem] w-1 shrink-0 bg-[#f27921] sm:block sm:h-[3.75rem]"
                  aria-hidden
                />
                <div className="min-w-0">
                  <h1 className="font-sw-display text-[1.85rem] font-bold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {trustBadge ? (
              <p className="sw-fade-up sw-fade-up-delay-1 max-w-xs text-sm leading-snug text-white/70 lg:justify-self-end lg:text-right">
                <span className="font-semibold text-white">{trustBadge}</span>
                <span className="mt-1 block text-[13px] text-white/55">
                  Built on multi-year cutoff trends
                </span>
              </p>
            ) : null}
          </div>

          <div className="sw-fade-up sw-fade-up-delay-1 mt-10 grid items-start gap-8 lg:mt-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-10 xl:gap-14">
            <aside className="sw-gx-form-rail lg:sticky lg:top-24 lg:self-start">
              <div className="w-full min-w-0">{children}</div>
            </aside>

            <div className="min-w-0">
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                How predictions work
              </p>
              <ol className="sw-gx-signal-steps">
                {features.map((feature, index) => (
                  <li key={feature.title} className="sw-gx-signal-step">
                    <span className="font-sw-display text-2xl font-bold tabular-nums tracking-tight text-[#f27921]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 pt-1">
                      <p className="sw-gx-step-title text-sm font-semibold">{feature.title}</p>
                      <p className="sw-gx-step-detail mt-1.5 text-sm leading-relaxed">
                        {feature.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {(hasResultsBand || showRelatedTools) && (
        <div className={`${LAYOUT.container} pb-12 pt-12 sm:pb-16 sm:pt-14 lg:pb-20`}>
          {hasResultsBand ? (
            <div className="sw-fade-up space-y-12 sm:space-y-14">
              {afterHero}
              {results}
              {insights}
            </div>
          ) : null}

          {showRelatedTools ? (
            <div className={hasResultsBand ? 'mt-14 sm:mt-16' : ''}>
              <RelatedToolsSection tools={relatedTools} />
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
