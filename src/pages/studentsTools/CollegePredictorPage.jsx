import { useRef, useState } from 'react';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';

const SAMPLE_COLLEGES = [
  { name: 'VIT University', branches: 'CSE, AI', chance: 'Medium' },
  { name: 'SRM Institute', branches: 'CSE, Data Science', chance: 'High' },
  { name: 'MIT Manipal', branches: 'ECE, IT', chance: 'Medium' },
];

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

  return (
    <ToolWorkspaceLayout
      title="College Predictor"
      subtitle="Generate likely college matches using your rank, category, and state preference."
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
        <div className="space-y-2 text-sm font-bold">
          <p>Matches Found: 12</p>
          <p>High Chance Colleges: 5</p>
        </div>
      }
      results={
        results.length ? (
          <section ref={resultsRef} className="rounded-[14px] border-2 border-black bg-[#F7B5B5]/35 p-6 shadow-[4px_4px_0px_#000]">
            <h2 className="text-2xl font-black text-[#0F172A]">Results Panel</h2>
            <p className="mt-1 text-sm text-slate-600">How to read this result: chance is an estimate based on current inputs and mock historical trends.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((item) => (
                <article
                  key={item.name}
                  className="rounded-[12px] border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000] transition-all hover:-translate-y-0.5"
                >
                  <h3 className="text-base font-black text-[#0F172A]">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">Branches: {item.branches}</p>
                  <p className="mt-2 text-sm font-semibold text-[#0F172A]">Admission Chance: {item.chance}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className="rounded-lg border-2 border-black bg-[#B7E5FF] px-2.5 py-1 text-xs font-bold">
                      View Details
                    </button>
                    <button type="button" className="rounded-lg border-2 border-black bg-[#FFE89A] px-2.5 py-1 text-xs font-bold">
                      Compare
                    </button>
                    <button type="button" className="rounded-lg border-2 border-black bg-[#C7F36B] px-2.5 py-1 text-xs font-bold">
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
          <section className="rounded-[14px] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000]">
            <h3 className="text-xl font-black text-[#0F172A]">Next Step Suggestions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Keep at least 2 high chance and 2 medium chance colleges in your final shortlist.</li>
              <li>Use Compare to evaluate fees, placements, and branch outcomes before locking choices.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className="text-2xl font-black text-[#0F172A]">Input Workspace</h2>
      <form className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={onSubmit}>
        <label className="text-sm font-semibold text-[#0F172A]">
          Rank
          <input
            type="number"
            value={form.rank}
            onChange={(e) => onChange('rank', e.target.value)}
            className="mt-1 w-full rounded-[10px] border-2 border-black px-3 py-2"
          />
          {errors.rank ? <span className="mt-1 block text-xs text-red-600">{errors.rank}</span> : null}
        </label>
        <label className="text-sm font-semibold text-[#0F172A]">
          Category
          <input
            value={form.category}
            onChange={(e) => onChange('category', e.target.value)}
            className="mt-1 w-full rounded-[10px] border-2 border-black px-3 py-2"
          />
          {errors.category ? <span className="mt-1 block text-xs text-red-600">{errors.category}</span> : null}
        </label>
        <label className="text-sm font-semibold text-[#0F172A]">
          State Preference
          <input
            value={form.state}
            onChange={(e) => onChange('state', e.target.value)}
            className="mt-1 w-full rounded-[10px] border-2 border-black px-3 py-2"
          />
          {errors.state ? <span className="mt-1 block text-xs text-red-600">{errors.state}</span> : null}
        </label>
        <div className="sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="rounded-[12px] border-2 border-black bg-[#C7F36B] px-5 py-2.5 text-sm font-black shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-0.5"
          >
            Generate Matches
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
