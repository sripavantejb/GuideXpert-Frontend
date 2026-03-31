import { HERO_MOCK_STATS } from '../../data/studentDashboardMock';

function FloatingDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="sd-float-1 absolute right-[8%] top-[12%] h-10 w-10 text-[#FFE89A]"
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
      <span className="sd-float-3 absolute left-[18%] top-[40%] flex h-3 w-3 rounded-full bg-[#C7F36B] ring-2 ring-black" />
      <span className="sd-float-2 absolute right-[20%] bottom-[30%] h-2 w-2 rotate-45 bg-[#B7E5FF] ring-1 ring-black" />
      <div className="sd-float-1 absolute right-[12%] top-[45%] h-14 w-14 rounded-full border-2 border-dashed border-white/30" />
    </div>
  );
}

export default function HeroSection() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      className="relative border-b-2 border-black bg-[#0F172A] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-14"
      aria-labelledby="student-dashboard-hero-title"
    >
      <div className="relative mx-auto max-w-6xl">
        <FloatingDecor />
        <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <p className="mb-3 inline-block rounded-full border-2 border-black bg-[#C7F36B] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0F172A] shadow-[4px_4px_0_#000]">
              Student Intelligence
            </p>
            <h1
              id="student-dashboard-hero-title"
              className="sd-font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
              style={{ fontWeight: 800 }}
            >
              Student Intelligence Dashboard
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300 sm:text-xl">
              Predict ranks, discover colleges, and find the right course for your future.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button type="button" onClick={() => scrollTo('rank-predictor')} className="sd-btn-primary">
                Start Prediction
              </button>
              <button type="button" onClick={() => scrollTo('tool-grid')} className="sd-btn-secondary bg-white">
                Explore Tools
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="sd-card-brutal relative mx-auto max-w-md bg-white p-6 lg:ml-auto">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Live preview</p>
              <p className="sd-font-display mt-2 text-2xl font-extrabold text-[#0F172A]">Analytics snapshot</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border-2 border-black bg-[#B7E5FF]/50 p-4">
                  <p className="text-xs font-semibold text-slate-600">Predicted Rank</p>
                  <p className="sd-font-display mt-1 text-2xl font-extrabold tabular-nums">
                    {HERO_MOCK_STATS.predictedRank.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border-2 border-black bg-[#F7B5B5]/50 p-4">
                  <p className="text-xs font-semibold text-slate-600">Percentile</p>
                  <p className="sd-font-display mt-1 text-2xl font-extrabold tabular-nums">
                    {HERO_MOCK_STATS.percentile}%
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-black/20 bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#C7F36B]"
                  style={{ width: `${Math.min(100, HERO_MOCK_STATS.percentile)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
