import { useRef, useState } from 'react';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import {
  swBtnPrimary,
  swError,
  swInsightsPanel,
  swInput,
  swLabel,
  swProgressBar,
  swProgressTrack,
  swResultCard,
  swResultsHighlight,
  swSectionSubtitle,
  swSectionTitle,
} from './components/studentWorkspaceUi';

const BRANCH_RESULTS = [
  { name: 'CSE', chance: 'High', fit: 88 },
  { name: 'AI & ML', chance: 'High', fit: 84 },
  { name: 'Data Science', chance: 'Medium', fit: 72 },
  { name: 'Electronics', chance: 'Medium', fit: 64 },
];

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
    setBranches(BRANCH_RESULTS);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  return (
    <ToolWorkspaceLayout
      title="Branch Predictor"
      subtitle="Estimate realistic branch opportunities for your preferred institution using current rank."
      compactHero
      howItWorks={[
        'The tool compares your rank with branch-wise historical cutoffs.',
        'Institution-specific trends estimate accessible branches.',
        'Results surface options with realistic selection probability.',
      ]}
      whatThisToolDoes={[
        'Maps your rank to likely branch opportunities in a selected institution.',
        'Helps you prioritize branch choices before option entry and counseling.',
      ]}
      inputGuide={[
        'Institution Name: Enter the target college or university.',
        'Current Rank: Enter your latest rank for branch prediction.',
      ]}
      preview={
        <div className="space-y-2 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a94a0]">Typical output</p>
          <p className="font-semibold text-[#041e30]">4 branch options with chance tags</p>
          <p className="text-[#5a6570]">Top illustration match: AI & ML</p>
        </div>
      }
      results={
        branches.length ? (
          <section ref={resultsRef} className={swResultsHighlight}>
            <h2 className={swSectionTitle}>Branch outlook</h2>
            <p className={swSectionSubtitle}>
              Indicative probabilities for <span className="font-semibold text-[#041e30]">{institution}</span> at rank{' '}
              <span className="font-semibold tabular-nums text-[#041e30]">{rank}</span>.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {branches.map((branch) => (
                <article key={branch.name} className={swResultCard}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-sw-display text-lg font-bold text-[#041e30]">
                      {branch.name}
                    </h3>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        branch.chance === 'High'
                          ? 'bg-[#fff4ed] text-[#c45a0c]'
                          : 'bg-[#eef2f7] text-[#2c3640]'
                      }`}
                    >
                      {branch.chance}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs font-semibold text-[#5a6570]">
                      <span>Relative likelihood</span>
                      <span className="tabular-nums text-[#041e30]">{branch.fit}%</span>
                    </div>
                    <div className={swProgressTrack}>
                      <div className={swProgressBar} style={{ width: `${branch.fit}%` }} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null
      }
      insights={
        branches.length ? (
          <section className={swInsightsPanel}>
            <h3 className={swSectionTitle}>Next steps</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#5a6570]">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Keep one core and one emerging branch in your top preferences for flexibility.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Compare curriculum and placement outcomes before final branch order.
              </li>
            </ul>
          </section>
        ) : null
      }
    >
      <div>
        <h2 className="text-lg font-bold text-[#111827] sm:text-xl">Enter branch prediction details</h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Get personalized branch recommendations in seconds!
        </p>
      </div>
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <label className={swLabel}>
          Institution name
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className={swInput}
            placeholder="e.g. NIT Trichy"
            autoComplete="organization"
          />
          {errors.institution ? <span className={swError}>{errors.institution}</span> : null}
        </label>
        <label className={swLabel}>
          Current rank
          <input
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            className={swInput}
            placeholder="e.g. 8420"
            inputMode="numeric"
          />
          {errors.rank ? <span className={swError}>{errors.rank}</span> : null}
        </label>
        <button type="submit" className={swBtnPrimary}>
          Predict My Branches
        </button>
      </form>
    </ToolWorkspaceLayout>
  );
}
