import { useRef, useState } from 'react';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';

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
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
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
      whatThisToolDoes={[
        'Provides a quick VS view across packages, placements, fees, and ranking.',
        'Highlights better-value metrics to support final college decision making.',
      ]}
      inputGuide={[
        'Institution A: First college you want to evaluate.',
        'Institution B: Second college for direct comparison.',
      ]}
      preview={
        <div className="space-y-2 text-sm font-bold">
          <p>Comparison Mode: VS Matrix</p>
          <p>Tracked Metrics: 4 core indicators</p>
        </div>
      }
      results={
        result ? (
          <section ref={resultsRef} className="rounded-[14px] border-2 border-black bg-[#FFE89A]/45 p-6 shadow-[4px_4px_0px_#000]">
            <h2 className="text-2xl font-black text-[#0F172A]">Results Panel</h2>
            <p className="mt-1 text-sm text-slate-600">How to read this result: highlighted cells indicate the better value for that metric.</p>
            <div className="mt-4 rounded-[12px] border-2 border-black bg-white p-4">
              <div className="mb-4 flex items-center justify-center gap-4 text-sm font-black sm:text-base">
                <span>{result.institutionA}</span>
                <span className="rounded-full border-2 border-black bg-[#C7F36B] px-3 py-1">VS</span>
                <span>{result.institutionB}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="border-b-2 border-black py-2">Metric</th>
                      <th className="border-b-2 border-black py-2">{result.institutionA}</th>
                      <th className="border-b-2 border-black py-2">{result.institutionB}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.metric}>
                        <td className="border-b border-slate-200 py-2 font-semibold">{row.metric}</td>
                        <td className={`border-b border-slate-200 py-2 ${row.better === 'a' ? 'font-black text-[#0F172A]' : 'text-slate-600'}`}>
                          {row.aValue}
                        </td>
                        <td className={`border-b border-slate-200 py-2 ${row.better === 'b' ? 'font-black text-[#0F172A]' : 'text-slate-600'}`}>
                          {row.bValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null
      }
      insights={
        result ? (
          <section className="rounded-[14px] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000]">
            <h3 className="text-xl font-black text-[#0F172A]">Next Step Suggestions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>If budget is tight, prioritize the lower-fee option unless package gap is large.</li>
              <li>Use this matrix together with branch preference and campus fit for final choice.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className="text-2xl font-black text-[#0F172A]">Input Workspace</h2>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <label className="text-sm font-semibold text-[#0F172A]">
          Institution A
          <input value={a} onChange={(e) => setA(e.target.value)} className="mt-1 w-full rounded-[10px] border-2 border-black px-3 py-2" />
          {errors.a ? <span className="mt-1 block text-xs text-red-600">{errors.a}</span> : null}
        </label>
        <label className="text-sm font-semibold text-[#0F172A]">
          Institution B
          <input value={b} onChange={(e) => setB(e.target.value)} className="mt-1 w-full rounded-[10px] border-2 border-black px-3 py-2" />
          {errors.b ? <span className="mt-1 block text-xs text-red-600">{errors.b}</span> : null}
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-[12px] border-2 border-black bg-[#C7F36B] px-5 py-2.5 text-sm font-black shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-0.5"
          >
            Run Comparison
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
