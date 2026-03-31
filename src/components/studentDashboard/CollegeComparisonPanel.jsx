import { useState, useMemo } from 'react';
import { COLLEGE_NAMES, COMPARISON_STATS } from '../../data/studentDashboardMock';

const ROWS = [
  { key: 'avgPackage', label: 'Average Package' },
  { key: 'fees', label: 'Fees' },
  { key: 'placementPct', label: 'Placement %' },
  { key: 'ranking', label: 'Ranking' },
  { key: 'campusSize', label: 'Campus Size' },
];

export default function CollegeComparisonPanel() {
  const [a, setA] = useState(COLLEGE_NAMES[0]);
  const [b, setB] = useState(COLLEGE_NAMES[2]);

  const statsA = useMemo(() => COMPARISON_STATS[a], [a]);
  const statsB = useMemo(() => COMPARISON_STATS[b], [b]);

  return (
    <section
      id="college-comparison"
      className="scroll-mt-24 border-b-2 border-black bg-white px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="college-comparison-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="college-comparison-heading"
          className="sd-font-display text-2xl font-extrabold text-[#0F172A] sm:text-3xl"
          style={{ fontWeight: 800 }}
        >
          College comparison
        </h2>
        <p className="mt-2 text-slate-600">Pick two colleges and compare key stats side by side.</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="cmp-a" className="block text-sm font-bold">
              College A
            </label>
            <select
              id="cmp-a"
              className="sd-input mt-2"
              value={a}
              onChange={(e) => setA(e.target.value)}
            >
              {COLLEGE_NAMES.map((n) => (
                <option key={n} value={n} disabled={n === b}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px] flex-1">
            <label htmlFor="cmp-b" className="block text-sm font-bold">
              College B
            </label>
            <select
              id="cmp-b"
              className="sd-input mt-2"
              value={b}
              onChange={(e) => setB(e.target.value)}
            >
              {COLLEGE_NAMES.map((n) => (
                <option key={n} value={n} disabled={n === a}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-8 overflow-x-auto rounded-[14px] border-2 border-black shadow-[4px_4px_0_#000]">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#0F172A] text-white">
                <th scope="col" className="border-2 border-black px-4 py-3 font-extrabold">
                  Metric
                </th>
                <th scope="col" className="border-2 border-black px-4 py-3 font-extrabold">
                  {a}
                </th>
                <th scope="col" className="border-2 border-black px-4 py-3 font-extrabold">
                  {b}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.key}
                  className={i % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}
                >
                  <th
                    scope="row"
                    className="border-2 border-black px-4 py-3 font-bold text-[#0F172A]"
                  >
                    {row.label}
                  </th>
                  <td className="border-2 border-black px-4 py-3 font-semibold tabular-nums">
                    {statsA[row.key]}
                  </td>
                  <td className="border-2 border-black px-4 py-3 font-semibold tabular-nums">
                    {statsB[row.key]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
