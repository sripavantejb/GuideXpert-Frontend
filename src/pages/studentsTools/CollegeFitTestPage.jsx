import { useRef, useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import ToolFactsPreview from './components/ToolFactsPreview';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { useRequireLoginToUse } from '../../components/studentAuth/RequireStudentAuth';
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
  swSelect,
  swFormTitle,
  swFormSubtitle,
} from './components/studentWorkspaceUi';

const SUGGESTIONS = [
  { name: 'SRM Institute', avgPackage: '8.5 LPA', placementRate: '89%', fees: '14L', fit: 91 },
  { name: 'Amrita University', avgPackage: '7.8 LPA', placementRate: '86%', fees: '12L', fit: 87 },
];

export default function CollegeFitTestPage() {
  const { savePrediction } = useStudentAuth() || {};
  const requireLoginToUse = useRequireLoginToUse();
  const [form, setForm] = useState({ fee: '', campus: '', city: '', placement: 70 });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState([]);
  const resultsRef = useRef(null);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (event) => {
    event.preventDefault();
    if (!requireLoginToUse()) return;
    const nextErrors = {};
    if (!form.fee) nextErrors.fee = 'Fee budget is required.';
    if (!form.campus) nextErrors.campus = 'Campus size is required.';
    if (!form.city) nextErrors.city = 'City preference is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setResults(SUGGESTIONS);
    savePrediction?.({
      type: 'college_fit_test',
      tool: 'College Fit Test',
      title: 'College fit shortlist',
      summary: SUGGESTIONS.map((c) => `${c.name} (${c.fit}%)`).join(' · '),
      payload: { form, matches: SUGGESTIONS },
    });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  return (
    <ToolWorkspaceLayout
      title="College Fit Test"
      subtitle="Filter colleges by budget, campus expectations, city preference, and placement priority."
      compactHero
      howItWorks={[
        'Your fee, campus, and city preferences define the fit baseline.',
        'Placement priority adjusts ranking weight for outcome-focused users.',
        'The final list surfaces colleges with balanced profile compatibility.',
      ]}
      whatThisToolDoes={[
        'Finds colleges that match your fee comfort, location, and placement expectations.',
        'Improves shortlisting by combining personal fit and outcome metrics.',
      ]}
      inputGuide={[
        'Fee Budget: Your approximate total affordable cost range.',
        'Campus Size: Preferred campus environment (compact or large).',
        'City Preference: Where you want to study.',
        'Placement Priority: Importance weight for placements in recommendations.',
      ]}
      preview={
        <ToolFactsPreview
          icon={FiMapPin}
          iconClass="bg-[#e8f1f8] text-[#0b3a5c]"
          name="College Fit Test"
          metricLabel="Typical shortlist"
          metricValue="8 colleges"
          points={['4 placement-led options', 'Weighted by your priority slider']}
        />
      }
      results={
        results.length ? (
          <section ref={resultsRef} className={swResultsHighlight}>
            <h2 className={swSectionTitle}>Recommended colleges</h2>
            <p className={swSectionSubtitle}>Ordered by overall fit with your stated preferences.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {results.map((college) => (
                <article key={college.name} className={swResultCard}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-sw-display text-lg font-bold text-[#041e30]">
                      {college.name}
                    </h3>
                    <span className="rounded-lg bg-[#fff4ed] px-2.5 py-1 text-[11px] font-bold tabular-nums text-[#c45a0c]">
                      {college.fit}% fit
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-[#f8fafc] px-2 py-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#8a94a0]">Package</dt>
                      <dd className="mt-1 text-sm font-bold text-[#041e30]">{college.avgPackage}</dd>
                    </div>
                    <div className="rounded-xl bg-[#f8fafc] px-2 py-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#8a94a0]">Placement</dt>
                      <dd className="mt-1 text-sm font-bold text-[#041e30]">{college.placementRate}</dd>
                    </div>
                    <div className="rounded-xl bg-[#f8fafc] px-2 py-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#8a94a0]">Fees</dt>
                      <dd className="mt-1 text-sm font-bold text-[#041e30]">{college.fees}</dd>
                    </div>
                  </dl>
                  <div className="mt-4">
                    <div className={swProgressTrack}>
                      <div className={swProgressBar} style={{ width: `${college.fit}%` }} />
                    </div>
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
            <ul className="mt-4 space-y-2.5 text-sm text-[#5a6570]">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                For high placement priority, compare avg package against fee burden ratio.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Check campus and city lifestyle fit before finalizing applications.
              </li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className={swFormTitle}>Your preferences</h2>
      <p className={swFormSubtitle}>Set budget, campus, city, and how much placements matter.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
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
          <input
            value={form.city}
            onChange={(e) => onChange('city', e.target.value)}
            className={swInput}
            placeholder="e.g. Chennai"
          />
          {errors.city ? <span className={swError}>{errors.city}</span> : null}
        </label>
        <label className={swLabel}>
          Placement priority
          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#5a6570]">
            <span>Flexible</span>
            <span className="tabular-nums text-[#041e30]">{form.placement}%</span>
            <span>Critical</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={form.placement}
            onChange={(e) => onChange('placement', Number(e.target.value))}
            className="mt-2 w-full accent-[#f27921]"
          />
        </label>
        <div>
          <button type="submit" className={swBtnPrimary}>
            Find matching colleges
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
