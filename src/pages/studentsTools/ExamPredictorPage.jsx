import { useRef, useState } from 'react';
import { FiZap } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import { getRankPredictorExams, getExamConfig } from '../../utils/rankPredictor';
import { predictRankPublic } from '../../utils/api';
import {
  swBtnChip,
  swBtnPrimary,
  swError,
  swErrorBox,
  swInsightsPanel,
  swInput,
  swLabel,
  swPreviewLabel,
  swResultCard,
  swResultsPanel,
  swSectionSubtitle,
  swSectionTitle,
  swSelect,
  swWorkspaceTitle,
} from './components/studentWorkspaceUi';

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
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <FiZap className="h-3.5 w-3.5" aria-hidden />
            </span>
            <p className={swPreviewLabel}>{exams.length} exams supported</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exams.slice(0, 5).map((e) => (
              <span key={e.id} className={swBtnChip}>
                {e.name}
              </span>
            ))}
            {exams.length > 5 && <span className={swBtnChip}>+{exams.length - 5} more</span>}
          </div>
        </div>
      }
      results={
        result ? (
          <section ref={resultsRef} tabIndex={-1} className={swResultsPanel}>
            <h2 className={swSectionTitle}>Results</h2>
            {result.message && <p className={swSectionSubtitle}>{result.message}</p>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className={swResultCard}>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {result.metricLabel || 'Predicted value'}
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
                  {result.predictedValue != null ? result.predictedValue.toLocaleString() : '—'}
                </p>
              </div>
              {result.range && (
                <div className={swResultCard}>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Range</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
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
          <section className={swInsightsPanel}>
            <h3 className={swSectionTitle}>Next steps</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Compare this prediction with the College Predictor to shortlist matching institutions.</li>
              <li>Try different score inputs to see how small improvements affect your predicted rank.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className={swWorkspaceTitle}>Enter your score</h2>
      <p className={swSectionSubtitle}>Select an exam and enter your score to get an instant prediction.</p>

      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className={swLabel}>
          Exam
          <select
            value={examId}
            onChange={(e) => {
              setExamId(e.target.value);
              setResult(null);
              setApiError('');
            }}
            className={swSelect}
          >
            <option value="">Select exam</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          {errors.exam && <span className={swError}>{errors.exam}</span>}
        </label>

        <label className={swLabel}>
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
            placeholder={
              selectedExam
                ? `e.g. ${Math.round((selectedExam.minScore + selectedExam.maxScore) / 2)}`
                : 'e.g. 180'
            }
            className={swInput}
          />
          {errors.score && <span className={swError}>{errors.score}</span>}
        </label>

        {selectedExam?.requiresDifficulty && (
          <label className={swLabel}>
            Difficulty
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={swSelect}>
              {selectedExam.difficultyOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="sm:col-span-2">
          {apiError && <p className={`mb-3 ${swErrorBox}`}>{apiError}</p>}
          <button type="submit" disabled={loading} className={swBtnPrimary}>
            {loading ? 'Predicting…' : 'Predict now'}
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
