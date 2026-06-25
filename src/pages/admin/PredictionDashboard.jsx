import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiRefreshCw, FiTarget, FiTrendingUp } from 'react-icons/fi';
import DashboardLayout from '../../components/Admin/DashboardLayout';
import KpiCard from '../../components/Admin/KpiCard';
import ChartContainer from '../../components/Admin/ChartContainer';
import {
  getPredictionPortfolio,
  getStoredToken,
  recomputePredictions,
} from '../../utils/adminApi';
import LeadDetailDrawer from './lead-intelligence/LeadDetailDrawer';

const RISK_STYLES = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-emerald-100 text-emerald-800',
};

const STAGE_OPTIONS = ['', 'hot', 'warm', 'cold'];

function formatPct(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value}%`;
}

export default function PredictionDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('hot');
  const [minScore, setMinScore] = useState('');
  const [recomputing, setRecomputing] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = getStoredToken();
    const params = { limit: 50, sortBy: 'admissionProbability' };
    if (stage) params.stage = stage;
    if (minScore !== '') params.minScore = minScore;

    const res = await getPredictionPortfolio(params, token);
    if (!res.success) {
      setError(res.message || 'Failed to load predictions');
      setData(null);
      setLoading(false);
      return;
    }
    setData(res.data?.data || res.data);
    setLoading(false);
  }, [stage, minScore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = data?.summary;
  const items = data?.items || [];

  const riskChartData = useMemo(() => {
    const breakdown = summary?.riskBreakdown || {};
    return Object.entries(breakdown).map(([risk, count]) => ({ risk, count }));
  }, [summary]);

  async function handleRecompute() {
    setRecomputing(true);
    setError('');
    const token = getStoredToken();
    const res = await recomputePredictions({ all: true, limit: 50 }, token);
    setRecomputing(false);
    if (!res.success) {
      setError(res.message || 'Recompute failed');
      return;
    }
    await loadData();
  }

  return (
    <DashboardLayout
      title="Conversion Prediction"
      subtitle="Rule-based booking, attendance, and admission forecasts with explainable factors."
      icon={FiTarget}
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-500">Lead stage</span>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {STAGE_OPTIONS.map((opt) => (
              <option key={opt || 'all'} value={opt}>
                {opt || 'All stages'}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-500">Min score</span>
          <input
            type="number"
            min="0"
            max="100"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            placeholder="Any"
            className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={handleRecompute}
          disabled={recomputing}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue-700 disabled:opacity-60"
        >
          <FiRefreshCw className={recomputing ? 'animate-spin' : ''} />
          Recompute top 50
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Leads scored" value={summary?.count ?? '—'} icon={FiTarget} loading={loading} />
        <KpiCard
          label="Avg booking probability"
          value={formatPct(summary?.avgBookingProbability)}
          icon={FiTrendingUp}
          loading={loading}
        />
        <KpiCard
          label="Avg attendance probability"
          value={formatPct(summary?.avgAttendanceProbability)}
          icon={FiTrendingUp}
          loading={loading}
        />
        <KpiCard
          label="Avg admission probability"
          value={formatPct(summary?.avgAdmissionProbability)}
          icon={FiTrendingUp}
          loading={loading}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartContainer title="Risk breakdown" className="lg:col-span-1">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : riskChartData.length ? (
            <ul className="space-y-2 text-sm">
              {riskChartData.map((row) => (
                <li key={row.risk} className="flex items-center justify-between">
                  <span className="capitalize">{row.risk}</span>
                  <span className="tabular-nums font-medium">{row.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No predictions yet.</p>
          )}
        </ChartContainer>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Portfolio predictions</h2>
            <p className="text-xs text-slate-500">
              Rules v1 — lifecycle funnel baselines + lead score + WhatsApp + copilot signals
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Stage</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Booking</th>
                  <th className="px-4 py-2">Attendance</th>
                  <th className="px-4 py-2">Admission</th>
                  <th className="px-4 py-2">Confidence</th>
                  <th className="px-4 py-2">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                      Loading predictions…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                      No leads match the current filters.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr
                      key={row.phone}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => setSelectedPhone(row.phone)}
                    >
                      <td className="px-4 py-2 tabular-nums">{row.phone}</td>
                      <td className="px-4 py-2 capitalize">{row.leadStage || '—'}</td>
                      <td className="px-4 py-2 tabular-nums">{row.leadScore ?? '—'}</td>
                      <td className="px-4 py-2 tabular-nums">{formatPct(row.bookingProbability)}</td>
                      <td className="px-4 py-2 tabular-nums">{formatPct(row.attendanceProbability)}</td>
                      <td className="px-4 py-2 tabular-nums">{formatPct(row.admissionProbability)}</td>
                      <td className="px-4 py-2 tabular-nums">{formatPct(row.confidenceScore)}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${RISK_STYLES[row.riskLevel] || RISK_STYLES.medium}`}
                        >
                          {row.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedPhone ? (
        <LeadDetailDrawer phone={selectedPhone} onClose={() => setSelectedPhone('')} />
      ) : null}
    </DashboardLayout>
  );
}
