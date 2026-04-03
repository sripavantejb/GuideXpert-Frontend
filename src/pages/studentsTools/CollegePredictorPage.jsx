import { useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';

const PREVIEW_DEMO = {
  matchesFound: 12,
  highChance: 5,
  poolCoverage: 82,
};

const SAMPLE_COLLEGES = [
  { name: 'VIT University', branches: 'CSE, AI', chance: 'Medium' },
  { name: 'SRM Institute', branches: 'CSE, Data Science', chance: 'High' },
  { name: 'MIT Manipal', branches: 'ECE, IT', chance: 'Medium' },
];

const inputClass =
  'mt-1.5 w-full min-h-[44px] rounded-[12px] border-[3px] border-black bg-white px-3 py-2 text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c7f36b]/80 focus:ring-offset-2';

export default function CollegePredictorPage() {
  const [form, setForm] = useState({ rank: '', category: '', state: '' });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState([]);
  const resultsRef = useRef(null);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.rank) nextErrors.rank = 'Rank is required.';
    if (!form.category) nextErrors.category = 'Category is required.';
    if (!form.state) nextErrors.state = 'State preference is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setResults(SAMPLE_COLLEGES);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const highChancePct = Math.round((PREVIEW_DEMO.highChance / PREVIEW_DEMO.matchesFound) * 100);

  return (
    <ToolWorkspaceLayout
      title="College Predictor"
      subtitle="Generate likely college matches using your rank, category, and state preference."
      compactHero
      howItWorks={[
        'Your rank and category are compared with historical opening and closing ranks.',
        'State preference filters the college pool to relevant institutions.',
        'The system tags each match by estimated admission probability.',
      ]}
      whatThisToolDoes={[
        'Builds a shortlist of colleges where your profile has realistic admission probability.',
        'Helps separate safe, target, and ambitious options for better counseling decisions.',
      ]}
      inputGuide={[
        'Rank: Your current or expected entrance exam rank.',
        'Category: Your applicable admission category for cutoff matching.',
        'State Preference: Preferred state for location-based college filtering.',
      ]}
      preview={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 sm:text-[10px]">Match scan</p>
            <span className="inline-flex items-center gap-1 rounded-md border-2 border-black bg-[#F7B5B5] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#0F172A] shadow-[2px_2px_0_#000] sm:text-[10px]">
              <FiSearch className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
              {PREVIEW_DEMO.matchesFound} matches
            </span>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 sm:text-[10px]">Matches found</p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xl font-black tabular-nums tracking-tight text-[#0F172A] sm:text-2xl">
                {PREVIEW_DEMO.matchesFound}
              </span>
              <span className="inline-flex rounded-md border-2 border-black bg-[#c7f36b] p-0.5 shadow-[2px_2px_0_#000]">
                <FiSearch className="h-3.5 w-3.5 text-[#0F172A]" aria-hidden />
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 sm:text-[10px]">
              <span>High chance colleges</span>
              <span className="tabular-nums text-[#0F172A]">
                {PREVIEW_DEMO.highChance} / {PREVIEW_DEMO.matchesFound}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full border-2 border-black bg-white shadow-[2px_2px_0_#000]">
              <div
                className="h-full rounded-full bg-[#F7B5B5]"
                style={{ width: `${highChancePct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 sm:text-[10px]">
              <span>Pool coverage</span>
              <span className="tabular-nums text-[#0F172A]">{PREVIEW_DEMO.poolCoverage}%</span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium leading-snug text-slate-500 sm:text-xs">After rank + category filter</p>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full border-2 border-black bg-white shadow-[2px_2px_0_#000]">
              <div
                className="h-full rounded-full bg-[#c7f36b]"
                style={{ width: `${PREVIEW_DEMO.poolCoverage}%` }}
              />
            </div>
          </div>
        </div>
      }
      results={
        results.length ? (
          <section
            ref={resultsRef}
            tabIndex={-1}
            className="animate-[fadeIn_0.35s_ease] rounded-[14px] border-[3px] border-black bg-[#F7B5B5]/40 p-6 shadow-[6px_6px_0_#000] sm:p-8"
          >
            <h2 className="text-2xl font-black text-[#0F172A]">Results panel</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              How to read this result: chance is an estimate based on your inputs and mock historical trends.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((item) => (
                <article
                  key={item.name}
                  className="rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000]"
                >
                  <h3 className="text-base font-black text-[#0F172A]">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">Branches: {item.branches}</p>
                  <p className="mt-2 text-sm font-semibold text-[#0F172A]">Admission chance: {item.chance}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-[10px] border-[3px] border-black bg-[#B7E5FF] px-2.5 py-1.5 text-xs font-black shadow-[2px_2px_0_#000]"
                    >
                      View details
                    </button>
                    <button
                      type="button"
                      className="rounded-[10px] border-[3px] border-black bg-[#c7f36b] px-2.5 py-1.5 text-xs font-black shadow-[2px_2px_0_#000]"
                    >
                      Compare
                    </button>
                    <button
                      type="button"
                      className="rounded-[10px] border-[3px] border-black bg-[#c7f36b] px-2.5 py-1.5 text-xs font-black shadow-[2px_2px_0_#000]"
                    >
                      Save
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null
      }
      insights={
        results.length ? (
          <section className="rounded-[14px] border-[3px] border-black border-l-[5px] border-l-[#c7f36b] bg-white p-6 pl-5 shadow-[6px_6px_0_#000] sm:p-8 sm:pl-6">
            <h3 className="text-xl font-black text-[#0F172A]">Next step suggestions</h3>
            <ul className="mt-4 space-y-2">
              <li className="rounded-[10px] border-2 border-black bg-[#F8FAFC] px-3 py-2.5 text-sm font-medium text-slate-700 shadow-[2px_2px_0_#000]">
                Keep at least 2 high chance and 2 medium chance colleges in your final shortlist.
              </li>
              <li className="rounded-[10px] border-2 border-black bg-[#F8FAFC] px-3 py-2.5 text-sm font-medium text-slate-700 shadow-[2px_2px_0_#000]">
                Use Compare to evaluate fees, placements, and branch outcomes before locking choices.
              </li>
            </ul>
          </section>
        ) : null
      }
    >
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Input workspace</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-[#0F172A]">Your profile</h2>
        <p className="mt-1 text-sm font-medium text-slate-600">Enter rank, category, and state to generate matches.</p>
      </div>
      <form className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" onSubmit={onSubmit}>
        <label className="text-sm font-black text-[#0F172A]">
          Rank
          <input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 12430"
            value={form.rank}
            onChange={(e) => onChange('rank', e.target.value)}
            className={inputClass}
          />
          {errors.rank ? <span className="mt-1.5 block text-xs font-semibold text-red-600">{errors.rank}</span> : null}
        </label>
        <label className="text-sm font-black text-[#0F172A]">
          Category
          <input
            placeholder="e.g. General"
            value={form.category}
            onChange={(e) => onChange('category', e.target.value)}
            className={inputClass}
          />
          {errors.category ? (
            <span className="mt-1.5 block text-xs font-semibold text-red-600">{errors.category}</span>
          ) : null}
        </label>
        <label className="text-sm font-black text-[#0F172A] sm:col-span-2 lg:col-span-1">
          State preference
          <input
            placeholder="e.g. Tamil Nadu"
            value={form.state}
            onChange={(e) => onChange('state', e.target.value)}
            className={inputClass}
          />
          {errors.state ? <span className="mt-1.5 block text-xs font-semibold text-red-600">{errors.state}</span> : null}
        </label>
        <div className="sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full min-w-[200px] items-center justify-center rounded-[12px] border-[3px] border-black bg-[#c7f36b] px-6 text-sm font-black text-[#0F172A] shadow-[4px_4px_0_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:w-auto"
          >
            Generate matches
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
