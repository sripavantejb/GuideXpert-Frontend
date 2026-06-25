import { LuArrowRight } from 'react-icons/lu';
import StudentsHeroIllustration from './StudentsHeroIllustration';

export default function StudentsDashboardHero({ onStartPrediction, onExploreTools }) {
  return (
    <section className="relative overflow-hidden bg-slate-900">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(199, 243, 107, 0.12), transparent), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(59, 130, 246, 0.08), transparent)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="min-w-0 flex-1 text-center lg:max-w-xl lg:text-left">
            <p className="mb-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-white/10">
              GuideXpert student workspace
            </p>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Predict rank.
              <br />
              Compare colleges.
              <br />
              <span className="text-emerald-300">Find your fit.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-300 lg:mx-0 lg:text-lg">
              Enter your marks or rank to discover best-fit colleges, branches, and admission chances — instantly.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button
                type="button"
                onClick={onStartPrediction}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Start prediction
              </button>
              <button
                type="button"
                onClick={onExploreTools}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Explore tools <LuArrowRight className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
              {[
                { value: '500+', label: 'Colleges' },
                { value: '40k+', label: 'Cutoff records' },
                { value: '10+', label: 'Smart tools' },
                { value: 'AI', label: 'Fit tests' },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xl font-semibold text-white sm:text-2xl">{stat.value}</dt>
                  <dd className="mt-0.5 text-xs text-slate-400">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="w-full min-w-0 flex-1 lg:max-w-[520px]">
            <StudentsHeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
