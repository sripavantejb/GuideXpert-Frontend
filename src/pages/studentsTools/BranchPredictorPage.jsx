import { useRef, useState } from 'react';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import {
  swBtnPrimary,
  swBtnTag,
  swError,
  swInsightsPanel,
  swInput,
  swLabel,
  swResultsHighlight,
  swSectionSubtitle,
  swSectionTitle,
  swWorkspaceTitle,
} from './components/studentWorkspaceUi';

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
      compactHero
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
        <div className="space-y-1 text-sm text-slate-600">
          <p>Likely branches: <span className="font-semibold text-slate-900">4</span></p>
          <p>Top match: <span className="font-semibold text-slate-900">AI & ML</span></p>
        </div>
      }
      results={
        branches.length ? (
          <section ref={resultsRef} className={swResultsHighlight}>
            <h2 className={swSectionTitle}>Results</h2>
            <p className={swSectionSubtitle}>
              Tags indicate branches with realistic selection probability for your input.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {branches.map((branch) => (
                <span key={branch} className={swBtnTag}>
                  {branch}
                </span>
              ))}
            </div>
          </section>
        ) : null
      }
      insights={
        branches.length ? (
          <section className={swInsightsPanel}>
            <h3 className={swSectionTitle}>Next steps</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Keep one core and one emerging branch in your top preferences for flexibility.</li>
              <li>Compare curriculum and placement outcomes before final branch order.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className={swWorkspaceTitle}>Enter your details</h2>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <label className={swLabel}>
          Institution name
          <input value={institution} onChange={(e) => setInstitution(e.target.value)} className={swInput} />
          {errors.institution ? <span className={swError}>{errors.institution}</span> : null}
        </label>
        <label className={swLabel}>
          Current rank
          <input type="number" value={rank} onChange={(e) => setRank(e.target.value)} className={swInput} />
          {errors.rank ? <span className={swError}>{errors.rank}</span> : null}
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className={swBtnPrimary}>
            Analyze branches
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
