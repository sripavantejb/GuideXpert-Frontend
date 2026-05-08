import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiDownload,
  FiLoader,
  FiPlay,
  FiSearch,
  FiSlash
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';
import {
  listWhatsappOpsMessages,
  getWhatsappOpsMessageTimeline,
  manualWhatsappOpsResend,
  previewWhatsappOpsManualRecovery,
  startWhatsappOpsManualRecovery,
  getWhatsappOpsManualRecoveryJob,
  cancelWhatsappOpsManualRecoveryJob
} from '../../../utils/whatsappOpsAdminApi';
import { defaultRangeIsoDates, formatDt } from './whatsappOpsShared';
import WaStatusBadge from '../../../components/Admin/whatsapp-ops/WaStatusBadge';

const TEMPLATE_LABELS = {
  slot_booked: 'Slot booked',
  pre4hr: '4hr reminder',
  meet: 'Meet link (~1hr)',
  '30min': '30 min reminder'
};

function buildUnresolvedCsv(candidates) {
  const header = 'phone,reason,status,attemptNumber,retryGroupId,errorMessage,createdAt';
  const lines = (candidates || []).map((c) => [
    c.phone || '',
    c.reason || '',
    c.status || '',
    c.attemptNumber ?? '',
    c.retryGroupId ? String(c.retryGroupId) : '',
    (c.errorMessage || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""'),
    c.createdAt ? new Date(c.createdAt).toISOString() : ''
  ].map((v) => /[",]/.test(String(v)) ? `"${v}"` : String(v)).join(','));
  return [header, ...lines].join('\n');
}

function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ManualRecoveryPanel({ messageKind, from, to, isSuper, onJobComplete }) {
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErr, setPreviewErr] = useState(null);
  const [job, setJob] = useState(null);
  const [starting, setStarting] = useState(false);
  const [actionErr, setActionErr] = useState(null);
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const refreshJob = useCallback(async (jobId) => {
    if (!jobId) return null;
    const res = await getWhatsappOpsManualRecoveryJob(jobId);
    if (!res.success) return null;
    const data = res.data?.data ?? res.data;
    setJob(data);
    return data;
  }, []);

  const startPolling = useCallback((jobId) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const next = await refreshJob(jobId);
      if (next && (next.status === 'completed' || next.status === 'failed' || next.status === 'cancelled')) {
        stopPolling();
        if (typeof onJobComplete === 'function') onJobComplete(next);
      }
    }, 2000);
  }, [refreshJob, stopPolling, onJobComplete]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const handlePreview = useCallback(async () => {
    setPreviewLoading(true);
    setPreviewErr(null);
    const res = await previewWhatsappOpsManualRecovery({ messageKind, from, to });
    setPreviewLoading(false);
    if (!res.success) {
      setPreviewErr(res.message || 'Preview failed');
      setPreview(null);
      return;
    }
    setPreview(res.data?.data ?? res.data);
  }, [messageKind, from, to]);

  const handleStart = useCallback(async () => {
    if (!preview || !preview.candidates?.length) {
      setActionErr('Preview first to load candidates');
      return;
    }
    if (!window.confirm(`Send recovery to ${preview.candidates.length} unresolved recipient(s)?`)) return;
    setStarting(true);
    setActionErr(null);
    const res = await startWhatsappOpsManualRecovery({ messageKind, from, to });
    setStarting(false);
    if (!res.success) {
      setActionErr(res.message || 'Could not start recovery');
      return;
    }
    const data = res.data?.data ?? res.data;
    if (data?.jobId) {
      const initial = await refreshJob(data.jobId);
      if (initial && initial.status === 'running') startPolling(data.jobId);
      else if (initial && initial.status === 'queued') startPolling(data.jobId);
    }
  }, [preview, messageKind, from, to, refreshJob, startPolling]);

  const handleCancel = useCallback(async () => {
    if (!job?._id) return;
    if (!window.confirm('Cancel this recovery job? In-progress sends will not be reverted.')) return;
    const res = await cancelWhatsappOpsManualRecoveryJob(job._id);
    if (res.success) await refreshJob(job._id);
  }, [job, refreshJob]);

  const handleCopy = useCallback(async () => {
    const list = preview?.candidates || [];
    if (!list.length) return;
    const text = list.map((c) => c.phone).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      document.body.removeChild(fallback);
    }
  }, [preview]);

  const handleExport = useCallback(() => {
    const list = preview?.candidates || [];
    if (!list.length) return;
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`unresolved-${messageKind}-${date}.csv`, buildUnresolvedCsv(list));
  }, [preview, messageKind]);

  const counts = preview?.candidatesByReason || {};
  const isSlotBooked = messageKind === 'slot_booked';
  const isJobRunning = job && (job.status === 'queued' || job.status === 'running');
  const counters = job?.counters || {};

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-200 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">Manual recovery</p>
          <h2 className="mt-1 text-base font-semibold text-amber-950">
            {TEMPLATE_LABELS[messageKind] || messageKind} · unresolved recipients
          </h2>
          <p className="mt-1 text-xs text-amber-900/80">
            Targets recipients still failed, excluded, or stuck after automated retries. Skips phones that have
            recently been delivered/read globally to prevent duplicate messages.
          </p>
          {isSlotBooked && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-amber-900">
              Transactional template · immediate-only retry policy preserved
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {previewLoading ? <FiLoader className="animate-spin" size={14} /> : <FiSearch size={14} />}
            Preview unresolved
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!preview?.candidates?.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCopy size={14} /> Copy phones
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!preview?.candidates?.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiDownload size={14} /> Export CSV
          </button>
          {isSuper && (
            <button
              type="button"
              onClick={handleStart}
              disabled={starting || isJobRunning || !preview?.candidates?.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {starting ? <FiLoader className="animate-spin" size={14} /> : <FiPlay size={14} />}
              Start recovery
            </button>
          )}
          {isSuper && isJobRunning && (
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FiSlash size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      {previewErr && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{previewErr}</div>
      )}
      {actionErr && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{actionErr}</div>
      )}

      {preview && (
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-amber-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">Unresolved breakdown</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-2">
                <p className="text-[11px] uppercase text-amber-800">Targeted</p>
                <p className="text-base font-semibold text-amber-950">{preview.targeted || 0}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-2">
                <p className="text-[11px] uppercase text-emerald-800">Skipped (already delivered)</p>
                <p className="text-base font-semibold text-emerald-900">
                  {(preview.skippedAlreadyDelivered || 0) + (preview.skippedGlobalRecentSuccess || 0)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2">
                <p className="text-[11px] uppercase text-slate-600">Skipped (in-flight)</p>
                <p className="text-base font-semibold text-slate-800">{preview.skippedInFlightDuplicate || 0}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2">
                <p className="text-[11px] uppercase text-slate-600">Lookback / stale</p>
                <p className="text-xs font-mono text-slate-700">
                  {preview.lookbackDays || '—'}d / {preview.inFlightStaleMinutes || '—'}m
                </p>
              </div>
            </div>
            {Object.keys(counts).length > 0 && (
              <div className="mt-3 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                {Object.entries(counts).map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50/40 px-2 py-1">
                    <span className="text-amber-900">{reason.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-amber-950">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
              {job ? 'Recovery job progress' : 'No active job'}
            </p>
            {job ? (
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    job.status === 'completed' ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : job.status === 'failed' ? 'border-rose-300 bg-rose-50 text-rose-900'
                    : job.status === 'cancelled' ? 'border-slate-300 bg-slate-50 text-slate-700'
                    : 'border-amber-300 bg-amber-50 text-amber-900'
                  }`}>{job.status}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{job._id}</span>
                  {job.startedAt && <span className="text-slate-400">started {formatDt(job.startedAt)}</span>}
                  {job.finishedAt && <span className="text-slate-400">finished {formatDt(job.finishedAt)}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Counter label="Targeted" value={counters.targeted} />
                  <Counter label="Attempted" value={counters.attempted} />
                  <Counter label="API accepted" value={counters.apiAccepted} accent="text-emerald-700" />
                  <Counter label="Send failed" value={counters.sendFailed} accent="text-rose-700" />
                  <Counter label="Skipped delivered" value={counters.skippedAlreadyDelivered} />
                  <Counter label="Skipped recent" value={counters.skippedGlobalRecentSuccess} />
                  <Counter label="Skipped in-flight" value={counters.skippedInFlightDuplicate} />
                  <Counter label="Remaining" value={counters.remaining} accent="text-amber-800" />
                </div>
                {job.errorSummary && (
                  <p className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-rose-800">{job.errorSummary}</p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Run preview, then start recovery (super-admin) to send fresh attempts to unresolved recipients.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Counter({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-1.5">
      <p className="text-[10px] uppercase text-slate-500">{label}</p>
      <p className={`text-sm font-semibold ${accent || 'text-slate-800'}`}>{Number.isFinite(value) ? value : 0}</p>
    </div>
  );
}

export default function WhatsAppOpsMessages() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [messageKind, setMessageKind] = useState('');
  const [status, setStatus] = useState('');
  const [attemptNumber, setAttemptNumber] = useState('');
  const [retryGroupId, setRetryGroupId] = useState('');
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
    const date = searchParams.get('date');
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setRange({ from: date, to: date });
    } else {
      const fromQ = searchParams.get('from');
      const toQ = searchParams.get('to');
      if (fromQ && /^\d{4}-\d{2}-\d{2}$/.test(fromQ)) {
        setRange((r) => ({
          from: fromQ,
          to: toQ && /^\d{4}-\d{2}-\d{2}$/.test(toQ) ? toQ : r.to
        }));
      } else if (toQ && /^\d{4}-\d{2}-\d{2}$/.test(toQ)) {
        setRange((r) => ({ ...r, to: toQ }));
      }
    }
    const k = searchParams.get('messageKind');
    if (k) setMessageKind(k);
    const st = searchParams.get('status');
    if (st) setStatus(st);
    const an = searchParams.get('attemptNumber');
    if (an) setAttemptNumber(an);
    const rg = searchParams.get('retryGroupId');
    if (rg) setRetryGroupId(rg);
  }, [searchParams]);

  const statusPillClass = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'read' || s === 'delivered') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (s === 'sent') return 'bg-sky-50 text-sky-900 border-sky-200';
    if (s === 'failed' || s === 'retry_exhausted') return 'bg-rose-50 text-rose-800 border-rose-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

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
        ...(attemptNumber ? { attemptNumber } : {}),
        ...(retryGroupId ? { retryGroupId } : {}),
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
  }, [from, to, phone, name, messageKind, status, attemptNumber, retryGroupId, page, reloadKey]);

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

  const auditSummary = useMemo(() => {
    const counts = { delivered: 0, failed: 0, pending: 0 };
    rows.forEach((r) => {
      const s = String(r.deliveryStatus || r.status || '').toLowerCase();
      if (s === 'read' || s === 'delivered') counts.delivered += 1;
      else if (s === 'failed' || s === 'retry_exhausted') counts.failed += 1;
      else counts.pending += 1;
    });
    return counts;
  }, [rows]);

  return (
    <div className="space-y-6 relative">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/60 p-5 sm:p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Delivery audit</h1>
        <p className="text-sm text-gray-600 mt-1">
          Real recipient-level WhatsApp delivery records from backend events and webhooks.
        </p>

        {messageKind && (
          <div className="mt-5">
            <ManualRecoveryPanel
              key={`${messageKind}|${from}|${to}`}
              messageKind={messageKind}
              from={from}
              to={to}
              isSuper={isSuper}
              onJobComplete={() => setReloadKey((k) => k + 1)}
            />
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-emerald-700">Received/delivered (page)</p>
            <p className="mt-1 flex items-center gap-2 text-xl font-bold text-emerald-900">
              <FiCheckCircle /> {auditSummary.delivered}
            </p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-rose-700">Failed (page)</p>
            <p className="mt-1 flex items-center gap-2 text-xl font-bold text-rose-900">
              <FiAlertCircle /> {auditSummary.failed}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-amber-700">Pending/submitted (page)</p>
            <p className="mt-1 flex items-center gap-2 text-xl font-bold text-amber-900">
              <FiClock /> {auditSummary.pending}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 items-end bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
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
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="block mt-1 rounded border px-2 py-1 w-44">
            <option value="">All</option>
            <option value="submitted">submitted</option>
            <option value="sent">sent</option>
            <option value="delivered">delivered</option>
            <option value="read">read</option>
            <option value="failed">failed (+ retry_exhausted via multi)</option>
            <option value="failed,retry_exhausted">failed,retry_exhausted</option>
            <option value="retry_exhausted">retry_exhausted</option>
          </select>
        </label>
        <label className="text-xs text-gray-600">
          Attempt #
          <select
            value={attemptNumber}
            onChange={(e) => setAttemptNumber(e.target.value)}
            className="block mt-1 rounded border px-2 py-1 w-28"
          >
            <option value="">All</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </label>
        <label className="text-xs text-gray-600">
          Retry group id
          <input
            value={retryGroupId}
            onChange={(e) => setRetryGroupId(e.target.value)}
            placeholder="Mongo ObjectId"
            className="block mt-1 rounded border px-2 py-1 w-52 font-mono text-xs"
          />
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
                <th className="text-left px-3 py-2">Sent time</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Phone number</th>
                <th className="text-left px-3 py-2">Message type</th>
                <th className="text-left px-3 py-2">Attempt</th>
                <th className="text-left px-3 py-2">Retry group</th>
                <th className="text-left px-3 py-2">Delivery status</th>
                <th className="text-left px-3 py-2">Failure reason</th>
                <th className="text-left px-3 py-2">Retry count</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-gray-500">
                    <FiLoader className="inline animate-spin mr-2" /> Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-10 text-center text-gray-600">
                    No message events yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{formatDt(r.sentAt || r.createdAt)}</td>
                  <td className="px-3 py-2">{r.userName || 'Not available'}</td>
                  <td className="px-3 py-2 font-mono">{r.phone || 'Not available'}</td>
                  <td className="px-3 py-2">{r.messageKind || 'Not available'}</td>
                  <td className="px-3 py-2 text-center">{r.attemptNumber ?? '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs max-w-[120px] truncate" title={r.retryGroupId ? String(r.retryGroupId) : ''}>
                    {r.retryGroupId ? String(r.retryGroupId).slice(-8) : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusPillClass(r.deliveryStatus || r.status)}`}>
                      {r.deliveryStatus || r.status || 'Not available'}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-[280px]">
                    {r.failureReason ? (
                      <span className="line-clamp-2 text-xs text-rose-800" title={r.failureReason}>{r.failureReason}</span>
                    ) : (
                      <span className="text-xs text-gray-500">None</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">{r.retryCount ?? r.retryCountSnapshot ?? 0}</td>
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
