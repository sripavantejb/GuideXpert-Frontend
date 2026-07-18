import { useCallback, useEffect, useState } from 'react';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import { getRecoveryAuditLogs } from '../../../utils/conversationRecoveryAdminApi';

export default function ConversationRecoveryAudit() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getRecoveryAuditLogs({ limit: 100 });
    const payload = res.data?.data ?? res.data;
    setItems(payload?.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
          <FiLoader className="h-5 w-5 animate-spin" /> Loading audit log…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Admin</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Student / Phone</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id} className="border-t border-slate-100">
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-3 py-2">{row.adminEmail || row.adminId || '—'}</td>
                  <td className="px-3 py-2 font-medium">{row.action}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {row.targetStudent || row.targetPhone || String(row.targetCaseId || '—')}
                  </td>
                  <td className="px-3 py-2">{row.reason || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.ip || '—'}</td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    No audit entries yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
