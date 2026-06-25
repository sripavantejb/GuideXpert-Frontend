import { FiMinusCircle, FiPlusCircle, FiTarget } from 'react-icons/fi';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import { useLeadPrediction } from '../../../hooks/useLeadPrediction';

const RISK_STYLES = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

function formatPct(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value}%`;
}

function ProbabilityBar({ label, value, tone = 'blue' }) {
  const toneClass =
    tone === 'green'
      ? 'bg-emerald-500'
      : tone === 'amber'
        ? 'bg-amber-500'
        : 'bg-primary-blue-500';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="tabular-nums font-semibold text-slate-900">{formatPct(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${toneClass}`} style={{ width: `${Math.min(value || 0, 100)}%` }} />
      </div>
    </div>
  );
}

function FactorList({ title, icon: Icon, items, emptyText }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      {items?.length ? (
        <ul className="space-y-1.5 text-sm text-slate-700">
          {items.map((factor) => (
            <li key={factor.ruleId} className="rounded-lg border border-slate-200/80 bg-white px-3 py-2">
              <span className="font-medium">{factor.label}</span>
              <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-slate-400">
                {factor.category}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

export default function LeadPredictionSection({ phone }) {
  const { prediction, loading, error, retry, refresh } = useLeadPrediction(phone);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-primary-blue-600">
            <FiTarget className="h-4 w-4" />
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Conversion Prediction</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">Rule-based forecast from lifecycle, score, and copilot signals.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={1} />
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={retry} className="text-xs font-medium underline">
            Retry
          </button>
        </div>
      ) : !prediction ? (
        <p className="text-sm text-slate-500">No prediction available for this lead.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${RISK_STYLES[prediction.riskLevel] || RISK_STYLES.medium}`}
            >
              {prediction.riskLevel} risk
            </span>
            <span className="text-xs text-slate-500">
              Confidence {formatPct(prediction.confidenceScore)} ({prediction.confidence})
            </span>
            {prediction.lifecycleMaxStage ? (
              <span className="text-xs text-slate-500">Lifecycle: {prediction.lifecycleMaxStage}</span>
            ) : null}
          </div>

          <div className="space-y-3">
            <ProbabilityBar label="Booking" value={prediction.bookingProbability} tone="blue" />
            <ProbabilityBar label="Attendance" value={prediction.attendanceProbability} tone="amber" />
            <ProbabilityBar label="Admission" value={prediction.admissionProbability} tone="green" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FactorList
              title="Positive factors"
              icon={FiPlusCircle}
              items={prediction.explanation?.positiveFactors}
              emptyText="No positive rules matched."
            />
            <FactorList
              title="Negative factors"
              icon={FiMinusCircle}
              items={prediction.explanation?.negativeFactors}
              emptyText="No negative rules matched."
            />
          </div>
        </div>
      )}
    </section>
  );
}
