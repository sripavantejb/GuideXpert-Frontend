const TOOLS = [
  {
    id: 'rank-predictor',
    title: 'Rank Predictor',
    desc: 'Estimate rank and percentile from marks.',
    accent: 'bg-[#F7B5B5]',
  },
  {
    id: 'college-predictor',
    title: 'College Predictor',
    desc: 'Match colleges to rank, category, and state.',
    accent: 'bg-[#C7F36B]',
  },
  {
    id: 'branch-predictor',
    title: 'Branch Predictor',
    desc: 'See possible branches for a college.',
    accent: 'bg-[#B7E5FF]',
  },
  {
    id: 'course-fit',
    title: 'Course Fit Test',
    desc: 'Quick quiz for best-fit courses.',
    accent: 'bg-[#FFE89A]',
  },
  {
    id: 'college-fit',
    title: 'College Fit Test',
    desc: 'Budget, city, campus, placements.',
    accent: 'bg-[#F7B5B5]',
  },
  {
    id: 'college-comparison',
    title: 'Compare Colleges',
    desc: 'Side-by-side stats in one table.',
    accent: 'bg-[#C7F36B]',
  },
];

export default function ToolGridSection() {
  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="tool-grid"
      className="scroll-mt-24 border-b-2 border-black bg-[#0F172A] px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="tool-grid-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="tool-grid-heading"
          className="sd-font-display text-2xl font-extrabold text-white sm:text-3xl"
          style={{ fontWeight: 800 }}
        >
          Tools dashboard
        </h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          Jump into each tool—structured like a product workspace, built for fast decisions.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              className="sd-card-brutal group flex w-full flex-col overflow-hidden text-left"
            >
              <div className={`h-2 w-full ${t.accent} border-b-2 border-black`} />
              <div className="p-5">
                <h3 className="sd-font-display text-lg font-extrabold text-[#0F172A]">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.desc}</p>
                <span className="mt-4 inline-flex items-center text-sm font-bold text-[#0F172A] group-hover:underline">
                  Open tool →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
