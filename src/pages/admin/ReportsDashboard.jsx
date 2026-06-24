import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiFileText,
  FiRefreshCw,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';
import DashboardLayout from '../../components/Admin/DashboardLayout';
import KpiCard from '../../components/Admin/KpiCard';
import ChartContainer from '../../components/Admin/ChartContainer';
import {
  generateExecutiveReport,
  getExecutiveReportByDate,
  getExecutiveReportHistory,
  getLatestExecutiveReport,
  getStoredToken,
} from '../../utils/adminApi';

const STAGE_LABELS = {
  lead: 'Lead',
  qualified: 'Qualified',
  interested: 'Interested',
  booked: 'Booked',
  attended: 'Attended',
  admission: 'Admission',
};

const KPI_LABELS = {
  lifecycleCohort: 'Lifecycle cohort',
  qualifiedLeads: 'Qualified leads',
  hotLeads: 'Hot leads',
  lifecycleBooked: 'Bookings',
  lifecycleAdmission: 'Admissions',
  openAlerts: 'Open alerts',
  followupsSent: 'Follow-ups sent',
  replyRate: 'Reply rate',
  conversionRate: 'Conversion rate',
};

function formatDelta(delta) {
  if (delta == null || Number.isNaN(delta)) return '—';
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

function DeltaBadge({ delta }) {
  if (delta == null || delta === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-emerald-700' : 'text-red-700'}`}
    >
      {up ? <FiTrendingUp className="h-3 w-3" /> : <FiTrendingDown className="h-3 w-3" />}
      {formatDelta(delta)}
    </span>
  );
}

export default function ReportsDashboard() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = getStoredToken();

    const [latestRes, historyRes] = await Promise.all([
      getLatestExecutiveReport(token),
      getExecutiveReportHistory({ limit: 30 }, token),
    ]);

    if (latestRes.success) {
      const data = latestRes.data?.data || latestRes.data;
      setLatest(data);
      setSelectedReport(data?.report || null);
      setComparison(data?.comparison || null);
      setSelectedDate(data?.report?.reportDate || '');
    } else if (latestRes.status !== 404) {
      setError(latestRes.message || 'Failed to load latest report');
    }

    if (historyRes.success) {
      setHistory(historyRes.data?.data?.items || historyRes.data?.items || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleGenerate(force = false) {
    setGenerating(true);
    setError('');
    const token = getStoredToken();
    const res = await generateExecutiveReport(
      { reportDate: selectedDate || undefined, force },
      token
    );
    setGenerating(false);
    if (!res.success) {
      setError(res.message || 'Failed to generate report');
      return;
    }
    await loadData();
  }

  async function handleSelectDate(date) {
    setSelectedDate(date);
    setLoading(true);
    const token = getStoredToken();
    const res = await getExecutiveReportByDate(date, token);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Failed to load report');
      return;
    }
    const data = res.data?.data || res.data;
    setSelectedReport(data?.report || null);
    setComparison(data?.comparison || null);
  }

  const payload = selectedReport?.payload || {};
  const summary = payload.summary || {};
  const funnelStages = payload.lifecycleFunnel?.stages || [];
  const alerts = payload.alerts || [];

  const comparisonRows = useMemo(() => {
    const kpis = comparison?.kpis || {};
    return Object.entries(kpis).map(([key, row]) => ({
      key,
      label: KPI_LABELS[key] || key,
      ...row,
    }));
  }, [comparison]);

  return (
    <DashboardLayout
      title="Daily Executive Reports"
      subtitle="Snapshot reports combining executive summary, alerts, funnel, counsellor performance, and follow-up effectiveness."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={generating}
          onClick={() => handleGenerate(false)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue-700 px-3 py-2 text-xs font-medium text-white hover:bg-primary-blue-800 disabled:opacity-60"
        >
          <FiRefreshCw className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating…' : 'Generate today'}
        </button>
        <button
          type="button"
          disabled={generating}
          onClick={() => handleGenerate(true)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Force regenerate
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {loading && !selectedReport ? (
        <p className="text-sm text-slate-500">Loading reports…</p>
      ) : (
        <>
          <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Report date"
              value={selectedReport?.reportDate || '—'}
              icon={FiCalendar}
              subtitle={selectedReport?.deliveryStatus || 'not generated'}
            />
            <KpiCard
              label="Lifecycle cohort"
              value={summary.lifecycleCohort ?? '—'}
              icon={FiBarChart2}
              subtitle={`vs prior: ${formatDelta(comparison?.kpis?.lifecycleCohort?.delta)}`}
            />
            <KpiCard
              label="Open alerts"
              value={summary.openAlerts ?? '—'}
              icon={FiBell}
              subtitle={`Admissions: ${summary.lifecycleAdmission ?? '—'}`}
            />
            <KpiCard
              label="Follow-up reply rate"
              value={summary.replyRate != null ? `${summary.replyRate}%` : '—'}
              icon={FiFileText}
              subtitle={`Sent: ${summary.followupsSent ?? '—'}`}
            />
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Report history</h2>
              <ul className="max-h-96 space-y-1 overflow-y-auto">
                {history.map((row) => (
                  <li key={row.reportDate}>
                    <button
                      type="button"
                      onClick={() => handleSelectDate(row.reportDate)}
                      className={`w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-slate-50 ${
                        selectedDate === row.reportDate ? 'bg-slate-100 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{row.reportDate}</span>
                        <span className="text-slate-400">{row.deliveryStatus}</span>
                      </div>
                      <div className="text-slate-500">
                        Cohort {row.summary?.lifecycleCohort ?? '—'} · Alerts{' '}
                        {row.summary?.openAlerts ?? '—'}
                      </div>
                    </button>
                  </li>
                ))}
                {!history.length ? (
                  <li className="text-xs text-slate-500">No reports yet. Generate one above.</li>
                ) : null}
              </ul>
            </section>

            <div className="space-y-4 lg:col-span-2">
              <ChartContainer title="Day-over-day comparison" icon={FiTrendingUp}>
                {comparison?.hasPrevious ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2 pr-3 font-medium">Metric</th>
                          <th className="py-2 pr-3 font-medium">Current</th>
                          <th className="py-2 pr-3 font-medium">Previous</th>
                          <th className="py-2 font-medium">Delta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRows.map((row) => (
                          <tr key={row.key} className="border-b border-slate-100">
                            <td className="py-2 pr-3 text-slate-800">{row.label}</td>
                            <td className="py-2 pr-3 tabular-nums">{row.current}</td>
                            <td className="py-2 pr-3 tabular-nums">{row.previous}</td>
                            <td className="py-2">
                              <DeltaBadge delta={row.delta} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No previous-day report for {comparison?.previousReportDate || 'yesterday'}.
                  </p>
                )}
              </ChartContainer>

              <ChartContainer title="Lifecycle funnel snapshot" icon={FiBarChart2}>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-4 font-medium">Stage</th>
                        <th className="py-2 pr-4 font-medium">Count</th>
                        <th className="py-2 font-medium">% of leads</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funnelStages.map((row) => (
                        <tr key={row.stage} className="border-b border-slate-100">
                          <td className="py-2 pr-4">{STAGE_LABELS[row.stage] || row.stage}</td>
                          <td className="py-2 pr-4 tabular-nums">{row.count}</td>
                          <td className="py-2 tabular-nums">{row.rateFromLeadPct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartContainer>

              <ChartContainer title="Open alerts in report" icon={FiBell}>
                {alerts.length ? (
                  <ul className="space-y-2 text-xs">
                    {alerts.slice(0, 10).map((alert) => (
                      <li key={alert._id} className="rounded-lg border border-slate-100 px-3 py-2">
                        <span className="font-medium text-slate-800">{alert.title}</span>
                        <p className="text-slate-600">{alert.message}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No open alerts in this report.</p>
                )}
              </ChartContainer>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
