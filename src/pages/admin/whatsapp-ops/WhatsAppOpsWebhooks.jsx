import { useCallback, useEffect, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { listWhatsappOpsWebhooks } from '../../../utils/whatsappOpsAdminApi';
import { defaultRangeIsoDates, formatDt } from './whatsappOpsShared';
import WaStatusBadge from '../../../components/Admin/whatsapp-ops/WaStatusBadge';

export default function WhatsAppOpsWebhooks() {
  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const res = await listWhatsappOpsWebhooks({ from, to, limit: 75, page: 1 });
    setLoading(false);
    if (!res.success) setErr(res.message);
    else setRows(Array.isArray(res.data.data) ? res.data.data : []);
  }, [from, to]);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inbound webhooks</h1>
          <p className="text-sm text-gray-600 mt-1">
            Stored callbacks from POST <code className="text-xs bg-gray-100 px-1 rounded">/webhook/gupshup</code> (set this full URL on the Gupshup app). Payload shapes vary — parser is defensive; duplicates dedupe by hash.
          </p>
        </div>
        <div className="flex gap-2 items-end">
          <input type="date" value={from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className="rounded border px-2 py-1 text-sm" />
          <input type="date" value={to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className="rounded border px-2 py-1 text-sm" />
          <button type="button" className="px-3 py-2 rounded-lg border bg-white text-sm font-semibold" onClick={load}>Apply</button>
        </div>
      </header>

      {err && <div className="bg-rose-50 border border-rose-200 text-sm px-4 py-2 rounded-lg">{err}</div>}
      {loading ? (
        <div className="flex justify-center py-16 gap-2 text-gray-600">
          <FiLoader className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden max-h-[70vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 text-xs uppercase text-left">
              <tr>
                <th className="px-3 py-2">Received</th>
                <th className="px-3 py-2">Message id</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Snippet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((w) => (
                <tr key={w._id}>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDt(w.receivedAt)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{w.messageId || '—'}</td>
                  <td className="px-3 py-2">{w.phone ? `***${String(w.phone).slice(-4)}` : '—'}</td>
                  <td className="px-3 py-2"><WaStatusBadge status={w.status} /></td>
                  <td className="px-3 py-2 text-xs text-gray-700 max-w-md truncate">{w.rawPayloadSnippet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
