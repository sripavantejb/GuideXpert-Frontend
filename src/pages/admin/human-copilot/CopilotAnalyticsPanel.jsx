import { useCallback, useEffect, useState } from 'react';
import {
  FiActivity,
  FiAlertCircle,
  FiBarChart2,
  FiClock,
  FiMessageSquare,
  FiSend,
  FiThermometer,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import KpiCard from '../../../components/Admin/KpiCard';
import StatCardSkeleton from '../../../components/UI/CardSkeleton';
import { fetchAllCopilotAnalytics } from '../../../utils/humanCopilotApi';
import { formatDurationMs, formatPercentRate, PANEL_CLASS } from './copilotUtils';

const PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
];

function Section({ title, children }) {
  return (
    <section className={`${PANEL_CLASS} p-4 sm:p-5`}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div
      className={`${PANEL_CLASS} flex items-center justify-between gap-3 border-red-200/80 bg-red-50/80 p-4 text-sm text-red-800`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  );
}

export default function CopilotAnalyticsPanel() {
  const [sinceDays, setSinceDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchAllCopilotAnalytics(sinceDays);
    if (!result.success) {
      setError(result.message || 'Failed to load analytics');
      setData(null);
    } else {
      setData(result);
    }
    setLoading(false);
  }, [sinceDays]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={`${PANEL_CLASS} flex flex-wrap gap-2 p-4`}>
          {PERIOD_OPTIONS.map((opt) => (
            <span
              key={opt.value}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-400"
            >
              {opt.label}
            </span>
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((__, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={load} />;
  }

  const volume = data?.overview?.volume || {};
  const responseTimes = data?.overview?.responseTimes || {};
  const workloads = data?.workloads || {};
  const aiUsage = data?.aiUsage || {};
  const escalations = data?.escalations || {};
  const delivery = data?.delivery || {};
  const leadQuality = data?.leadQuality || {};

  return (
    <div className="space-y-4">
      <div className={`${PANEL_CLASS} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <div>
          <p className="text-sm font-medium text-slate-900">Conversation analytics</p>
          <p className="text-xs text-slate-500">Operational metrics for Human Copilot handoffs</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Time period">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSinceDays(opt.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                sinceDays === opt.value
                  ? 'border-primary-blue-300 bg-primary-blue-50 text-primary-blue-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Section title="Volume">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total handoffs" value={volume.total ?? 0} icon={FiUsers} accent="hero" />
          <KpiCard label="Active handoffs" value={volume.active ?? 0} icon={FiActivity} />
          <KpiCard label="Resolved" value={volume.resolved ?? 0} icon={FiBarChart2} />
          <KpiCard label="Reopened" value={volume.reopened ?? 0} icon={FiAlertCircle} />
        </div>
      </Section>

      <Section title="Response times">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Avg first response"
            value={formatDurationMs(responseTimes.avgFirstResponseMs)}
            icon={FiClock}
            subtitle="Time to first counsellor reply"
          />
          <KpiCard
            label="Longest first response"
            value={formatDurationMs(responseTimes.maxFirstResponseMs)}
            icon={FiClock}
          />
          <KpiCard
            label="Avg resolution"
            value={formatDurationMs(responseTimes.avgResolutionMs)}
            icon={FiClock}
          />
          <KpiCard
            label="Longest resolution"
            value={formatDurationMs(responseTimes.maxResolutionMs)}
            icon={FiClock}
          />
        </div>
      </Section>

      <Section title="Workloads">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {['sr1', 'sr2'].map((slot) => {
            const row = workloads[slot] || {};
            return (
              <div key={slot} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">
                  {slot === 'sr1' ? 'SR Counsellor 1' : 'SR Counsellor 2'}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <KpiCard label="Assigned" value={row.assigned ?? 0} />
                  <KpiCard label="Resolved" value={row.resolved ?? 0} />
                  <KpiCard
                    label="Avg response"
                    value={formatDurationMs(row.avgFirstResponseMs)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="AI usage">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            label="Suggested replies"
            value={aiUsage.totalSuggestedReplies ?? 0}
            icon={FiZap}
            accent
          />
          <KpiCard label="Accepted" value={aiUsage.accepted ?? 0} icon={FiZap} />
          <KpiCard label="Edited" value={aiUsage.edited ?? 0} icon={FiMessageSquare} />
          <KpiCard label="Manual replies" value={aiUsage.manual ?? 0} icon={FiMessageSquare} />
          <KpiCard
            label="Acceptance rate"
            value={formatPercentRate(aiUsage.acceptanceRate)}
            subtitle="Accepted / AI-assisted"
          />
        </div>
      </Section>

      <Section title="Escalations">
        <div className={`${PANEL_CLASS} overflow-hidden border-slate-200`}>
          <ul className="divide-y divide-slate-100">
            {(escalations.reasons || []).map((reason) => (
              <li
                key={reason.key}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <span className="font-medium text-slate-800">{reason.label}</span>
                <span className="tabular-nums text-slate-600">
                  {reason.count ?? 0}{' '}
                  <span className="text-slate-400">({reason.percent ?? 0}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Delivery">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Successful sends" value={delivery.successfulSends ?? 0} icon={FiSend} />
          <KpiCard label="Failed sends" value={delivery.failedSends ?? 0} icon={FiAlertCircle} />
          <KpiCard label="Retries" value={delivery.retries ?? 0} icon={FiSend} />
          <KpiCard
            label="Retry success rate"
            value={formatPercentRate(delivery.retrySuccessRate)}
          />
        </div>
      </Section>

      <Section title="Lead quality">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard label="Cold leads" value={leadQuality.cold ?? 0} icon={FiThermometer} />
          <KpiCard label="Warm leads" value={leadQuality.warm ?? 0} icon={FiActivity} />
          <KpiCard label="Hot leads" value={leadQuality.hot ?? 0} icon={FiTrendingUp} accent />
          <KpiCard label="Unscored" value={leadQuality.unscored ?? 0} icon={FiUsers} />
          <KpiCard
            label="Average score"
            value={leadQuality.averageLeadScore ?? 0}
            subtitle="Across scored handoffs"
          />
        </div>
      </Section>
    </div>
  );
}
