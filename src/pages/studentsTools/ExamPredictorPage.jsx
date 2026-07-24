import { useRef, useState } from 'react';
import { FiZap } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import ToolFactsPreview from './components/ToolFactsPreview';
import { getRankPredictorExams, getExamConfig } from '../../utils/rankPredictor';
import { predictRankPublic } from '../../utils/api';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { useRequireLoginToUse } from '../../components/studentAuth/RequireStudentAuth';
import {
  swBtnPrimary,
  swError,
  swErrorBox,
  swInsightsPanel,
  swInput,
  swLabel,
  swResultCard,
  swResultsPanel,
  swSectionSubtitle,
  swSectionTitle,
  swSelect,
  swFormTitle,
  swFormSubtitle,
} from './components/studentWorkspaceUi';

const exams = getRankPredictorExams();

export default function ExamPredictorPage() {
  const { savePrediction } = useStudentAuth() || {};
  const requireLoginToUse = useRequireLoginToUse();
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
    if (!requireLoginToUse()) return;
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
      savePrediction?.({
        type: 'exam_predictor',
        tool: 'Exam Predictor',
        examId,
        title: `${selectedExam?.name || examId} score prediction`,
        summary: `${predicted.metricLabel || 'Result'}: ${predicted.predictedValue ?? '—'}`,
        payload: { examId, score: Number(score), ...predicted },
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
        <ToolFactsPreview
          icon={FiZap}
          iconClass="bg-[#fff8ed] text-[#c45a0c]"
          name="Exam Predictor"
          metricLabel="Coverage"
          metricValue={`${exams.length} exams`}
          points={exams.slice(0, 4).map((e) => e.name).concat(
            exams.length > 4 ? [`+${exams.length - 4} more supported`] : []
          )}
        />
      }
      results={
        result ? (
          <section ref={resultsRef} tabIndex={-1} className={swResultsPanel}>
            <h2 className={swSectionTitle}>Prediction results</h2>
            {result.message && <p className={swSectionSubtitle}>{result.message}</p>}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className={`${swResultCard} bg-gradient-to-br from-[#fff9f4] to-white`}>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a94a0]">
                  {result.metricLabel || 'Predicted value'}
                </p>
                <p className="mt-2 font-sw-display text-3xl font-bold tabular-nums text-[#041e30] sm:text-4xl">
                  {result.predictedValue != null ? result.predictedValue.toLocaleString() : '—'}
                </p>
              </div>
              {result.range && (
                <div className={swResultCard}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a94a0]">Likely range</p>
                  <p className="mt-2 font-sw-display text-xl font-bold tabular-nums text-[#041e30]">
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
            <ul className="mt-4 space-y-2.5 text-sm text-[#5a6570]">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Compare this prediction with the College Predictor to shortlist matching institutions.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Try different score inputs to see how small improvements affect your predicted rank.
              </li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className={swFormTitle}>Enter your score</h2>
      <p className={swFormSubtitle}>Select an exam and enter your score to get an instant prediction.</p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
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

        <div>
          {apiError && <p className={`mb-3 ${swErrorBox}`}>{apiError}</p>}
          <button type="submit" disabled={loading} className={swBtnPrimary}>
            {loading ? 'Predicting…' : 'Predict now'}
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
