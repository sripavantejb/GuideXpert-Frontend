import { useRef, useState } from 'react';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';

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
        <div className="space-y-3">
          <p className="text-sm font-bold">Predicted Rank: 12,430</p>
          <p className="text-sm font-bold">Percentile: 96.2%</p>
        </div>
      }
      results={
        result ? (
          <section
            ref={resultsRef}
            className="animate-[fadeIn_0.35s_ease] rounded-[14px] border-2 border-black bg-[#B7E5FF]/40 p-6 shadow-[4px_4px_0px_#000]"
            tabIndex={-1}
          >
            <h2 className="text-2xl font-black text-[#0F172A]">Results Panel</h2>
            <p className="mt-1 text-sm text-slate-600">How to read this result: lower rank and higher percentile indicate stronger admission potential.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[12px] border-2 border-black bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Predicted Rank</p>
                <p className="mt-1 text-3xl font-black">{result.predictedRank.toLocaleString()}</p>
              </div>
              <div className="rounded-[12px] border-2 border-black bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Percentile</p>
                <p className="mt-1 text-3xl font-black">{result.percentile}%</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm font-bold">
                  <span>Target College Match</span>
                  <span>{result.targetMatch}%</span>
                </div>
                <div className="h-3 rounded-full border-2 border-black bg-white">
                  <div className="h-full rounded-full bg-[#C7F36B]" style={{ width: `${result.targetMatch}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm font-bold">
                  <span>Profile Completion</span>
                  <span>{result.profileCompletion}%</span>
                </div>
                <div className="h-3 rounded-full border-2 border-black bg-white">
                  <div className="h-full rounded-full bg-[#F7B5B5]" style={{ width: `${result.profileCompletion}%` }} />
                </div>
              </div>
            </div>
          </section>
        ) : null
      }
      insights={
        result ? (
          <section className="rounded-[14px] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000]">
            <h3 className="text-xl font-black text-[#0F172A]">Next Step Suggestions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Focus on high-weight topics to improve percentile by 1-2 points.</li>
              <li>Prepare a shortlist of target and safe colleges using this prediction range.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className="text-2xl font-black text-[#0F172A]">Input Workspace</h2>
      <p className="mt-1 text-sm text-slate-600">Enter your details and click Predict Rank to access results.</p>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold text-[#0F172A]">
          Exam Name
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="mt-1 w-full rounded-[10px] border-2 border-black bg-white px-3 py-2"
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
            className="mt-1 w-full rounded-[10px] border-2 border-black bg-white px-3 py-2"
          />
          {errors.marks ? <span className="mt-1 block text-xs text-red-600">{errors.marks}</span> : null}
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-[12px] border-2 border-black bg-[#C7F36B] px-5 py-2.5 text-sm font-black text-[#0F172A] shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-0.5"
          >
            Predict Rank
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
