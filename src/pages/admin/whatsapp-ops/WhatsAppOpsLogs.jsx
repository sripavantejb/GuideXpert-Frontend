import { useState } from 'react';
import { downloadWhatsappOpsCsv, triggerWhatsappOpsRetryBatch } from '../../../utils/whatsappOpsAdminApi';
import { FiDownload, FiPlay, FiShield } from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';

export default function WhatsAppOpsLogs() {
  const [busy, setBusy] = useState(null);
  const [retryMsg, setRetryMsg] = useState('');
  const { user } = useAuth();
  const superAdmin = user?.isSuperAdmin === true;

  async function handleExport(type) {
    setBusy(`export:${type}`);
    try {
      await downloadWhatsappOpsCsv(type);
    } catch (e) {
      alert(e.message || 'Export failed');
    }
    setBusy(null);
  }

  async function handleRetryCron() {
    if (!confirm('Super-admin manual retry sweep (same selector as cron). Proceed?')) return;
    setBusy('retry');
    setRetryMsg('');
    try {
      const res = await triggerWhatsappOpsRetryBatch();
      if (!res.success) setRetryMsg(res.message || 'Failed');
      else setRetryMsg(`OK · attempted ${JSON.stringify(res.data?.data ?? res.data)}`);
    } catch (e) {
      setRetryMsg(e.message || 'HTTP error');
    }
    setBusy(null);
  }

  const btn = 'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50';

  return (
    <div className="space-y-6">
      <header className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Logs & exports</h1>
        <p className="text-sm text-gray-600 mt-1">
          Download sanitized CSV snapshots for offline analysis / incident response.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <button type="button" disabled={busy} className={btn} onClick={() => handleExport('messages')}>
          <FiDownload /> Messages CSV
        </button>
        <button type="button" disabled={busy} className={btn} onClick={() => handleExport('cron')}>
          <FiDownload /> Cron runs CSV
        </button>
        <button type="button" disabled={busy} className={btn} onClick={() => handleExport('webhooks')}>
          <FiDownload /> Webhooks CSV
        </button>
        <button type="button" disabled={busy} className={btn} onClick={() => handleExport('failures')}>
          <FiDownload /> Failures CSV
        </button>
      </div>

      {superAdmin ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <FiShield /> Super-admin utilities
          </div>
          <p className="text-sm text-amber-950/90">
            Manual retry executes the same batch scan as{' '}
            <code>/api/cron/retry-whatsapp</code>. Requires confirmation header server-side (<code>x-whatsapp-ops-confirm: RETRY</code>).
          </p>
          <button
            type="button"
            disabled={busy === 'retry'}
            onClick={handleRetryCron}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-950 text-white px-4 py-2 text-sm font-bold hover:bg-amber-900 disabled:opacity-50"
          >
            <FiPlay /> Run retry batch now
          </button>
          {retryMsg && <p className="text-xs font-mono text-gray-900">{retryMsg}</p>}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Retry batch triggers are limited to super-admins.</p>
      )}
    </div>
  );
}
