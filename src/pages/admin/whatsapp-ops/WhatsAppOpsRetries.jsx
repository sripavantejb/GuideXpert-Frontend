import { useCallback, useEffect, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ChartContainer from '../../../components/Admin/ChartContainer';
import { getWhatsappOpsRetriesAnalytics } from '../../../utils/whatsappOpsAdminApi';
import { defaultRangeIsoDates, formatDt } from './whatsappOpsShared';

export default function WhatsAppOpsRetries() {
  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const res = await getWhatsappOpsRetriesAnalytics({ from, to });
    setLoading(false);
    if (!res.success) setErr(res.message);
    else setData(res.data?.data ?? res.data);
  }, [from, to]);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  const chartData = (data?.successAfterRetriesBySnap || []).map((r) => ({
    label: String(r._id),
    count: r.count,
  }));

  return (
    <div className="space-y-6">
      <header className="border-b border-gray-100 pb-4 flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Retry analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Exhausted sends, retry volume, and eventual success by prior failure count.</p>
        </div>
        <div className="flex gap-2 items-end">
          <input type="date" value={from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className="rounded border px-2 py-1 text-sm" />
          <input type="date" value={to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className="rounded border px-2 py-1 text-sm" />
          <button type="button" onClick={load} className="px-3 py-2 rounded-lg border bg-white text-sm font-semibold">
            Apply
          </button>
        </div>
      </header>

      {err && <div className="text-sm bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">{err}</div>}
      {loading && !data ? (
        <div className="flex items-center gap-2 text-gray-500 py-16 justify-center">
          <FiLoader className="animate-spin" /> Loading…
        </div>
      ) : data && (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase text-gray-500 font-semibold">Exhausted messages</p>
              <p className="text-3xl font-bold mt-1">{data.exhaustedCount ?? data.totals?.exhausted ?? 0}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase text-gray-500 font-semibold">Avg retry snap</p>
              <p className="text-3xl font-bold mt-1">{data.averageRetrySnap != null ? Number(data.averageRetrySnap).toFixed(2) : '—'}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase text-gray-500 font-semibold">Events touching retries</p>
              <p className="text-3xl font-bold mt-1">{data.totals?.eventsWithRetries ?? '—'}</p>
            </div>
          </div>

          <ChartContainer title="Success after prior failures" subtitle="successful events grouped by submission retry count snapshot before send">
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="px-4 py-3 border-b font-semibold text-gray-900">Retry kind breakdown</div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase">
                <tr>
                  <th className="px-4 py-2">Kind</th>
                  <th className="px-4 py-2">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(Array.isArray(data.kindBreakdown) ? data.kindBreakdown : []).map((row) => (
                  <tr key={row.kind}>
                    <td className="px-4 py-2">{row.kind}</td>
                    <td className="px-4 py-2">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="px-4 py-3 border-b font-semibold text-gray-900">Recent exhausted samples</div>
            <div className="max-h-80 overflow-auto">
              <table className="min-w-full text-xs">
                <thead className="sticky top-0 bg-gray-100">
                  <tr className="text-left">
                    <th className="px-2 py-1">When</th>
                    <th className="px-2 py-1">Phone</th>
                    <th className="px-2 py-1">Kind</th>
                    <th className="px-2 py-1">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.exhaustedSamples || []).map((s, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-2 py-1 whitespace-nowrap">{formatDt(s.createdAt)}</td>
                      <td className="px-2 py-1">***{String(s.phone).slice(-4)}</td>
                      <td className="px-2 py-1">{s.messageKind}</td>
                      <td className="px-2 py-1 max-w-md truncate" title={s.errorMessage}>{s.errorMessage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
