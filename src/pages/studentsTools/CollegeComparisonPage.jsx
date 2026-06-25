import { useRef, useState } from 'react';
import { FiColumns } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import {
  swBtnPrimary,
  swBtnTag,
  swError,
  swInsightsPanel,
  swInput,
  swLabel,
  swPreviewLabel,
  swProgressBar,
  swProgressTrack,
  swResultCard,
  swResultsHighlight,
  swSectionSubtitle,
  swSectionTitle,
  swWorkspaceTitle,
} from './components/studentWorkspaceUi';

function VsBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 ${className}`}
    >
      VS
    </span>
  );
}

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
      compactHero
      howItWorks={[
        'Core metrics are evaluated side-by-side for both institutions.',
        'Each metric highlights the stronger value based on predefined rules.',
        'The matrix helps you make a balanced decision across outcomes and cost.',
      ]}
      whatThisToolDoes={[
        'Provides a quick VS view across packages, placements, fees, and ranking.',
        'Highlights better-value metrics to support final college decision making.',
      ]}
      inputGuide={[
        'Institution A: First college you want to evaluate.',
        'Institution B: Second college for direct comparison.',
      ]}
      preview={
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={swPreviewLabel}>Comparison mode</p>
              <p className="mt-0.5 font-semibold text-slate-900">VS matrix</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FiColumns className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Package delta (demo)</span>
              <span className="text-slate-700">A leads</span>
            </div>
            <div className={`mt-1.5 ${swProgressTrack}`}>
              <div className={swProgressBar} style={{ width: '62%' }} />
            </div>
          </div>
        </div>
      }
      results={
        result ? (
          <section ref={resultsRef} tabIndex={-1} className={swResultsHighlight}>
            <h2 className={swSectionTitle}>Comparison results</h2>
            <p className={swSectionSubtitle}>Highlighted values show the stronger option for each metric.</p>
            <div className={`mt-5 ${swResultCard}`}>
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-center">
                <span className="max-w-48 truncate font-medium text-slate-900" title={result.institutionA}>
                  {result.institutionA}
                </span>
                <VsBadge />
                <span className="max-w-48 truncate font-medium text-slate-900" title={result.institutionB}>
                  {result.institutionB}
                </span>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Metric</th>
                      <th className="max-w-40 px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400" title={result.institutionA}>
                        {truncateLabel(result.institutionA, 18)}
                      </th>
                      <th className="max-w-40 px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400" title={result.institutionB}>
                        {truncateLabel(result.institutionB, 18)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.metric} className="border-b border-slate-100">
                        <td className="px-3 py-2.5 font-medium text-slate-900">{row.metric}</td>
                        <td className={`px-3 py-2.5 ${row.better === 'a' ? 'bg-emerald-50 font-semibold text-emerald-800' : 'text-slate-600'}`}>
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            {row.aValue}
                            {row.better === 'a' ? <span className={swBtnTag}>Better</span> : null}
                          </span>
                        </td>
                        <td className={`px-3 py-2.5 ${row.better === 'b' ? 'bg-emerald-50 font-semibold text-emerald-800' : 'text-slate-600'}`}>
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            {row.bValue}
                            {row.better === 'b' ? <span className={swBtnTag}>Better</span> : null}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden" aria-label="Comparison by metric">
                {result.rows.map((row) => (
                  <li key={row.metric} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{row.metric}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-center text-sm ${row.better === 'a' ? 'bg-emerald-50 font-semibold' : 'bg-white'}`}>
                        <span className="block text-[10px] uppercase text-slate-400">A</span>
                        <span className="tabular-nums">{row.aValue}</span>
                      </div>
                      <VsBadge className="scale-90" />
                      <div className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-center text-sm ${row.better === 'b' ? 'bg-emerald-50 font-semibold' : 'bg-white'}`}>
                        <span className="block text-[10px] uppercase text-slate-400">B</span>
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
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>If budget is tight, prioritize the lower-fee option unless the package gap is large.</li>
              <li>Use this matrix together with branch preference and campus fit for your final choice.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <div>
        <h2 className={swWorkspaceTitle}>Enter both institutions</h2>
        <p className={swSectionSubtitle}>We’ll compare packages, placements, fees, and ranking side by side.</p>
      </div>

      <form className="mt-6 space-y-6" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_auto_1fr] md:items-end md:gap-4">
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

          <div className="flex justify-center md:pb-1">
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

        <button type="submit" className={`${swBtnPrimary} w-full md:w-auto`}>
          Run comparison
        </button>
      </form>
    </ToolWorkspaceLayout>
  );
}
