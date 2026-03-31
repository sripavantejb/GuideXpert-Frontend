import { useState } from 'react';
import { STATES, filterCollegeFit } from '../../data/studentDashboardMock';

const BUDGET_OPTS = [
  { id: 'low', label: 'Under ₹3L / yr' },
  { id: 'medium', label: '₹3L – ₹8L / yr' },
  { id: 'high', label: '₹8L+ / yr' },
];

const CAMPUS_OPTS = [
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

const PLACEMENT_OPTS = [
  { id: 'medium', label: 'Balanced' },
  { id: 'high', label: 'Top priority' },
];

export default function CollegeFitPanel() {
  const [budget, setBudget] = useState('medium');
  const [cityPreference, setCityPreference] = useState('Karnataka');
  const [campusSize, setCampusSize] = useState('large');
  const [placementPriority, setPlacementPriority] = useState('high');
  const [list, setList] = useState(null);

  const run = () => {
    setList(
      filterCollegeFit({
        budget,
        cityPreference,
        campusSize,
        placementPriority,
      }),
    );
  };

  return (
    <section
      id="college-fit"
      className="scroll-mt-24 border-b-2 border-black bg-[#F8FAFC] px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="college-fit-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="college-fit-heading"
          className="sd-font-display text-2xl font-extrabold text-[#0F172A] sm:text-3xl"
          style={{ fontWeight: 800 }}
        >
          College Fit Test
        </h2>
        <p className="mt-2 text-slate-600">Match budget, city, campus, and placement goals (demo recommendations).</p>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="sd-card-brutal bg-white p-6">
            <div className="mb-4 h-2 rounded-t-[12px] border-2 border-black bg-[#FFE89A]" />
            <label htmlFor="cf-budget" className="block text-sm font-bold">
              Budget
            </label>
            <select
              id="cf-budget"
              className="sd-input mt-2"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              {BUDGET_OPTS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <label htmlFor="cf-city" className="mt-4 block text-sm font-bold">
              City preference (state)
            </label>
            <select
              id="cf-city"
              className="sd-input mt-2"
              value={cityPreference}
              onChange={(e) => setCityPreference(e.target.value)}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <label htmlFor="cf-campus" className="mt-4 block text-sm font-bold">
              Campus size
            </label>
            <select
              id="cf-campus"
              className="sd-input mt-2"
              value={campusSize}
              onChange={(e) => setCampusSize(e.target.value)}
            >
              {CAMPUS_OPTS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <label htmlFor="cf-place" className="mt-4 block text-sm font-bold">
              Placement priority
            </label>
            <select
              id="cf-place"
              className="sd-input mt-2"
              value={placementPriority}
              onChange={(e) => setPlacementPriority(e.target.value)}
            >
              {PLACEMENT_OPTS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <button type="button" className="sd-btn-primary mt-6 w-full" onClick={run}>
              Recommend colleges
            </button>
          </div>
          <div>
            {list && (
              <ul className="space-y-4">
                {list.map((c) => (
                  <li
                    key={c.name}
                    className="sd-result-fade-in sd-card-brutal flex gap-4 bg-white p-4"
                  >
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#B7E5FF] text-xs font-extrabold text-[#0F172A]"
                      aria-hidden
                    >
                      LOGO
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="sd-font-display text-lg font-extrabold">{c.name}</p>
                      <p className="text-sm text-slate-600">
                        {c.city}, {c.state}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold text-slate-700">
                        <span className="rounded border border-black/20 bg-slate-50 px-2 py-0.5">
                          Fees: {c.fees}
                        </span>
                        <span className="rounded border border-black/20 bg-slate-50 px-2 py-0.5">
                          {c.placement}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!list && (
              <p className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                Submit to see recommended colleges.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
