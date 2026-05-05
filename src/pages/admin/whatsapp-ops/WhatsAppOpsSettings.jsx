import { useEffect, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { getWhatsappOpsMeta } from '../../../utils/whatsappOpsAdminApi';

const POLL_KEY = 'guidexpert_whatsapp_ops_poll';

export default function WhatsAppOpsSettings() {
  const [meta, setMeta] = useState(null);
  const [poll, setPoll] = useState(() => localStorage.getItem(POLL_KEY) !== 'off');

  useEffect(() => {
    localStorage.setItem(POLL_KEY, poll ? 'on' : 'off');
    window.dispatchEvent(new CustomEvent('whatsapp-ops-poll', { detail: poll }));
  }, [poll]);

  useEffect(() => {
    let cancelled = false;
    getWhatsappOpsMeta().then((res) => {
      if (!cancelled && res.success) setMeta(res.data?.data ?? res.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 max-w-xl">
      <header className="border-b pb-4">
        <h1 className="text-xl font-bold text-gray-900">Operations settings</h1>
        <p className="text-sm text-gray-600 mt-1">Safe read-only hints. Never displays secret env values.</p>
      </header>

      {!meta ? (
        <p className="text-gray-500 inline-flex gap-2">
          <FiLoader className="animate-spin" /> Loading…
        </p>
      ) : (
        <ul className="rounded-xl border bg-white divide-y divide-gray-100">
          {(meta.envHints || []).map((k) => (
            <li key={k} className="px-4 py-2 font-mono text-sm text-gray-800">
              {k}
            </li>
          ))}
        </ul>
      )}

      <label className="flex items-center gap-2 text-sm cursor-pointer border rounded-xl px-4 py-3 bg-white">
        <input type="checkbox" checked={poll} onChange={(e) => setPoll(e.target.checked)} />
        Overview auto-refresh (toggle default for live KPI tiles)
      </label>
      <p className="text-xs text-gray-500">
        Frontend-only preference. Cron cadence stays in deployment config (Render / Vercel / external pings).
      </p>
    </div>
  );
}
