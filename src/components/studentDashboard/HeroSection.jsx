import { HERO_MOCK_STATS } from '../../data/studentDashboardMock';

function FloatingDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="sd-float-1 absolute right-[8%] top-[12%] h-10 w-10 text-[#c7f36b]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 17.8 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
      </svg>
      <svg
        className="sd-float-2 absolute bottom-[20%] left-[5%] h-8 w-8 text-[#F7B5B5]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sd-float-3 absolute left-[18%] top-[40%] flex h-3 w-3 rounded-full bg-[#c7f36b] ring-2 ring-black" />
      <span className="sd-float-2 absolute right-[20%] bottom-[30%] h-2 w-2 rotate-45 bg-[#B7E5FF] ring-1 ring-black" />
      <div className="sd-float-1 absolute right-[12%] top-[45%] h-14 w-14 rounded-full border-2 border-dashed border-white/30" />
    </div>
  );
}

export default function HeroSection() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pct = HERO_MOCK_STATS.percentile;
  const pref = HERO_MOCK_STATS.preferencesComplete;

  return (
    <section
      className="relative border-b-2 border-black bg-[#0F172A] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-14"
      aria-labelledby="student-dashboard-hero-title"
    >
      <div className="relative mx-auto max-w-6xl">
        <FloatingDecor />
        <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <p className="mb-3 inline-block rounded-full border-2 border-black bg-[#c7f36b] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0F172A] shadow-[4px_4px_0_#000]">
              GuideXpert · Student Intelligence
            </p>
            <h1
              id="student-dashboard-hero-title"
              className="sd-font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
              style={{ fontWeight: 800 }}
            >
              Student <span className="text-[#c7f36b]">Intelligence</span> Dashboard
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300 sm:text-xl">
              Estimate rank and percentile, match colleges and branches to your profile, run course and college fit
              tests, and compare institutions side by side—all in one workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button type="button" onClick={() => scrollTo('rank-predictor')} className="sd-btn-primary">
                Initialize rank prediction
              </button>
              <button type="button" onClick={() => scrollTo('tool-grid')} className="sd-btn-secondary bg-white">
                Browse predictors & fit tests →
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-[14px] border-2 border-black bg-[#0F172A] shadow-[6px_6px_0_#c7f36b] lg:ml-auto">
              <div className="flex items-center gap-2 border-b-2 border-black bg-[#0B0E14] px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" aria-hidden />
                <span className="ml-2 font-mono text-[11px] font-medium tracking-wide text-slate-400">
                  &gt;_ SESSION ACTIVE
                </span>
              </div>
              <div className="bg-white p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Estimated rank
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="sd-font-display text-3xl font-extrabold tabular-nums text-[#0F172A] sm:text-4xl">
                    {HERO_MOCK_STATS.predictedRank.toLocaleString()}
                  </p>
                  <span className="inline-flex text-[#28C840]" aria-hidden>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
                    </svg>
                  </span>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Exam percentile</span>
                    <span className="tabular-nums text-[#0F172A]">{pct}%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-black/15 bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#0F172A]"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Preference profile</span>
                    <span className="tabular-nums text-[#0F172A]">{pref.toFixed(1)}%</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">Course fit + college fit inputs</p>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-black/15 bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#B7E5FF]"
                      style={{ width: `${Math.min(100, pref)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
