import { LuArrowRight } from 'react-icons/lu';
import { HERO_PREVIEW_DATA } from '../../utils/heroPreviewData';

const NeoButton = ({ children, primary = false, className = '', onClick }) => {
  const baseStyle =
    'font-bold rounded-[14px] px-6 py-3 border-2 border-[#0F172A] transition-all duration-150 flex items-center justify-center gap-2';
  const typeStyle = primary
    ? 'bg-[#c7f36b] text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-[#b0d95d] active:shadow-[0px_0px_0px_#0F172A] active:translate-y-[4px] active:translate-x-[4px]'
    : 'bg-white text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-slate-50 active:shadow-[0px_0px_0px_#0F172A] active:translate-y-[4px] active:translate-x-[4px]';

  return (
    <button type="button" className={`${baseStyle} ${typeStyle} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

function chanceColorClass(chanceColor) {
  if (chanceColor === 'emerald') return 'bg-emerald-100 text-emerald-800 border-emerald-400';
  if (chanceColor === 'amber') return 'bg-amber-100 text-amber-800 border-amber-400';
  return 'bg-red-100 text-red-800 border-red-400';
}

function HeroPreviewCard() {
  const preview = HERO_PREVIEW_DATA;

  return (
    <div className="mx-auto w-full max-w-[620px] min-w-0 overflow-hidden rounded-[14px] border-[3px] border-black bg-white shadow-[8px_8px_0px_#c7f36b]">
      <div className="border-b-2 border-black bg-[#0F172A] px-4 py-3 sm:px-5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sample preview</p>
        <h2 className="mt-0.5 text-lg font-black text-white sm:text-xl">JEE marks to rank</h2>
      </div>

      <div className="space-y-4 p-6 sm:p-7 lg:p-8">
        <div className="rounded-[10px] border-2 border-black bg-slate-50 p-4 shadow-[3px_3px_0px_#000]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Score
              </span>
              <span className="text-2xl font-black tabular-nums text-[#0F172A]">
                {preview.score}{' '}
                <span className="text-sm font-bold text-slate-400">/ {preview.maxScore}</span>
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Estimated rank
              </span>
              <span className="text-2xl font-black tabular-nums text-emerald-600">
                ~{preview.estRank.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-lg border-2 border-black bg-slate-200"
            role="presentation"
          >
            <div
              className="h-full bg-[#0F172A]"
              style={{ width: `${preview.scorePercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-xs font-bold sm:text-sm">
            <span className="text-[#0F172A]">Percentile</span>
            <span className="tabular-nums text-[#0F172A]">{preview.percentile.toFixed(3)}%</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full border-2 border-black bg-slate-100">
            <div
              className="h-full bg-black"
              style={{ width: `${Math.min(100, preview.scorePercent)}%` }}
            />
          </div>
        </div>

        <div className="border-t border-black/15 pt-3">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            College suggestions
          </span>
          <div className="space-y-2">
            {preview.colleges.map((col, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-[8px] border-2 border-black bg-white p-2 text-xs font-bold shadow-[2px_2px_0px_#000]"
              >
                <div>
                  <div className="text-[#0F172A]">{col.name}</div>
                  <div className="text-[10px] font-medium text-slate-400">{col.course}</div>
                </div>
                <span
                  className={`rounded-[6px] border-2 border-black px-2 py-0.5 text-[9px] font-bold uppercase ${chanceColorClass(col.chanceColor)}`}
                >
                  {col.chance} chance
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] font-medium text-slate-400">
          Example preview — start prediction for your score
        </p>
      </div>
    </div>
  );
}

export default function StudentsDashboardHero({ onStartPrediction, onExploreTools }) {
  return (
    <section className="relative flex min-h-[calc(100dvh-76px)] items-center overflow-hidden border-b-2 border-black bg-[#0F172A] py-8 sm:py-10 lg:py-12">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-6 xl:px-8">
        <div className="min-w-0 px-0 lg:pl-12 lg:pr-6">
          <div className="flex flex-col gap-10 sm:gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="min-w-0 flex-1 lg:max-w-[620px]">
              <p className="mb-4 inline-block rounded-full border-2 border-black bg-[#c7f36b] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0F172A] shadow-[3px_3px_0_#000]">
                GuideXpert · Rank &amp; college tools
              </p>

              <h1 className="mb-5 text-3xl font-black leading-[1.08] tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl">
                Predict Rank.
                <br />
                Compare Colleges.
                <br />
                Find Your Best Fit.
              </h1>

              <p className="mb-8 max-w-xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg">
                Enter your marks or rank and discover your best-fit colleges, branches, and admission
                chances instantly.
              </p>

              <div className="flex w-full min-w-0 flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
                <NeoButton
                  primary
                  className="w-full sm:w-auto sm:min-w-[220px]"
                  onClick={onStartPrediction}
                >
                  Start Prediction
                </NeoButton>
                <NeoButton
                  className="w-full sm:w-auto sm:min-w-[200px]"
                  onClick={onExploreTools}
                >
                  Explore Tools <LuArrowRight />
                </NeoButton>
              </div>

              <div className="mt-8 max-w-[540px] border-t border-slate-700 pt-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <div className="text-xl font-black text-[#c7f36b]">500+</div>
                    <div className="text-xs font-medium text-slate-400">Colleges</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-[#c7f36b]">40k+</div>
                    <div className="text-xs font-medium text-slate-400">Cutoff records</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-[#c7f36b]">10+</div>
                    <div className="text-xs font-medium text-slate-400">Smart tools</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-[#c7f36b]">AI-based</div>
                    <div className="text-xs font-medium text-slate-400">Fit tests</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full min-w-0 flex-1 lg:pl-4">
              <HeroPreviewCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
