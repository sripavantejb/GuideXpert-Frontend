import { useMemo, useRef, useState } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import {
  examConfig,
  getExamConfig,
  getRankPredictorExams,
  getRankPredictorInputPlaceholder,
  getRankPredictorInputStep,
  validateRankPredictorScore,
} from '../../utils/rankPredictor';
import { predictRankPublic } from '../../utils/api';

const PREVIEW_DEMO = {
  rank: 12430,
  percentile: 96.2,
  profileComplete: 80,
};

export default function RankPredictorPage() {
  const exams = useMemo(() => getRankPredictorExams(), []);
  const [examId, setExamId] = useState('');
  const [score, setScore] = useState('');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  const exam = examId ? getExamConfig(examId) : null;

  const handleExamChange = (id) => {
    setExamId(id);
    setErrors({});
    setFormError('');
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);
    setFormError('');
    const nextErrors = {};
    if (!exam) nextErrors.exam = 'Please select an exam.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    console.log('Selected exam config:', examConfig[exam.name]);

    const validation = validateRankPredictorScore(score, exam);
    if (!validation.ok) {
      setErrors({ score: validation.error });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const payload = {
        examId: exam.id,
        score: validation.value,
      };
      if (exam.requiresDifficulty) {
        payload.options = { difficulty };
      }
      const response = await predictRankPublic(payload);
      if (!response.success) {
        setFormError(response.message || 'Could not generate prediction. Please try again.');
        return;
      }
      const predicted = response.data || {};
      setResult({
        predictedRank: predicted.predictedValue,
        range: predicted.range,
        message: predicted.message,
        metricLabel: predicted.metricLabel,
      });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } catch (err) {
      setFormError(err.message || 'Could not generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
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
        'Estimates your likely rank using your selected exam and score (marks, percentile, or normalized score as applicable).',
        'Helps you judge admission potential before you apply.',
      ]}
      inputGuide={[
        'Exam: Choose your exam; allowed score type and range update automatically.',
        'Score: Enter marks, percentile, or normalized score within the shown range for that exam.',
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
            <h2 className="break-words text-2xl font-black text-[#0F172A] sm:text-3xl">Results Panel</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Lower rank numbers usually mean better standing. Use the range as a guide, not a guarantee.
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{result.metricLabel || 'Prediction'}</p>
                <p className="mt-1 break-words text-3xl font-black tabular-nums text-[#0F172A]">{result.predictedRank}</p>
              </div>
              <div className="rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Range</p>
                <p className="mt-1 text-lg font-bold text-[#0F172A]">{result.range}</p>
              </div>
              {result.message ? (
                <p className="rounded-[12px] border-[3px] border-black bg-white p-4 text-sm font-medium text-slate-700 shadow-[4px_4px_0_#000]">
                  {result.message}
                </p>
              ) : null}
            </div>
          </section>
        ) : null
      }
      insights={
        result ? (
          <section className="rounded-[14px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0_#000]">
            <h3 className="text-xl font-black text-[#0F172A]">Next Step Suggestions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium text-slate-600">
              <li>Cross-check cutoffs and previous-year data for your target colleges.</li>
              <li>Prepare a balanced shortlist of target, match, and safe options.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className="text-xl font-black text-[#0F172A] sm:text-2xl">Input Workspace</h2>
      <p className="mt-1 text-sm font-medium text-slate-600">
        Select your exam, enter your score within the allowed range, then click Predict Rank.
      </p>
      <form noValidate className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold text-[#0F172A]">
          Exam
          <select
            value={examId}
            onChange={(e) => handleExamChange(e.target.value)}
            className="mt-1 w-full rounded-[10px] border-[3px] border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]"
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          {errors.exam ? <span className="mt-1 block text-xs text-red-600">{errors.exam}</span> : null}
        </label>

        {exam ? (
          <>
            <label className="text-sm font-semibold text-[#0F172A]">
              {exam.scoreLabel}
              <input
                type="number"
                value={score}
                min={exam.min}
                max={exam.max}
                step={getRankPredictorInputStep(exam)}
                onChange={(e) => setScore(e.target.value)}
                placeholder={getRankPredictorInputPlaceholder(exam)}
                className="mt-1 w-full rounded-[10px] border-[3px] border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]"
              />
              <span className="mt-1 block text-[11px] font-medium text-slate-500">
                Allowed range: {exam.min} - {exam.max}
                {exam.type === 'percentile' ? ' (decimals allowed)' : ' (whole numbers only)'}
              </span>
              {errors.score ? <span className="mt-1 block text-xs text-red-600">{errors.score}</span> : null}
            </label>
            {exam.requiresDifficulty ? (
              <label className="text-sm font-semibold text-[#0F172A] sm:col-span-2">
                Difficulty level
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-1 w-full max-w-md rounded-[10px] border-[3px] border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]"
                >
                  {exam.difficultyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </>
        ) : (
          <div className="text-sm font-medium text-slate-500 sm:flex sm:items-end">
            Select an exam to enter your score.
          </div>
        )}

        {formError ? (
          <p className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>
        ) : null}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading || !exam}
            className="rounded-[12px] border-[3px] border-black bg-[#c7f36b] px-6 py-3 text-sm font-black text-[#0F172A] shadow-[4px_4px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Predicting…' : 'Predict Rank'}
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
