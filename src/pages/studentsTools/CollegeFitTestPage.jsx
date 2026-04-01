import { useRef, useState } from 'react';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';

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
        <div className="space-y-2 text-sm font-bold">
          <p>Recommended Colleges: 8</p>
          <p>Placement-focused matches: 4</p>
        </div>
      }
      results={
        results.length ? (
          <section ref={resultsRef} className="rounded-[14px] border-2 border-black bg-[#B7E5FF]/35 p-6 shadow-[4px_4px_0px_#000]">
            <h2 className="text-2xl font-black text-[#0F172A]">Results Panel</h2>
            <p className="mt-1 text-sm text-slate-600">How to read this result: recommendations prioritize your chosen criteria, especially placement weight.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {results.map((college) => (
                <article key={college.name} className="rounded-[12px] border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
                  <h3 className="text-base font-black text-[#0F172A]">{college.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">Average Package: {college.avgPackage}</p>
                  <p className="text-sm text-slate-600">Placement Rate: {college.placementRate}</p>
                  <p className="text-sm text-slate-600">Fees: {college.fees}</p>
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
              <li>For high placement priority, compare avg package against fee burden ratio.</li>
              <li>Check campus and city lifestyle fit before finalizing applications.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className="text-2xl font-black text-[#0F172A]">Input Workspace</h2>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <label className="text-sm font-semibold text-[#0F172A]">
          Fee Budget
          <select value={form.fee} onChange={(e) => onChange('fee', e.target.value)} className="mt-1 w-full rounded-[10px] border-2 border-black px-3 py-2">
            <option value="">Select budget</option>
            <option value="lt10">&lt; 10L</option>
            <option value="10to20">10L - 20L</option>
            <option value="gt20">&gt; 20L</option>
          </select>
          {errors.fee ? <span className="mt-1 block text-xs text-red-600">{errors.fee}</span> : null}
        </label>
        <label className="text-sm font-semibold text-[#0F172A]">
          Campus Size
          <select value={form.campus} onChange={(e) => onChange('campus', e.target.value)} className="mt-1 w-full rounded-[10px] border-2 border-black px-3 py-2">
            <option value="">Select campus size</option>
            <option value="small">Compact</option>
            <option value="large">Large</option>
          </select>
          {errors.campus ? <span className="mt-1 block text-xs text-red-600">{errors.campus}</span> : null}
        </label>
        <label className="text-sm font-semibold text-[#0F172A]">
          City Preference
          <input value={form.city} onChange={(e) => onChange('city', e.target.value)} className="mt-1 w-full rounded-[10px] border-2 border-black px-3 py-2" />
          {errors.city ? <span className="mt-1 block text-xs text-red-600">{errors.city}</span> : null}
        </label>
        <label className="text-sm font-semibold text-[#0F172A]">
          Placement Priority ({form.placement}%)
          <input
            type="range"
            min="0"
            max="100"
            value={form.placement}
            onChange={(e) => onChange('placement', Number(e.target.value))}
            className="mt-3 w-full"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-[12px] border-2 border-black bg-[#C7F36B] px-5 py-2.5 text-sm font-black shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-0.5"
          >
            Process Criteria
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
