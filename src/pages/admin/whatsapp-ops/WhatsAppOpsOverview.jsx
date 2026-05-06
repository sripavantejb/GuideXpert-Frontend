import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import KpiCard from '../../../components/Admin/KpiCard';
import ChartContainer from '../../../components/Admin/ChartContainer';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import {
  getWhatsappOpsMeta,
  getWhatsappOpsSummary,
  getWhatsappOpsCalendarMonth,
  getWhatsappOpsCalendarDay
} from '../../../utils/whatsappOpsAdminApi';
import { defaultRangeIsoDates } from './whatsappOpsShared';
import { useWhatsappOpsHost } from './whatsappOpsHostContext';

const POLL_KEY = 'guidexpert_whatsapp_ops_poll';
const FALLBACK_TEMPLATE_KINDS = [
  { id: 'slot_booked', label: 'Slot booked', description: 'Immediate confirmation after slot booking' },
  { id: 'pre4hr', label: '4hr reminder', description: 'Reminder sent around 4 hours before slot' },
  { id: 'meet', label: 'Meet link (~1hr)', description: 'Meeting link reminder sent around 1 hour before slot' },
  { id: '30min', label: '30 min reminder', description: 'Final reminder sent around 30 minutes before slot' }
];

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function localIsoDate(d = new Date()) {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function monthStartLabel(monthIso) {
  const [y, m] = String(monthIso).split('-').map((x) => parseInt(x, 10));
  const d = new Date(Date.UTC(y, (m || 1) - 1, 1));
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function monthGrid(monthIso) {
  const [y, m] = String(monthIso).split('-').map((x) => parseInt(x, 10));
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const firstWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  const total = 42;
  while (cells.length < total) cells.push(null);
  const rows = [];
  for (let r = 0; r < 6; r += 1) rows.push(cells.slice(r * 7, (r + 1) * 7));
  return rows;
}

const RETRY_STAGE_META = {
  1: { title: 'Initial Attempt', subtitle: 'Primary send wave' },
  2: { title: 'Retry 1', subtitle: 'First recovery wave' },
  3: { title: 'Retry 2', subtitle: 'Final recovery wave' }
};

export default function WhatsAppOpsOverview() {
  const { notifyWhatsappOpsApi404, clearWhatsappOpsApi404 } = useWhatsappOpsHost();
  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [selectedDate, setSelectedDate] = useState(() => localIsoDate());
  const [monthCursor, setMonthCursor] = useState(() => localIsoDate().slice(0, 7));
  const [selectedKind, setSelectedKind] = useState(null);
  const [calendarMode, setCalendarMode] = useState('day');
  const [templateKinds, setTemplateKinds] = useState(FALLBACK_TEMPLATE_KINDS);
  const [live, setLive] = useState(
    () => typeof localStorage === 'undefined' || localStorage.getItem(POLL_KEY) !== 'off'
  );
  const [lastSync, setLastSync] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [errDetail, setErrDetail] = useState('');
  const [payload, setPayload] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [dayData, setDayData] = useState(null);

  const loadSummary = useCallback(async () => {
    setErr(null);
    setErrDetail('');
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
        setErrDetail(
          res.status >= 500
            ? 'Server-side error while aggregating stats. Check backend logs for WhatsApp send/provider issues.'
            : ''
        );
        setPayload(null);
      }
      return;
    }
    clearWhatsappOpsApi404();
    setPayload(res.data?.data ?? res.data);
  }, [from, to, selectedKind, notifyWhatsappOpsApi404, clearWhatsappOpsApi404]);

  const loadMonth = useCallback(async () => {
    const res = await getWhatsappOpsCalendarMonth({ month: monthCursor, ...(selectedKind ? { messageKind: selectedKind } : {}) });
    if (res.success) setMonthData(res.data?.data ?? res.data);
  }, [monthCursor, selectedKind]);

  const loadDay = useCallback(async () => {
    const res = await getWhatsappOpsCalendarDay({ date: selectedDate, ...(selectedKind ? { messageKind: selectedKind } : {}) });
    if (res.success) setDayData(res.data?.data ?? res.data);
  }, [selectedDate, selectedKind]);

  const loadAll = useCallback(async () => {
    await Promise.all([loadSummary(), loadMonth(), loadDay()]);
  }, [loadSummary, loadMonth, loadDay]);

  useEffect(() => {
    Promise.resolve().then(() => loadAll());
  }, [loadAll]);

  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(loadAll, 60000);
    return () => clearInterval(id);
  }, [live, loadAll]);

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

  const byKindChart = useMemo(() => {
    const src = Array.isArray(dayData?.byKind) ? dayData.byKind : [];
    return src.map((x) => ({ label: x?.kind || '—', count: asNumber(x?.count) }));
  }, [dayData]);

  const byStatusChart = useMemo(() => {
    const src = Array.isArray(dayData?.byStatus) ? dayData.byStatus : [];
    return src.map((x) => ({ label: x?.status || '—', count: asNumber(x?.count) }));
  }, [dayData]);

  const calendarCells = useMemo(() => monthGrid(monthCursor), [monthCursor]);

  /** IST day bucket uses message row `createdAt` (see backend getCalendarDayOverview). */
  const dailyOverall = dayData?.overall || {};
  const dailySelected = dayData?.selectedKindMetrics || {};

  const monthTrend = useMemo(
    () => (monthData?.days || []).map((d) => ({
      date: d.date?.slice(-2),
      attempts: asNumber(d.attempts),
      bookings: asNumber(d.bookedSlotsCount),
      failed: asNumber(d.failed)
    })),
    [monthData]
  );

  const selectedTemplate = selectedKind
    ? templateKinds.find((k) => k.id === selectedKind) || FALLBACK_TEMPLATE_KINDS.find((k) => k.id === selectedKind)
    : null;
  const isAllTemplates = !selectedKind;
  const selectedStrategy = selectedTemplate?.retryPolicy?.strategy || (selectedKind === 'slot_booked' ? 'immediate_only' : 'multi_stage');

  const messagesDrillHref = useMemo(() => {
    const p = new URLSearchParams();
    p.set('date', selectedDate);
    if (selectedKind) p.set('messageKind', selectedKind);
    p.set('status', 'failed,retry_exhausted');
    return `/admin/whatsapp-ops/messages?${p.toString()}`;
  }, [selectedDate, selectedKind]);

  const byAttempt = dayData?.byAttempt || {};
  const retry2Exclusions = dayData?.retry2Exclusions || { totalExcluded: 0, byReason: {} };
  const retryLifecycle = useMemo(() => {
    const stageBuckets = [1, 2, 3].map((n) => {
      const bucket = byAttempt[n] || byAttempt[String(n)] || {};
      const targeted = asNumber(bucket.targeted);
      const submitted = asNumber(bucket.submitted);
      const sent = asNumber(bucket.sent);
      const delivered = asNumber(bucket.delivered);
      const read = asNumber(bucket.read);
      const failed = asNumber(bucket.failed);
      const inFlight = asNumber(bucket.inFlight);
      const started = targeted > 0 || submitted > 0 || sent > 0 || delivered > 0 || read > 0 || failed > 0 || inFlight > 0;
      return {
        stage: n,
        bucket,
        targeted,
        submitted,
        sent,
        delivered,
        read,
        failed,
        inFlight,
        started,
        hasInFlight: inFlight > 0
      };
    });

    const s1 = stageBuckets[0];
    const s2 = stageBuckets[1];
    const s3 = stageBuckets[2];
    let activeStage = null;
    if (s1.started && !s2.started && s1.hasInFlight) activeStage = 1;
    else if (s2.started && !s3.started && s2.hasInFlight) activeStage = 2;
    else if (s3.started && s3.hasInFlight) activeStage = 3;

    const states = stageBuckets.map((s) => {
      if (!s.started) return { ...s, state: 'pending' };
      if (activeStage === s.stage) return { ...s, state: 'active' };
      return { ...s, state: 'completed' };
    });

    const lifecycleCompleted =
      activeStage == null && states.some((s) => s.started) && states.filter((s) => s.started).every((s) => !s.hasInFlight);

    return { states, activeStage, lifecycleCompleted };
  }, [byAttempt]);

  const scopeLabel = isAllTemplates ? 'All templates' : (selectedTemplate?.label || 'Selected template');

  const volumeCards = isAllTemplates
    ? [
        {
          label: 'Slots booked',
          value: asNumber(dayData?.bookedSlotsCount),
          accent: true,
          subtitle: `${scopeLabel} • ${selectedDate}`,
          className: 'border-indigo-100 bg-indigo-50/30'
        },
        {
          label: 'WhatsApp attempts',
          value: asNumber(dailyOverall.whatsappAttempts),
          subtitle: `${scopeLabel} • attempts`,
          className: 'border-sky-100 bg-sky-50/30'
        },
        {
          label: 'Slot-booked attempts',
          value: asNumber(dailyOverall.slotBookedAttempts),
          subtitle: `${scopeLabel} • slot_booked`,
          className: 'border-cyan-100 bg-cyan-50/30'
        },
        {
          label: 'Failed',
          value: asNumber(dailyOverall.whatsappFailed),
          subtitle: `${scopeLabel} • failures`,
          className: 'border-rose-100 bg-rose-50/30'
        }
      ]
    : [
        {
          label: `${selectedTemplate?.label || 'Template'} attempts`,
          value: asNumber(dailySelected.whatsappAttempts),
          accent: true,
          subtitle: `${scopeLabel} • attempts`,
          className: 'border-indigo-100 bg-indigo-50/30'
        },
        {
          label: `${selectedTemplate?.label || 'Template'} failed`,
          value: asNumber(dailySelected.whatsappFailed),
          subtitle: `${scopeLabel} • failures`,
          className: 'border-rose-100 bg-rose-50/30'
        },
        {
          label: `${selectedTemplate?.label || 'Template'} delivered`,
          value: asNumber(dailySelected.deliveredCount),
          subtitle: `${scopeLabel} • delivered`,
          className: 'border-emerald-100 bg-emerald-50/30'
        },
        {
          label: `${selectedTemplate?.label || 'Template'} retries`,
          value: asNumber(dailySelected.retried),
          subtitle: `${scopeLabel} • retries`,
          className: 'border-amber-100 bg-amber-50/30'
        }
      ];

  const pipelineSource = isAllTemplates ? dailyOverall : dailySelected;
  const pipelinePrefix = isAllTemplates ? '' : `${selectedTemplate?.label || 'Template'} `;
  const pipelineCards = [
    {
      label: `${pipelinePrefix}Submitted`,
      value: asNumber(pipelineSource.providerAcceptedCount),
      subtitle: isAllTemplates ? `${scopeLabel} • accepted (Gupshup)` : `${scopeLabel} • accepted (Gupshup)`,
      className: 'border-blue-100 bg-blue-50/30'
    },
    {
      label: `${pipelinePrefix}Sent`,
      value: asNumber(pipelineSource.sentCount),
      subtitle: isAllTemplates ? `${scopeLabel} • sent+ (DLR)` : `${scopeLabel} • sent+ (DLR)`,
      className: 'border-sky-100 bg-sky-50/30'
    },
    {
      label: `${pipelinePrefix}Delivered`,
      value: asNumber(pipelineSource.deliveredCount),
      subtitle: isAllTemplates ? `${scopeLabel} • delivered` : `${scopeLabel} • delivered`,
      className: 'border-emerald-100 bg-emerald-50/30'
    },
    {
      label: `${pipelinePrefix}Read`,
      value: asNumber(pipelineSource.readCount),
      subtitle: isAllTemplates ? `${scopeLabel} • read` : `${scopeLabel} • read`,
      className: 'border-violet-100 bg-violet-50/30'
    },
    {
      label: `${pipelinePrefix}Retried / Exhausted`,
      value: `${asNumber(pipelineSource.retried)} / ${asNumber(pipelineSource.retryExhausted)}`,
      subtitle: isAllTemplates ? `${scopeLabel} • reliability` : `${scopeLabel} • reliability`,
      className: 'border-amber-100 bg-amber-50/30'
    }
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-primary-blue-200 bg-gradient-to-br from-white via-primary-blue-50/20 to-primary-blue-100/30 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200/80 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary-navy">Overview</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Daily IST drill-down for slot bookings and WhatsApp delivery pipeline. Click any date to inspect exact metrics.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-medium text-gray-600">
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm transition focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-100"
              />
            </label>
            <label className="text-xs font-medium text-gray-600">
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm transition focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-100"
              />
            </label>
            <label className="text-xs font-medium text-gray-600">
              Drilldown date
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedDate(v);
                  setMonthCursor(v.slice(0, 7));
                  setRange({ from: v, to: v });
                }}
                className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm transition focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-100"
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
              onClick={loadAll}
            className="mt-6 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <section className="mt-4 rounded-xl border border-primary-blue-200 bg-white/95 p-3 sm:p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-navy mb-3">Template message type</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedKind(null)}
              aria-pressed={selectedKind === null}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold border transition-colors ${
                selectedKind === null
                  ? 'bg-primary-navy text-white border-primary-navy shadow-sm'
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
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold border transition-colors ${
                  selectedKind === kind.id
                    ? 'bg-primary-navy text-white border-primary-navy shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {kind.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                const today = localIsoDate();
                setSelectedKind(null);
                setSelectedDate(today);
                setMonthCursor(today.slice(0, 7));
                setRange(defaultRangeIsoDates());
              }}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset filters
            </button>
          </div>
        </section>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
          <span className={`inline-block h-2 w-2 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
          Last sync: {lastSync ? lastSync.toLocaleString('en-IN') : '—'}
        </div>
      </header>

      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <p className="font-semibold">{err}</p>
          {errDetail && <p className="mt-1 text-xs text-rose-800">{errDetail}</p>}
        </div>
      )}

      {loading && !payload && (
        <div className="flex items-center gap-2 text-gray-500 py-16 justify-center">
          <FiLoader className="animate-spin" /> Loading metrics…
        </div>
      )}

      {payload && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-primary-blue-200 bg-white shadow-sm overflow-hidden lg:col-span-1">
              <div className="px-4 py-3 border-b border-primary-blue-200 bg-gradient-to-r from-primary-blue-50 to-white">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-primary-blue-200">
                    <button
                      type="button"
                      onClick={() => setCalendarMode('day')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        calendarMode === 'day'
                          ? 'bg-primary-navy text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMode('range')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        calendarMode === 'range'
                          ? 'bg-primary-navy text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Range
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1.5 rounded-md bg-white border border-primary-blue-200 hover:bg-primary-blue-50 text-gray-600"
                    onClick={() => {
                      const d = new Date(`${monthCursor}-01T00:00:00Z`);
                      d.setUTCMonth(d.getUTCMonth() - 1);
                      setMonthCursor(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
                    }}
                    aria-label="Previous month"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-semibold text-primary-navy min-w-[100px] text-center">{monthStartLabel(monthCursor)}</span>
                  <button
                    type="button"
                    className="p-1.5 rounded-md bg-white border border-primary-blue-200 hover:bg-primary-blue-50 text-gray-600"
                    onClick={() => {
                      const d = new Date(`${monthCursor}-01T00:00:00Z`);
                      d.setUTCMonth(d.getUTCMonth() + 1);
                      setMonthCursor(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
                    }}
                    aria-label="Next month"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              </div>

              <div className="p-4 bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
                      <th key={w} className="text-center text-[10px] font-semibold text-slate-400 uppercase py-2">
                        {w}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendarCells.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((dayNum, ci) => {
                        if (dayNum == null) return <td key={`${ri}-${ci}`} className="p-1" />;
                        const dateKey = `${monthCursor}-${String(dayNum).padStart(2, '0')}`;
                        const isSelected = dateKey === selectedDate;
                        const isToday = dateKey === localIsoDate();
                        return (
                          <td key={`${ri}-${ci}`} className="p-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDate(dateKey);
                                setRange({ from: dateKey, to: dateKey });
                              }}
                              className={`w-full rounded-lg border px-2 py-1.5 text-left transition-all ${
                                isSelected
                                  ? 'bg-primary-navy text-white border-primary-navy ring-1 ring-primary-blue-400'
                                  : 'bg-white text-slate-700 border-primary-blue-200 hover:bg-primary-blue-50/40'
                              } ${isToday ? 'ring-1 ring-primary-blue-300' : ''}`}
                            >
                              <div className="text-xs font-medium text-center py-2">{dayNum}</div>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-3 pt-3 border-t border-primary-blue-100">
                <span className="text-xs text-slate-400">Select a date to filter</span>
              </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-navy">
                Selected day overview ({selectedDate}) {selectedTemplate ? `· ${selectedTemplate.label}` : '· all templates'}
              </h2>
              <div className="rounded-xl border border-primary-blue-200 bg-primary-blue-50/40 px-4 py-3 text-xs text-primary-navy">
                Daily drilldown is IST-based and shows exact stored booking + WhatsApp pipeline metrics for the selected date.
              </div>
              <div className="rounded-2xl border border-primary-blue-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-navy">
                  {isAllTemplates ? 'Volume' : 'Selected template volume'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {volumeCards.map((card) => (
                    <KpiCard
                      key={card.label}
                      label={card.label}
                      value={card.value}
                      subtitle={card.subtitle}
                      accent={card.accent}
                      className={card.className}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-primary-blue-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-navy">
                  {isAllTemplates ? 'Pipeline & reliability' : 'Selected template pipeline & reliability'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {pipelineCards.map((card) => (
                    <KpiCard
                      key={card.label}
                      label={card.label}
                      value={card.value}
                      subtitle={card.subtitle}
                      className={card.className}
                    />
                  ))}
                </div>
              </div>

              {selectedKind && selectedStrategy === 'immediate_only' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-navy">
                        Transactional immediate retry summary (IST day · {selectedDate})
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Lightweight `slot_booked` flow: initial attempt + one short-delay retry only.
                      </p>
                    </div>
                    <Link
                      to={`${messagesDrillHref}&messageKind=slot_booked`}
                      className="text-sm font-semibold text-primary-navy hover:underline"
                    >
                      Open transactional failures →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <KpiCard
                      label="Total targeted"
                      value={asNumber((byAttempt[1] || {}).targeted)}
                      subtitle="Attempt 1 recipients"
                      className="border-indigo-100 bg-indigo-50/30"
                    />
                    <KpiCard
                      label="Initial success / failed"
                      value={`${asNumber((byAttempt[1] || {}).delivered)} / ${asNumber((byAttempt[1] || {}).failed)}`}
                      subtitle="Attempt 1 delivered+ / failed"
                      className="border-blue-100 bg-blue-50/30"
                    />
                    <KpiCard
                      label="Immediate retry attempted"
                      value={asNumber((byAttempt[2] || {}).targeted)}
                      subtitle="Attempt 2 rows"
                      className="border-amber-100 bg-amber-50/30"
                    />
                    <KpiCard
                      label="Recovered after retry"
                      value={asNumber((byAttempt[2] || {}).delivered)}
                      subtitle="Attempt 2 delivered+"
                      className="border-emerald-100 bg-emerald-50/30"
                    />
                    <KpiCard
                      label="Delivered total"
                      value={asNumber((byAttempt[1] || {}).delivered) + asNumber((byAttempt[2] || {}).delivered)}
                      subtitle="Attempt1+2 delivered+"
                      className="border-emerald-100 bg-emerald-50/30"
                    />
                    <KpiCard
                      label="Read total"
                      value={asNumber((byAttempt[1] || {}).read) + asNumber((byAttempt[2] || {}).read)}
                      subtitle="Attempt1+2 read"
                      className="border-violet-100 bg-violet-50/30"
                    />
                    <KpiCard
                      label="Final failed"
                      value={
                        asNumber((byAttempt[2] || {}).targeted) > 0
                          ? asNumber((byAttempt[2] || {}).failed)
                          : asNumber((byAttempt[1] || {}).failed)
                      }
                      subtitle="Exhausted / unrecovered"
                      className="border-rose-100 bg-rose-50/30"
                    />
                    <KpiCard
                      label="Retry2 rows"
                      value={asNumber((byAttempt[3] || {}).targeted)}
                      subtitle="Expected: 0 for slot_booked"
                      className="border-slate-100 bg-slate-50/30"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {selectedKind && selectedStrategy !== 'immediate_only' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-navy">
                    Retry lifecycle analytics (IST day · {selectedDate})
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Progression overview for retry-enabled templates: Attempt 1 → Retry 1 → Retry 2.
                  </p>
                  {retryLifecycle.lifecycleCompleted && (
                    <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      Retry lifecycle completed
                    </div>
                  )}
                </div>
                <Link
                  to={messagesDrillHref}
                  className="text-sm font-semibold text-primary-navy hover:underline"
                >
                  Open failed drilldown →
                </Link>
              </div>

              <div className="hidden xl:grid grid-cols-3 gap-3 text-xs text-slate-500">
                {[1, 2, 3].map((n) => (
                  <div key={`connector-${n}`} className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-semibold">Stage {n}</span>
                    {n < 3 && <span aria-hidden="true" className="text-slate-400">→</span>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {retryLifecycle.states.map((stageData) => {
                  const n = stageData.stage;
                  const targeted = stageData.targeted;
                  const delivered = stageData.delivered;
                  const sent = stageData.sent;
                  const successRate = targeted ? Math.round((delivered / targeted) * 1000) / 10 : 0;
                  const stageMeta = RETRY_STAGE_META[n];
                  const stageState = stageData.state;
                  const stageBadge =
                    stageState === 'active' ? 'Running' : stageState === 'completed' ? 'Completed' : 'Pending';
                  const cardClassName =
                    stageState === 'active'
                      ? 'border-primary-blue-300 bg-primary-blue-50/50 ring-1 ring-primary-blue-200 shadow-sm'
                      : stageState === 'completed'
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-slate-200 bg-slate-50/40 opacity-90';
                  const badgeClassName =
                    stageState === 'active'
                      ? 'border-primary-blue-300 bg-primary-blue-100 text-primary-navy'
                      : stageState === 'completed'
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
                        : 'border-slate-300 bg-white text-slate-600';
                  const indicatorClassName =
                    stageState === 'active'
                      ? 'bg-primary-blue-500 animate-pulse'
                      : stageState === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-slate-300';
                  return (
                    <div key={n} className={`rounded-xl border p-4 transition-colors ${cardClassName}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block h-2.5 w-2.5 rounded-full ${indicatorClassName}`} />
                            <p className="text-sm font-semibold text-slate-900">{stageMeta.title}</p>
                          </div>
                          <p className="text-xs text-slate-500">{stageMeta.subtitle}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-primary-blue-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-primary-navy">
                          Stage {n}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeClassName}`}>
                          {stageBadge}
                        </span>
                        {n < 3 && <div className="text-[11px] font-semibold text-slate-400">Next stage →</div>}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-white border border-slate-200 px-2 py-1.5">
                          <p className="text-slate-500">Targeted</p>
                          <p className="font-semibold text-slate-900">{targeted}</p>
                        </div>
                        <div className="rounded-lg bg-white border border-slate-200 px-2 py-1.5">
                          <p className="text-slate-500">Accepted/Sent</p>
                          <p className="font-semibold text-slate-900">{stageData.submitted} / {sent}</p>
                        </div>
                        <div className="rounded-lg bg-white border border-slate-200 px-2 py-1.5">
                          <p className="text-slate-500">Delivered</p>
                          <p className="font-semibold text-emerald-700">{delivered}</p>
                        </div>
                        <div className="rounded-lg bg-white border border-slate-200 px-2 py-1.5">
                          <p className="text-slate-500">Read</p>
                          <p className="font-semibold text-violet-700">{stageData.read}</p>
                        </div>
                        <div className="rounded-lg bg-white border border-slate-200 px-2 py-1.5">
                          <p className="text-slate-500">Failed</p>
                          <p className="font-semibold text-rose-700">{stageData.failed}</p>
                        </div>
                        <div className="rounded-lg bg-white border border-slate-200 px-2 py-1.5">
                          <p className="text-slate-500">In-flight</p>
                          <p className="font-semibold text-amber-700">{stageData.inFlight}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2">
                        <p className="text-xs text-slate-500">Success rate</p>
                        <p className="text-sm font-semibold text-primary-navy">{successRate}%</p>
                      </div>
                      <Link
                        to={`${messagesDrillHref}&attemptNumber=${n}`}
                        className="mt-3 inline-block text-xs font-semibold text-sky-800 hover:underline"
                      >
                        Messages for attempt {n} →
                      </Link>
                    </div>
                  );
                })}
              </div>

              {asNumber(retry2Exclusions.totalExcluded) > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
                    Retry2 eligibility reconciliation
                  </p>
                  <p className="mt-1 text-sm text-amber-900/90">
                    Retry1 failed: <span className="font-semibold">{asNumber(retry2Exclusions.retry1Failed)}</span> · Retry2 targeted: <span className="font-semibold">{asNumber(retry2Exclusions.retry2Targeted)}</span> · Excluded: <span className="font-semibold">{asNumber(retry2Exclusions.totalExcluded)}</span>
                  </p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 text-xs">
                    {Object.entries(retry2Exclusions.byReason || {}).map(([reason, count]) => (
                      <div key={reason} className="rounded-lg border border-amber-200 bg-white px-2.5 py-2">
                        <p className="font-semibold text-amber-900">{asNumber(count)}</p>
                        <p className="text-amber-800/90">{String(reason).replace(/_/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <ChartContainer title="Month trend (IST)" subtitle="Bookings vs attempts vs failed by day">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={monthTrend} margin={{ top: 12, left: 0, right: 16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#dbe7f3" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bookings" stroke="#4d8ec7" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="attempts" stroke="#003366" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="failed" stroke="#dc2626" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>

            <ChartContainer title="Day status composition" subtitle={`Message statuses on ${selectedDate}`}>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={byStatusChart} margin={{ top: 12, left: 0, right: 16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#dbe7f3" />
                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [value, 'events']} />
                    <Bar dataKey="count" fill="#003366" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>

            <ChartContainer title="Per-template breakdown" subtitle={`All template events on ${selectedDate}`}>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={byKindChart} margin={{ top: 12, left: 0, right: 16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#dbe7f3" />
                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [value, 'events']} />
                    <Bar dataKey="count" fill="#4d8ec7" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </div>

          {(!payload?.meta?.attemptedRows) && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-base font-semibold text-gray-700">No events in this selection</p>
              <p className="mt-1 text-sm text-gray-500">
                No WhatsApp attempts found for {selectedTemplate ? selectedTemplate.label : 'the selected date range'}.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
