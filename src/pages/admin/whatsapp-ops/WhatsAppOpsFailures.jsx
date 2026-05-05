import { useCallback, useEffect, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { getWhatsappOpsFailuresRollup } from '../../../utils/whatsappOpsAdminApi';
import { defaultRangeIsoDates, formatDt } from './whatsappOpsShared';

export default function WhatsAppOpsFailures() {
  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const res = await getWhatsappOpsFailuresRollup({ from, to });
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
          <h1 className="text-xl font-bold text-gray-900">Failure fingerprints</h1>
          <p className="text-sm text-gray-600 mt-1">Grouped trimmed error strings from WhatsApp message events.</p>
        </div>
        <div className="flex gap-2 items-end">
          <input type="date" value={from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className="rounded border px-2 py-1 text-sm" />
          <input type="date" value={to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className="rounded border px-2 py-1 text-sm" />
          <button type="button" className="px-3 py-2 rounded-lg border bg-white text-sm font-semibold" onClick={load}>Apply</button>
        </div>
      </header>

      {err && <div className="bg-rose-50 border border-rose-200 text-sm px-4 py-2 rounded-lg">{err}</div>}
      {loading ? (
        <div className="flex justify-center py-16 gap-2"><FiLoader className="animate-spin" /></div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr className="text-left">
                <th className="px-4 py-2">Count</th>
                <th className="px-4 py-2">Last seen</th>
                <th className="px-4 py-2">Sample message id</th>
                <th className="px-4 py-2">Error (trimmed)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((g) => (
                <tr key={g._id}>
                  <td className="px-4 py-2 font-bold">{g.count}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{formatDt(g.latest)}</td>
                  <td className="px-4 py-2 font-mono text-xs">{g.sampleId || '—'}</td>
                  <td className="px-4 py-2 text-gray-800">{g._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
