import { useCallback, useEffect, useState } from 'react';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import {
  getRecoveryAlerts,
  acknowledgeRecoveryAlert,
  resolveRecoveryAlert,
} from '../../../utils/conversationRecoveryAdminApi';

export default function ConversationRecoveryAlerts() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState('open');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getRecoveryAlerts({ status, refresh: '1' });
    setAlerts(res.data?.data ?? res.data ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
          <option value="all">All</option>
        </select>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
        >
          <FiRefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-slate-600">
          <FiLoader className="h-5 w-5 animate-spin" /> Loading alerts…
        </div>
      ) : (
        <div className="space-y-3">
          {(Array.isArray(alerts) ? alerts : []).map((a) => (
            <div
              key={a._id}
              className={`rounded-xl border px-4 py-3 ${
                a.severity === 'critical'
                  ? 'border-red-200 bg-red-50'
                  : a.severity === 'warning'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {a.severity} · {a.status}
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">{a.title}</div>
                  <p className="mt-1 text-sm text-slate-700">{a.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  {a.status === 'open' ? (
                    <button
                      type="button"
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                      onClick={async () => {
                        await acknowledgeRecoveryAlert(a._id);
                        load();
                      }}
                    >
                      Acknowledge
                    </button>
                  ) : null}
                  {a.status !== 'resolved' ? (
                    <button
                      type="button"
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                      onClick={async () => {
                        await resolveRecoveryAlert(a._id);
                        load();
                      }}
                    >
                      Resolve
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          {!alerts?.length ? (
            <p className="text-sm text-slate-500">No alerts for this filter.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
