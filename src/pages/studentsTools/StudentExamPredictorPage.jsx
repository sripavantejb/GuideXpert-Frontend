import { useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  FiTrendingUp,
  FiBookOpen,
  FiZap,
  FiBarChart2,
  FiTarget,
  FiCpu,
  FiAward,
  FiActivity,
  FiFileText,
  FiGrid,
} from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import { getExamConfig } from '../../utils/rankPredictor';
import { predictRankPublic } from '../../utils/api';

const EXAM_ICON_MAP = {
  apeamcet: { Icon: FiBookOpen, bg: 'bg-[#B7E5FF]' },
  jeeadvanced: { Icon: FiZap, bg: 'bg-[#F7B5B5]' },
  jeemainpercentile: { Icon: FiBarChart2, bg: 'bg-[#c7f36b]' },
  jeemainmarks: { Icon: FiTarget, bg: 'bg-[#F7B5B5]' },
  kcet: { Icon: FiCpu, bg: 'bg-[#B7E5FF]' },
  keam: { Icon: FiAward, bg: 'bg-[#c7f36b]' },
  mhcet: { Icon: FiActivity, bg: 'bg-[#F7B5B5]' },
  tnea: { Icon: FiTrendingUp, bg: 'bg-[#B7E5FF]' },
  tseamcet: { Icon: FiFileText, bg: 'bg-[#c7f36b]' },
  wbjee: { Icon: FiGrid, bg: 'bg-[#B7E5FF]' },
};

const DEFAULT_ICON = { Icon: FiBarChart2, bg: 'bg-[#c7f36b]' };

export default function StudentExamPredictorPage() {
  const { examId } = useParams();
  const exam = useMemo(() => getExamConfig(examId), [examId]);
  const { Icon: ExamIcon, bg: iconBg } = EXAM_ICON_MAP[examId] || DEFAULT_ICON;

  const [score, setScore] = useState('');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const resultsRef = useRef(null);

  if (!exam) return <Navigate to="/students/rank-predictor" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');

    if (score === '') {
      setError('Please enter your marks to continue.');
      return;
    }
    const numericScore = Number(score);
    if (Number.isNaN(numericScore)) {
      setError('Only numeric values are allowed.');
      return;
    }

    setLoading(true);
    try {
      const payload = { examId: exam.id, score: numericScore };
      if (exam.requiresDifficulty) {
        payload.options = { difficulty };
      }
      const response = await predictRankPublic(payload);
      if (!response.success) {
        setError(response.message || 'Could not generate prediction. Please try again.');
        return;
      }
      const predicted = response.data || {};
      setResult({
        predictedValue: predicted.predictedValue,
        range: predicted.range,
        message: predicted.message,
        metricLabel: predicted.metricLabel,
      });
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    } catch (err) {
      setError(err.message || 'Could not generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title={exam.name}
      subtitle={exam.description}
      compactHero
      howItWorks={[
        'Your marks are mapped against historical cutoff trends for this exam.',
        'The model checks previous rank distributions for similar score bands.',
        'Normalization patterns adjust the estimate to produce a likely rank and percentile range.',
      ]}
      whatThisToolDoes={[
        `Predicts your likely rank or percentile for ${exam.name} based on your score.`,
        'Helps you gauge where you stand before counseling rounds begin.',
      ]}
      inputGuide={[
        `${exam.scoreLabel}: Enter your expected or actual ${exam.scoreLabel.toLowerCase()} (${exam.minScore} – ${exam.maxScore}).`,
        ...(exam.requiresDifficulty ? ['Difficulty: Select the paper difficulty for more accurate prediction.'] : []),
      ]}
      preview={
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-md border-2 border-black shadow-[2px_2px_0_#000] ${iconBg}`}>
              <ExamIcon className="h-3.5 w-3.5 text-[#0F172A]" strokeWidth={2.5} />
            </span>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{exam.name}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Score range</p>
            <p className="mt-0.5 text-lg font-black tabular-nums text-[#0F172A]">
              {exam.minScore} – {exam.maxScore}
            </p>
          </div>
          <div>
            <div className="flex justify-between gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <span>Ready to predict</span>
              <span className="inline-flex rounded-md border-2 border-black bg-[#c7f36b] p-0.5 shadow-[2px_2px_0_#000]">
                <FiTrendingUp className="h-3 w-3 text-[#0F172A]" aria-hidden />
              </span>
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
            <h2 className="text-2xl font-black text-[#0F172A] sm:text-3xl">Results Panel</h2>
            {result.message && (
              <p className="mt-1 text-sm font-medium text-slate-600">{result.message}</p>
            )}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {result.metricLabel || 'Predicted Value'}
                </p>
                <p className="mt-1 text-3xl font-black tabular-nums">
                  {result.predictedValue != null ? result.predictedValue.toLocaleString() : '\u2014'}
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
              <li>Focus on high-weight topics to improve your score by a few marks.</li>
              <li>Use the College Predictor to shortlist matching institutions for this rank range.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <div className="mb-6 flex items-center gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] border-[3px] border-black shadow-[3px_3px_0_#000] ${iconBg}`}>
          <ExamIcon className="h-6 w-6 text-[#0F172A]" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#0F172A] sm:text-2xl">
            {exam.title || `${exam.name} Predictor`}
          </h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500">Enter your score and get an instant prediction.</p>
        </div>
      </div>

      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold text-[#0F172A]">
          {exam.scoreLabel || 'Score'}
          <span className="ml-1 text-xs font-normal text-slate-400">
            ({exam.minScore} – {exam.maxScore})
          </span>
          <input
            type="number"
            value={score}
            step={exam.step || 1}
            min={exam.minScore}
            max={exam.maxScore}
            onChange={(e) => setScore(e.target.value)}
            placeholder={`Enter ${(exam.scoreLabel || 'score').toLowerCase()}`}
            className="mt-1 w-full rounded-[10px] border-[3px] border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]"
          />
          <p className="mt-1 text-xs text-slate-400">Allowed range: {exam.minScore} – {exam.maxScore}</p>
        </label>

        {exam.requiresDifficulty && (
          <label className="text-sm font-semibold text-[#0F172A]">
            Difficulty Level
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-1 w-full rounded-[10px] border-[3px] border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]"
            >
              {exam.difficultyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        )}

        <div className="sm:col-span-2">
          {error && (
            <p className="mb-3 rounded-[10px] border-2 border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-[12px] border-[3px] border-black bg-[#c7f36b] px-6 py-3 text-sm font-black text-[#0F172A] shadow-[4px_4px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Predicting\u2026' : 'Predict Rank'}
          </button>
        </div>
      </form>
    </ToolWorkspaceLayout>
  );
}
