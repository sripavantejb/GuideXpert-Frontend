import { useCallback, useEffect, useMemo, useState } from 'react';
import KpiCard from '../../../components/Admin/KpiCard';
import ChartContainer from '../../../components/Admin/ChartContainer';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import { getWhatsappOpsMeta, getWhatsappOpsSummary } from '../../../utils/whatsappOpsAdminApi';
import { defaultRangeIsoDates } from './whatsappOpsShared';
import { useWhatsappOpsHost } from './whatsappOpsHostContext';

const POLL_KEY = 'guidexpert_whatsapp_ops_poll';
const FALLBACK_TEMPLATE_KINDS = [
  { id: 'slot_booked', label: 'Slot booked', description: 'Immediate confirmation after slot booking' },
  { id: 'pre4hr', label: '4hr reminder', description: 'Reminder sent around 4 hours before slot' },
  { id: 'meet', label: 'Meet link (~1hr)', description: 'Meeting link reminder sent around 1 hour before slot' },
  { id: '30min', label: '30 min reminder', description: 'Final reminder sent around 30 minutes before slot' }
];

export default function WhatsAppOpsOverview() {
  const { notifyWhatsappOpsApi404, clearWhatsappOpsApi404 } = useWhatsappOpsHost();
  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [selectedKind, setSelectedKind] = useState(null);
  const [templateKinds, setTemplateKinds] = useState(FALLBACK_TEMPLATE_KINDS);
  const [live, setLive] = useState(
    () => typeof localStorage === 'undefined' || localStorage.getItem(POLL_KEY) !== 'off'
  );
  const [lastSync, setLastSync] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [payload, setPayload] = useState(null);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    const res = await getWhatsappOpsSummary({ from, to, ...(selectedKind ? { messageKind: selectedKind } : {}) });
    setLoading(false);
    setLastSync(new Date());
    if (!res.success) {
      if (res.status === 404) {
        notifyWhatsappOpsApi404();
        setErr(null);
        setPayload(null);
      } else {
        clearWhatsappOpsApi404();
        setErr(res.message || 'Failed to load summary');
        setPayload(null);
      }
      return;
    }
    clearWhatsappOpsApi404();
    setPayload(res.data?.data ?? res.data);
  }, [from, to, selectedKind, notifyWhatsappOpsApi404, clearWhatsappOpsApi404]);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [live, load]);

  useEffect(() => {
    const onPoll = (e) => {
      const on = typeof e.detail === 'boolean' ? e.detail : localStorage.getItem(POLL_KEY) !== 'off';
      setLive(on);
    };
    window.addEventListener('whatsapp-ops-poll', onPoll);
    return () => window.removeEventListener('whatsapp-ops-poll', onPoll);
  }, []);

  useEffect(() => {
    let disposed = false;
    getWhatsappOpsMeta().then((res) => {
      if (disposed || !res.success) return;
      const data = res.data?.data ?? res.data;
      if (Array.isArray(data?.templateKinds) && data.templateKinds.length > 0) {
        setTemplateKinds(data.templateKinds);
      }
    });
    return () => {
      disposed = true;
    };
  }, []);

  const byKindChart = useMemo(
    () => (payload?.byKind || []).map((x) => ({ label: x.kind || '—', count: x.count || 0 })),
    [payload]
  );

  const byStatusChart = useMemo(
    () => (payload?.byStatus || []).map((x) => ({ label: x.status || '—', count: x.count || 0 })),
    [payload]
  );

  const t = payload?.totals || {};
  const selectedTemplate = selectedKind
    ? templateKinds.find((k) => k.id === selectedKind) || FALLBACK_TEMPLATE_KINDS.find((k) => k.id === selectedKind)
    : null;
  const showGlobalOnly = !selectedKind;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/60 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Overview</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            {selectedTemplate
              ? `Metrics for ${selectedTemplate.label} in the selected date range.`
              : 'Aggregate WhatsApp attempts, delivery signals, webhook volume, and cron health.'}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-gray-600">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              className="mt-1 block rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-gray-600">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="mt-1 block rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer mt-6">
            <input
              type="checkbox"
              checked={live}
              onChange={(e) => {
                const next = e.target.checked;
                setLive(next);
                localStorage.setItem(POLL_KEY, next ? 'on' : 'off');
              }}
            />
            Live (60s)
          </label>
          <button
            type="button"
            onClick={load}
            className="mt-6 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
        </div>

        <section className="mt-4 rounded-xl border border-gray-200 bg-white/90 p-3 sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Template message type</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedKind(null)}
            aria-pressed={selectedKind === null}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/40 ${
              selectedKind === null
                ? 'bg-primary-navy text-white border-primary-navy'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {templateKinds.map((kind) => (
            <button
              key={kind.id}
              type="button"
              onClick={() => setSelectedKind(kind.id)}
              aria-pressed={selectedKind === kind.id}
              title={kind.description || kind.label}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/40 ${
                selectedKind === kind.id
                  ? 'bg-primary-navy text-white border-primary-navy'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {kind.label}
            </button>
          ))}
        </div>
        </section>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
        <span
          className={`inline-block h-2 w-2 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}
        />
        Last sync: {lastSync ? lastSync.toLocaleString('en-IN') : '—'}
        </div>
      </header>

      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{err}</div>
      )}
      {loading && !payload && (
        <div className="flex items-center gap-2 text-gray-500 py-16 justify-center">
          <FiLoader className="animate-spin" /> Loading metrics…
        </div>
      )}

      {payload && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Delivery performance</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard label="Attempts" value={t.whatsappAttempts ?? 0} accent />
            <KpiCard label="Success (approx.)" value={t.whatsappSuccessApprox ?? 0} />
            <KpiCard label="Failed" value={t.whatsappFailed ?? 0} />
            <KpiCard label="Messages read" value={t.readCount ?? 0} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard label="Delivered" value={t.deliveredCount ?? 0} />
            <KpiCard label="Retried events" value={t.retried ?? 0} />
            <KpiCard label="Retry exhausted (approx.)" value={t.permanentlyFailedApprox ?? 0} />
            {showGlobalOnly ? <KpiCard label="Webhook events" value={t.webhookEvents ?? 0} /> : <div className="hidden xl:block" />}
          </div>

          <div className={`grid gap-4 ${showGlobalOnly ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
            <KpiCard
              accent="hero"
              label="Delivery rate (approx.)"
              value={`${payload.rates?.deliveryRatePct ?? '—'}%`}
              subtitle="Submitted + delivered + read / attempts"
            />
            <KpiCard label="Retry rate" value={`${payload.rates?.retryRatePct ?? '—'}%`} subtitle="Events with retries" />
            {showGlobalOnly && (
              <KpiCard
                label="Cron failures"
                value={payload.cronRuns?.failure ?? 0}
                subtitle={`Runs: ${payload.cronRuns?.runs ?? 0} · Success ~${payload.rates?.cronSuccessRatePct ?? '—'}%`}
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Trends</h2>
          </div>
          <div className={`grid gap-6 ${showGlobalOnly ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
            {showGlobalOnly && (
              <ChartContainer title="Messages by type" subtitle="Recorded events in range">
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={byKindChart} margin={{ top: 12, left: 0, right: 16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                      <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <Tooltip formatter={(value) => [value, 'events']} />
                      <Bar dataKey="count" fill="#1e40af" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>
            )}

            <ChartContainer
              title="Messages by status"
              subtitle={showGlobalOnly ? 'Normalized event statuses' : `Statuses for ${selectedTemplate?.label || 'selected template'}`}
            >
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={byStatusChart} margin={{ top: 12, left: 0, right: 16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <Tooltip formatter={(value) => [value, 'events']} />
                    <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </div>
        </>
      )}
    </div>
  );
}
