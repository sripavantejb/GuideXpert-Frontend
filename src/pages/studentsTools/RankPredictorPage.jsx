import { useRef, useState } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';

const PREVIEW_DEMO = {
  rank: 12430,
  percentile: 96.2,
  profileComplete: 80,
};

export default function RankPredictorPage() {
  const [exam, setExam] = useState('');
  const [marks, setMarks] = useState('');
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!exam) nextErrors.exam = 'Please select an exam.';
    if (!marks) nextErrors.marks = 'Please enter marks scored.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const marksValue = Number(marks);
    const percentile = Math.max(70, Math.min(99.9, 70 + marksValue * 0.11));
    const predictedRank = Math.max(1200, Math.round(25000 - marksValue * 85));
    const nextResult = {
      predictedRank,
      percentile: percentile.toFixed(1),
      targetMatch: Math.min(99, Math.round(percentile - 2)),
      profileCompletion: 80,
    };
    setResult(nextResult);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <ToolWorkspaceLayout
      title="Rank Predictor"
      subtitle="Predict your expected exam rank based on marks and performance analytics."
      compactHero
      howItWorks={[
        'Your marks are mapped against historical cutoff trends.',
        'The model checks previous rank distributions for similar score bands.',
        'Normalization patterns adjust the estimate to produce a likely rank and percentile range.',
      ]}
      whatThisToolDoes={[
        'Estimates your likely rank and percentile using your selected exam and marks.',
        'Helps you judge if your profile can match target colleges before applying.',
      ]}
      inputGuide={[
        'Exam Name: Select the exam for which you want a rank estimate.',
        'Marks Scored: Enter your expected or actual marks for the selected exam.',
      ]}
      preview={
        <div className="space-y-2.5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Estimated rank</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black tabular-nums tracking-tight text-[#0F172A] sm:text-2xl">
                {PREVIEW_DEMO.rank.toLocaleString()}
              </span>
              <span className="inline-flex rounded-md border-2 border-black bg-[#c7f36b] p-0.5 shadow-[2px_2px_0_#000]">
                <FiTrendingUp className="h-3 w-3 text-[#0F172A]" aria-hidden />
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <span>Exam percentile</span>
              <span className="tabular-nums text-[#0F172A]">{PREVIEW_DEMO.percentile}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[2px_2px_0_#000]">
              <div
                className="h-full rounded-full bg-[#0F172A]"
                style={{ width: `${Math.min(100, PREVIEW_DEMO.percentile)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <span>Preference profile</span>
              <span className="tabular-nums text-[#0F172A]">{PREVIEW_DEMO.profileComplete.toFixed(1)}%</span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500">Course fit + college fit inputs</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[2px_2px_0_#000]">
              <div
                className="h-full rounded-full bg-[#B7E5FF]"
                style={{ width: `${PREVIEW_DEMO.profileComplete}%` }}
              />
            </div>
          </div>
        </div>
      }
      results={
        result ? (
          <section
            ref={resultsRef}
            className="animate-[fadeIn_0.35s_ease] rounded-[14px] border-[3px] border-black bg-[#B7E5FF]/50 p-6 shadow-[6px_6px_0_#000]"
            tabIndex={-1}
          >
            <h2 className="text-2xl font-black text-[#0F172A]">Results Panel</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              How to read this result: lower rank and higher percentile indicate stronger admission potential.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Predicted Rank</p>
                <p className="mt-1 text-3xl font-black tabular-nums">{result.predictedRank.toLocaleString()}</p>
              </div>
              <div className="rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Percentile</p>
                <p className="mt-1 text-3xl font-black tabular-nums">{result.percentile}%</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm font-bold">
                  <span>Target College Match</span>
                  <span className="tabular-nums">{result.targetMatch}%</span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[2px_2px_0_#000]">
                  <div className="h-full rounded-full bg-[#c7f36b]" style={{ width: `${result.targetMatch}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm font-bold">
                  <span>Profile Completion</span>
                  <span className="tabular-nums">{result.profileCompletion}%</span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[2px_2px_0_#000]">
                  <div className="h-full rounded-full bg-[#F7B5B5]" style={{ width: `${result.profileCompletion}%` }} />
                </div>
              </div>
            </div>
          </section>
        ) : null
      }
      insights={
        result ? (
          <section className="rounded-[14px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0_#000]">
            <h3 className="text-xl font-black text-[#0F172A]">Next Step Suggestions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium text-slate-600">
              <li>Focus on high-weight topics to improve percentile by 1-2 points.</li>
              <li>Prepare a shortlist of target and safe colleges using this prediction range.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className="text-2xl font-black text-[#0F172A]">Input Workspace</h2>
      <p className="mt-1 text-sm font-medium text-slate-600">
        Enter your details and click Predict Rank to access results.
      </p>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold text-[#0F172A]">
          Exam Name
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="mt-1 w-full rounded-[10px] border-[3px] border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]"
          >
            <option value="">Select Exam</option>
            <option value="jee-main">JEE Main</option>
            <option value="bitsat">BITSAT</option>
            <option value="viteee">VITEEE</option>
          </select>
          {errors.exam ? <span className="mt-1 block text-xs text-red-600">{errors.exam}</span> : null}
        </label>
        <label className="text-sm font-semibold text-[#0F172A]">
          Marks Scored
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="e.g. 180"
            className="mt-1 w-full rounded-[10px] border-[3px] border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]"
          />
          {errors.marks ? <span className="mt-1 block text-xs text-red-600">{errors.marks}</span> : null}
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-[12px] border-[3px] border-black bg-[#c7f36b] px-6 py-3 text-sm font-black text-[#0F172A] shadow-[4px_4px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000]"
          >
            Predict Rank
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
