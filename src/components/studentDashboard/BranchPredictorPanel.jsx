import { useState } from 'react';
import { COLLEGE_NAMES, branchesForCollege } from '../../data/studentDashboardMock';

export default function BranchPredictorPanel() {
  const [rank, setRank] = useState('8500');
  const [college, setCollege] = useState(COLLEGE_NAMES[0]);
  const [branches, setBranches] = useState(null);

  const predict = () => {
    setBranches(branchesForCollege(college));
  };

  return (
    <section
      id="branch-predictor"
      className="scroll-mt-24 border-b-2 border-black bg-[#F8FAFC] px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="branch-predictor-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="branch-predictor-heading"
          className="sd-font-display text-2xl font-extrabold text-[#0F172A] sm:text-3xl"
          style={{ fontWeight: 800 }}
        >
          Branch Predictor
        </h2>
        <p className="mt-2 text-slate-600">Pick rank and college to preview possible branches (demo).</p>
        <div className="mt-8 max-w-2xl">
          <div className="sd-card-brutal bg-white p-6">
            <div className="mb-4 h-2 w-full rounded-t-[12px] border-2 border-black bg-[#B7E5FF]" />
            <label htmlFor="bp-rank" className="block text-sm font-bold">
              Rank
            </label>
            <input
              id="bp-rank"
              type="number"
              className="sd-input mt-2"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
            />
            <label htmlFor="bp-college" className="mt-4 block text-sm font-bold">
              College
            </label>
            <select
              id="bp-college"
              className="sd-input mt-2"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            >
              {COLLEGE_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button type="button" className="sd-btn-primary mt-6" onClick={predict}>
              Show branches
            </button>
          </div>
          {branches && (
            <div
              key={college}
              className="sd-result-fade-in sd-card-brutal mt-8 border-[#000] bg-[#FFE89A]/40 p-6"
            >
              <p className="text-sm font-bold uppercase tracking-wide text-slate-700">Possible branches</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {branches.map((b) => (
                  <span
                    key={b}
                    className="inline-flex rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-extrabold text-[#0F172A] shadow-[4px_4px_0_#000]"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
