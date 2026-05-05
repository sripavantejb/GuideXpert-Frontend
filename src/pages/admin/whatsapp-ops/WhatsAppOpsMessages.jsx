import { useEffect, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';
import {
  listWhatsappOpsMessages,
  getWhatsappOpsMessageTimeline,
  manualWhatsappOpsResend,
} from '../../../utils/whatsappOpsAdminApi';
import { defaultRangeIsoDates, formatDt } from './whatsappOpsShared';
import WaStatusBadge from '../../../components/Admin/whatsapp-ops/WaStatusBadge';

export default function WhatsAppOpsMessages() {
  const { user } = useAuth();
  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [messageKind, setMessageKind] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1 });
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [drawer, setDrawer] = useState(null);
  const [tlLoading, setTlLoading] = useState(false);
  const [resendBusy, setResendBusy] = useState(null);

  const isSuper = user?.isSuperAdmin === true;

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(async () => {
      setLoading(true);
      setErr(null);
      const params = {
        from,
        to,
        page,
        limit: 40,
        ...(phone ? { phone } : {}),
        ...(name ? { name } : {}),
        ...(messageKind ? { messageKind } : {}),
        ...(status ? { status } : {}),
      };
      const res = await listWhatsappOpsMessages(params);
      if (cancelled) return;
      setLoading(false);
      if (!res.success) {
        setErr(res.message);
        setRows([]);
        return;
      }
      setRows(Array.isArray(res.data.data) ? res.data.data : []);
      setMeta({ total: res.data.total || 0, page: res.data.page });
    });
    return () => {
      cancelled = true;
    };
  }, [from, to, phone, name, messageKind, status, page, reloadKey]);

  async function openTimeline(id) {
    setDrawer(null);
    setTlLoading(true);
    const res = await getWhatsappOpsMessageTimeline(id);
    setTlLoading(false);
    if (res.success) setDrawer(res.data.data);
    else {
      setDrawer(null);
      alert(res.message || 'Could not load timeline');
    }
  }

  async function resend(row, kindOverride) {
    if (!row?.formSubmissionId) return;
    if (!window.confirm('Super-admin resend: duplicate message may be delivered. Continue?')) return;
    setResendBusy(row._id);
    const kind = kindOverride || row.messageKind;
    const res = await manualWhatsappOpsResend({ formSubmissionId: row.formSubmissionId, messageKind: kind });
    setResendBusy(null);
    if (!res.success) alert(res.message || 'Resend failed');
    else setReloadKey((k) => k + 1);
  }

  return (
    <div className="space-y-6 relative">
      <header className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Message events</h1>
        <p className="text-sm text-gray-600 mt-1">Every recorded send attempt (from safeSendWhatsApp + webhooks).</p>
      </header>

      <div className="flex flex-wrap gap-3 items-end bg-white border border-gray-200 rounded-xl p-4">
        <label className="text-xs text-gray-600">
          From
          <input type="date" value={from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className="block mt-1 rounded border px-2 py-1" />
        </label>
        <label className="text-xs text-gray-600">
          To
          <input type="date" value={to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className="block mt-1 rounded border px-2 py-1" />
        </label>
        <label className="text-xs text-gray-600">
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit" className="block mt-1 rounded border px-2 py-1 w-36" />
        </label>
        <label className="text-xs text-gray-600">
          Name contains
          <input value={name} onChange={(e) => setName(e.target.value)} className="block mt-1 rounded border px-2 py-1 w-40" />
        </label>
        <label className="text-xs text-gray-600">
          Kind
          <select value={messageKind} onChange={(e) => setMessageKind(e.target.value)} className="block mt-1 rounded border px-2 py-1">
            <option value="">All</option>
            <option value="slot_booked">slot_booked</option>
            <option value="pre4hr">pre4hr</option>
            <option value="meet">meet</option>
            <option value="30min">30min</option>
          </select>
        </label>
        <label className="text-xs text-gray-600">
          Status
          <input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g. submitted" className="block mt-1 rounded border px-2 py-1 w-32" />
        </label>
        <button
          type="button"
          className="px-3 py-2 rounded-lg border bg-gray-900 text-white font-semibold text-sm"
          onClick={() => {
            setPage(1);
            setReloadKey((k) => k + 1);
          }}
        >
          Search
        </button>
      </div>

      {err && <div className="text-sm text-rose-800 bg-rose-50 border border-rose-200 px-4 py-2 rounded-lg">{err}</div>}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 text-xs uppercase text-gray-700 z-10">
              <tr>
                <th className="text-left px-3 py-2">When</th>
                <th className="text-left px-3 py-2">User</th>
                <th className="text-left px-3 py-2">Phone</th>
                <th className="text-left px-3 py-2">Kind</th>
                <th className="text-left px-3 py-2">Template</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Cron</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                    <FiLoader className="inline animate-spin mr-2" /> Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-gray-600">
                    No message events yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{formatDt(r.createdAt)}</td>
                  <td className="px-3 py-2">{r.userName || '—'}</td>
                  <td className="px-3 py-2 font-mono">***{String(r.phone).slice(-4)}</td>
                  <td className="px-3 py-2">{r.messageKind}</td>
                  <td className="px-3 py-2 font-mono text-xs max-w-[120px] truncate" title={r.templateId}>{r.templateId || r.templateIdEnvKey || '—'}</td>
                  <td className="px-3 py-2">
                    <WaStatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-2 text-xs">{r.cronJobKey || r.source}</td>
                  <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                    <button type="button" className="text-primary-navy font-semibold hover:underline" onClick={() => openTimeline(r._id)}>
                      Timeline
                    </button>
                    {isSuper && r.formSubmissionId && (
                      <button
                        type="button"
                        disabled={resendBusy === r._id}
                        className="text-rose-700 font-semibold hover:underline disabled:opacity-40"
                        onClick={() => resend(r)}
                      >
                        Resend kind
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded-lg disabled:opacity-40">
          Prev
        </button>
        <span className="text-gray-700">
          Page {page} &middot; {meta.total} rows
        </span>
        <button
          type="button"
          disabled={loading || page * 40 >= meta.total}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded-lg disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {(tlLoading || drawer) && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white shadow-2xl border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-lg">Timeline</h2>
            <button
              type="button"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900"
              onClick={() => {
                setDrawer(null);
                setTlLoading(false);
              }}
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4 text-sm">
            {tlLoading && !drawer && (
              <p className="text-gray-500 py-16 flex items-center gap-2 justify-center">
                <FiLoader className="animate-spin" /> Loading timeline…
              </p>
            )}
            {drawer && (
              <>
                <div>
                  <p className="font-semibold text-gray-900">Event</p>
                  <pre className="text-xs bg-gray-50 rounded-lg p-2 overflow-auto max-h-48">{JSON.stringify(drawer.event, null, 2)}</pre>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Inbound webhooks ({drawer.webhooks?.length || 0})</p>
                  <ul className="space-y-2">
                    {(drawer.webhooks || []).map((w) => (
                      <li key={w._id} className="border border-gray-100 rounded-lg p-2 text-xs">
                        <span className="font-semibold">{formatDt(w.receivedAt)}</span>{' '}
                        <WaStatusBadge status={w.status} /> msg {w.messageId || '—'}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
