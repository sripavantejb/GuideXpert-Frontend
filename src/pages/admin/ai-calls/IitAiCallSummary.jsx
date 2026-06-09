import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import KpiCard from '../../../components/Admin/KpiCard';
import AdminChartFrame from '../../../components/Admin/AdminChartFrame';
import {
  getIitAiCallSummary,
  getIitAiCallSummaryStats,
  getIitAiCallSummaries,
} from '../../../utils/aiCallsAdminApi';

const OUTCOME_COLORS = {
  Confirmed: 'bg-green-100 text-green-800',
  Undecided: 'bg-amber-100 text-amber-800',
  'Not Interested': 'bg-red-100 text-red-800',
  'No Answer': 'bg-gray-100 text-gray-700',
  'Reschedule Requested': 'bg-blue-100 text-blue-800',
};

const CONFIRMATION_COLORS = {
  YES: 'bg-green-100 text-green-800',
  NO: 'bg-red-100 text-red-800',
  MAYBE: 'bg-amber-100 text-amber-800',
  NO_ANSWER: 'bg-gray-100 text-gray-700',
};

const OUTCOME_FILTERS = [
  { id: '', label: 'All outcomes' },
  { id: 'Confirmed', label: 'Confirmed' },
  { id: 'Undecided', label: 'Undecided' },
  { id: 'Not Interested', label: 'Not Interested' },
  { id: 'No Answer', label: 'No Answer' },
  { id: 'Reschedule Requested', label: 'Reschedule Requested' },
];

function fmt(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return String(dateStr);
  }
}

function Badge({ value, colorMap }) {
  if (!value) return <span className="text-gray-400">—</span>;
  const cls = colorMap[value] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
}

function CallDetailDrawer({ recordId, onClose }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      const res = await getIitAiCallSummary(recordId);
      if (cancelled) return;
      if (!res.success) {
        setError(res.message || 'Failed to load call details.');
        setLoading(false);
        return;
      }
      setRecord(res.data?.data?.record || res.data?.record || null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [recordId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close" />
      <aside className="relative w-full max-w-xl bg-white shadow-xl h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Call conversation</h3>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800">Close</button>
        </div>
        <div className="p-5 space-y-5">
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && record && (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Student</span><p className="font-medium">{record.personName || '—'}</p></div>
                <div><span className="text-gray-500">Phone</span><p className="font-medium">{record.phone || '—'}</p></div>
                <div><span className="text-gray-500">Call time</span><p className="font-medium">{fmt(record.callTime || record.createdAt)}</p></div>
                <div><span className="text-gray-500">Duration</span><p className="font-medium">{record.duration != null ? `${record.duration}s` : '—'}</p></div>
                <div><span className="text-gray-500">Outcome</span><p><Badge value={record.callOutcome} colorMap={OUTCOME_COLORS} /></p></div>
                <div><span className="text-gray-500">Confirmation</span><p><Badge value={record.confirmation} colorMap={CONFIRMATION_COLORS} /></p></div>
                <div><span className="text-gray-500">Concern</span><p className="font-medium">{record.studentConcern || '—'}</p></div>
                <div><span className="text-gray-500">Exam attempted</span><p className="font-medium">{record.examAttempted || '—'}</p></div>
                <div><span className="text-gray-500">Time confirmed</span><p className="font-medium">{record.timeConfirmed || '—'}</p></div>
                <div><span className="text-gray-500">Reschedule</span><p className="font-medium">{record.rescheduleRequested || '—'}</p></div>
                {record.preferredCallbackTime && (
                  <div className="col-span-2"><span className="text-gray-500">Preferred callback</span><p className="font-medium">{record.preferredCallbackTime}</p></div>
                )}
              </div>

              {record.summary && (
                <section>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">AI Summary</h4>
                  <p className="text-sm text-gray-700 bg-slate-50 border rounded-lg p-3 whitespace-pre-wrap">{record.summary}</p>
                </section>
              )}

              {record.transcript && (
                <section>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Transcript</h4>
                  <pre className="text-xs text-gray-700 bg-slate-50 border rounded-lg p-3 whitespace-pre-wrap overflow-x-auto max-h-96">{record.transcript}</pre>
                </section>
              )}

              {record.recordingUrl && (
                <section>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Recording</h4>
                  <a href={record.recordingUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                    {record.recordingUrl}
                  </a>
                </section>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function IitAiCallSummary() {
  const LIMIT = 25;
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [drawerId, setDrawerId] = useState(null);

  const loadStats = useCallback(async () => {
    const res = await getIitAiCallSummaryStats();
    if (res.success) setStats(res.data?.data || res.data || null);
  }, []);

  const loadRows = useCallback(async () => {
    setTableLoading(true);
    setError('');
    const res = await getIitAiCallSummaries({
      page,
      limit: LIMIT,
      q: search.trim() || undefined,
      callOutcome: outcomeFilter || undefined,
    });
    if (!res.success) {
      setRows([]);
      setTotal(0);
      setError(res.message || 'Failed to load call records.');
      setTableLoading(false);
      return;
    }
    const payload = res.data || {};
    setRows(Array.isArray(payload.rows) ? payload.rows : []);
    setTotal(Number(payload.total) || 0);
    setTableLoading(false);
  }, [page, search, outcomeFilter]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadRows()]);
    setLoading(false);
  }, [loadStats, loadRows]);

  useEffect(() => { refreshAll(); }, [refreshAll]);
  useEffect(() => { loadRows(); }, [loadRows]);

  const summary = stats?.summary || {};
  const outcomeChartData = Object.entries(stats?.byOutcome || {}).map(([name, count]) => ({ name, count }));
  const dailySeries = stats?.dailySeries || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">IITian AI Calls — Summary &amp; Stats</h1>
        <p className="text-sm text-gray-500 mt-1">
          Post-call analysis from OSVI for the IIT Career Counselling Reminder agent (Telugu).
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total calls" value={loading ? '…' : summary.total ?? 0} accent="hero" />
        <KpiCard label="Confirmed" value={loading ? '…' : summary.confirmed ?? 0} />
        <KpiCard label="Undecided" value={loading ? '…' : summary.undecided ?? 0} />
        <KpiCard label="Not interested" value={loading ? '…' : summary.notInterested ?? 0} />
        <KpiCard label="No answer" value={loading ? '…' : summary.noAnswer ?? 0} />
        <KpiCard label="Confirm rate" value={loading ? '…' : `${summary.successRate ?? 0}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminChartFrame title="Outcomes" subtitle="Calls grouped by post-call outcome">
          {outcomeChartData.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No outcome data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={outcomeChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </AdminChartFrame>

        <AdminChartFrame title="Daily volume (IST)" subtitle="Last 14 days">
          {dailySeries.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No daily data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" name="Total" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="confirmed" name="Confirmed" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </AdminChartFrame>
      </div>

      <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-end gap-3 px-4 py-4 border-b">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Search name, phone, concern</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search…"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Outcome</label>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={outcomeFilter}
              onChange={(e) => { setOutcomeFilter(e.target.value); setPage(1); }}
            >
              {OUTCOME_FILTERS.map((f) => (
                <option key={f.id || 'all'} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {error && <div className="px-4 py-3 text-sm text-red-600">{error}</div>}

        {tableLoading ? (
          <div className="px-4 py-10 text-sm text-gray-500 text-center">Loading call records…</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-gray-600">No IIT AI call records yet.</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Configure OSVI post-call integration to POST to{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">/api/osvi/iit-ai-call-analysis</code>
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-semibold">Student</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold">Outcome</th>
                    <th className="px-4 py-3 text-left font-semibold">Confirmation</th>
                    <th className="px-4 py-3 text-left font-semibold">Concern</th>
                    <th className="px-4 py-3 text-left font-semibold">Exam</th>
                    <th className="px-4 py-3 text-left font-semibold">Call time</th>
                    <th className="px-4 py-3 text-left font-semibold">Summary</th>
                    <th className="px-4 py-3 text-left font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={String(row._id)} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.personName || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.phone || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><Badge value={row.callOutcome} colorMap={OUTCOME_COLORS} /></td>
                      <td className="px-4 py-3 whitespace-nowrap"><Badge value={row.confirmation} colorMap={CONFIRMATION_COLORS} /></td>
                      <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate" title={row.studentConcern || ''}>{row.studentConcern || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.examAttempted || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(row.callTime || row.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={row.summary || ''}>{row.summary || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDrawerId(row._id)}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
              <span>Page {page} of {Math.max(1, Math.ceil(total / LIMIT))} ({total} total)</span>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-50">Prev</button>
                <button type="button" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </section>

      {drawerId && (
        <CallDetailDrawer recordId={drawerId} onClose={() => setDrawerId(null)} />
      )}
    </div>
  );
}
