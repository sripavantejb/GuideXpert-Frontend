import { useLocation } from 'react-router-dom';
import { FiZap, FiLayers, FiCheckSquare, FiEdit3 } from 'react-icons/fi';
import StudentWorkspaceNavbar from '../../../components/studentDashboard/StudentWorkspaceNavbar';
import StudentWorkspaceFooter from '../../../components/studentDashboard/StudentWorkspaceFooter';
import { getHeroMeta, HERO_ACCENT_STYLES } from '../workspaceMeta';

function HelpList({ title, items, icon }) {
  const SvgIcon = icon;
  return (
    <div className="rounded-[14px] border-[3px] border-black bg-white p-5 shadow-[5px_5px_0_#000]">
      <h3 className="mb-4 flex items-center gap-3 text-base font-black text-[#0F172A]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border-[3px] border-black bg-[#F8FAFC] shadow-[3px_3px_0_#000]">
          <SvgIcon className="h-5 w-5 text-[#0F172A]" aria-hidden />
        </span>
        {title}
      </h3>
      <ul className="space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-[10px] border-2 border-black bg-[#F8FAFC] px-3 py-2.5 font-medium shadow-[2px_2px_0_#000]"
          >
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
}) {
  const { pathname } = useLocation();
  const { Icon: HeroIcon, accent } = getHeroMeta(pathname);
  const heroAccentClass = HERO_ACCENT_STYLES[accent] || HERO_ACCENT_STYLES.lime;

  return (
    <div className="flex min-h-screen flex-col">
      <StudentWorkspaceNavbar />
      <main className="student-tool-page-shell relative flex min-h-0 flex-1 flex-col">
        {compactHero ? (
          <div className="mx-auto w-full max-w-7xl shrink-0 px-4 pt-8 pb-4 sm:px-6 sm:pb-6 lg:px-8">
            <section className="rounded-[14px] border-[3px] border-black bg-[#0F172A] p-6 shadow-[4px_4px_0_#000] sm:p-8 lg:p-10">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student tool workspace</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] border-[3px] border-black shadow-[4px_4px_0_#000] sm:h-16 sm:w-16 ${heroAccentClass}`}
                >
                  <HeroIcon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.25} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
                  <p className="mt-2 max-w-2xl text-sm font-normal leading-relaxed text-slate-300 sm:text-base">{subtitle}</p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl shrink-0 px-4 pt-8 pb-4 sm:px-6 sm:pb-6 lg:px-8">
            <section className="overflow-hidden rounded-[14px] border-[3px] border-black bg-[#0F172A] shadow-[4px_4px_0_#000]">
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student tool workspace</p>
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div
                      className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[14px] border-[3px] border-black sm:h-[88px] sm:w-[88px] ${heroAccentClass}`}
                    >
                      <HeroIcon className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
                        {title}
                      </h1>
                      <p className="mt-3 max-w-2xl text-sm font-normal leading-relaxed text-slate-300 sm:text-base">{subtitle}</p>
                    </div>
                  </div>

                  <div className="w-full max-w-[min(100%,20rem)] lg:justify-self-end">
                    <div className="rounded-[14px] border-[3px] border-black bg-white shadow-[6px_6px_0_#c7f36b]">
                      <div className="flex items-center gap-2 border-b-[3px] border-black bg-[#F8FAFC] px-3 py-2">
                        <FiZap className="h-3.5 w-3.5 shrink-0 text-[#0F172A]" aria-hidden />
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600 sm:text-[10px] sm:tracking-[0.2em]">
                          Live analytics preview
                        </p>
                      </div>
                      <div className="p-3 text-[#0F172A] sm:p-4">{preview}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 pb-10 pt-2 sm:px-6 sm:pb-12 sm:pt-4 lg:px-8">
          <div className="flex-1 space-y-7">
            <section className="rounded-[14px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0_#000] sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border-[3px] border-black bg-[#c7f36b] shadow-[4px_4px_0_#000]">
                    <FiLayers className="h-6 w-6 text-[#0F172A]" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#0F172A] sm:text-3xl">How This Tool Works</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Simple explanation of how this recommendation is generated.
                    </p>
                  </div>
                </div>
              </div>
              <ol className="space-y-3">
                {howItWorks?.map((item, index) => (
                  <li key={item} className="flex gap-4">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-white text-sm font-black text-[#0F172A] shadow-[3px_3px_0_#000]"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span className="pt-1 text-sm font-medium leading-relaxed text-slate-700 sm:text-base">{item}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <HelpList title="What this tool does" items={whatThisToolDoes} icon={FiCheckSquare} />
                <HelpList title="What each input means" items={inputGuide} icon={FiEdit3} />
              </div>
            </section>

            <section className="rounded-[14px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0_#000] sm:p-8">
              {children}
            </section>

            {results}

            {insights}
          </div>
        </div>
      </main>
      <StudentWorkspaceFooter />
    </div>
  );
}
