import { useState } from 'react';
import {
  CATEGORIES,
  STATES,
  mockCollegesForRank,
} from '../../data/studentDashboardMock';

export default function CollegePredictorPanel() {
  const [rank, setRank] = useState('12000');
  const [category, setCategory] = useState('GENERAL');
  const [state, setState] = useState('Tamil Nadu');
  const [results, setResults] = useState(null);

  const run = () => {
    setResults(mockCollegesForRank(rank, category, state));
  };

  return (
    <section
      id="college-predictor"
      className="scroll-mt-24 border-b-2 border-black bg-white px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="college-predictor-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="college-predictor-heading"
          className="sd-font-display text-2xl font-extrabold text-[#0F172A] sm:text-3xl"
          style={{ fontWeight: 800 }}
        >
          College Predictor
        </h2>
        <p className="mt-2 text-slate-600">Suggested colleges based on rank, category, and state (demo data).</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sd-card-brutal bg-[#F8FAFC] p-6">
              <div className="mb-4 h-2 w-full rounded-t-[12px] border-2 border-black bg-[#F7B5B5]" />
              <label htmlFor="cp-rank" className="block text-sm font-bold">
                Rank
              </label>
              <input
                id="cp-rank"
                type="number"
                min={1}
                className="sd-input mt-2"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
              />
              <label htmlFor="cp-cat" className="mt-4 block text-sm font-bold">
                Category
              </label>
              <select
                id="cp-cat"
                className="sd-input mt-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label htmlFor="cp-state" className="mt-4 block text-sm font-bold">
                State
              </label>
              <select
                id="cp-state"
                className="sd-input mt-2"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="button" className="sd-btn-primary mt-6 w-full" onClick={run}>
                Find colleges
              </button>
            </div>
          </div>
          <div className="lg:col-span-2">
            {results && (
              <ul className="space-y-4" key={`${rank}-${category}-${state}`}>
                {results.map((row) => (
                  <li
                    key={row.name}
                    className="sd-result-fade-in sd-card-brutal bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="sd-font-display text-xl font-extrabold">{row.name}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {row.possibleBranches.map((b) => (
                            <span
                              key={b}
                              className="inline-flex rounded-full border-2 border-black bg-[#B7E5FF]/60 px-3 py-1 text-xs font-bold text-[#0F172A]"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`rounded-lg border-2 border-black px-3 py-1 text-sm font-extrabold ${
                          row.chance === 'High'
                            ? 'bg-[#C7F36B]'
                            : row.chance === 'Medium'
                              ? 'bg-[#FFE89A]'
                              : 'bg-[#F7B5B5]'
                        }`}
                      >
                        Chance: {row.chance}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!results && (
              <p className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                Run the predictor to see suggested colleges.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
