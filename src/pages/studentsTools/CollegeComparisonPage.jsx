import { useRef, useState } from 'react';
import { FiColumns } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';

const inputClass =
  'mt-1.5 w-full min-h-11 rounded-[12px] border-[3px] border-black bg-white px-3 py-2.5 text-sm font-semibold text-[#0F172A] shadow-[2px_2px_0_#000] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c7f36b]/80 focus:ring-offset-2';

function VsBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-[#c7f36b] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#0F172A] shadow-[3px_3px_0_#000] ${className}`}
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
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comparison mode</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-lg font-black tracking-tight text-[#0F172A] sm:text-xl">VS Matrix</span>
                <span className="inline-flex rounded-md border-[3px] border-black bg-[#c7f36b] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#0F172A] shadow-[2px_2px_0_#000]">
                  4 metrics
                </span>
              </div>
            </div>
            <span className="inline-flex rounded-[10px] border-[3px] border-black bg-[#c7f36b] p-2 shadow-[3px_3px_0_#000]">
              <FiColumns className="h-5 w-5 text-[#0F172A]" aria-hidden />
            </span>
          </div>
          <div>
            <div className="flex justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Package delta (demo)</span>
              <span className="tabular-nums text-[#0F172A]">A leads</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[2px_2px_0_#000]">
              <div className="h-full w-[62%] rounded-full bg-[#c7f36b]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Placement spread (demo)</span>
              <span className="tabular-nums text-[#0F172A]">+5 pts</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[2px_2px_0_#000]">
              <div className="h-full w-[48%] rounded-full bg-[#c7f36b]" />
            </div>
          </div>
        </div>
      }
      results={
        result ? (
          <section
            ref={resultsRef}
            tabIndex={-1}
            className="animate-[fadeIn_0.35s_ease] rounded-[14px] border-[3px] border-black bg-[#c7f36b]/40 p-6 shadow-[6px_6px_0_#000] outline-none focus-visible:ring-2 focus-visible:ring-[#c7f36b] focus-visible:ring-offset-2"
          >
            <h2 className="text-2xl font-black tracking-tight text-[#0F172A] sm:text-3xl">Results panel</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Highlighted values show the stronger option for that metric (lower fees rank as better).
            </p>
            <div className="mt-4 rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000] sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-center sm:gap-4">
                <span
                  className="max-w-[min(100%,12rem)] truncate text-xs font-black text-[#0F172A] sm:max-w-56 sm:text-sm md:text-base"
                  title={result.institutionA}
                >
                  {result.institutionA}
                </span>
                <VsBadge />
                <span
                  className="max-w-[min(100%,12rem)] truncate text-xs font-black text-[#0F172A] sm:max-w-56 sm:text-sm md:text-base"
                  title={result.institutionB}
                >
                  {result.institutionB}
                </span>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-left">
                      <th className="border-b-[3px] border-black px-3 py-2.5 text-xs font-black uppercase tracking-wide text-[#0F172A]">
                        Metric
                      </th>
                      <th
                        className="max-w-40 border-b-[3px] border-black px-3 py-2.5 text-xs font-black uppercase tracking-wide text-[#0F172A]"
                        title={result.institutionA}
                      >
                        {truncateLabel(result.institutionA, 18)}
                      </th>
                      <th
                        className="max-w-40 border-b-[3px] border-black px-3 py-2.5 text-xs font-black uppercase tracking-wide text-[#0F172A]"
                        title={result.institutionB}
                      >
                        {truncateLabel(result.institutionB, 18)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.metric}>
                        <td className="border-b-2 border-slate-200 px-3 py-2.5 font-bold text-[#0F172A]">{row.metric}</td>
                        <td
                          className={`border-b-2 border-slate-200 px-3 py-2.5 ${
                            row.better === 'a' ? 'bg-[#c7f36b]/25 font-black text-[#0F172A]' : 'text-slate-600'
                          }`}
                        >
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            {row.aValue}
                            {row.better === 'a' ? (
                              <span className="rounded border-2 border-black bg-[#c7f36b] px-1.5 py-0 text-[10px] font-black uppercase">
                                Better
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td
                          className={`border-b-2 border-slate-200 px-3 py-2.5 ${
                            row.better === 'b' ? 'bg-[#c7f36b]/25 font-black text-[#0F172A]' : 'text-slate-600'
                          }`}
                        >
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            {row.bValue}
                            {row.better === 'b' ? (
                              <span className="rounded border-2 border-black bg-[#c7f36b] px-1.5 py-0 text-[10px] font-black uppercase">
                                Better
                              </span>
                            ) : null}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden" aria-label="Comparison by metric">
                {result.rows.map((row) => (
                  <li
                    key={row.metric}
                    className="rounded-[12px] border-[3px] border-black bg-[#F8FAFC] p-3 shadow-[3px_3px_0_#000]"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">{row.metric}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div
                        className={`min-w-0 flex-1 rounded-lg border-2 border-black px-2 py-1.5 text-center text-sm font-bold ${
                          row.better === 'a' ? 'bg-[#c7f36b]/30' : 'bg-white'
                        }`}
                      >
                        <span className="block truncate text-[10px] font-black uppercase text-slate-500">A</span>
                        <span className="min-w-0 break-words tabular-nums">{row.aValue}</span>
                      </div>
                      <VsBadge className="scale-90" />
                      <div
                        className={`min-w-0 flex-1 rounded-lg border-2 border-black px-2 py-1.5 text-center text-sm font-bold ${
                          row.better === 'b' ? 'bg-[#c7f36b]/30' : 'bg-white'
                        }`}
                      >
                        <span className="block truncate text-[10px] font-black uppercase text-slate-500">B</span>
                        <span className="min-w-0 break-words tabular-nums">{row.bValue}</span>
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
          <section className="rounded-[14px] border-[3px] border-black border-l-[6px] border-l-[#c7f36b] bg-white p-6 pl-5 shadow-[6px_6px_0_#000] sm:p-8 sm:pl-6">
            <h3 className="text-xl font-black tracking-tight text-[#0F172A] sm:text-2xl">Next step suggestions</h3>
            <ul className="mt-4 space-y-2.5" role="list">
              {[
                'If budget is tight, prioritize the lower-fee option unless the package gap is large.',
                'Use this matrix together with branch preference and campus fit for your final choice.',
              ].map((text) => (
                <li
                  key={text}
                  className="rounded-[10px] border-2 border-black bg-[#F8FAFC] px-3 py-2.5 text-sm font-medium leading-relaxed text-slate-700 shadow-[2px_2px_0_#000]"
                >
                  {text}
                </li>
              ))}
            </ul>
          </section>
        ) : null
      }
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Input workspace</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-[#0F172A] sm:text-3xl">Enter both institutions</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">We’ll run a side-by-side matrix on packages, placements, fees, and rank.</p>
      </div>

      <form className="mt-6 space-y-6" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_auto_1fr] md:items-end md:gap-4">
          <label className="block min-w-0 text-sm font-bold text-[#0F172A]">
            Institution A
            <input
              value={a}
              onChange={(e) => setA(e.target.value)}
              className={inputClass}
              placeholder="e.g. IIT Madras"
              autoComplete="organization"
              aria-invalid={!!errors.a}
            />
            {errors.a ? <span className="mt-1.5 block text-xs font-semibold text-red-600">{errors.a}</span> : null}
          </label>

          <div className="flex justify-center md:pb-1">
            <VsBadge className="md:translate-y-[-2px]" />
          </div>

          <label className="block min-w-0 text-sm font-bold text-[#0F172A]">
            Institution B
            <input
              value={b}
              onChange={(e) => setB(e.target.value)}
              className={inputClass}
              placeholder="e.g. NIT Trichy"
              autoComplete="organization"
              aria-invalid={!!errors.b}
            />
            {errors.b ? <span className="mt-1.5 block text-xs font-semibold text-red-600">{errors.b}</span> : null}
          </label>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            className="w-full min-h-11 min-w-[200px] rounded-[12px] border-[3px] border-black bg-[#c7f36b] px-6 py-3 text-sm font-black text-[#0F172A] shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#000] md:w-auto"
          >
            Run comparison
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
