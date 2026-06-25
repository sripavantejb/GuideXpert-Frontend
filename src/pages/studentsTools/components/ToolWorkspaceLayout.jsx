import { useLocation } from 'react-router-dom';
import { FiZap, FiLayers, FiCheckSquare, FiEdit3 } from 'react-icons/fi';
import StudentWorkspaceNavbar from '../../../components/studentDashboard/StudentWorkspaceNavbar';
import StudentWorkspaceFooter from '../../../components/studentDashboard/StudentWorkspaceFooter';
import { getHeroMeta, HERO_ACCENT_STYLES } from '../workspaceMeta';
import {
  swCard,
  swContainer,
  swHeroEyebrow,
  swPageShell,
  swPageSubtitle,
  swPageTitle,
  swSectionSubtitle,
  swSectionTitle,
} from './studentWorkspaceUi';

function HelpList({ title, items, icon: Icon }) {
  return (
    <div className={`${swCard} min-w-0`}>
      <h3 className="mb-4 flex items-center gap-3 text-base font-semibold text-slate-900">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        {title}
      </h3>
      <ul className="space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-slate-50 px-3 py-2.5 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ToolWorkspaceLayout({
  title,
  subtitle,
  howItWorks,
  preview,
  children,
  results,
  insights,
  whatThisToolDoes,
  inputGuide,
  compactHero = false,
  afterHero = null,
}) {
  const { pathname } = useLocation();
  const { Icon: HeroIcon, accent } = getHeroMeta(pathname);
  const heroAccentClass = HERO_ACCENT_STYLES[accent] || HERO_ACCENT_STYLES.lime;

  return (
    <div className={swPageShell}>
      <StudentWorkspaceNavbar />
      <main className="flex-1">
        <div className={swContainer}>
          <header className="mb-8">
            <p className={swHeroEyebrow}>Student tool</p>
            <div className={`mt-3 ${compactHero ? 'space-y-4' : 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:items-start'}`}>
              <div className="flex gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${heroAccentClass}`}>
                  <HeroIcon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h1 className={swPageTitle}>{title}</h1>
                  <p className={swPageSubtitle}>{subtitle}</p>
                </div>
              </div>

              {!compactHero && preview ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-3 flex items-center gap-2 text-slate-500">
                    <FiZap className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <p className="text-xs font-medium uppercase tracking-wider">Preview</p>
                  </div>
                  <div className="text-slate-900">{preview}</div>
                </div>
              ) : null}
            </div>
          </header>

          {afterHero}

          <div className="space-y-6">
            <section className={swCard}>
              <div className="mb-6 flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FiLayers className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className={swSectionTitle}>How this tool works</h2>
                  <p className={swSectionSubtitle}>Simple explanation of how recommendations are generated.</p>
                </div>
              </div>
              <ol className="space-y-3">
                {howItWorks?.map((item, index) => (
                  <li key={item} className="flex min-w-0 gap-3 sm:gap-4">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 pt-0.5 text-sm leading-relaxed text-slate-600 sm:text-base">{item}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <HelpList title="What this tool does" items={whatThisToolDoes} icon={FiCheckSquare} />
                <HelpList title="What each input means" items={inputGuide} icon={FiEdit3} />
              </div>
            </section>

            <section className={swCard}>{children}</section>

            {results}
            {insights}
          </div>
        </div>
      </main>
      <StudentWorkspaceFooter />
    </div>
  );
}
