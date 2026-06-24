import { useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import {
  swBtnPrimary,
  swBtnSecondary,
  swError,
  swInsightsPanel,
  swInput,
  swLabel,
  swPreviewLabel,
  swProgressBar,
  swProgressTrack,
  swResultCard,
  swResultsHighlight,
  swSectionSubtitle,
  swSectionTitle,
  swWorkspaceTitle,
} from './components/studentWorkspaceUi';

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
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className={swPreviewLabel}>Match scan</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
              <FiSearch className="h-3 w-3" aria-hidden />
              {PREVIEW_DEMO.matchesFound} matches
            </span>
          </div>
          <div>
            <p className={swPreviewLabel}>Matches found</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900">{PREVIEW_DEMO.matchesFound}</p>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>High chance colleges</span>
              <span className="tabular-nums text-slate-700">
                {PREVIEW_DEMO.highChance} / {PREVIEW_DEMO.matchesFound}
              </span>
            </div>
            <div className={`mt-1.5 ${swProgressTrack}`}>
              <div className="h-full rounded-full bg-rose-400" style={{ width: `${highChancePct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Pool coverage</span>
              <span className="tabular-nums text-slate-700">{PREVIEW_DEMO.poolCoverage}%</span>
            </div>
            <div className={`mt-1.5 ${swProgressTrack}`}>
              <div className={swProgressBar} style={{ width: `${PREVIEW_DEMO.poolCoverage}%` }} />
            </div>
          </div>
        </div>
      }
      results={
        results.length ? (
          <section ref={resultsRef} tabIndex={-1} className={swResultsHighlight}>
            <h2 className={swSectionTitle}>Results</h2>
            <p className={swSectionSubtitle}>
              Chance is an estimate based on your inputs and mock historical trends.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((item) => (
                <article key={item.name} className={swResultCard}>
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">Branches: {item.branches}</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">Admission chance: {item.chance}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className={swBtnSecondary}>
                      View details
                    </button>
                    <button type="button" className={swBtnPrimary}>
                      Compare
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
          <section className={swInsightsPanel}>
            <h3 className={swSectionTitle}>Next steps</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Keep at least 2 high chance and 2 medium chance colleges in your final shortlist.</li>
              <li>Use Compare to evaluate fees, placements, and branch outcomes before locking choices.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <div>
        <h2 className={swWorkspaceTitle}>Your profile</h2>
        <p className={swSectionSubtitle}>Enter rank, category, and state to generate matches.</p>
      </div>
      <form className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" onSubmit={onSubmit}>
        <label className={swLabel}>
          Rank
          <input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 12430"
            value={form.rank}
            onChange={(e) => onChange('rank', e.target.value)}
            className={swInput}
          />
          {errors.rank ? <span className={swError}>{errors.rank}</span> : null}
        </label>
        <label className={swLabel}>
          Category
          <input
            placeholder="e.g. General"
            value={form.category}
            onChange={(e) => onChange('category', e.target.value)}
            className={swInput}
          />
          {errors.category ? <span className={swError}>{errors.category}</span> : null}
        </label>
        <label className={`${swLabel} sm:col-span-2 lg:col-span-1`}>
          State preference
          <input
            placeholder="e.g. Tamil Nadu"
            value={form.state}
            onChange={(e) => onChange('state', e.target.value)}
            className={swInput}
          />
          {errors.state ? <span className={swError}>{errors.state}</span> : null}
        </label>
        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" className={`${swBtnPrimary} w-full sm:w-auto`}>
            Generate matches
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
