import { useRef, useState } from 'react';
import { FiZap } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import { getRankPredictorExams, getExamConfig } from '../../utils/rankPredictor';
import { predictRankPublic } from '../../utils/api';

const exams = getRankPredictorExams();

export default function ExamPredictorPage() {
  const [examId, setExamId] = useState('');
  const [score, setScore] = useState('');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const resultsRef = useRef(null);

  const selectedExam = examId ? getExamConfig(examId) : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!examId) nextErrors.exam = 'Please select an exam.';
    if (score === '') nextErrors.score = 'Please enter your score.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setResult(null);
    setApiError('');
    setLoading(true);

    try {
      const payload = { examId, score: Number(score) };
      if (selectedExam?.requiresDifficulty) {
        payload.options = { difficulty };
      }
      const response = await predictRankPublic(payload);
      if (!response.success) {
        setApiError(response.message || 'Could not generate prediction. Please try again.');
        return;
      }
      const predicted = response.data || {};
      setResult({
        predictedValue: predicted.predictedValue,
        range: predicted.range,
        message: predicted.message,
        metricLabel: predicted.metricLabel,
      });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } catch (err) {
      setApiError(err.message || 'Could not generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Exam Predictor"
      subtitle="Select any supported exam, enter your score, and get an instant rank or percentile prediction."
      compactHero
      howItWorks={[
        'Pick the exam you took or plan to take from the supported list.',
        'The model maps your score against historical cutoff and rank distribution data.',
        'A predicted rank or percentile range is generated based on normalization patterns.',
      ]}
      whatThisToolDoes={[
        'Predicts rank or percentile for any supported entrance exam from your score.',
        'Helps compare performance across different exams in a single workspace.',
      ]}
      inputGuide={[
        'Exam: Choose the entrance exam you want a prediction for.',
        'Score / Marks: Enter the score you achieved or expect in the selected exam.',
        'Difficulty (MHT CET only): Select the paper difficulty for more accurate percentile prediction.',
      ]}
      preview={
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-md border-2 border-black bg-[#c7f36b] p-0.5 shadow-[2px_2px_0_#000]">
              <FiZap className="h-3 w-3 text-[#0F172A]" aria-hidden />
            </span>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              {exams.length} exams supported
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Supported exams</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {exams.slice(0, 5).map((e) => (
                <span
                  key={e.id}
                  className="rounded-md border border-black/20 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-[#0F172A]"
                >
                  {e.name}
                </span>
              ))}
              {exams.length > 5 && (
                <span className="rounded-md border border-black/20 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                  +{exams.length - 5} more
                </span>
              )}
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
            <h2 className="wrap-break-word text-2xl font-black text-[#0F172A] sm:text-3xl">Results Panel</h2>
            {result.message && (
              <p className="mt-1 text-sm font-medium text-slate-600">{result.message}</p>
            )}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {result.metricLabel || 'Predicted Value'}
                </p>
                <p className="mt-1 text-3xl font-black tabular-nums">
                  {result.predictedValue != null ? result.predictedValue.toLocaleString() : '—'}
                </p>
              </div>
              {result.range && (
                <div className="rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Range</p>
                  <p className="mt-1 text-xl font-black tabular-nums">
                    {result.range.low?.toLocaleString()} – {result.range.high?.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : null
      }
      insights={
        result ? (
          <section className="rounded-[14px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0_#000]">
            <h3 className="text-xl font-black text-[#0F172A]">Next Step Suggestions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium text-slate-600">
              <li>Compare this prediction with the College Predictor to shortlist matching institutions.</li>
              <li>Try different score inputs to see how small improvements affect your predicted rank.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className="text-xl font-black text-[#0F172A] sm:text-2xl">Input Workspace</h2>
      <p className="mt-1 text-sm font-medium text-slate-600">
        Select an exam and enter your score to get an instant prediction.
      </p>

      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold text-[#0F172A]">
          Exam
          <select
            value={examId}
            onChange={(e) => {
              setExamId(e.target.value);
              setResult(null);
              setApiError('');
            }}
            className="mt-1 w-full rounded-[10px] border-[3px] border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]"
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          {errors.exam && <span className="mt-1 block text-xs text-red-600">{errors.exam}</span>}
        </label>

        <label className="text-sm font-semibold text-[#0F172A]">
          {selectedExam?.scoreLabel || 'Score'}
          {selectedExam && (
            <span className="ml-1 text-xs font-normal text-slate-400">
              ({selectedExam.minScore} – {selectedExam.maxScore})
            </span>
          )}
          <input
            type="number"
            value={score}
            step={selectedExam?.step || 1}
            min={selectedExam?.minScore}
            max={selectedExam?.maxScore}
            onChange={(e) => setScore(e.target.value)}
            placeholder={selectedExam ? `e.g. ${Math.round((selectedExam.minScore + selectedExam.maxScore) / 2)}` : 'e.g. 180'}
            className="mt-1 w-full rounded-[10px] border-[3px] border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]"
          />
          {errors.score && <span className="mt-1 block text-xs text-red-600">{errors.score}</span>}
        </label>

        {selectedExam?.requiresDifficulty && (
          <label className="text-sm font-semibold text-[#0F172A]">
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-1 w-full rounded-[10px] border-[3px] border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]"
            >
              {selectedExam.difficultyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        )}

        <div className="sm:col-span-2">
          {apiError && (
            <p className="mb-3 rounded-[10px] border-2 border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {apiError}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-[12px] border-[3px] border-black bg-[#c7f36b] px-6 py-3 text-sm font-black text-[#0F172A] shadow-[4px_4px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Predicting…' : 'Predict Now'}
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
