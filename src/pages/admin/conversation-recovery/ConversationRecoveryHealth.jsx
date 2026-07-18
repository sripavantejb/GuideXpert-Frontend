import { useCallback, useEffect, useState } from 'react';
import KpiCard from '../../../components/Admin/KpiCard';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import {
  getRecoveryHealth,
  getRecoverySystemMetrics,
} from '../../../utils/conversationRecoveryAdminApi';

function pct(rate) {
  const n = Number(rate);
  if (!Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

export default function ConversationRecoveryHealth() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [h, m] = await Promise.all([getRecoveryHealth(), getRecoverySystemMetrics()]);
    setHealth(h.data?.data ?? h.data);
    setMetrics(m.data?.data ?? m.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <FiLoader className="h-5 w-5 animate-spin" /> Loading health…
      </div>
    );
  }

  const h = health || {};
  const sm = metrics || h.systemMetrics || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <FiRefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Service status" value={h.serviceStatus || '—'} />
        <KpiCard label="Scheduler status" value={h.schedulerStatus || '—'} />
        <KpiCard
          label="Last scheduler run"
          value={
            h.lastSchedulerRun?.startedAt
              ? new Date(h.lastSchedulerRun.startedAt).toLocaleString()
              : 'Never'
          }
        />
        <KpiCard label="Queue size" value={h.queueSize ?? 0} />
        <KpiCard label="Pending jobs" value={h.pendingJobs ?? 0} />
        <KpiCard label="Messages today" value={h.messagesToday ?? 0} />
        <KpiCard label="Failures today" value={h.failuresToday ?? 0} />
        <KpiCard label="Recovery success %" value={pct(h.recoverySuccessPct)} />
        <KpiCard label="Delivery success %" value={pct(h.deliverySuccessPct)} />
        <KpiCard label="Read rate" value={pct(h.readRate)} />
        <KpiCard label="Reply rate" value={pct(h.replyRate)} />
        <KpiCard label="Booking conversion" value={pct(h.bookingConversion)} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">System metrics</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-700">
          <div>Scheduler executions: {sm.schedulerExecutions ?? 0}</div>
          <div>Avg execution: {sm.averageExecutionTimeMs ?? 0} ms</div>
          <div>Messages / min: {sm.messagesPerMinute ?? 0}</div>
          <div>Resume latency: {sm.resumeLatencyMs ?? 0} ms</div>
          <div>API latency: {sm.apiLatencyMs ?? 0} ms</div>
          <div>Failures / hour: {sm.failuresPerHour ?? 0}</div>
          <div>Template configured: {h.templateConfigured ? 'yes' : 'no'}</div>
        </div>
      </div>
    </div>
  );
}
