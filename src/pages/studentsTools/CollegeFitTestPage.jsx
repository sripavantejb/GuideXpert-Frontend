import { useRef, useState } from 'react';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import {
  swBtnPrimary,
  swError,
  swInsightsPanel,
  swInput,
  swLabel,
  swResultCard,
  swResultsHighlight,
  swSectionSubtitle,
  swSectionTitle,
  swSelect,
  swWorkspaceTitle,
} from './components/studentWorkspaceUi';

const SUGGESTIONS = [
  { name: 'SRM Institute', avgPackage: '8.5 LPA', placementRate: '89%', fees: '14L' },
  { name: 'Amrita University', avgPackage: '7.8 LPA', placementRate: '86%', fees: '12L' },
];

export default function CollegeFitTestPage() {
  const [form, setForm] = useState({ fee: '', campus: '', city: '', placement: 70 });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState([]);
  const resultsRef = useRef(null);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.fee) nextErrors.fee = 'Fee budget is required.';
    if (!form.campus) nextErrors.campus = 'Campus size is required.';
    if (!form.city) nextErrors.city = 'City preference is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setResults(SUGGESTIONS);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  return (
    <ToolWorkspaceLayout
      title="College Fit Test"
      subtitle="Filter colleges by budget, campus expectations, and placement priorities."
      compactHero
      howItWorks={[
        'Your fee, campus, and city preferences define the fit baseline.',
        'Placement priority adjusts ranking weight for outcome-focused users.',
        'The final list surfaces colleges with balanced profile compatibility.',
      ]}
      whatThisToolDoes={[
        'Finds colleges that match your fee comfort, location, and placement expectations.',
        'Improves shortlisting quality by combining personal fit and outcome metrics.',
      ]}
      inputGuide={[
        'Fee Budget: Your approximate total affordable cost range.',
        'Campus Size: Preferred campus environment (compact or large).',
        'City Preference: Where you want to study.',
        'Placement Priority: Importance weight for placements in recommendations.',
      ]}
      preview={
        <div className="space-y-1 text-sm text-slate-600">
          <p>Recommended colleges: <span className="font-semibold text-slate-900">8</span></p>
          <p>Placement-focused matches: <span className="font-semibold text-slate-900">4</span></p>
        </div>
      }
      results={
        results.length ? (
          <section ref={resultsRef} className={swResultsHighlight}>
            <h2 className={swSectionTitle}>Results</h2>
            <p className={swSectionSubtitle}>Recommendations prioritize your chosen criteria.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {results.map((college) => (
                <article key={college.name} className={swResultCard}>
                  <h3 className="font-semibold text-slate-900">{college.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">Average package: {college.avgPackage}</p>
                  <p className="text-sm text-slate-600">Placement rate: {college.placementRate}</p>
                  <p className="text-sm text-slate-600">Fees: {college.fees}</p>
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
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>For high placement priority, compare avg package against fee burden ratio.</li>
              <li>Check campus and city lifestyle fit before finalizing applications.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className={swWorkspaceTitle}>Your preferences</h2>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <label className={swLabel}>
          Fee budget
          <select value={form.fee} onChange={(e) => onChange('fee', e.target.value)} className={swSelect}>
            <option value="">Select budget</option>
            <option value="lt10">&lt; 10L</option>
            <option value="10to20">10L – 20L</option>
            <option value="gt20">&gt; 20L</option>
          </select>
          {errors.fee ? <span className={swError}>{errors.fee}</span> : null}
        </label>
        <label className={swLabel}>
          Campus size
          <select value={form.campus} onChange={(e) => onChange('campus', e.target.value)} className={swSelect}>
            <option value="">Select campus size</option>
            <option value="small">Compact</option>
            <option value="large">Large</option>
          </select>
          {errors.campus ? <span className={swError}>{errors.campus}</span> : null}
        </label>
        <label className={swLabel}>
          City preference
          <input value={form.city} onChange={(e) => onChange('city', e.target.value)} className={swInput} />
          {errors.city ? <span className={swError}>{errors.city}</span> : null}
        </label>
        <label className={swLabel}>
          Placement priority ({form.placement}%)
          <input
            type="range"
            min="0"
            max="100"
            value={form.placement}
            onChange={(e) => onChange('placement', Number(e.target.value))}
            className="mt-3 w-full accent-emerald-600"
          />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className={swBtnPrimary}>
            Process criteria
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
