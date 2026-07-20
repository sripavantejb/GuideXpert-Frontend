import { useRef, useState } from 'react';
import { FiColumns } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import {
  ADMISSION_PREDICTOR_TOOLS,
  FIT_TEST_TOOLS,
} from '../../constants/studentWorkspaceTools';
import {
  swBtnPrimary,
  swError,
  swInsightsPanel,
  swInput,
  swLabel,
  swMetricBetter,
  swResultCard,
  swResultsHighlight,
  swSectionSubtitle,
  swSectionTitle,
} from './components/studentWorkspaceUi';

function VsBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#041e30] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white ${className}`}
    >
      VS
    </span>
  );
}

const RELATED = [
  ...ADMISSION_PREDICTOR_TOOLS.filter((t) =>
    ['college-predictor', 'branch-predictor', 'exam-predictor'].includes(t.id)
  ),
  ...FIT_TEST_TOOLS.filter((t) => t.id === 'college-fit'),
];

export default function CollegeComparisonPage() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  const onSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!a) nextErrors.a = 'Institution A is required.';
    if (!b) nextErrors.b = 'Institution B is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setResult({
      institutionA: a,
      institutionB: b,
      rows: [
        { metric: 'Average Package', aValue: '8.5 LPA', bValue: '7.2 LPA', better: 'a' },
        { metric: 'Placement %', aValue: '91%', bValue: '86%', better: 'a' },
        { metric: 'Fees', aValue: '14L', bValue: '11L', better: 'b' },
        { metric: 'Ranking', aValue: '24', bValue: '31', better: 'a' },
      ],
    });
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      resultsRef.current?.focus({ preventScroll: true });
    }, 60);
  };

  const truncateLabel = (s, max = 14) => {
    const t = (s || '').trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max)}…`;
  };

  return (
    <ToolWorkspaceLayout
      title="College Comparison"
      subtitle="Compare two institutions side-by-side and identify the stronger value choice."
      howItWorks={[
        'Core metrics are evaluated side-by-side for both institutions.',
        'Each metric highlights the stronger value based on predefined rules.',
        'The matrix helps you make a balanced decision across outcomes and cost.',
      ]}
      relatedTools={RELATED}
      results={
        result ? (
          <section ref={resultsRef} tabIndex={-1} className={swResultsHighlight}>
            <h2 className={swSectionTitle}>Comparison results</h2>
            <p className={swSectionSubtitle}>Highlighted values show the stronger option for each metric.</p>
            <div className={`mt-6 ${swResultCard}`}>
              <div className="mb-5 flex flex-wrap items-center justify-center gap-3 text-center">
                <span
                  className="max-w-48 truncate font-sw-display text-base font-bold text-[#041e30]"
                  title={result.institutionA}
                >
                  {result.institutionA}
                </span>
                <VsBadge />
                <span
                  className="max-w-48 truncate font-sw-display text-base font-bold text-[#041e30]"
                  title={result.institutionB}
                >
                  {result.institutionB}
                </span>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e4e9f0] text-left">
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a94a0]">
                        Metric
                      </th>
                      <th
                        className="max-w-40 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a94a0]"
                        title={result.institutionA}
                      >
                        {truncateLabel(result.institutionA, 18)}
                      </th>
                      <th
                        className="max-w-40 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a94a0]"
                        title={result.institutionB}
                      >
                        {truncateLabel(result.institutionB, 18)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.metric} className="border-b border-[#f0f3f7]">
                        <td className="px-3 py-3.5 font-semibold text-[#041e30]">{row.metric}</td>
                        <td className={`px-3 py-3.5 ${row.better === 'a' ? 'bg-[#fff4ed] font-semibold text-[#c45a0c]' : 'text-[#5a6570]'}`}>
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            {row.aValue}
                            {row.better === 'a' ? <span className={swMetricBetter}>Better</span> : null}
                          </span>
                        </td>
                        <td className={`px-3 py-3.5 ${row.better === 'b' ? 'bg-[#fff4ed] font-semibold text-[#c45a0c]' : 'text-[#5a6570]'}`}>
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            {row.bValue}
                            {row.better === 'b' ? <span className={swMetricBetter}>Better</span> : null}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden" aria-label="Comparison by metric">
                {result.rows.map((row) => (
                  <li key={row.metric} className="rounded-xl bg-[#f8fafc] p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a94a0]">{row.metric}</p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div
                        className={`min-w-0 flex-1 rounded-xl px-2 py-2 text-center text-sm ${
                          row.better === 'a' ? 'bg-[#fff4ed] font-semibold text-[#c45a0c]' : 'bg-white'
                        }`}
                      >
                        <span className="block text-[10px] uppercase text-[#8a94a0]">A</span>
                        <span className="tabular-nums">{row.aValue}</span>
                      </div>
                      <VsBadge className="scale-90" />
                      <div
                        className={`min-w-0 flex-1 rounded-xl px-2 py-2 text-center text-sm ${
                          row.better === 'b' ? 'bg-[#fff4ed] font-semibold text-[#c45a0c]' : 'bg-white'
                        }`}
                      >
                        <span className="block text-[10px] uppercase text-[#8a94a0]">B</span>
                        <span className="tabular-nums">{row.bValue}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null
      }
      insights={
        result ? (
          <section className={swInsightsPanel}>
            <h3 className={swSectionTitle}>Next steps</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#5a6570]">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                If budget is tight, prioritize the lower-fee option unless the package gap is large.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Use this matrix with branch preference and campus fit for your final choice.
              </li>
            </ul>
          </section>
        ) : null
      }
      afterHero={
        !result ? (
          <section className="rounded-2xl border border-[#e4e9f0] bg-white/90 px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f27921]">
                  How comparison works
                </p>
                <h2 className={`mt-2 ${swSectionTitle}`}>A clearer side-by-side view</h2>
                <p className={swSectionSubtitle}>
                  Enter two colleges above to see packages, placements, fees, and rankings in one matrix —
                  then use the suggestions below for predictors that deepen your shortlist.
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#041e30] text-white">
                <FiColumns className="h-6 w-6" aria-hidden />
              </div>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                { label: 'Packages & placements', detail: 'Spot which campus leads on outcomes.' },
                { label: 'Fees & ranking', detail: 'Balance cost against reputation signals.' },
                { label: 'Decision-ready', detail: 'Highlight the stronger value on each row.' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-[#f7f9fc] px-4 py-4">
                  <p className="text-sm font-semibold text-[#041e30]">{item.label}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5a6570]">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null
      }
    >
      <div>
        <h2 className="text-lg font-bold text-[#111827] sm:text-xl">Enter both institutions</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#6b7280]">
          We’ll compare packages, placements, fees, and ranking side by side.
        </p>
      </div>

      <form className="mt-8 space-y-7" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-7 md:grid md:grid-cols-[1fr_auto_1fr] md:items-end md:gap-5">
          <label className={`block min-w-0 ${swLabel}`}>
            Institution A
            <input
              value={a}
              onChange={(e) => setA(e.target.value)}
              className={swInput}
              placeholder="e.g. IIT Madras"
              autoComplete="organization"
              aria-invalid={!!errors.a}
            />
            {errors.a ? <span className={swError}>{errors.a}</span> : null}
          </label>

          <div className="flex justify-center md:pb-1.5">
            <VsBadge />
          </div>

          <label className={`block min-w-0 ${swLabel}`}>
            Institution B
            <input
              value={b}
              onChange={(e) => setB(e.target.value)}
              className={swInput}
              placeholder="e.g. NIT Trichy"
              autoComplete="organization"
              aria-invalid={!!errors.b}
            />
            {errors.b ? <span className={swError}>{errors.b}</span> : null}
          </label>
        </div>

        <button type="submit" className={`${swBtnPrimary} w-full`}>
          Run comparison
        </button>
      </form>
    </ToolWorkspaceLayout>
  );
}
