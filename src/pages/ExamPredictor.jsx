import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
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
import ToolWorkspaceLayout from './studentsTools/components/ToolWorkspaceLayout';
import RankPredictorWithLeadGate from '../components/rankPredictor/RankPredictorWithLeadGate';
import { getExamConfig } from '../utils/rankPredictor';
import {
  swInsightsPanel,
  swResultCard,
  swResultsPanel,
  swSectionSubtitle,
  swSectionTitle,
  swFormTitle,
  swFormSubtitle,
} from './studentsTools/components/studentWorkspaceUi';

const EXAM_ICON_MAP = {
  apeamcet: { Icon: FiBookOpen, iconClass: 'bg-sky-50 text-sky-600' },
  jeeadvanced: { Icon: FiZap, iconClass: 'bg-rose-50 text-rose-600' },
  jeemainpercentile: { Icon: FiBarChart2, iconClass: 'bg-emerald-50 text-emerald-600' },
  jeemainmarks: { Icon: FiTarget, iconClass: 'bg-rose-50 text-rose-600' },
  kcet: { Icon: FiCpu, iconClass: 'bg-sky-50 text-sky-600' },
  keam: { Icon: FiAward, iconClass: 'bg-emerald-50 text-emerald-600' },
  mhcet: { Icon: FiActivity, iconClass: 'bg-rose-50 text-rose-600' },
  tnea: { Icon: FiTrendingUp, iconClass: 'bg-sky-50 text-sky-600' },
  tseamcet: { Icon: FiFileText, iconClass: 'bg-emerald-50 text-emerald-600' },
  wbjee: { Icon: FiGrid, iconClass: 'bg-violet-50 text-violet-600' },
};

const DEFAULT_ICON = { Icon: FiBarChart2, iconClass: 'bg-emerald-50 text-emerald-600' };

function formatResultRange(range) {
  if (range == null || range === '') return '\u2014';
  if (typeof range === 'string') return range;
  if (typeof range === 'object' && range.low != null && range.high != null) {
    return `${Number(range.low).toLocaleString()} \u2013 ${Number(range.high).toLocaleString()}`;
  }
  return String(range);
}

function ExamPredictor() {
  const { examId } = useParams();
  const exam = useMemo(() => getExamConfig(examId), [examId]);
  const { Icon: ExamIcon, iconClass } = EXAM_ICON_MAP[examId] || DEFAULT_ICON;

  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  const onResultChange = useCallback((next) => {
    setResult(next);
  }, []);

  if (!exam) return <Navigate to="/rank-predictor" replace />;

  return (
    <ToolWorkspaceLayout
      title={exam.name}
      subtitle={exam.description}
      howItWorks={[
        'Your marks are mapped against historical cutoff trends for this exam.',
        'The model checks previous rank distributions for similar score bands.',
        'Normalization patterns adjust the estimate to produce a likely rank and percentile range.',
      ]}
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
                  {result.predictedValue != null ? result.predictedValue.toLocaleString() : '\u2014'}
                </p>
              </div>
              {result.range && (
                <div className={swResultCard}>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Range</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
                    {formatResultRange(result.range)}
                  </p>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm text-[#5a6570]">
              Prefer the student workspace?{' '}
              <Link className="font-semibold text-[#f27921] hover:underline" to={`/students/rank-predictor/${exam.id}`}>
                Open in GuideXpert tools
              </Link>
            </p>
          </section>
        ) : null
      }
      insights={
        result ? (
          <section className={swInsightsPanel}>
            <h3 className={swSectionTitle}>Next steps</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Focus on high-weight topics to improve your score by a few marks.</li>
              <li>Use the College Predictor to shortlist matching institutions for this rank range.</li>
            </ul>
          </section>
        ) : null
      }
      showRelatedTools={false}
      homeTo="/"
    >
      <RankPredictorWithLeadGate
        exam={exam}
        variant="student"
        onResultChange={onResultChange}
        resultsRef={resultsRef}
        headerSlot={(
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
              <ExamIcon className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </div>
            <div>
              <h2 className={swFormTitle}>{exam.title || `${exam.name} Predictor`}</h2>
              <p className={swFormSubtitle}>
                Enter your score, verify your phone, then see your prediction.
              </p>
            </div>
          </div>
        )}
      />
    </ToolWorkspaceLayout>
  );
}

export default ExamPredictor;
