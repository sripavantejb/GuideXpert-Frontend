import { useCallback, useMemo, useRef, useState } from 'react';
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
import RankPredictorWithLeadGate from '../../components/rankPredictor/RankPredictorWithLeadGate';
import { getExamConfig } from '../../utils/rankPredictor';

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

function formatResultRange(range) {
  if (range == null || range === '') return '\u2014';
  if (typeof range === 'string') return range;
  if (typeof range === 'object' && range.low != null && range.high != null) {
    return `${Number(range.low).toLocaleString()} \u2013 ${Number(range.high).toLocaleString()}`;
  }
  return String(range);
}

export default function StudentExamPredictorPage() {
  const { examId } = useParams();
  const exam = useMemo(() => getExamConfig(examId), [examId]);
  const { Icon: ExamIcon, bg: iconBg } = EXAM_ICON_MAP[examId] || DEFAULT_ICON;

  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  const onResultChange = useCallback((next) => {
    setResult(next);
  }, []);

  if (!exam) return <Navigate to="/students/rank-predictor" replace />;

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
        `${exam.scoreLabel}: Enter your expected or actual ${exam.scoreLabel.toLowerCase()} (${exam.min} – ${exam.max}).`,
        ...(exam.requiresDifficulty ? ['Difficulty: Select the paper difficulty for more accurate prediction.'] : []),
        'Verify your mobile with OTP so we can save your lead and show your prediction.',
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
              {exam.min} – {exam.max}
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
                  <p className="mt-1 text-xl font-black tabular-nums">{formatResultRange(result.range)}</p>
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
      <RankPredictorWithLeadGate
        exam={exam}
        variant="student"
        onResultChange={onResultChange}
        resultsRef={resultsRef}
        headerSlot={(
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] border-[3px] border-black shadow-[3px_3px_0_#000] ${iconBg}`}>
              <ExamIcon className="h-6 w-6 text-[#0F172A]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#0F172A] sm:text-2xl">
                {exam.title || `${exam.name} Predictor`}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-slate-500">
                Enter your score, verify your phone, then see your prediction.
              </p>
            </div>
          </div>
        )}
      />
    </ToolWorkspaceLayout>
  );
}
