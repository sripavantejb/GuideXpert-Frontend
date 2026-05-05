import { useCallback, useEffect, useState } from 'react';
import { FiChevronRight, FiLoader } from 'react-icons/fi';
import {
  listWhatsappOpsCronRuns,
  getWhatsappOpsCronRunDetail,
} from '../../../utils/whatsappOpsAdminApi';
import { defaultRangeIsoDates, formatDt } from './whatsappOpsShared';
export default function WhatsAppOpsCron() {
  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [runs, setRuns] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0 });
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    const res = await listWhatsappOpsCronRuns({ from, to, limit: 50, page: 1 });
    setLoading(false);
    if (!res.success) {
      setErr(res.message);
      return;
    }
    setRuns(Array.isArray(res.data.data) ? res.data.data : []);
    setMeta({
      page: res.data.page,
      totalPages: res.data.totalPages,
      total: res.data.total,
    });
  }, [from, to]);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  async function openDetail(id) {
    setDetailLoading(true);
    const res = await getWhatsappOpsCronRunDetail(id);
    setDetailLoading(false);
    if (res.success) setDetail(res.data.data);
    else setDetail(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cron executions</h1>
          <p className="text-sm text-gray-600 mt-1">
            One row per HTTP cron invocation. Drill into linked WhatsApp attempts.
          </p>
          <p className="text-xs text-amber-800 mt-2 bg-amber-50 inline-block px-2 py-1 rounded-lg border border-amber-200">
            Scheduler cadence lives in Vercel / external cron — URLs:{' '}
            <code>/api/cron/send-reminders</code>, meetlinks, send-30min-reminders, retry-whatsapp.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="text-xs font-medium text-gray-600">
            From
            <input type="date" value={from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className="mt-1 rounded-lg border px-2 py-1 block" />
          </label>
          <label className="text-xs font-medium text-gray-600">
            To
            <input type="date" value={to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className="mt-1 rounded-lg border px-2 py-1 block" />
          </label>
          <button type="button" onClick={load} className="text-sm px-3 py-2 rounded-lg border bg-white font-semibold hover:bg-gray-50">
            Apply
          </button>
        </div>
      </header>

      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{err}</div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 py-12 justify-center">
          <FiLoader className="animate-spin" /> Loading…
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-600 text-sm">
          No cron runs in this range yet. Executes will appear once schedulers hit the backend after deployment.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          <div className="max-h-[60vh] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-100 text-gray-700 text-xs uppercase tracking-wide z-10">
                <tr>
                  <th className="text-left px-4 py-2">Job</th>
                  <th className="text-left px-4 py-2">Started</th>
                  <th className="text-left px-4 py-2">Duration ms</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Stats</th>
                  <th className="w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runs.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">{r.jobKey}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDt(r.startedAt)}</td>
                    <td className="px-4 py-2">{r.durationMs ?? '—'}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          r.success === false
                            ? 'bg-rose-100 text-rose-800'
                            : r.success === true
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {r.success === true ? 'OK' : r.success === false ? 'Failed' : 'Running'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-700 max-w-md truncate" title={JSON.stringify(r.stats || {})}>
                      {JSON.stringify(r.stats || {})}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => openDetail(r._id)}
                        className="text-primary-navy hover:underline inline-flex items-center gap-0.5 font-semibold"
                      >
                        View <FiChevronRight />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 px-4 py-2 border-t">{meta.total} total runs matched</p>
        </div>
      )}

      {detailLoading && (
        <p className="text-sm text-gray-500 inline-flex gap-2">
          <FiLoader className="animate-spin" /> Loading details…
        </p>
      )}
      {detail && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h2 className="font-bold text-gray-900">Run detail</h2>
          <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-auto max-h-48">{JSON.stringify(detail.run, null, 2)}</pre>
          <p className="text-sm font-semibold text-gray-800">Linked WhatsApp attempts ({detail.linkedEvents?.length || 0})</p>
          <div className="overflow-auto max-h-64">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="px-2 py-1">Phone</th>
                  <th className="px-2 py-1">Kind</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Created</th>
                </tr>
              </thead>
              <tbody>
                {(detail.linkedEvents || []).map((e) => (
                  <tr key={e._id} className="border-t border-gray-100">
                    <td className="px-2 py-1">***{String(e.phone).slice(-4)}</td>
                    <td className="px-2 py-1">{e.messageKind}</td>
                    <td className="px-2 py-1">{e.status}</td>
                    <td className="px-2 py-1">{formatDt(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
