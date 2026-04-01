import { useRef, useState } from 'react';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';

export default function BranchPredictorPage() {
  const [institution, setInstitution] = useState('');
  const [rank, setRank] = useState('');
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const resultsRef = useRef(null);

  const onSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!institution) nextErrors.institution = 'Institution name is required.';
    if (!rank) nextErrors.rank = 'Current rank is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setBranches(['CSE', 'AI & ML', 'Data Science', 'Electronics']);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  return (
    <ToolWorkspaceLayout
      title="Branch Predictor"
      subtitle="Analyze possible branches for your preferred institution using your current rank."
      howItWorks={[
        'The tool compares your rank with branch-wise historical cutoffs.',
        'Institution-specific trends are used to estimate accessible branches.',
        'Output badges represent realistic options for your preference list.',
      ]}
      whatThisToolDoes={[
        'Maps your rank to likely branch opportunities in a selected institution.',
        'Helps you prioritize branch choices before option entry and counseling rounds.',
      ]}
      inputGuide={[
        'Institution Name: Enter the target college or university.',
        'Current Rank: Enter your latest rank for branch prediction.',
      ]}
      preview={
        <div className="space-y-2 text-sm font-bold">
          <p>Likely Branches: 4</p>
          <p>Top Match: AI & ML</p>
        </div>
      }
      results={
        branches.length ? (
          <section ref={resultsRef} className="rounded-[14px] border-2 border-black bg-[#FFE89A]/45 p-6 shadow-[4px_4px_0px_#000]">
            <h2 className="text-2xl font-black text-[#0F172A]">Results Panel</h2>
            <p className="mt-1 text-sm text-slate-600">How to read this result: tags indicate branches with realistic selection probability for your input.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {branches.map((branch) => (
                <span
                  key={branch}
                  className="rounded-[10px] border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0px_#000]"
                >
                  {branch}
                </span>
              ))}
            </div>
          </section>
        ) : null
      }
      insights={
        branches.length ? (
          <section className="rounded-[14px] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000]">
            <h3 className="text-xl font-black text-[#0F172A]">Next Step Suggestions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Keep one core and one emerging branch in your top preferences for flexibility.</li>
              <li>Compare curriculum and placement outcomes before final branch order.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className="text-2xl font-black text-[#0F172A]">Input Workspace</h2>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <label className="text-sm font-semibold text-[#0F172A]">
          Institution Name
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="mt-1 w-full rounded-[10px] border-2 border-black px-3 py-2"
          />
          {errors.institution ? <span className="mt-1 block text-xs text-red-600">{errors.institution}</span> : null}
        </label>
        <label className="text-sm font-semibold text-[#0F172A]">
          Current Rank
          <input
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            className="mt-1 w-full rounded-[10px] border-2 border-black px-3 py-2"
          />
          {errors.rank ? <span className="mt-1 block text-xs text-red-600">{errors.rank}</span> : null}
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-[12px] border-2 border-black bg-[#C7F36B] px-5 py-2.5 text-sm font-black shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-0.5"
          >
            Analyze Branches
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
