import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiCheck,
  FiFilter,
  FiLayers,
  FiTarget,
  FiChevronRight,
  FiInfo,
  FiList,
} from 'react-icons/fi';
import { LAYOUT } from '../../../components/studentDashboard/careers360/careers360Theme';
import {
  swPageShell,
  swSectionTitle,
  swSectionSubtitle,
  swCard,
} from './studentWorkspaceUi';
import RelatedToolsSection from './RelatedToolsSection';

const FEATURE_ICONS = [FiLayers, FiFilter, FiTarget];
const FEATURE_ICON_STYLES = [
  'bg-[#fce7f3] text-[#be185d]',
  'bg-[#dbeafe] text-[#1d4ed8]',
  'bg-[#ffedd5] text-[#c2410c]',
];

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
  if (pathname.startsWith('/students/rank-predictor/')) {
    return BREADCRUMB_CATEGORY['/students/rank-predictor'];
  }
  return { label: 'Predictors & Tools', to: '/students/predictors' };
}

function featureItems({ howItWorks, whatThisToolDoes }) {
  const defaultTitles = ['Detailed Criteria', 'Personalized Report', 'Comprehensive Coverage'];

  if (howItWorks?.length) {
    return howItWorks.slice(0, 3).map((item, index) => {
      if (item && typeof item === 'object') {
        return {
          title: item.title || defaultTitles[index] || `Highlight ${index + 1}`,
          detail: item.detail || item.description || '',
        };
      }
      return {
        title: defaultTitles[index] || `Highlight ${index + 1}`,
        detail: item,
      };
    });
  }
  if (whatThisToolDoes?.length) {
    return whatThisToolDoes.slice(0, 3).map((text, index) => {
      const [head, ...rest] = String(text).split(/[.!]/);
      const title = head?.trim() || defaultTitles[index];
      const detail = rest.join('.').trim() || text;
      return { title, detail };
    });
  }
  return [
    { title: 'Detailed Criteria', detail: 'Rank, quota & category based.' },
    { title: 'Personalized Report', detail: 'Filter by branch, fees, location & more.' },
    { title: 'Comprehensive Coverage', detail: 'All India & state-level colleges.' },
  ];
}

function ToolInfoSection({ whatThisToolDoes, inputGuide, preview }) {
  const hasWhat = Array.isArray(whatThisToolDoes) && whatThisToolDoes.length > 0;
  const hasGuide = Array.isArray(inputGuide) && inputGuide.length > 0;
  const hasPreview = Boolean(preview);
  if (!hasWhat && !hasGuide && !hasPreview) return null;

  return (
    <section className={`${swCard} space-y-8`} aria-labelledby="tool-info-heading">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f27921]">
          Tool guide
        </p>
        <h2 id="tool-info-heading" className={swSectionTitle}>
          About this predictor
        </h2>
        <p className={swSectionSubtitle}>
          Quick context on what this tool covers and how to fill the form for better results.
        </p>
      </div>

      <div
        className={`grid gap-6 ${
          hasPreview ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,18rem)]' : 'lg:grid-cols-2'
        }`}
      >
        <div className="space-y-6">
          {hasWhat ? (
            <div>
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-[#041e30]">
                <FiInfo className="h-4 w-4 text-[#f27921]" aria-hidden />
                What this tool does
              </h3>
              <ul className="mt-3 space-y-2.5">
                {whatThisToolDoes.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-[#5a6570]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasGuide ? (
            <div>
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-[#041e30]">
                <FiList className="h-4 w-4 text-[#f27921]" aria-hidden />
                How to fill the inputs
              </h3>
              <ul className="mt-3 space-y-2.5">
                {inputGuide.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-[#5a6570]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1d4ed8]" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {hasPreview ? (
          <aside className="rounded-xl border border-[#e4e9f0] bg-[#f7f9fc] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a94a0]">
              Snapshot
            </p>
            <div className="mt-3">{preview}</div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

export default function ToolWorkspaceLayout({
  title,
  subtitle,
  howItWorks,
  children,
  results,
  insights,
  whatThisToolDoes,
  trustBadge = 'Trusted by 500K+ Students',
  relatedTools,
  showRelatedTools = true,
  preview = null,
  inputGuide = null,
  compactHero: _compactHero,
  afterHero = null,
}) {
  const { pathname } = useLocation();
  const category = resolveBreadcrumbCategory(pathname);
  const features = featureItems({ howItWorks, whatThisToolDoes });
  const hasInfo =
    (Array.isArray(whatThisToolDoes) && whatThisToolDoes.length > 0) ||
    (Array.isArray(inputGuide) && inputGuide.length > 0) ||
    Boolean(preview);
  const infoSection = hasInfo ? (
    <ToolInfoSection
      whatThisToolDoes={whatThisToolDoes}
      inputGuide={inputGuide}
      preview={preview}
    />
  ) : null;
  const hasBelowHero = Boolean(
    afterHero || infoSection || results || insights || showRelatedTools
  );

  return (
    <main className={`${swPageShell} !bg-[#f3f5f8]`}>
      <section className="sw-c360-tool-hero relative overflow-hidden !py-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 22%, rgba(242,121,33,0.18), transparent 42%), radial-gradient(circle at 82% 18%, rgba(56,189,248,0.12), transparent 38%)',
          }}
          aria-hidden
        />

        <div className={`relative ${LAYOUT.container} py-10 sm:py-12 lg:py-16`}>
          <nav
            className="sw-fade-up mb-10 flex flex-wrap items-center gap-1.5 text-[13px] !text-white/70"
            aria-label="Breadcrumb"
          >
            <Link
              to="/students"
              className="inline-flex items-center gap-1 !text-white/70 transition hover:!text-white"
            >
              <FiHome className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Home</span>
            </Link>
            <FiChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
            <Link to={category.to} className="!text-white/70 transition hover:!text-white">
              {category.label}
            </Link>
            <FiChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
            <span className="font-medium !text-white">{title}</span>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,24rem)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,26rem)] lg:gap-12 xl:gap-16">
            <div className="sw-fade-up min-w-0 text-white lg:pr-4">
              {trustBadge ? (
                <p className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#16a34a]/20 px-3.5 py-1.5 text-xs font-semibold !text-[#86efac] ring-1 ring-[#4ade80]/35">
                  <FiCheck className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  {trustBadge}
                </p>
              ) : null}

              <h1 className="font-sw-display text-[1.85rem] font-bold leading-[1.15] tracking-tight !text-white sm:text-4xl lg:text-[2.55rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed !text-white/80 sm:text-base">
                  {subtitle}
                </p>
              ) : null}

              <ul className="mt-10 space-y-5">
                {features.map((feature, index) => {
                  const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
                  const iconStyle = FEATURE_ICON_STYLES[index % FEATURE_ICON_STYLES.length];
                  return (
                    <li key={`${feature.title}-${index}`} className="flex gap-4">
                      <span
                        className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 pt-1">
                        <p className="text-sm font-semibold !text-white sm:text-[15px]">
                          {feature.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed !text-white/65">
                          {feature.detail}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="sw-fade-up sw-fade-up-delay-1 w-full min-w-0 max-w-full justify-self-stretch lg:justify-self-end">
              <div className="w-full min-w-0 max-w-full rounded-2xl border border-white/40 bg-[#f7f8fb] p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] sm:p-8">
                <div className="w-full min-w-0 max-w-full">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {hasBelowHero ? (
        <div className={`${LAYOUT.container} space-y-12 py-12 sm:space-y-14 sm:py-16 lg:py-20`}>
          {afterHero}
          {infoSection}
          {results}
          {insights}
          {showRelatedTools ? (
            <RelatedToolsSection tools={relatedTools} />
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
