import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiAlertTriangle, FiBell, FiCheck, FiCheckCircle, FiFilter, FiHeadphones, FiSend } from 'react-icons/fi';
import DashboardLayout from '../../components/Admin/DashboardLayout';
import KpiCard from '../../components/Admin/KpiCard';
import ChartContainer from '../../components/Admin/ChartContainer';
import {
  acknowledgeAnalyticsAlert,
  getAnalyticsAlerts,
  getCounsellorPerformance,
  getFollowupEffectiveness,
  getStoredToken,
  resolveAnalyticsAlert,
} from '../../utils/adminApi';

const SEVERITY_OPTIONS = ['critical', 'high', 'medium', 'low'];
const PRODUCT_LINE_OPTIONS = ['all', 'whatsapp', 'iit', 'registration', 'oneOnOne', 'copilot'];
const STATUS_OPTIONS = [
  { value: 'open,acknowledged', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'open,acknowledged,resolved', label: 'All' },
];

const SEVERITY_STYLES = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

function formatType(type) {
  return String(type || '')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatPct(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value}%`;
}

export default function AlertsDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [followup, setFollowup] = useState(null);
  const [counsellors, setCounsellors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [productLineFilter, setProductLineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('open,acknowledged');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = getStoredToken();
    const params = { status: statusFilter, limit: 100 };
    if (severityFilter) params.severity = severityFilter;
    if (productLineFilter && productLineFilter !== 'all') params.productLine = productLineFilter;

    const [alertsRes, followupRes, counsellorRes] = await Promise.all([
      getAnalyticsAlerts(params, token),
      getFollowupEffectiveness({ sinceDays: 30 }, token),
      getCounsellorPerformance({ sinceDays: 30 }, token),
    ]);

    if (!alertsRes.success) {
      setError(alertsRes.message || 'Failed to load alerts');
      setAlerts([]);
      setLoading(false);
      return;
    }

    setAlerts(alertsRes.data?.data?.items || alertsRes.data?.items || []);
    setMeta(alertsRes.data?.data?.meta || alertsRes.data?.meta || null);
    setFollowup(followupRes.success ? followupRes.data?.data || followupRes.data : null);
    setCounsellors(counsellorRes.success ? counsellorRes.data?.data || counsellorRes.data : null);
    setLoading(false);
  }, [severityFilter, productLineFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCount = meta?.openCount ?? alerts.filter((a) => a.status !== 'resolved').length;

  const counsellorRows = useMemo(
    () => counsellors?.counsellors || [],
    [counsellors]
  );

  async function handleAcknowledge(id) {
    setActionId(id);
    const token = getStoredToken();
    const res = await acknowledgeAnalyticsAlert(id, token);
    setActionId('');
    if (res.success) await loadData();
    else setError(res.message || 'Acknowledge failed');
  }

  async function handleResolve(id) {
    setActionId(id);
    const token = getStoredToken();
    const res = await resolveAnalyticsAlert(id, token);
    setActionId('');
    if (res.success) await loadData();
    else setError(res.message || 'Resolve failed');
  }

  return (
    <DashboardLayout
      title="Smart Alerts"
      subtitle="Operational intelligence: lifecycle alerts, follow-up effectiveness, and counsellor performance."
    >
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open alerts" value={openCount} icon={FiBell} accent="hero" />
        <KpiCard
          label="Follow-ups sent (30d)"
          value={followup?.followupsSent ?? '—'}
          icon={FiSend}
          subtitle={`Reply rate: ${formatPct(followup?.replyRate)}`}
        />
        <KpiCard
          label="Booking rate"
          value={formatPct(followup?.bookingRate)}
          icon={FiCheckCircle}
          subtitle={`Conversions: ${followup?.conversions ?? '—'}`}
        />
        <KpiCard
          label="Conversion rate"
          value={formatPct(followup?.conversionRate)}
          icon={FiAlertTriangle}
          subtitle={`Replies: ${followup?.replies ?? '—'}`}
        />
      </section>

      <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
            <FiFilter className="text-slate-400" /> Filters
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          >
            <option value="">All severities</option>
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={productLineFilter}
            onChange={(e) => setProductLineFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          >
            {PRODUCT_LINE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All product lines' : p}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading alerts…</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-slate-500">No alerts match the current filters.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <article
                key={alert._id}
                className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.low}`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs text-slate-500">{formatType(alert.type)}</span>
                      <span className="text-xs text-slate-400">· {alert.productLine}</span>
                      <span className="text-xs text-slate-400">· {alert.status}</span>
                    </div>
                    <h3 className="mt-1 font-medium text-slate-900">{alert.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-600">{alert.message}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Triggered {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {alert.status === 'open' ? (
                      <button
                        type="button"
                        disabled={actionId === alert._id}
                        onClick={() => handleAcknowledge(alert._id)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Acknowledge
                      </button>
                    ) : null}
                    {alert.status !== 'resolved' ? (
                      <button
                        type="button"
                        disabled={actionId === alert._id}
                        onClick={() => handleResolve(alert._id)}
                        className="flex items-center gap-1 rounded-lg bg-primary-blue-700 px-2 py-1 text-xs font-medium text-white hover:bg-primary-blue-800"
                      >
                        <FiCheck className="h-3 w-3" />
                        Resolve
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <ChartContainer title="Counsellor performance (30d)" icon={FiHeadphones}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-medium">Counsellor</th>
                <th className="py-2 pr-4 font-medium">Sessions</th>
                <th className="py-2 pr-4 font-medium">Avg response</th>
                <th className="py-2 pr-4 font-medium">Bookings</th>
                <th className="py-2 pr-4 font-medium">Admissions</th>
                <th className="py-2 font-medium">Hot converted</th>
              </tr>
            </thead>
            <tbody>
              {counsellorRows.map((row) => (
                <tr key={row.counsellorId} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium uppercase">{row.counsellorId}</td>
                  <td className="py-2 pr-4 tabular-nums">{row.sessionsHandled}</td>
                  <td className="py-2 pr-4 tabular-nums">
                    {row.avgResponseTime ? `${Math.round(row.avgResponseTime / 60000)}m` : '—'}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">{row.bookingsGenerated}</td>
                  <td className="py-2 pr-4 tabular-nums">{row.admissionsGenerated}</td>
                  <td className="py-2 tabular-nums">{row.hotLeadsConverted}</td>
                </tr>
              ))}
              {!counsellorRows.length ? (
                <tr>
                  <td colSpan={6} className="py-4 text-slate-500">
                    No counsellor data available.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </ChartContainer>
    </DashboardLayout>
  );
}
