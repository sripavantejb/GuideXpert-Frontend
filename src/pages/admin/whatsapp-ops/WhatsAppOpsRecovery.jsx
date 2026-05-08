import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiActivity,
  FiAlertOctagon,
  FiAlertTriangle,
  FiArrowDown,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiDownload,
  FiEye,
  FiInfo,
  FiLoader,
  FiPauseCircle,
  FiPlay,
  FiRefreshCw,
  FiRotateCw,
  FiSearch,
  FiSlash,
  FiSliders,
  FiTarget,
  FiX,
  FiZap
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';
import {
  cancelWhatsappOpsManualRecoveryJob,
  downloadUnresolvedCsv,
  getUnresolvedRecipients,
  getWhatsappOpsManualRecoveryJob,
  listWhatsappOpsManualRecoveryJobs,
  previewWhatsappOpsManualRecovery,
  startWhatsappOpsManualRecovery
} from '../../../utils/whatsappOpsAdminApi';
import { defaultRangeIsoDates, formatDt } from './whatsappOpsShared';
import WhatsAppOpsMessages from './WhatsAppOpsMessages';

const TEMPLATE_OPTIONS = [
  { value: '', label: 'All templates' },
  { value: 'slot_booked', label: 'slot_booked · transactional' },
  { value: 'pre4hr', label: 'pre4hr · 4 hour reminder' },
  { value: 'meet', label: 'meet · meeting link' },
  { value: '30min', label: '30min · 30 min reminder' }
];

const GROUP_OPTIONS = [
  { id: 'all', label: 'All unresolved' },
  { id: 'failed', label: 'Failed' },
  { id: 'excluded', label: 'Excluded' },
  { id: 'exhausted', label: 'Exhausted' },
  { id: 'not_accepted', label: 'Not accepted' },
  { id: 'in_flight_stale', label: 'In-flight stale' }
];

const EXCLUSION_CATEGORY_LABELS = {
  permanent_failure: 'Permanently failed',
  invalid_recipient: 'Invalid / no WhatsApp',
  retry_exhausted: 'Retry exhausted',
  cooldown: 'Cooldown blocked',
  duplicate_protected: 'Duplicate protected',
  manually_disabled: 'Manually disabled',
  already_resolved: 'Already resolved',
  unresolved_other: 'Other'
};

const EXCLUSION_CATEGORY_COLORS = {
  permanent_failure: 'border-rose-200 bg-rose-50 text-rose-800',
  invalid_recipient: 'border-slate-300 bg-slate-50 text-slate-700',
  retry_exhausted: 'border-amber-200 bg-amber-50 text-amber-800',
  cooldown: 'border-sky-200 bg-sky-50 text-sky-800',
  duplicate_protected: 'border-violet-200 bg-violet-50 text-violet-800',
  manually_disabled: 'border-slate-300 bg-slate-50 text-slate-700',
  already_resolved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  unresolved_other: 'border-slate-200 bg-slate-50 text-slate-700'
};

const TERMINAL_STATUSES = ['completed', 'failed', 'cancelled'];

function isTerminal(status) {
  return TERMINAL_STATUSES.includes(status);
}

function formatElapsed(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '0:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m < 60) return `${m}:${String(s).padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ${s}s`;
}

function copyToClipboard(text) {
  if (!text) return Promise.resolve();
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

function buildClipboardCsv(rows) {
  const header = 'phone,name,template,reason,exclusionCategory,lastStatus,lastEventId';
  const lines = (rows || []).map((r) => {
    const cells = [
      r.phone || '',
      r.name || '',
      r.messageKind || '',
      r.reason || '',
      r.exclusionCategory || '',
      r.lifecycleState || '',
      r.lastEventId ? String(r.lastEventId) : ''
    ];
    return cells
      .map((v) => {
        const s = String(v).replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
        return /[",]/.test(s) ? `"${s}"` : s;
      })
      .join(',');
  });
  return [header, ...lines].join('\n');
}

/* ============================================================================
 * SectionCard — standardized admin theme card shell with optional gradient header
 * ========================================================================= */

function SectionCard({
  icon: Icon,
  kicker,
  title,
  subtitle,
  headerRight,
  bodyClassName,
  className,
  children,
  noHeader,
  sticky,
  stickyTop = 'top-0'
}) {
  const stickyCls = sticky ? `sticky ${stickyTop} z-30` : '';
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-primary-blue-200 bg-white shadow-sm ${stickyCls} ${className || ''}`}
    >
      {!noHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-blue-200 bg-gradient-to-r from-primary-blue-50 to-white px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary-navy ring-1 ring-primary-blue-200">
                <Icon size={15} />
              </span>
            )}
            <div className="min-w-0">
              {kicker && (
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-navy">
                  {kicker}
                </p>
              )}
              {title && <h3 className="truncate text-sm font-semibold text-slate-900">{title}</h3>}
              {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {headerRight && <div className="flex flex-wrap items-center gap-2">{headerRight}</div>}
        </div>
      )}
      <div className={bodyClassName ?? 'p-4'}>{children}</div>
    </section>
  );
}

/* ============================================================================
 * Status pill with icon + intent color (used in unresolved table)
 * ========================================================================= */

function StatusPill({ status, size = 'sm' }) {
  const s = String(status || '').toLowerCase();
  let cls = 'border-slate-200 bg-slate-100 text-slate-700';
  let Icon = FiClock;
  if (s === 'delivered' || s === 'read') {
    cls = 'border-emerald-200 bg-emerald-50 text-emerald-800';
    Icon = FiCheckCircle;
  } else if (s === 'failed') {
    cls = 'border-rose-200 bg-rose-50 text-rose-800';
    Icon = FiAlertTriangle;
  } else if (s === 'retry_exhausted') {
    cls = 'border-amber-200 bg-amber-50 text-amber-800';
    Icon = FiAlertOctagon;
  } else if (s === 'sent') {
    cls = 'border-sky-200 bg-sky-50 text-sky-800';
    Icon = FiArrowRight;
  } else if (s === 'submitted') {
    cls = 'border-blue-200 bg-blue-50 text-blue-800';
    Icon = FiTarget;
  } else if (s === 'queued' || s === 'retry_pending') {
    cls = 'border-slate-200 bg-slate-50 text-slate-700';
    Icon = FiPauseCircle;
  }
  const sizeCls = size === 'lg'
    ? 'px-2.5 py-1 text-xs'
    : 'px-2 py-0.5 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${cls} ${sizeCls}`}>
      <Icon size={size === 'lg' ? 12 : 11} />
      {s || '—'}
    </span>
  );
}

function CounterTile({ label, value, accent }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-base font-semibold ${accent || 'text-slate-800'}`}>
        {Number.isFinite(value) ? value.toLocaleString() : (value || 0)}
      </p>
    </div>
  );
}

function KpiTile({ label, value, accent, icon: Icon }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="text-slate-400" size={11} />}
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
      <p className={`mt-0.5 text-2xl font-bold leading-tight ${accent || 'text-slate-900'}`}>
        {Number.isFinite(value) ? value.toLocaleString() : (value || 0)}
      </p>
    </div>
  );
}

function SummaryTile({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-primary-blue-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-primary-navy">{label}</p>
      <p className={`mt-0.5 text-xl font-bold leading-tight ${accent || 'text-slate-900'}`}>
        {Number.isFinite(value) ? value.toLocaleString() : (value || 0)}
      </p>
    </div>
  );
}

function severityStripeClass(row) {
  if (row.retryExhausted) return 'bg-rose-500';
  if (row.lifecycleState === 'failed') return 'bg-amber-500';
  if (row.exclusionReason) return 'bg-slate-400';
  if (['queued', 'submitted', 'sent', 'retry_pending'].includes(row.lifecycleState)) return 'bg-sky-400';
  return 'bg-slate-200';
}

/* ============================================================================
 * PageHeader — top operations card with summary tiles + last-sync + refresh
 * ========================================================================= */

function PageHeader({
  totalRows,
  totals,
  jobActive,
  onRefresh,
  loading,
  lastSyncAt,
  messageKind
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-primary-blue-200 bg-white shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-primary-navy via-violet-600 to-sky-500" aria-hidden />
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary-blue-200 bg-primary-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-navy">
              Recovery operations
            </span>
            <span
              className={`inline-flex h-1.5 w-1.5 rounded-full shadow-[0_0_0_3px_rgba(16,185,129,0.25)] ${
                jobActive ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
              aria-hidden
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {messageKind ? `Scope · ${messageKind}` : 'Scope · all templates'}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
            Recovery console
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Inspect unresolved recipients across templates, trigger manual recovery and export operator
            follow-up lists. Automated retry lineage is preserved.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 lg:items-end">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryTile label="All unresolved" value={totalRows} accent="text-primary-navy" />
            <SummaryTile label="Failed" value={totals.failed || 0} accent="text-rose-700" />
            <SummaryTile label="Excluded" value={totals.excluded || 0} accent="text-violet-700" />
            <SummaryTile label="Exhausted" value={totals.exhausted || 0} accent="text-amber-700" />
          </div>
          <div className="flex items-center justify-end gap-2">
            {lastSyncAt && (
              <span className="text-[10px] text-slate-500">Last sync · {formatDt(lastSyncAt)}</span>
            )}
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh data"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary-navy shadow-sm transition hover:bg-primary-blue-50 disabled:opacity-60"
            >
              {loading ? <FiLoader className="animate-spin" size={13} /> : <FiRefreshCw size={13} />}
              Refresh
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * FiltersToolbar — sticky filters: date / template / search + group pills
 * ========================================================================= */

function FiltersToolbar({
  from, to, messageKind, group, search,
  totals, totalsByCategory, jobActive,
  onFromChange, onToChange, onTemplateChange, onGroupChange, onSearchChange
}) {
  const headerRight = jobActive ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary-blue-200 bg-primary-blue-50 px-2 py-0.5 text-[11px] font-semibold text-primary-navy">
      <FiRotateCw className="animate-spin" size={11} /> auto-refreshing while batch runs
    </span>
  ) : null;

  return (
    <SectionCard
      icon={FiSliders}
      kicker="Filters & scope"
      title="Inspection filters"
      subtitle="Restrict the unresolved list by date, template, group, or free-text search."
      headerRight={headerRight}
      sticky
      stickyTop="top-3"
      bodyClassName="space-y-3 p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-[11px] font-semibold text-slate-600">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="mt-0.5 block rounded-md border border-primary-blue-200 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-100"
          />
        </label>
        <label className="text-[11px] font-semibold text-slate-600">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="mt-0.5 block rounded-md border border-primary-blue-200 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-100"
          />
        </label>
        <label className="text-[11px] font-semibold text-slate-600">
          Template
          <select
            value={messageKind}
            onChange={(e) => onTemplateChange(e.target.value)}
            className="mt-0.5 block rounded-md border border-primary-blue-200 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-100"
          >
            {TEMPLATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="ml-auto text-[11px] font-semibold text-slate-600">
          Search (name/phone/reason)
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="9876…  rate limit  expired"
            className="mt-0.5 block w-64 rounded-md border border-primary-blue-200 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-100"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-primary-blue-100 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Group</span>
        {GROUP_OPTIONS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onGroupChange(g.id)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
              group === g.id
                ? 'border-primary-navy bg-primary-navy text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-primary-blue-50'
            }`}
          >
            {g.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${group === g.id ? 'bg-white/20' : 'bg-slate-100 text-slate-700'}`}>
              {(totals[g.id] ?? 0).toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {Object.keys(totalsByCategory).length > 0 && (
        <div className="flex flex-wrap items-center gap-1 border-t border-primary-blue-100 pt-3 text-[11px]">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">By exclusion category</span>
          {Object.entries(totalsByCategory).map(([cat, count]) => (
            <span key={cat} className={`rounded-full border px-2 py-0.5 ${
              EXCLUSION_CATEGORY_COLORS[cat] || 'border-slate-200 bg-slate-50'
            }`}>
              <strong className="font-mono">{count}</strong> {EXCLUSION_CATEGORY_LABELS[cat] || cat}
            </span>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ============================================================================
 * RecoveryBatchHero — themed live execution card with 3+3 KPI grid + footer
 * ========================================================================= */

function RecoveryBatchHero({ job, isSuper, onCancel, onDismiss, dismissed }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    /** Drive the elapsed timer at 1s while a job is present and not yet terminal. */
    if (!job || isTerminal(job.status)) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [job]);

  if (!job || dismissed) return null;

  const counters = job.counters || {};
  const targeted = counters.targeted || (job.candidatePhonesCount || 0);
  const completedSteps = (counters.attempted || 0)
    + (counters.skippedAlreadyDelivered || 0)
    + (counters.skippedGlobalRecentSuccess || 0)
    + (counters.skippedInFlightDuplicate || 0);
  const percent = job.progressPercent != null
    ? job.progressPercent
    : (targeted ? Math.min(100, Math.round((completedSteps / targeted) * 100)) : 0);
  const recovered = counters.recovered || 0;
  const recoveryRate = targeted ? Math.round((recovered / targeted) * 1000) / 10 : 0;

  const startedAt = job.startedAt ? new Date(job.startedAt).getTime() : null;
  const finishedAt = job.finishedAt ? new Date(job.finishedAt).getTime() : null;
  const elapsedMs = startedAt ? (finishedAt || now) - startedAt : 0;

  const isRunning = !isTerminal(job.status);

  /** Theme tokens by job state. Running uses primary-navy gradient progress, terminal states use intent colours. */
  let cardClassName = 'border-primary-blue-300 ring-1 ring-primary-blue-200/60';
  let headerClassName = 'border-primary-blue-200 bg-gradient-to-r from-primary-blue-100/70 to-primary-blue-50/40';
  let badgeClassName = 'border-primary-blue-300 bg-primary-blue-100 text-primary-navy';
  let progressFillClassName = 'bg-gradient-to-r from-primary-navy to-primary-blue-400';
  let dotClassName = 'bg-primary-blue-500 animate-pulse';
  let stageBadge = 'Running';

  if (job.status === 'completed') {
    cardClassName = 'border-emerald-200';
    headerClassName = 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white';
    badgeClassName = 'border-emerald-300 bg-emerald-100 text-emerald-900';
    progressFillClassName = 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    dotClassName = 'bg-emerald-500';
    stageBadge = 'Completed';
  } else if (job.status === 'failed') {
    cardClassName = 'border-rose-200';
    headerClassName = 'border-rose-200 bg-gradient-to-r from-rose-50 to-white';
    badgeClassName = 'border-rose-300 bg-rose-100 text-rose-900';
    progressFillClassName = 'bg-gradient-to-r from-rose-500 to-rose-400';
    dotClassName = 'bg-rose-500';
    stageBadge = 'Failed';
  } else if (job.status === 'cancelled') {
    cardClassName = 'border-slate-200';
    headerClassName = 'border-slate-200 bg-gradient-to-r from-slate-50 to-white';
    badgeClassName = 'border-slate-300 bg-white text-slate-700';
    progressFillClassName = 'bg-slate-400';
    dotClassName = 'bg-slate-400';
    stageBadge = 'Cancelled';
  }

  const batchSuffix = String(job._id || '').slice(-8);
  const messageKindLabel = job.messageKind || job.template || '—';

  return (
    <section className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${cardClassName}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 ${headerClassName}`}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary-navy ring-1 ring-primary-blue-200">
            <FiActivity size={15} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-navy">Live operation</p>
            <h3 className="truncate text-sm font-semibold text-slate-900">
              Recovery batch
              <span className="ml-2 font-mono text-[11px] font-normal text-slate-500">· {messageKindLabel}</span>
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeClassName}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} aria-hidden />
            {stageBadge}
          </span>
          <span className="font-mono text-[11px] text-slate-500">Batch · {batchSuffix}</span>
          {isSuper && isRunning && (
            <button
              type="button"
              onClick={onCancel}
              title="Cancel this recovery batch"
              className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
            >
              <FiSlash size={11} /> Cancel batch
            </button>
          )}
          {!isRunning && typeof onDismiss === 'function' && (
            <button
              type="button"
              onClick={onDismiss}
              title="Dismiss completed batch banner"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <FiX size={11} /> Dismiss
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-3 rounded-full transition-all ${progressFillClassName}`}
            style={{ width: `${percent}%` }}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-end pr-2 font-mono text-[11px] font-bold text-slate-700 mix-blend-luminosity">
            {percent}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <KpiTile label="Targeted" value={targeted} icon={FiTarget} />
          <KpiTile label="Attempted" value={counters.attempted || 0} icon={FiArrowRight} />
          <KpiTile label="Accepted" value={counters.apiAccepted || 0} icon={FiActivity} accent="text-primary-navy" />
          <KpiTile label="Recovered" value={recovered} icon={FiCheckCircle} accent="text-emerald-700" />
          <KpiTile label="Failed" value={counters.sendFailed || 0} icon={FiAlertTriangle} accent="text-rose-700" />
          <KpiTile label="In-flight" value={counters.inFlight || 0} icon={FiClock} accent="text-amber-700" />
        </div>

        {job.errorSummary && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-800">
            {job.errorSummary}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-blue-200 bg-primary-blue-50/40 px-3 py-2">
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-navy">Recovery rate</p>
              <p className="font-mono text-lg font-bold text-primary-navy">{recoveryRate}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-navy">Elapsed</p>
              <p className="font-mono text-lg font-bold text-slate-800">{formatElapsed(elapsedMs)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            {isRunning ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary-blue-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-primary-navy">
                <FiRotateCw className="animate-spin" size={11} /> auto-refreshing every 2s
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Started {formatDt(job.startedAt)}</span>
            )}
            {!isRunning && job.finishedAt && (
              <span className="text-[11px] text-slate-500">Finished {formatDt(job.finishedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * RecoveryActionsCard — idle / preview-ready / running modes
 * ========================================================================= */

function RecoveryActionsCard({
  messageKind, isSuper, selectedPhones, job,
  preview, previewLoading, previewErr, starting, actionErr,
  onPreview, onStart
}) {
  const isRunning = job && (job.status === 'queued' || job.status === 'running');
  const isSlotBooked = messageKind === 'slot_booked';

  if (!messageKind) {
    return (
      <SectionCard
        icon={FiPlay}
        kicker="Recovery actions"
        title="Pick a template to enable manual recovery"
        subtitle="Manual recovery is template-scoped; select a template above to preview and trigger a batch."
        bodyClassName="p-4"
      >
        <div className="rounded-xl border border-dashed border-primary-blue-200 bg-primary-blue-50/30 p-3 text-xs text-slate-600">
          <FiInfo className="mr-1 inline text-primary-navy" />
          No template selected. Choose a template in the filter above to unlock the preview and start CTAs.
        </div>
      </SectionCard>
    );
  }

  if (isRunning) {
    return (
      <SectionCard
        icon={FiPlay}
        kicker="Recovery actions"
        title={`${messageKind} · paused while batch runs`}
        subtitle="Live operation in progress. Recovery actions resume automatically when the batch completes."
        bodyClassName="px-4 py-3"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary-blue-200 bg-primary-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-navy">
            <FiActivity size={11} /> Operation in progress
          </span>
          <span>See the live batch above for live counters and the cancel control.</span>
          <span className="ml-auto text-[11px] text-slate-500">Started {formatDt(job.startedAt)}</span>
        </div>
      </SectionCard>
    );
  }

  const targeted = selectedPhones?.length || preview?.candidates?.length || 0;
  const skippedTotal = preview
    ? (preview.skippedAlreadyDelivered || 0)
      + (preview.skippedGlobalRecentSuccess || 0)
      + (preview.skippedInFlightDuplicate || 0)
    : null;
  const ready = !!preview && targeted > 0;

  const headerRight = (
    <>
      <button
        type="button"
        onClick={onPreview}
        disabled={previewLoading}
        title="Preview unresolved candidates"
        className="inline-flex items-center gap-1.5 rounded-md border border-primary-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary-navy shadow-sm transition hover:bg-primary-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {previewLoading ? <FiLoader className="animate-spin" size={13} /> : <FiSearch size={13} />}
        {preview ? 'Re-run preview' : 'Preview unresolved'}
      </button>
      {isSuper && (
        <button
          type="button"
          onClick={onStart}
          disabled={starting || !ready}
          title={ready ? 'Start the manual recovery batch' : 'Run preview or select rows to enable'}
          className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
            ready
              ? 'border border-rose-700 bg-rose-600 text-white hover:bg-rose-700'
              : 'border border-slate-300 bg-slate-100 text-slate-500'
          }`}
        >
          {starting ? <FiLoader className="animate-spin" size={14} /> : <FiPlay size={14} />}
          {selectedPhones?.length
            ? `Recover ${selectedPhones.length} selected`
            : ready
              ? `Start recovery (${targeted})`
              : 'Start recovery'}
        </button>
      )}
    </>
  );

  return (
    <SectionCard
      icon={FiPlay}
      kicker="Recovery actions"
      title={`${messageKind} · unresolved recipients`}
      subtitle={
        isSlotBooked
          ? 'Transactional template · immediate-only retry policy unchanged'
          : 'Reuses safeSendWhatsApp; duplicate, delivered/read suppression and retry lineage are preserved.'
      }
      headerRight={headerRight}
      bodyClassName="space-y-3 p-4"
    >
      {(previewErr || actionErr) && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-800">
          {previewErr || actionErr}
        </div>
      )}

      {(ready || selectedPhones?.length > 0) && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <FiCheckCircle size={12} /> Ready to recover
            </span>
            <span className="text-sm font-semibold text-emerald-900">
              {selectedPhones?.length
                ? `${selectedPhones.length} selected recipient(s)`
                : `${targeted} unresolved recipient(s)`}
            </span>
            {!selectedPhones?.length && skippedTotal != null && skippedTotal > 0 && (
              <span className="text-[11px] text-emerald-800">
                {skippedTotal.toLocaleString()} suppressed by guard rails
              </span>
            )}
            <span className="ml-auto text-[11px] text-slate-600">
              {isSuper ? 'Click Start recovery →' : 'Super-admin required to execute'}
            </span>
          </div>

          {!selectedPhones?.length && preview && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <CounterTile label="Targeted" value={preview.targeted || 0} accent="text-slate-900" />
              <CounterTile
                label="Skipped delivered"
                value={(preview.skippedAlreadyDelivered || 0) + (preview.skippedGlobalRecentSuccess || 0)}
                accent="text-emerald-700"
              />
              <CounterTile label="Skipped in-flight" value={preview.skippedInFlightDuplicate || 0} accent="text-violet-700" />
              <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Lookback / stale</p>
                <p className="text-xs font-mono text-slate-700">
                  {preview.lookbackDays || '—'}d / {preview.inFlightStaleMinutes || '—'}m
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!ready && !selectedPhones?.length && !previewLoading && (
        <div className="rounded-xl border border-dashed border-primary-blue-200 bg-primary-blue-50/30 p-3 text-xs text-slate-600">
          <FiInfo className="mr-1 inline text-primary-navy" />
          Run preview to load unresolved candidates, or check rows below to recover a specific subset.
        </div>
      )}
    </SectionCard>
  );
}

/* ============================================================================
 * RecentBatchesCard — always-visible recent batches (top 3)
 * ========================================================================= */

function RecentBatchesCard({ recentJobs, messageKind }) {
  const top3 = (recentJobs || []).slice(0, 3);
  return (
    <SectionCard
      icon={FiClock}
      kicker="Recent batches"
      title={
        messageKind
          ? top3.length
            ? `${messageKind} · last ${top3.length} batch${top3.length === 1 ? '' : 'es'}`
            : `${messageKind} · no recent batches`
          : 'Pick a template to see recent batches'
      }
      subtitle="Manual recovery jobs targeting this template (most recent first)."
      bodyClassName={top3.length ? 'p-0' : 'p-4'}
    >
      {top3.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary-blue-200 bg-primary-blue-50/30 p-3 text-xs text-slate-600">
          <FiInfo className="mr-1 inline text-primary-navy" />
          {messageKind
            ? 'No recent recovery batches for this template.'
            : 'Pick a template above to load its recent batches.'}
        </div>
      ) : (
        <ul className="divide-y divide-primary-blue-100">
          {top3.map((j) => {
            const c = j.counters || {};
            const recovered = c.recovered || 0;
            const target = c.targeted || j.candidatePhonesCount || 0;
            const statusCls =
              j.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : j.status === 'failed' ? 'border-rose-200 bg-rose-50 text-rose-800'
              : j.status === 'cancelled' ? 'border-slate-300 bg-slate-50 text-slate-700'
              : 'border-amber-200 bg-amber-50 text-amber-800';
            return (
              <li key={j._id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-xs">
                <span className="font-mono text-[11px] text-slate-600">{String(j._id).slice(-8)}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusCls}`}>
                  {j.status}
                </span>
                <span className="text-slate-700">
                  <strong className="font-mono text-emerald-700">{recovered.toLocaleString()}</strong>
                  <span className="text-slate-400"> / </span>
                  <strong className="font-mono text-slate-800">{target.toLocaleString()}</strong>
                  <span className="ml-1 text-slate-500">recovered/targeted</span>
                </span>
                <span className="ml-auto text-[11px] text-slate-500">{formatDt(j.createdAt)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

/* ============================================================================
 * UnresolvedTableCard — themed table with sticky thead + bulk-actions
 * ========================================================================= */

function UnresolvedTableCard({
  rows, loading, page, totalPages, totalRows,
  selected, onToggleRow, onTogglePage, onClearSelection,
  onPrev, onNext,
  onCopyPhones, onCopyCsv, onDownloadCsv, csvBusy,
  isSuper, onBulkRecover
}) {
  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.phone));
  const showBulkBar = selected.size > 0;

  const headerRight = (
    <>
      <button
        type="button"
        onClick={onCopyPhones}
        title="Copy filtered phones to clipboard"
        className="inline-flex items-center gap-1 rounded-md border border-primary-blue-200 bg-white px-2 py-1 text-[11px] font-semibold text-primary-navy shadow-sm hover:bg-primary-blue-50"
      >
        <FiCopy size={11} /> Copy phones
      </button>
      <button
        type="button"
        onClick={onCopyCsv}
        title="Copy filtered rows as CSV"
        className="inline-flex items-center gap-1 rounded-md border border-primary-blue-200 bg-white px-2 py-1 text-[11px] font-semibold text-primary-navy shadow-sm hover:bg-primary-blue-50"
      >
        <FiCopy size={11} /> Copy CSV
      </button>
      <button
        type="button"
        onClick={onDownloadCsv}
        disabled={csvBusy}
        title="Download grouped CSV"
        className="inline-flex items-center gap-1 rounded-md border border-primary-navy bg-primary-navy px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-primary-navy/90 disabled:opacity-60"
      >
        {csvBusy ? <FiLoader className="animate-spin" size={11} /> : <FiDownload size={11} />}
        Download grouped CSV
      </button>
    </>
  );

  return (
    <SectionCard
      icon={FiTarget}
      kicker="Unresolved recipients"
      title={`${rows.length} on this page · ${totalRows.toLocaleString()} total`}
      subtitle={`Page ${page} / ${totalPages || 1}. Select rows to recover or export a custom subset.`}
      headerRight={headerRight}
      bodyClassName="p-0"
    >
      {showBulkBar && (
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-amber-200 bg-amber-50/95 px-4 py-2 text-xs backdrop-blur">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            <FiTarget size={11} /> {selected.size} selected
          </span>
          {isSuper && (
            <button
              type="button"
              onClick={onBulkRecover}
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-700 bg-rose-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-rose-700"
            >
              <FiPlay size={11} /> Recover selected
            </button>
          )}
          <button
            type="button"
            onClick={onCopyPhones}
            title="Copy selected phones"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FiCopy size={11} /> Copy
          </button>
          <span className="ml-2 hidden text-[10px] text-slate-500 sm:inline">
            Esc to clear selection
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            title="Clear selection"
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-600 hover:bg-slate-50"
          >
            <FiX size={11} /> Clear
          </button>
        </div>
      )}

      <div className="max-h-[60vh] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-primary-blue-50/80 to-white text-[10px] font-bold uppercase tracking-[0.12em] text-primary-navy backdrop-blur">
            <tr>
              <th className="w-10 px-2 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={onTogglePage}
                  aria-label="Select page"
                />
              </th>
              <th className="px-3 py-3 text-left">Recipient</th>
              <th className="px-3 py-3 text-left">Template / stage</th>
              <th className="px-3 py-3 text-left">State</th>
              <th className="px-3 py-3 text-left">Reason / error</th>
              <th className="px-3 py-3 text-left">Ever delivered</th>
              <th className="px-3 py-3 text-right">Retries</th>
              <th className="px-3 py-3 text-left">Last attempt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-blue-100">
            {loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-12 text-center text-slate-500">
                  <FiLoader className="mr-2 inline animate-spin" /> Loading unresolved recipients…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-14 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-1.5 text-slate-500">
                    <FiCheckCircle className="text-emerald-500" size={28} />
                    <p className="text-sm font-semibold text-slate-700">No unresolved recipients in this slice.</p>
                    <p className="text-xs">Adjust filters, widen the date range, or check the Overview page for stable trends.</p>
                  </div>
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const isSel = selected.has(r.phone);
              return (
                <tr
                  key={`${r.phone}-${r.messageKind}-${r.lastEventId}`}
                  className={`relative ${isSel ? 'bg-amber-50/50' : 'hover:bg-primary-blue-50/40'}`}
                >
                  <td className="relative w-10 px-2 py-3">
                    <span className={`absolute left-0 top-0 h-full w-1 ${severityStripeClass(r)}`} aria-hidden />
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => onToggleRow(r.phone)}
                      aria-label={`Select ${r.phone}`}
                      className="ml-1"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-mono text-[13px] font-semibold text-slate-900">{r.phone}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">{r.name || '—'}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-md bg-primary-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary-navy ring-1 ring-primary-blue-200">{r.messageKind}</span>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {r.attemptStage || '—'}
                      <span className="ml-1 text-slate-400">attempt #{r.lastAttemptNumber || '—'}</span>
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <StatusPill status={r.lifecycleState} size="sm" />
                      {r.retryExhausted && (
                        <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                          <FiAlertOctagon size={10} /> exhausted
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[280px] px-3 py-3">
                    <p className="text-[12px] font-semibold text-slate-800">
                      {r.exclusionReason || r.reason || '—'}
                    </p>
                    {r.errorMessage ? (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-rose-700" title={r.errorMessage}>
                        {r.errorMessage}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[11px] text-slate-400">no error message recorded</p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[11px]">
                    {r.everDeliveredAt ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800 ring-1 ring-emerald-100">
                        <FiCheckCircle size={10} /> {formatDt(r.everDeliveredAt)}
                      </span>
                    ) : (
                      <span className="text-slate-400">never</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-xs">{r.retryHistoryCount || 0}</td>
                  <td className="px-3 py-3 text-[11px] text-slate-600">{formatDt(r.lastAttemptAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-primary-blue-100 bg-primary-blue-50/30 px-4 py-2 text-[11px] text-slate-600">
        <span>
          Showing {(rows.length ? (page - 1) * 50 + 1 : 0)}–{(page - 1) * 50 + rows.length} of {totalRows.toLocaleString()}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={onPrev}
            className="rounded-md border border-primary-blue-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-primary-navy hover:bg-primary-blue-50 disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page <strong className="text-primary-navy">{page}</strong> / {totalPages || 1}</span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={onNext}
            className="rounded-md border border-primary-blue-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-primary-navy hover:bg-primary-blue-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

/* ============================================================================
 * FinalExportCard — operator triage and grouped CSV export
 * ========================================================================= */

function FinalExportCard({
  totalsByCategory, totalRows, csvBusy,
  onCopyPhones, onCopyCsv, onDownloadCsv
}) {
  const entries = Object.entries(totalsByCategory || {})
    .filter(([, count]) => count > 0)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));

  const headerRight = (
    <>
      <button
        type="button"
        onClick={onCopyPhones}
        title="Copy phones"
        className="inline-flex items-center gap-1 rounded-md border border-primary-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-primary-navy shadow-sm hover:bg-primary-blue-50"
      >
        <FiCopy size={12} /> Copy phones
      </button>
      <button
        type="button"
        onClick={onCopyCsv}
        title="Copy CSV"
        className="inline-flex items-center gap-1 rounded-md border border-primary-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-primary-navy shadow-sm hover:bg-primary-blue-50"
      >
        <FiCopy size={12} /> Copy CSV
      </button>
      <button
        type="button"
        onClick={onDownloadCsv}
        disabled={csvBusy}
        title="Download grouped CSV"
        className="inline-flex items-center gap-1.5 rounded-md border border-primary-navy bg-primary-navy px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-navy/90 disabled:opacity-60"
      >
        {csvBusy ? <FiLoader className="animate-spin" size={13} /> : <FiDownload size={13} />}
        Download grouped CSV
      </button>
    </>
  );

  return (
    <SectionCard
      icon={FiDownload}
      kicker="Operator triage & export"
      title={`${totalRows.toLocaleString()} unresolved recipient${totalRows === 1 ? '' : 's'} in this slice`}
      subtitle="Use this for downstream resolution: invalid number cleanup, manual outreach via call/SMS, or escalations."
      headerRight={headerRight}
      bodyClassName="p-4"
    >
      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-3 text-xs text-emerald-800">
          <FiCheckCircle className="mr-1 inline" /> No unresolved recipients to export. The current slice is fully resolved.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {entries.map(([cat, count]) => (
            <div
              key={cat}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 ring-1 ring-primary-blue-100 ${
                EXCLUSION_CATEGORY_COLORS[cat] || 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {EXCLUSION_CATEGORY_LABELS[cat] || cat}
                </p>
                <p className="mt-0.5 text-2xl font-bold leading-tight text-primary-navy">{Number(count).toLocaleString()}</p>
              </div>
              <FiArrowDown className="text-primary-navy/60" />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ============================================================================
 * RecoveryTab — orchestrator with lifted job state + 6s reload ticker
 * ========================================================================= */

function RecoveryTab() {
  const { user } = useAuth();
  const isSuper = user?.isSuperAdmin === true;
  const [searchParams, setSearchParams] = useSearchParams();

  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [messageKind, setMessageKind] = useState('');
  const [group, setGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const [csvBusy, setCsvBusy] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  /* ---------------------- Filters: query string sync ---------------------- */
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
    const g = searchParams.get('group');
    if (g) setGroup(g);
  }, [searchParams]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (from) next.set('from', from); else next.delete('from');
    if (to) next.set('to', to); else next.delete('to');
    if (messageKind) next.set('messageKind', messageKind); else next.delete('messageKind');
    if (group && group !== 'all') next.set('group', group); else next.delete('group');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, messageKind, group]);

  /* ---------------------- Job state lifted to RecoveryTab ----------------- */
  const [job, setJob] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErr, setPreviewErr] = useState(null);
  const [starting, setStarting] = useState(false);
  const [actionErr, setActionErr] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const pollRef = useRef(null);
  const tableTickRef = useRef(null);

  /** Reset action/preview state when scope changes (template/range). */
  const scopeKey = `${messageKind || 'none'}|${from}|${to}`;
  const lastScopeKeyRef = useRef(scopeKey);
  useEffect(() => {
    if (lastScopeKeyRef.current !== scopeKey) {
      lastScopeKeyRef.current = scopeKey;
      setPreview(null);
      setPreviewErr(null);
      setActionErr(null);
    }
  }, [scopeKey]);

  const stopJobPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const stopTableTick = useCallback(() => {
    if (tableTickRef.current) {
      clearInterval(tableTickRef.current);
      tableTickRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    stopJobPolling();
    stopTableTick();
  }, [stopJobPolling, stopTableTick]);

  const refreshJob = useCallback(async (jobId) => {
    if (!jobId) return null;
    const res = await getWhatsappOpsManualRecoveryJob(jobId);
    if (!res.success) return null;
    const next = res.data?.data ?? res.data;
    setJob(next);
    return next;
  }, []);

  const loadRecentJobs = useCallback(async () => {
    if (!messageKind) {
      setRecentJobs([]);
      return;
    }
    const res = await listWhatsappOpsManualRecoveryJobs({ messageKind, limit: 5 });
    if (res.success) {
      const arr = res.data?.data ?? res.data;
      setRecentJobs(Array.isArray(arr) ? arr : []);
    }
  }, [messageKind]);

  useEffect(() => {
    Promise.resolve().then(() => loadRecentJobs());
  }, [loadRecentJobs]);

  /** Start polling whenever we hold a non-terminal job. Also tick reloadKey every 6s
   *  so the unresolved table reflects live recovery progress without manual refresh. */
  useEffect(() => {
    if (!job || isTerminal(job.status)) {
      stopJobPolling();
      stopTableTick();
      return;
    }
    if (!pollRef.current) {
      pollRef.current = setInterval(async () => {
        const next = await refreshJob(job._id);
        if (next && isTerminal(next.status)) {
          stopJobPolling();
          stopTableTick();
          loadRecentJobs();
          setReloadKey((k) => k + 1);
        }
      }, 2000);
    }
    if (!tableTickRef.current) {
      tableTickRef.current = setInterval(() => {
        setReloadKey((k) => k + 1);
      }, 6000);
    }
  }, [job, refreshJob, stopJobPolling, stopTableTick, loadRecentJobs]);

  /* ---------------------- Unresolved list load ---------------------------- */
  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const params = { from, to, group, page, limit: 50 };
    if (messageKind) params.messageKind = messageKind;
    const res = await getUnresolvedRecipients(params);
    setLoading(false);
    if (!res.success) {
      setErr(res.message || 'Failed to load unresolved recipients');
      setData(null);
      return;
    }
    setData(res.data?.data ?? res.data);
    setLastSyncAt(new Date().toISOString());
  }, [from, to, group, page, messageKind]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const filteredRows = useMemo(() => {
    const s = String(search || '').trim().toLowerCase();
    const rows = data?.rows || [];
    if (!s) return rows;
    return rows.filter((r) => [r.phone, r.name, r.errorMessage, r.exclusionReason]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(s)));
  }, [data, search]);

  const totals = data?.totalsByGroup || {};
  const totalsByCategory = data?.totalsByExclusionCategory || {};
  const totalRows = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const jobActive = !!(job && !isTerminal(job.status));

  const toggleRow = (phone) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  };
  const togglePage = () => {
    setSelected((prev) => {
      const allOn = filteredRows.length > 0 && filteredRows.every((r) => prev.has(r.phone));
      const next = new Set(prev);
      if (allOn) filteredRows.forEach((r) => next.delete(r.phone));
      else filteredRows.forEach((r) => next.add(r.phone));
      return next;
    });
  };
  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const selectedArr = useMemo(() => Array.from(selected), [selected]);

  /** Esc key clears selection — accessibility hint shown in bulk-actions bar. */
  useEffect(() => {
    if (selected.size === 0) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') clearSelection();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected.size, clearSelection]);

  /* ---------------------- Recovery actions -------------------------------- */
  const handlePreview = useCallback(async () => {
    if (!messageKind) return;
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
    if (!messageKind) {
      setActionErr('Select a template first');
      return;
    }
    const targeted = selectedArr.length || preview?.candidates?.length || 0;
    if (!targeted) {
      setActionErr('Nothing to send. Run preview or select rows first.');
      return;
    }
    const label = selectedArr.length
      ? `${selectedArr.length} selected recipient(s)`
      : `${preview?.candidates?.length || 0} unresolved recipient(s)`;
    if (!window.confirm(`Send manual recovery to ${label}? Duplicate protections still apply.`)) return;
    setStarting(true);
    setActionErr(null);
    const body = { messageKind, from, to };
    if (selectedArr.length) body.phones = selectedArr;
    const res = await startWhatsappOpsManualRecovery(body);
    setStarting(false);
    if (!res.success) {
      setActionErr(res.message || 'Could not start recovery');
      return;
    }
    const out = res.data?.data ?? res.data;
    if (out?.jobId) {
      setBannerDismissed(false);
      const initial = await refreshJob(out.jobId);
      if (initial) {
        loadRecentJobs();
      }
    }
  }, [messageKind, from, to, selectedArr, preview, refreshJob, loadRecentJobs]);

  const handleCancel = useCallback(async () => {
    if (!job?._id) return;
    if (!window.confirm('Cancel this recovery batch? In-progress sends will not be reverted.')) return;
    const res = await cancelWhatsappOpsManualRecoveryJob(job._id);
    if (res.success) await refreshJob(job._id);
  }, [job, refreshJob]);

  const handleBulkRecover = useCallback(() => handleStart(), [handleStart]);

  /* ---------------------- Export actions ---------------------------------- */
  const handleCopyPhones = async () => {
    const phones = filteredRows.map((r) => r.phone).join('\n');
    await copyToClipboard(phones);
  };
  const handleCopyCsv = async () => {
    await copyToClipboard(buildClipboardCsv(filteredRows));
  };
  const handleDownloadCsv = async () => {
    setCsvBusy(true);
    try {
      const params = { from, to, group };
      if (messageKind) params.messageKind = messageKind;
      await downloadUnresolvedCsv(params);
    } catch (e) {
      setErr(e?.message || 'CSV export failed');
    }
    setCsvBusy(false);
  };

  /* ---------------------- Render ----------------------------------------- */
  return (
    <div className="space-y-3">
      <PageHeader
        totalRows={totalRows}
        totals={totals}
        jobActive={jobActive}
        onRefresh={() => setReloadKey((k) => k + 1)}
        loading={loading}
        lastSyncAt={lastSyncAt}
        messageKind={messageKind}
      />

      {err && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-800">{err}</div>
      )}

      <FiltersToolbar
        from={from}
        to={to}
        messageKind={messageKind}
        group={group}
        search={search}
        totals={totals}
        totalsByCategory={totalsByCategory}
        jobActive={jobActive}
        onFromChange={(v) => { setRange((r) => ({ ...r, from: v })); setPage(1); }}
        onToChange={(v) => { setRange((r) => ({ ...r, to: v })); setPage(1); }}
        onTemplateChange={(v) => { setMessageKind(v); setPage(1); }}
        onGroupChange={(v) => { setGroup(v); setPage(1); }}
        onSearchChange={(v) => setSearch(v)}
      />

      <RecoveryBatchHero
        job={job}
        isSuper={isSuper}
        onCancel={handleCancel}
        onDismiss={() => setBannerDismissed(true)}
        dismissed={bannerDismissed}
      />

      <RecoveryActionsCard
        messageKind={messageKind}
        isSuper={isSuper}
        selectedPhones={selectedArr}
        job={job}
        preview={preview}
        previewLoading={previewLoading}
        previewErr={previewErr}
        starting={starting}
        actionErr={actionErr}
        onPreview={handlePreview}
        onStart={handleStart}
      />

      <RecentBatchesCard recentJobs={recentJobs} messageKind={messageKind} />

      <UnresolvedTableCard
        rows={filteredRows}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalRows={totalRows}
        selected={selected}
        onToggleRow={toggleRow}
        onTogglePage={togglePage}
        onClearSelection={clearSelection}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        onCopyPhones={handleCopyPhones}
        onCopyCsv={handleCopyCsv}
        onDownloadCsv={handleDownloadCsv}
        csvBusy={csvBusy}
        isSuper={isSuper}
        onBulkRecover={handleBulkRecover}
      />

      <FinalExportCard
        totalsByCategory={totalsByCategory}
        totalRows={totalRows}
        csvBusy={csvBusy}
        onCopyPhones={handleCopyPhones}
        onCopyCsv={handleCopyCsv}
        onDownloadCsv={handleDownloadCsv}
      />
    </div>
  );
}

export default function WhatsAppOpsRecovery() {
  const [tab, setTab] = useState('recovery');
  return (
    <div className="space-y-3">
      <nav
        role="tablist"
        aria-label="Recovery console sections"
        className="inline-flex items-center gap-1 rounded-xl border border-primary-blue-200 bg-white p-1 shadow-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'recovery'}
          onClick={() => setTab('recovery')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            tab === 'recovery'
              ? 'bg-primary-navy text-white shadow-sm'
              : 'text-slate-700 hover:bg-primary-blue-50'
          }`}
        >
          <FiZap size={14} /> Recovery
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'audit'}
          onClick={() => setTab('audit')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            tab === 'audit'
              ? 'bg-primary-navy text-white shadow-sm'
              : 'text-slate-700 hover:bg-primary-blue-50'
          }`}
        >
          <FiEye size={14} /> Audit (raw events)
        </button>
      </nav>
      <div role="tabpanel">
        {tab === 'recovery' ? <RecoveryTab /> : <WhatsAppOpsMessages />}
      </div>
    </div>
  );
}
