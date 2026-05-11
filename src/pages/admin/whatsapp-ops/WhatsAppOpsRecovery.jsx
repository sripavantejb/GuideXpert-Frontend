import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiActivity,
  FiAlertOctagon,
  FiAlertTriangle,
  FiArrowDown,
  FiArrowRight,
  FiChevronDown,
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
  fetchUnresolvedCsvText,
  getUnresolvedRecipients,
  getWhatsappOpsManualRecoveryJob,
  listWhatsappOpsManualRecoveryJobs,
  previewWhatsappOpsManualRecovery,
  startWhatsappOpsManualRecovery
} from '../../../utils/whatsappOpsAdminApi';
import { dateInputsToApiRange, defaultRangeIsoDates, formatDt } from './whatsappOpsShared';
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
  stickyTop = 'top-0',
  compact
}) {
  const stickyCls = sticky ? `sticky ${stickyTop} z-30` : '';
  const headerPad = compact ? 'px-3 py-2.5 sm:px-4' : 'px-4 py-4 sm:px-5';
  const iconWrap = compact ? 'h-8 w-8' : 'h-10 w-10';
  const iconSz = compact ? 16 : 18;
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.04] ${stickyCls} ${className || ''}`}
    >
      {!noHeader && (
        <div className={`border-b border-slate-200/80 bg-slate-50/90 ${headerPad}`}>
          <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-3'} sm:flex-row sm:items-center sm:justify-between`}>
            <div className="flex min-w-0 items-center gap-3">
              {Icon && (
                <span className={`flex ${iconWrap} shrink-0 items-center justify-center rounded-xl bg-white text-primary-navy shadow-sm ring-1 ring-slate-200/80`}>
                  <Icon size={iconSz} />
                </span>
              )}
              <div className="min-w-0">
                {kicker && (
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    {kicker}
                  </p>
                )}
                {title && (
                  <h3 className={`mt-0.5 truncate font-semibold text-slate-900 ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
                )}
                {subtitle && (
                  <p className={`mt-1 leading-snug text-slate-600 ${compact ? 'text-xs' : 'text-sm'}`}>{subtitle}</p>
                )}
              </div>
            </div>
            {headerRight && (
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{headerRight}</div>
            )}
          </div>
        </div>
      )}
      <div className={bodyClassName ?? (compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5')}>{children}</div>
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
    ? 'px-2.5 py-1 text-sm'
    : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${cls} ${sizeCls}`}>
      <Icon size={size === 'lg' ? 14 : 12} />
      {s || '—'}
    </span>
  );
}

function CounterTile({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-slate-200/90 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${accent || 'text-slate-800'}`}>
        {Number.isFinite(value) ? value.toLocaleString() : (value || 0)}
      </p>
    </div>
  );
}

function KpiTile({ label, value, accent, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="text-slate-400" size={14} />}
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className={`mt-1 text-2xl font-bold leading-tight tabular-nums ${accent || 'text-slate-900'}`}>
        {Number.isFinite(value) ? value.toLocaleString() : (value || 0)}
      </p>
    </div>
  );
}

function SummaryTile({ label, value, accent }) {
  return (
    <div className="relative flex min-h-[4.25rem] flex-col justify-center overflow-hidden rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-900/[0.03] sm:min-h-[4.5rem] sm:px-4 sm:py-3">
      <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary-navy/80" aria-hidden />
      <p className="pl-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</p>
      <p className={`mt-0.5 pl-2.5 text-xl font-bold leading-none tabular-nums sm:text-2xl ${accent || 'text-slate-900'}`}>
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
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.04]">
      <div className="h-1 w-full bg-gradient-to-r from-primary-navy via-violet-600 to-sky-500" aria-hidden />
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 sm:px-3 sm:py-1 sm:text-xs">
                Recovery operations
              </span>
              <span
                className={`inline-flex h-2 w-2 rounded-full shadow-[0_0_0_3px_rgba(16,185,129,0.2)] ${
                  jobActive ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
                aria-hidden
              />
              <span className="text-xs font-medium text-slate-500">
                {messageKind ? `Scope · ${messageKind}` : 'Scope · all templates'}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Recovery console
            </h2>
            <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Inspect unresolved recipients, run manual recovery, and export lists. Retry lineage is preserved.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
            {lastSyncAt && (
              <span className="whitespace-nowrap text-[11px] text-slate-500 sm:text-right">Last sync · {formatDt(lastSyncAt)}</span>
            )}
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh data"
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-primary-navy shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/25 disabled:opacity-60 sm:w-auto sm:text-sm"
            >
              {loading ? <FiLoader className="animate-spin" size={16} /> : <FiRefreshCw size={16} />}
              Refresh
            </button>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryTile label="All unresolved" value={totalRows} accent="text-primary-navy" />
          <SummaryTile label="Failed" value={totals.failed || 0} accent="text-rose-700" />
          <SummaryTile label="Excluded" value={totals.excluded || 0} accent="text-violet-700" />
          <SummaryTile label="Exhausted" value={totals.exhausted || 0} accent="text-amber-700" />
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

  const fieldClass =
    'mt-1.5 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-primary-navy/40 focus:outline-none focus:ring-2 focus:ring-primary-navy/15';

  return (
    <SectionCard
      icon={FiSliders}
      kicker="Filters & scope"
      title="Inspection filters"
      subtitle="Restrict the unresolved list by date, template, group, or free-text search."
      headerRight={headerRight}
      sticky
      stickyTop="top-2"
      compact
      bodyClassName="space-y-3 p-3 sm:p-4"
    >
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 ring-1 ring-slate-900/[0.03] sm:p-3.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <label className="text-sm font-medium text-slate-700 sm:col-span-1 lg:col-span-2">
            From
            <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-1 lg:col-span-2">
            To
            <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-4">
            Template
            <select value={messageKind} onChange={(e) => onTemplateChange(e.target.value)} className={fieldClass}>
              {TEMPLATE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-4">
            Search (name / phone / reason)
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="e.g. 98765… or rate limit"
              className={fieldClass}
            />
          </label>
        </div>

        <div className="mt-3 border-t border-slate-200/80 pt-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Group</p>
          <div className="scrollbar-hide mt-1.5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {GROUP_OPTIONS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onGroupChange(g.id)}
                className={`inline-flex min-h-[2.25rem] shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  group === g.id
                    ? 'border-primary-navy bg-primary-navy text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {g.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-mono tabular-nums ${
                    group === g.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {(totals[g.id] ?? 0).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {Object.keys(totalsByCategory).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-3 text-sm">
          <span className="w-full text-xs font-bold uppercase tracking-wide text-slate-500 sm:w-auto">By exclusion category</span>
          {Object.entries(totalsByCategory).map(([cat, count]) => (
            <span
              key={cat}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                EXCLUSION_CATEGORY_COLORS[cat] || 'border-slate-200 bg-slate-50'
              }`}
            >
              <strong className="font-mono tabular-nums">{count}</strong>
              <span className="text-slate-700">{EXCLUSION_CATEGORY_LABELS[cat] || cat}</span>
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
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 ${headerClassName}`}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-navy shadow-sm ring-1 ring-slate-200/80">
            <FiActivity size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Live operation</p>
            <h3 className="mt-0.5 truncate text-base font-semibold text-slate-900">
              Recovery batch
              <span className="ml-2 font-mono text-sm font-normal text-slate-500">· {messageKindLabel}</span>
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClassName}`}>
            <span className={`h-2 w-2 rounded-full ${dotClassName}`} aria-hidden />
            {stageBadge}
          </span>
          <span className="font-mono text-xs text-slate-500">Batch · {batchSuffix}</span>
          {isSuper && isRunning && (
            <button
              type="button"
              onClick={onCancel}
              title="Cancel this recovery batch"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
            >
              <FiSlash size={14} /> Cancel batch
            </button>
          )}
          {!isRunning && typeof onDismiss === 'function' && (
            <button
              type="button"
              onClick={onDismiss}
              title="Dismiss completed batch banner"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <FiX size={14} /> Dismiss
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Batch progress</span>
            <span className="font-mono tabular-nums text-slate-800">{percent}%</span>
          </div>
          <div
            className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label={`Recovery progress ${percent} percent`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressFillClassName}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <KpiTile label="Targeted" value={targeted} icon={FiTarget} />
              <KpiTile label="Attempted" value={counters.attempted || 0} icon={FiArrowRight} />
              <KpiTile label="Accepted" value={counters.apiAccepted || 0} icon={FiActivity} accent="text-primary-navy" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Outcomes</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <KpiTile label="Recovered" value={recovered} icon={FiCheckCircle} accent="text-emerald-700" />
              <KpiTile label="Failed" value={counters.sendFailed || 0} icon={FiAlertTriangle} accent="text-rose-700" />
              <KpiTile label="In-flight" value={counters.inFlight || 0} icon={FiClock} accent="text-amber-700" />
            </div>
          </div>
        </div>

        {job.errorSummary && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">
            {job.errorSummary}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recovery rate</p>
              <p className="font-mono text-xl font-bold text-primary-navy tabular-nums">{recoveryRate}%</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Elapsed</p>
              <p className="font-mono text-xl font-bold text-slate-800 tabular-nums">{formatElapsed(elapsedMs)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right text-sm text-slate-600">
            {isRunning ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-navy/20 bg-white px-3 py-1 text-xs font-semibold text-primary-navy shadow-sm">
                <FiRotateCw className="animate-spin" size={12} /> Auto-refresh every 2s
              </span>
            ) : (
              <span>Started {formatDt(job.startedAt)}</span>
            )}
            {!isRunning && job.finishedAt && <span>Finished {formatDt(job.finishedAt)}</span>}
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
        bodyClassName="p-3"
      >
        <div className="rounded-lg border border-dashed border-primary-blue-200 bg-primary-blue-50/30 p-2.5 text-xs text-slate-600">
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
        bodyClassName="px-3 py-2.5"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs leading-snug text-slate-700">
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
      compact
      icon={FiPlay}
      kicker="Recovery actions"
      title={`${messageKind} · unresolved recipients`}
      subtitle={
        isSlotBooked
          ? 'Transactional · immediate-only retry unchanged.'
          : 'Uses safeSendWhatsApp; duplicate / delivered suppression preserved.'
      }
      headerRight={headerRight}
      bodyClassName="space-y-2 p-3 sm:p-3.5"
    >
      {(previewErr || actionErr) && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-800">
          {previewErr || actionErr}
        </div>
      )}

      {(ready || selectedPhones?.length > 0) && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]">
              <FiCheckCircle size={11} /> Ready
            </span>
            <span className="text-xs font-semibold text-emerald-900 sm:text-sm">
              {selectedPhones?.length
                ? `${selectedPhones.length} selected`
                : `${targeted} unresolved`}
            </span>
            {!selectedPhones?.length && skippedTotal != null && skippedTotal > 0 && (
              <span className="text-[10px] text-emerald-800 sm:text-[11px]">
                {skippedTotal.toLocaleString()} skipped by guards
              </span>
            )}
            <span className="ml-auto shrink-0 text-[10px] text-slate-600 sm:text-[11px]">
              {isSuper ? 'Start recovery →' : 'Super-admin only'}
            </span>
          </div>

          {!selectedPhones?.length && preview && (
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
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
        <div className="rounded-lg border border-dashed border-primary-blue-200 bg-primary-blue-50/30 p-2.5 text-xs leading-snug text-slate-600">
          <FiInfo className="mr-1 inline shrink-0 text-primary-navy" />
          Run preview or select rows below to recover a subset.
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
      compact
      icon={FiClock}
      kicker="Recent batches"
      title={
        messageKind
          ? top3.length
            ? `${messageKind} · last ${top3.length} batch${top3.length === 1 ? '' : 'es'}`
            : `${messageKind} · no recent batches`
          : 'Pick a template to see recent batches'
      }
      subtitle="Latest manual jobs for this template."
      bodyClassName={top3.length ? 'p-0' : 'p-3'}
    >
      {top3.length === 0 ? (
        <div className="rounded-lg border border-dashed border-primary-blue-200 bg-primary-blue-50/30 p-2.5 text-xs leading-snug text-slate-600">
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
              <li key={j._id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-xs sm:gap-3 sm:px-4">
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

  const btnSecondary =
    'inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20';
  const btnPrimary =
    'inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary-navy bg-primary-navy px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30 disabled:opacity-60';

  const headerRight = (
    <>
      <button type="button" onClick={onCopyPhones} title="Copy filtered phones to clipboard" className={btnSecondary}>
        <FiCopy size={14} /> Copy phones
      </button>
      <button
        type="button"
        onClick={onCopyCsv}
        disabled={csvBusy}
        title="Copy filtered phone numbers to clipboard (one 10-digit number per line, up to 5000)"
        className={btnSecondary}
      >
        {csvBusy ? <FiLoader className="animate-spin" size={14} /> : <FiCopy size={14} />}
        Copy CSV
      </button>
      <button type="button" onClick={onDownloadCsv} disabled={csvBusy} title="Download phone numbers only (one per line, .csv)" className={btnPrimary}>
        {csvBusy ? <FiLoader className="animate-spin" size={14} /> : <FiDownload size={14} />}
        Download CSV
      </button>
    </>
  );

  return (
    <SectionCard
      compact
      icon={FiTarget}
      kicker="Unresolved recipients"
      title={`${rows.length} on this page · ${totalRows.toLocaleString()} total`}
      subtitle={`Page ${page} / ${totalPages || 1}. Select rows to recover or export a custom subset.`}
      headerRight={headerRight}
      bodyClassName="p-0"
    >
      {showBulkBar && (
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white/95 px-4 py-3 text-sm shadow-sm backdrop-blur-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-navy px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            <FiTarget size={12} /> {selected.size} selected
          </span>
          {isSuper && (
            <button
              type="button"
              onClick={onBulkRecover}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-600 bg-rose-600 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
            >
              <FiPlay size={14} /> Recover selected
            </button>
          )}
          <button
            type="button"
            onClick={onCopyPhones}
            title="Copy selected phones"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FiCopy size={14} /> Copy
          </button>
          <span className="hidden text-xs text-slate-500 sm:inline">Esc clears selection</span>
          <button
            type="button"
            onClick={onClearSelection}
            title="Clear selection"
            className="ml-auto inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <FiX size={14} /> Clear
          </button>
        </div>
      )}

      <div className="max-h-[min(70vh,720px)] overflow-auto">
        <table className="min-w-[960px] w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 text-xs font-bold uppercase tracking-wide text-slate-500 shadow-sm backdrop-blur-md">
            <tr>
              <th className="w-11 px-2 py-2.5 text-left align-middle sm:w-12 sm:px-3">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={onTogglePage}
                  aria-label="Select page"
                  className="rounded border-slate-300"
                />
              </th>
              <th className="px-2 py-2.5 text-left align-middle sm:px-3">Recipient</th>
              <th className="px-2 py-2.5 text-left align-middle sm:px-3">Template / stage</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-left align-middle sm:px-3">State</th>
              <th className="min-w-[180px] max-w-[min(28rem,40vw)] px-2 py-2.5 text-left align-middle sm:px-3">Reason / error</th>
              <th className="px-2 py-2.5 text-left align-middle sm:px-3">Ever delivered</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-right align-middle sm:px-3">Retries</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-left align-middle sm:px-3">Last attempt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center text-sm text-slate-500">
                  <FiLoader className="mr-2 inline animate-spin" /> Loading unresolved recipients…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-2 text-slate-500">
                    <FiCheckCircle className="text-emerald-500" size={32} />
                    <p className="text-base font-semibold text-slate-800">No unresolved recipients in this slice.</p>
                    <p className="text-sm text-slate-600">Adjust filters or widen the date range. Use Overview for trends.</p>
                  </div>
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const isSel = selected.has(r.phone);
              return (
                <tr
                  key={`${r.phone}-${r.messageKind}-${r.lastEventId}`}
                  className={`relative transition-colors ${
                    isSel
                      ? 'bg-slate-50 ring-2 ring-inset ring-primary-navy/20'
                      : 'odd:bg-white even:bg-slate-50/40 hover:bg-slate-100/80'
                  }`}
                >
                  <td className="relative w-11 px-2 py-2 align-middle sm:w-12 sm:px-3 sm:py-2.5">
                    <span className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full sm:top-2 sm:bottom-2 ${severityStripeClass(r)}`} aria-hidden />
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => onToggleRow(r.phone)}
                      aria-label={`Select ${r.phone}`}
                      className="ml-1 rounded border-slate-300"
                    />
                  </td>
                  <td className="px-2 py-2 align-middle sm:px-3 sm:py-2.5">
                    <p className="font-mono text-xs font-semibold text-slate-900 sm:text-sm">{r.phone}</p>
                    <p className="mt-0.5 max-w-[14rem] truncate text-xs text-slate-600 sm:text-sm">{r.name || '—'}</p>
                  </td>
                  <td className="px-2 py-2 align-middle sm:px-3 sm:py-2.5">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex w-fit max-w-full items-center rounded-md bg-primary-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary-navy ring-1 ring-primary-blue-200/80 sm:px-2 sm:text-xs">
                        {r.messageKind}
                      </span>
                      <p className="line-clamp-1 text-xs text-slate-600 sm:text-sm" title={`${r.attemptStage || '—'} · #${r.lastAttemptNumber || '—'}`}>
                        {r.attemptStage || '—'}
                        <span className="text-slate-400"> · #{r.lastAttemptNumber || '—'}</span>
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 align-middle sm:px-3 sm:py-2.5">
                    <div className="inline-flex max-w-[11rem] flex-nowrap items-center gap-1 overflow-x-auto sm:max-w-none sm:overflow-visible">
                      <StatusPill status={r.lifecycleState} size="sm" />
                      {r.retryExhausted && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 sm:px-2 sm:text-xs">
                          <FiAlertOctagon size={11} /> Exhausted
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[min(28rem,40vw)] px-2 py-2 align-middle sm:px-3 sm:py-2.5">
                    <p className="line-clamp-2 text-xs font-medium text-slate-800 sm:text-sm" title={r.exclusionReason || r.reason || ''}>
                      {r.exclusionReason || r.reason || '—'}
                    </p>
                    {r.errorMessage ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-rose-700 sm:text-sm" title={r.errorMessage}>
                        {r.errorMessage}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[11px] leading-tight text-slate-400">No error detail</p>
                    )}
                  </td>
                  <td className="px-2 py-2 align-middle text-xs sm:px-3 sm:py-2.5 sm:text-sm">
                    {r.everDeliveredAt ? (
                      <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-900 sm:text-xs sm:px-2.5 sm:py-1">
                        <FiCheckCircle className="shrink-0" size={12} /> <span className="truncate">{formatDt(r.everDeliveredAt)}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Never</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right align-middle font-mono text-xs tabular-nums text-slate-800 sm:px-3 sm:py-2.5 sm:text-sm">{r.retryHistoryCount || 0}</td>
                  <td className="whitespace-nowrap px-2 py-2 align-middle text-xs text-slate-600 sm:px-3 sm:py-2.5 sm:text-sm">{formatDt(r.lastAttemptAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
        <span className="tabular-nums">
          Showing {(rows.length ? (page - 1) * 50 + 1 : 0)}–{(page - 1) * 50 + rows.length} of {totalRows.toLocaleString()}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={onPrev}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-primary-navy shadow-sm hover:bg-white disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Page <strong className="text-primary-navy tabular-nums">{page}</strong> / {totalPages || 1}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={onNext}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-primary-navy shadow-sm hover:bg-white disabled:opacity-50"
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

function FinalExportCard({ totalsByCategory, totalRows }) {
  const entries = Object.entries(totalsByCategory || {})
    .filter(([, count]) => count > 0)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));

  return (
    <details className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_16px_-8px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.04] group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 sm:px-4 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-primary-navy ring-1 ring-slate-200/80">
            <FiDownload size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Triage by category</p>
            <p className="truncate text-sm font-semibold text-slate-900">
              {totalRows.toLocaleString()} in slice · expand for breakdown
            </p>
          </div>
        </div>
        <FiChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-slate-200/80 px-3 pb-3 pt-2 sm:px-4">
        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-900">
            <FiCheckCircle className="mr-1 inline align-text-bottom" size={14} /> No breakdown for this slice.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {entries.map(([cat, count]) => (
              <div
                key={cat}
                className={`flex flex-col rounded-lg border px-3 py-2 shadow-sm ${
                  EXCLUSION_CATEGORY_COLORS[cat] || 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <p className="text-xs font-semibold leading-snug text-slate-800">
                  {EXCLUSION_CATEGORY_LABELS[cat] || cat}
                </p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-primary-navy">{Number(count).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

/* ============================================================================
 * RecoveryTab — orchestrator with lifted job state + 6s reload ticker
 * ========================================================================= */

function RecoveryTab() {
  const { user } = useAuth();
  const isSuper = user?.isSuperAdmin === true;
  const [searchParams, setSearchParams] = useSearchParams();
  const urlHydratedRef = useRef(false);

  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [messageKind, setMessageKind] = useState('');
  const [group, setGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const [csvBusy, setCsvBusy] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  /* Debounce search text for server-side `q` filter */
  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(String(search || '').trim());
    }, 350);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  /* One-time hydrate from URL so filters match shareable links */
  useLayoutEffect(() => {
    if (urlHydratedRef.current) return;
    urlHydratedRef.current = true;
    const date = searchParams.get('date');
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setRange({ from: date, to: date });
    } else {
      const fromQ = searchParams.get('from');
      const toQ = searchParams.get('to');
      const def = defaultRangeIsoDates();
      if (fromQ && /^\d{4}-\d{2}-\d{2}$/.test(fromQ)) {
        setRange({
          from: fromQ,
          to: toQ && /^\d{4}-\d{2}-\d{2}$/.test(toQ) ? toQ : def.to
        });
      } else if (toQ && /^\d{4}-\d{2}-\d{2}$/.test(toQ)) {
        setRange((r) => ({ ...r, to: toQ }));
      }
    }
    setMessageKind(searchParams.get('messageKind')?.trim() || '');
    const g = searchParams.get('group')?.trim().toLowerCase();
    const allowed = new Set(['all', 'failed', 'excluded', 'exhausted', 'not_accepted', 'in_flight_stale']);
    setGroup(g && allowed.has(g) ? g : 'all');
    const q0 = searchParams.get('q')?.trim() || '';
    setSearch(q0);
    setDebouncedSearch(q0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial URL only
  }, []);

  /* Write filter state to URL (replace; avoids stale keys) */
  useEffect(() => {
    if (!urlHydratedRef.current) return;
    const next = new URLSearchParams();
    if (from) next.set('from', from);
    if (to) next.set('to', to);
    if (messageKind) next.set('messageKind', messageKind);
    if (group && group !== 'all') next.set('group', group);
    if (debouncedSearch) next.set('q', debouncedSearch);
    setSearchParams(next, { replace: true });
  }, [from, to, messageKind, group, debouncedSearch, setSearchParams]);

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

  /** Same instant bounds the API uses (local calendar day → UTC ISO). */
  const apiDateRange = useMemo(() => dateInputsToApiRange(from, to), [from, to]);

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
    const params = { ...apiDateRange, group, page, limit: 50 };
    if (messageKind) params.messageKind = messageKind;
    if (debouncedSearch) params.q = debouncedSearch;
    const res = await getUnresolvedRecipients(params);
    setLoading(false);
    if (!res.success) {
      setErr(res.message || 'Failed to load unresolved recipients');
      setData(null);
      return;
    }
    setData(res.data?.data ?? res.data);
    setLastSyncAt(new Date().toISOString());
  }, [apiDateRange, group, page, messageKind, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const tableRows = data?.rows || [];

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
      const allOn = tableRows.length > 0 && tableRows.every((r) => prev.has(r.phone));
      const next = new Set(prev);
      if (allOn) tableRows.forEach((r) => next.delete(r.phone));
      else tableRows.forEach((r) => next.add(r.phone));
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
    const res = await previewWhatsappOpsManualRecovery({ messageKind, ...apiDateRange });
    setPreviewLoading(false);
    if (!res.success) {
      setPreviewErr(res.message || 'Preview failed');
      setPreview(null);
      return;
    }
    setPreview(res.data?.data ?? res.data);
  }, [messageKind, apiDateRange]);

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
    const body = { messageKind, ...apiDateRange };
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
  }, [messageKind, apiDateRange, selectedArr, preview, refreshJob, loadRecentJobs]);

  const handleCancel = useCallback(async () => {
    if (!job?._id) return;
    if (!window.confirm('Cancel this recovery batch? In-progress sends will not be reverted.')) return;
    const res = await cancelWhatsappOpsManualRecoveryJob(job._id);
    if (res.success) await refreshJob(job._id);
  }, [job, refreshJob]);

  const handleBulkRecover = useCallback(() => handleStart(), [handleStart]);

  /* ---------------------- Export actions ---------------------------------- */
  const handleCopyPhones = async () => {
    const phones = tableRows.map((r) => r.phone).join('\n');
    await copyToClipboard(phones);
  };
  const handleCopyCsv = async () => {
    setCsvBusy(true);
    setErr(null);
    try {
      const params = { ...apiDateRange, group };
      if (messageKind) params.messageKind = messageKind;
      if (debouncedSearch) params.q = debouncedSearch;
      const text = await fetchUnresolvedCsvText(params);
      const forClipboard = text.replace(/^\uFEFF/, '');
      await copyToClipboard(forClipboard);
    } catch (e) {
      setErr(e?.message || 'CSV copy failed');
    }
    setCsvBusy(false);
  };
  const handleDownloadCsv = async () => {
    setCsvBusy(true);
    setErr(null);
    try {
      const params = { ...apiDateRange, group };
      if (messageKind) params.messageKind = messageKind;
      if (debouncedSearch) params.q = debouncedSearch;
      await downloadUnresolvedCsv(params);
    } catch (e) {
      setErr(e?.message || 'CSV export failed');
    }
    setCsvBusy(false);
  };

  /* ---------------------- Render ----------------------------------------- */
  return (
    <div className="space-y-4">
      <PageHeader
        totalRows={totalRows}
        totals={totals}
        jobActive={jobActive}
        onRefresh={() => setReloadKey((k) => k + 1)}
        loading={loading}
        lastSyncAt={lastSyncAt}
        messageKind={messageKind}
      />

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

      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-900">{err}</div>
      )}

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
        rows={tableRows}
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

      <FinalExportCard totalsByCategory={totalsByCategory} totalRows={totalRows} />
    </div>
  );
}

export default function WhatsAppOpsRecovery() {
  const [tab, setTab] = useState('recovery');
  return (
    <div className="space-y-4">
      <nav
        role="tablist"
        aria-label="Recovery console sections"
        className="inline-flex w-full max-w-xl items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-50/80 p-1 shadow-sm ring-1 ring-slate-900/[0.04] sm:w-auto"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'recovery'}
          onClick={() => setTab('recovery')}
          className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/25 sm:flex-initial ${
            tab === 'recovery'
              ? 'bg-primary-navy text-white shadow-md'
              : 'text-slate-700 hover:bg-white'
          }`}
        >
          <FiZap size={16} /> Recovery
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'audit'}
          onClick={() => setTab('audit')}
          className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/25 sm:flex-initial ${
            tab === 'audit'
              ? 'bg-primary-navy text-white shadow-md'
              : 'text-slate-700 hover:bg-white'
          }`}
        >
          <FiEye size={16} /> Audit (raw events)
        </button>
      </nav>
      <div role="tabpanel">
        {tab === 'recovery' ? <RecoveryTab /> : <WhatsAppOpsMessages />}
      </div>
    </div>
  );
}
