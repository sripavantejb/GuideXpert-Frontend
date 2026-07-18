import { useCallback, useEffect, useState } from 'react';
import KpiCard from '../../../components/Admin/KpiCard';
import ChartContainer from '../../../components/Admin/ChartContainer';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import {
  getRecoveryOverview,
  getRecoveryByPhase,
  getRecoveryTrends,
  getCampaignPerformance,
} from '../../../utils/conversationRecoveryAdminApi';

function pct(rate) {
  const n = Number(rate);
  if (!Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

export default function ConversationRecoveryOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [byPhase, setByPhase] = useState([]);
  const [trends, setTrends] = useState(null);
  const [campaign, setCampaign] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [ov, ph, tr, cp] = await Promise.all([
      getRecoveryOverview({}),
      getRecoveryByPhase({}),
      getRecoveryTrends({}),
      getCampaignPerformance(),
    ]);
    if (!ov.success) {
      setError(ov.message || 'Failed to load overview');
      setLoading(false);
      return;
    }
    setOverview(ov.data?.data ?? ov.data);
    setByPhase((ph.data?.data ?? ph.data) || []);
    setTrends(tr.data?.data ?? tr.data);
    setCampaign(cp.data?.data ?? cp.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <FiLoader className="h-5 w-5 animate-spin" /> Loading overview…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
        <button type="button" className="ml-3 underline" onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  const o = overview || {};
  const windows = campaign?.windows || {};

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
        <KpiCard label="Eligible" value={o.eligible ?? 0} />
        <KpiCard label="Sent" value={o.sent ?? 0} />
        <KpiCard label="Delivered" value={o.delivered ?? 0} />
        <KpiCard label="Recovered" value={o.recovered ?? 0} />
        <KpiCard label="Delivery rate" value={pct(o.deliveryRate)} />
        <KpiCard label="Recovery rate" value={pct(o.recoveryRate)} />
        <KpiCard label="Booking conversion" value={pct(o.bookingConversion)} />
        <KpiCard label="Booked after recovery" value={o.booked ?? 0} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Campaign window</th>
              <th className="px-3 py-2">Eligible</th>
              <th className="px-3 py-2">Sent</th>
              <th className="px-3 py-2">Delivered</th>
              <th className="px-3 py-2">Read</th>
              <th className="px-3 py-2">Replies</th>
              <th className="px-3 py-2">Recovered</th>
              <th className="px-3 py-2">Bookings</th>
              <th className="px-3 py-2">Conversion %</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['24 Hour', windows['24_hour']],
              ['72 Hour', windows['72_hour']],
              ['7 Day', windows['7_day']],
            ].map(([label, row]) => (
              <tr key={label} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{label}</td>
                <td className="px-3 py-2">{row?.eligible ?? 0}</td>
                <td className="px-3 py-2">{row?.sent ?? 0}</td>
                <td className="px-3 py-2">{row?.delivered ?? 0}</td>
                <td className="px-3 py-2">{row?.read ?? 0}</td>
                <td className="px-3 py-2">{row?.replies ?? 0}</td>
                <td className="px-3 py-2">{row?.recovered ?? 0}</td>
                <td className="px-3 py-2">{row?.bookings ?? 0}</td>
                <td className="px-3 py-2">{pct(row?.conversionPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartContainer title="Recovery / delivery / reply trends">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={(trends?.deliveryTrend || []).map((d, i) => ({
                  date: d.date,
                  delivered: d.value,
                  recovered: trends?.recoveryTrend?.[i]?.value ?? 0,
                  replies: trends?.replyTrend?.[i]?.value ?? 0,
                  read: trends?.readTrend?.[i]?.value ?? 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="read" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="replies" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="recovered" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
        <ChartContainer title="Failure trend">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends?.failureTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" name="failures" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      <ChartContainer title="Recoveries by last phase">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Array.isArray(byPhase) ? byPhase : []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="phase" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="recoveries" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
}
