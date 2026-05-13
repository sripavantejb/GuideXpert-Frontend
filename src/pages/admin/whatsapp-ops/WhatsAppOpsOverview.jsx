import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import KpiCard from '../../../components/Admin/KpiCard';
import ChartContainer from '../../../components/Admin/ChartContainer';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import {
  getWhatsappOpsMeta,
  getWhatsappOpsSummary,
  getWhatsappOpsCalendarMonth,
  getWhatsappOpsCalendarDay,
  getLatestWhatsappOpsSnapshot
} from '../../../utils/whatsappOpsAdminApi';
import { defaultRangeIsoDates, istCalendarIsoToday } from './whatsappOpsShared';
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

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Inclusive list of YYYY-MM months between two ISO dates (by string order). */
function distinctMonthsBetweenIsoDates(fromIso, toIso) {
  if (!ISO_DATE_RE.test(fromIso) || !ISO_DATE_RE.test(toIso)) return [];
  const a = fromIso <= toIso ? fromIso : toIso;
  const b = fromIso <= toIso ? toIso : fromIso;
  let y = parseInt(a.slice(0, 4), 10);
  let m = parseInt(a.slice(5, 7), 10);
  const endY = parseInt(b.slice(0, 4), 10);
  const endM = parseInt(b.slice(5, 7), 10);
  const out = [];
  while (y < endY || (y === endY && m <= endM)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

function mergeWhatsappMonthPayloads(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const dayByDate = new Map();
  const recById = new Map();
  let messageKind = null;
  for (const data of parts) {
    if (!data || typeof data !== 'object') continue;
    if (data.filter?.messageKind != null) messageKind = data.filter.messageKind;
    for (const row of data.days || []) {
      if (row?.date) dayByDate.set(row.date, row);
    }
    for (const row of data.recipientTrendDays || []) {
      if (row?._id) recById.set(row._id, row);
    }
  }
  const days = [...dayByDate.values()].sort((x, y) => String(x.date).localeCompare(String(y.date)));
  const recipientTrendDays = [...recById.values()].sort((a, b) => String(a._id).localeCompare(String(b._id)));
  const monthTotals = days.reduce(
    (acc, d) => ({
      bookedSlotsCount: acc.bookedSlotsCount + asNumber(d.bookedSlotsCount),
      attempts: acc.attempts + asNumber(d.attempts),
      accepted: acc.accepted + asNumber(d.accepted),
      sent: acc.sent + asNumber(d.sent),
      delivered: acc.delivered + asNumber(d.delivered),
      read: acc.read + asNumber(d.read),
      failed: acc.failed + asNumber(d.failed),
      retried: acc.retried + asNumber(d.retried)
    }),
    {
      bookedSlotsCount: 0,
      attempts: 0,
      accepted: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      retried: 0
    }
  );
  return {
    ...parts[0],
    schemaVersion: parts[0]?.schemaVersion ?? 2,
    filter: { ...(parts[0]?.filter || {}), mergedMonths: true, messageKind },
    monthTotals,
    days,
    recipientTrendDays
  };
}

function normalizeIsoRange(prev, patch) {
  const next = { ...prev, ...patch };
  let { from: nf, to: nt } = next;
  if (ISO_DATE_RE.test(nf) && ISO_DATE_RE.test(nt) && nf > nt) {
    return { from: nt, to: nf };
  }
  return next;
}

function formatPromotionCountdown(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(t)) return null;
  if (t <= 0) return 'Due now';
  const m = Math.floor(t / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${Math.max(1, m)}m`;
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

/** Must match backend `ALLOWED_SLOT_TIME_SUFFIXES` + `all`. */
const SLOT_TIME_OPTIONS = [
  { id: 'all', label: 'All slot times' },
  { id: '11AM', label: '11 AM' },
  { id: '3PM', label: '3 PM' },
  { id: '6PM', label: '6 PM' },
  { id: '7PM', label: '7 PM' }
];

function slotTimeFilterLabel(id) {
  return SLOT_TIME_OPTIONS.find((o) => o.id === id)?.label || id;
}

export default function WhatsAppOpsOverview() {
  const { notifyWhatsappOpsApi404, clearWhatsappOpsApi404 } = useWhatsappOpsHost();
  const [{ from, to }, setRange] = useState(defaultRangeIsoDates);
  const [selectedDate, setSelectedDate] = useState(() => istCalendarIsoToday());
  const [monthCursor, setMonthCursor] = useState(() => istCalendarIsoToday().slice(0, 7));
  const [selectedKind, setSelectedKind] = useState(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState('all');
  const [calendarMode, setCalendarMode] = useState('day');
  const [templateKinds, setTemplateKinds] = useState(FALLBACK_TEMPLATE_KINDS);
  const [waDiagnostics, setWaDiagnostics] = useState(false);
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
  const [daySnapshotDoc, setDaySnapshotDoc] = useState(null);

  const summaryLoadGen = useRef(0);
  const monthLoadGen = useRef(0);
  const dayLoadGen = useRef(0);

  const loadSummary = useCallback(async () => {
    const gen = ++summaryLoadGen.current;
    setErr(null);
    setErrDetail('');
    setLoading(true);
    const res = await getWhatsappOpsSummary({ from, to, ...(selectedKind ? { messageKind: selectedKind } : {}) });
    if (gen !== summaryLoadGen.current) return;
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
    const gen = ++monthLoadGen.current;
    const rangeMonths =
      ISO_DATE_RE.test(from) && ISO_DATE_RE.test(to) ? distinctMonthsBetweenIsoDates(from, to) : [];
    const union = [...new Set([...rangeMonths, monthCursor])].sort((a, b) => a.localeCompare(b));
    const months = union.slice(0, 24);
    const results = await Promise.all(
      months.map((m) =>
        getWhatsappOpsCalendarMonth({ month: m, ...(selectedKind ? { messageKind: selectedKind } : {}) })
      )
    );
    if (gen !== monthLoadGen.current) return;
    const okParts = results.filter((r) => r.success).map((r) => r.data?.data ?? r.data);
    if (!okParts.length) {
      setMonthData(null);
      return;
    }
    setMonthData(mergeWhatsappMonthPayloads(okParts));
  }, [from, to, monthCursor, selectedKind]);

  const loadDay = useCallback(async () => {
    const gen = ++dayLoadGen.current;
    const params = {
      date: selectedDate,
      slotTime: selectedSlotTime,
      ...(selectedKind ? { messageKind: selectedKind } : {}),
      ...(waDiagnostics ? { debug: '1' } : {})
    };
    const isPastSlotDay = selectedDate < istCalendarIsoToday();
    const [dayRes, snapRes] = await Promise.all([
      getWhatsappOpsCalendarDay(params),
      isPastSlotDay ? getLatestWhatsappOpsSnapshot({ scope: 'day', ...params }) : Promise.resolve({ success: false })
    ]);
    if (gen !== dayLoadGen.current) return;
    if (dayRes.success) setDayData(dayRes.data?.data ?? dayRes.data);
    else setDayData(null);
    if (isPastSlotDay && snapRes.success) {
      const body = snapRes.data;
      const doc = body?.data != null ? body.data : body;
      setDaySnapshotDoc(doc && doc.payload ? doc : null);
    } else {
      setDaySnapshotDoc(null);
    }
  }, [selectedDate, selectedKind, selectedSlotTime, waDiagnostics]);

  const loadAll = useCallback(async () => {
    await Promise.all([loadSummary(), loadMonth(), loadDay()]);
  }, [loadSummary, loadMonth, loadDay]);

  useEffect(() => {
    Promise.resolve().then(() => loadAll());
  }, [loadAll]);

  useEffect(() => {
    if (!ISO_DATE_RE.test(from) || !ISO_DATE_RE.test(to)) return;
    setSelectedDate((d) => {
      if (d < from) return from;
      if (d > to) return to;
      return d;
    });
  }, [from, to]);

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

  const dayView = useMemo(() => {
    if (!dayData) return null;
    const past = selectedDate < istCalendarIsoToday();
    const snapshotKind = daySnapshotDoc?.messageKind || null;
    const selectedKindNorm = selectedKind || null;
    const snapshotSlotTime =
      daySnapshotDoc?.range?.slotTime ??
      daySnapshotDoc?.payload?.filter?.slotTime ??
      daySnapshotDoc?.filter?.slotTime ??
      'all';
    const snapshotMatchesSelection =
      Boolean(daySnapshotDoc?.payload) &&
      daySnapshotDoc.range?.dateIso === selectedDate &&
      snapshotKind === selectedKindNorm &&
      String(snapshotSlotTime || 'all') === String(selectedSlotTime || 'all');
    if (dayData.schemaVersion === 2 && past && snapshotMatchesSelection) {
      return {
        ...daySnapshotDoc.payload,
        _meta: { source: 'snapshot', capturedAt: daySnapshotDoc.capturedAt }
      };
    }
    return { ...dayData, _meta: { source: 'live' } };
  }, [dayData, daySnapshotDoc, selectedDate, selectedKind, selectedSlotTime]);

  const legacyDay = dayView?.slotCohortAttemptMetrics || dayView?.legacyAttemptMetrics || {};
  const isRecipientDay = dayView?.schemaVersion === 2;
  const rt = dayView?.recipientTotals;
  const retryFunnelRecipient = dayView?.retryFunnelByAttempt || {};
  const exclusionBreakdown = dayView?.exclusionBreakdown || {};
  const retryQueue = dayView?.retryQueue || {};

  const byKindChart = useMemo(() => {
    const src = Array.isArray(legacyDay.byKind) ? legacyDay.byKind : [];
    return src.map((x) => ({ label: x?.kind || '—', count: asNumber(x?.count) }));
  }, [legacyDay]);

  const byStatusChart = useMemo(() => {
    const src = Array.isArray(legacyDay.byStatus) ? legacyDay.byStatus : [];
    return src.map((x) => ({ label: x?.status || '—', count: asNumber(x?.count) }));
  }, [legacyDay]);

  const failureReasonChart = useMemo(() => {
    const src = Array.isArray(dayView?.charts?.failureReasons) ? dayView.charts.failureReasons : [];
    return src.map((x) => ({ label: x?._id || '—', count: asNumber(x?.count) }));
  }, [dayView]);

  const calendarCells = useMemo(() => monthGrid(monthCursor), [monthCursor]);

  /** Slot-day IST cohort: attempt rows joined via submission slotDate (same as recipient cohort). */
  const dailyOverall = legacyDay.overall || {};
  const dailySelected = legacyDay.selectedKindMetrics || {};

  const monthTrend = useMemo(() => {
    const days = monthData?.days || [];
    const recList = Array.isArray(monthData?.recipientTrendDays) ? monthData.recipientTrendDays : [];
    const recByDay = new Map(recList.map((d) => [d._id, d]));
    const fromF = ISO_DATE_RE.test(from) ? from : '';
    const toF = ISO_DATE_RE.test(to) ? to : '';
    const multiMonth = Boolean(fromF && toF && fromF.slice(0, 7) !== toF.slice(0, 7));
    return days
      .filter((d) => {
        const dateStr = d.date;
        if (!dateStr) return false;
        if (fromF && dateStr < fromF) return false;
        if (toF && dateStr > toF) return false;
        return true;
      })
      .map((d) => {
        const r = recByDay.get(d.date);
        return {
          date: multiMonth ? d.date?.slice(5) || d.date : d.date?.slice(-2),
          attempts: asNumber(d.attempts),
          bookings: asNumber(d.bookedSlotsCount),
          failed: asNumber(d.failed),
          recDelivered: asNumber(r?.delivered),
          recUnresolved: asNumber(r?.unresolved),
          recPermanent: asNumber(r?.permanentFailed)
        };
      });
  }, [monthData, from, to]);

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

  const byAttempt = legacyDay.byAttempt || {};
  const retry2Exclusions = legacyDay.retry2Exclusions || { totalExcluded: 0, byReason: {} };
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

  const recipientRetryLifecycle = useMemo(() => {
    const stageBuckets = [1, 2, 3].map((n) => {
      const bucket = retryFunnelRecipient[n] || retryFunnelRecipient[String(n)] || {};
      const targeted = asNumber(bucket.targetedRecipients);
      const submitted = asNumber(bucket.accepted);
      const sent = asNumber(bucket.sent);
      const delivered = asNumber(bucket.delivered);
      const read = asNumber(bucket.read);
      const failed = asNumber(bucket.failed);
      const inFlight = asNumber(bucket.inFlight);
      const excluded = asNumber(bucket.excluded);
      const started = targeted > 0 || submitted > 0 || sent > 0 || delivered > 0 || read > 0 || failed > 0 || inFlight > 0 || excluded > 0;
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
        excluded,
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
  }, [retryFunnelRecipient]);

  const scopeLabel = isAllTemplates ? 'All templates' : (selectedTemplate?.label || 'Selected template');

  const volumeCards = useMemo(() => {
    const filt = dayView?.filter || {};
    const slotPart =
      filt.slotTime && filt.slotTime !== 'all'
        ? ` · ${slotTimeFilterLabel(filt.slotTime)} booking cohort`
        : ' · all slot times on this IST date';
    const cohortDate = `IST ${selectedDate}${slotPart}`;
    const cohortScope = cohortDate;

    if (isRecipientDay && rt) {
      if (isAllTemplates) {
        return [
          {
            label: 'Booked (cohort)',
            value: asNumber(dayView?.bookedSlotsCount),
            accent: true,
            subtitle: `FormSubmission · registered · ${cohortDate}`,
            className: 'border-slate-200/90 bg-white'
          },
          {
            label: 'People (≥1 WA row)',
            value: asNumber(rt.totalRecipients),
            subtitle: `${scopeLabel} · unique phone · rolled up across template kinds · ${cohortDate}`,
            className: 'border-indigo-100 bg-indigo-50/30'
          },
          {
            label: 'Delivered',
            value: asNumber(rt.delivered),
            subtitle: `${scopeLabel} · reached delivered+ on any kind · ${cohortScope}`,
            className: 'border-emerald-100 bg-emerald-50/30'
          },
          {
            label: 'Read',
            value: asNumber(rt.read),
            subtitle: `${scopeLabel} · reached read on any kind · ${cohortScope}`,
            className: 'border-violet-100 bg-violet-50/30'
          },
          {
            label: 'Unresolved',
            value: asNumber(rt.finalUnresolved),
            subtitle: `${scopeLabel} · in-flight or retryable · ${cohortScope}`,
            className: 'border-amber-100 bg-amber-50/30'
          },
          {
            label: 'Permanent failed',
            value: asNumber(rt.finalPermanentFailed),
            subtitle: `${scopeLabel} · exhausted or non-retryable terminal · ${cohortScope}`,
            className: 'border-rose-100 bg-rose-50/30'
          }
        ];
      }
      return [
        {
          label: 'Booked (cohort)',
          value: asNumber(dayView?.bookedSlotsCount),
          accent: true,
          subtitle: `FormSubmission · registered · ${cohortDate}`,
          className: 'border-slate-200/90 bg-white'
        },
        {
          label: 'Recipients',
          value: asNumber(rt.totalRecipients),
          subtitle: `${scopeLabel} · per lineage + phone + template · people with ≥1 WhatsApp row in cohort · ${cohortDate}`,
          className: 'border-indigo-100 bg-indigo-50/30'
        },
        {
          label: 'Delivered',
          value: asNumber(rt.delivered),
          subtitle: `${scopeLabel} · reached delivered+ at least once · ${cohortScope}`,
          className: 'border-emerald-100 bg-emerald-50/30'
        },
        {
          label: 'Read',
          value: asNumber(rt.read),
          subtitle: `${scopeLabel} · reached read at least once · ${cohortScope}`,
          className: 'border-violet-100 bg-violet-50/30'
        },
        {
          label: 'Unresolved',
          value: asNumber(rt.finalUnresolved),
          subtitle: `${scopeLabel} · still active · ${cohortScope}`,
          className: 'border-amber-100 bg-amber-50/30'
        }
      ];
    }
    if (isAllTemplates) {
      return [
        {
          label: 'Booked (cohort)',
          value: asNumber(dayView?.bookedSlotsCount),
          accent: true,
          subtitle: `FormSubmission · registered · ${cohortDate}`,
          className: 'border-slate-200/90 bg-white'
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
      ];
    }
    return [
      {
        label: 'Booked (cohort)',
        value: asNumber(dayView?.bookedSlotsCount),
        accent: true,
        subtitle: `FormSubmission · registered · ${cohortDate}`,
        className: 'border-slate-200/90 bg-white'
      },
      {
        label: `${selectedTemplate?.label || 'Template'} attempts`,
        value: asNumber(dailySelected.whatsappAttempts),
        subtitle: `${scopeLabel} • attempts (${cohortDate})`,
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
  }, [
    isRecipientDay,
    rt,
    isAllTemplates,
    selectedDate,
    scopeLabel,
    dayView,
    dailyOverall,
    dailySelected,
    selectedTemplate
  ]);

  const pipelineCards = useMemo(() => {
    const filt = dayView?.filter || {};
    const slotPart =
      filt.slotTime && filt.slotTime !== 'all'
        ? ` · ${slotTimeFilterLabel(filt.slotTime)} booking cohort`
        : ' · all slot times on this IST date';
    const cohortScope = `IST ${selectedDate}${slotPart}`;

    if (isRecipientDay && rt) {
      const prefix = isAllTemplates ? 'All · ' : `${selectedTemplate?.label || 'Template'} · `;
      if (isAllTemplates) {
        return [
          {
            label: `${prefix}Accepted (any kind)`,
            value: asNumber(rt.accepted),
            subtitle: `${scopeLabel} · provider accepted · rolled up per phone · ${cohortScope}`,
            className: 'border-blue-100 bg-blue-50/30'
          },
          {
            label: `${prefix}Delivered`,
            value: asNumber(rt.delivered),
            subtitle: `${scopeLabel} · delivered+ on at least one kind · ${cohortScope}`,
            className: 'border-emerald-100 bg-emerald-50/30'
          },
          {
            label: `${prefix}Read`,
            value: asNumber(rt.read),
            subtitle: `${scopeLabel} · read on at least one kind · ${cohortScope}`,
            className: 'border-violet-100 bg-violet-50/30'
          },
          {
            label: `${prefix}Unresolved`,
            value: asNumber(rt.finalUnresolved),
            subtitle: `${scopeLabel} · in-flight or retryable · ${cohortScope}`,
            className: 'border-amber-100 bg-amber-50/30'
          },
          {
            label: `${prefix}Permanent / exhausted`,
            value: asNumber(rt.finalPermanentFailed),
            subtitle: `${scopeLabel} · terminal · ${cohortScope}`,
            className: 'border-rose-100 bg-rose-50/30'
          }
        ];
      }
      return [
        {
          label: `${prefix}Accepted`,
          value: asNumber(rt.accepted),
          subtitle: `${scopeLabel} · provider accepted · ${cohortScope}`,
          className: 'border-blue-100 bg-blue-50/30'
        },
        {
          label: `${prefix}Delivered`,
          value: asNumber(rt.delivered),
          subtitle: `${scopeLabel} · delivered+ · ${cohortScope}`,
          className: 'border-emerald-100 bg-emerald-50/30'
        },
        {
          label: `${prefix}Read`,
          value: asNumber(rt.read),
          subtitle: `${scopeLabel} · read · ${cohortScope}`,
          className: 'border-violet-100 bg-violet-50/30'
        },
        {
          label: `${prefix}Unresolved`,
          value: asNumber(rt.finalUnresolved),
          subtitle: `${scopeLabel} · in-flight or retryable · ${cohortScope}`,
          className: 'border-amber-100 bg-amber-50/30'
        },
        {
          label: `${prefix}Permanent / exhausted`,
          value: asNumber(rt.finalPermanentFailed),
          subtitle: `${scopeLabel} · terminal · ${cohortScope}`,
          className: 'border-rose-100 bg-rose-50/30'
        }
      ];
    }
    const pipelineSource = isAllTemplates ? dailyOverall : dailySelected;
    const pipelinePrefix = isAllTemplates ? '' : `${selectedTemplate?.label || 'Template'} `;
    return [
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
  }, [isRecipientDay, rt, isAllTemplates, scopeLabel, selectedDate, dayView, dailyOverall, dailySelected, selectedTemplate]);

  const campaignFunnel = isRecipientDay ? recipientRetryLifecycle : retryLifecycle;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-primary-blue-200 bg-gradient-to-br from-white via-primary-blue-50/20 to-primary-blue-100/30 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200/80 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary-navy">Overview</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Daily IST drill-down for slot bookings and WhatsApp delivery pipeline. Calendar and month grids use slot-day IST cohorts (step3Data.slotDate). The date-range summary strip above the calendar uses event-time (message createdAt) from the API for quick volume checks.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-medium text-gray-600">
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setRange((r) => normalizeIsoRange(r, { from: e.target.value }))}
                className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm transition focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-100"
              />
            </label>
            <label className="text-xs font-medium text-gray-600">
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setRange((r) => normalizeIsoRange(r, { to: e.target.value }))}
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
                  setRange((r) => normalizeIsoRange(r, { from: v, to: v }));
                }}
                className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm transition focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-100"
              />
            </label>
            <label className="text-xs font-medium text-gray-600">
              Slot time (booking cohort)
              <select
                value={selectedSlotTime}
                onChange={(e) => setSelectedSlotTime(e.target.value)}
                className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm transition focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-100 min-w-[140px]"
              >
                {SLOT_TIME_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
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
                const today = istCalendarIsoToday();
                setSelectedKind(null);
                setSelectedSlotTime('all');
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
                        const isToday = dateKey === istCalendarIsoToday();
                        return (
                          <td key={`${ri}-${ci}`} className="p-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDate(dateKey);
                                setRange((r) => normalizeIsoRange(r, { from: dateKey, to: dateKey }));
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
                Selected day overview ({selectedDate}) · {slotTimeFilterLabel(selectedSlotTime)}{' '}
                {selectedTemplate ? `· ${selectedTemplate.label}` : '· all templates'}
              </h2>
              <div className="rounded-xl border border-primary-blue-200 bg-primary-blue-50/40 px-4 py-3 text-xs text-primary-navy space-y-2">
                <p>
                  {isRecipientDay
                    ? 'Primary metrics use registered FormSubmission bookings for the selected IST date and slot-time filter. WhatsApp rows are restricted to those submissions; all-templates view rolls up by unique phone across template kinds. Legacy attempt-row charts below still use message createdAt for that IST day (debugging).'
                    : 'Daily drilldown is IST-based and shows exact stored booking + WhatsApp pipeline metrics for the selected date.'}
                </p>
                {isRecipientDay && dayView?._meta?.source === 'snapshot' && dayView?._meta?.capturedAt && (
                  <p className="font-semibold text-slate-800">
                    Frozen snapshot · captured {new Date(dayView._meta.capturedAt).toLocaleString('en-IN')}
                  </p>
                )}
                {isRecipientDay && dayView?._meta?.source === 'live' && (
                  <p className="font-semibold text-emerald-800">Live recipient metrics (slot-day cohort)</p>
                )}
                {isRecipientDay && asNumber(rt?.cohortFallbackCount) > 0 && (
                  <p className="text-amber-900">
                    {asNumber(rt.cohortFallbackCount)} recipient(s) used createdAt fallback for slot day (missing submission link).
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-primary-blue-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-navy">
                  {isAllTemplates ? 'Volume' : 'Selected template volume'}
                </p>
                {isRecipientDay && (
                  <p className="mb-3 text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">Booked slots</span> ({asNumber(dayView?.bookedSlotsCount)}): registered
                    FormSubmission rows for this IST slot day
                    {selectedSlotTime !== 'all' ? ` and ${slotTimeFilterLabel(selectedSlotTime)} cohort` : ''}.{' '}
                    <span className="font-semibold text-slate-700">Recipients</span> ({asNumber(rt?.totalRecipients)}): distinct
                    {selectedKind ? ` lineage + phone + this template` : ' lineage + phone'} with at least one WhatsApp event row in this cohort (not the same count as bookings). Cohort anchor: booking IST slot day (
                    {dayView?.cohortAnchor || 'booking_ist_slot_day'}).
                  </p>
                )}
                <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(12rem,1fr))]">
                  {volumeCards.map((card) => (
                    <KpiCard
                      key={card.label}
                      label={card.label}
                      value={card.value}
                      subtitle={card.subtitle}
                      accent={card.accent}
                      className={`min-w-0 ${card.className || ''}`}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-primary-blue-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-navy">
                  {isAllTemplates ? 'Pipeline & reliability' : 'Selected template pipeline & reliability'}
                </p>
                <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(12rem,1fr))]">
                  {pipelineCards.map((card) => (
                    <KpiCard
                      key={card.label}
                      label={card.label}
                      value={card.value}
                      subtitle={card.subtitle}
                      className={`min-w-0 ${card.className || ''}`}
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
                    {isRecipientDay ? 'Recipient retry funnel (slot-day IST)' : 'Retry lifecycle analytics (IST day)'} · {selectedDate}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {isRecipientDay
                      ? 'Distinct recipients by lineage (canonicalRetryGroupId || retryGroupId). Per-stage counts use only rows at that attempt number.'
                      : 'Progression overview for retry-enabled templates: Attempt 1 → Retry 1 → Retry 2.'}
                  </p>
                  {isRecipientDay && retryQueue?.nextPromotionDueAt && (
                    <p className="mt-2 text-xs font-semibold text-primary-navy">
                      Next promotion window:{' '}
                      {formatPromotionCountdown(retryQueue.nextPromotionDueAt) || '—'} ·{' '}
                      {new Date(retryQueue.nextPromotionDueAt).toLocaleString('en-IN')}
                    </p>
                  )}
                  {campaignFunnel.lifecycleCompleted && (
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
                {campaignFunnel.states.map((stageData) => {
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
                        {isRecipientDay && (
                          <div className="rounded-lg bg-white border border-slate-200 px-2 py-1.5 col-span-2">
                            <p className="text-slate-500">Excluded (rows)</p>
                            <p className="font-semibold text-slate-800">{asNumber(stageData.excluded)}</p>
                          </div>
                        )}
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

              {isRecipientDay && Object.keys(exclusionBreakdown).length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-800">
                    Exclusion breakdown (event rows, slot-day cohort)
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Total exclusion rows: <span className="font-semibold">{asNumber(rt?.excludedTotal)}</span>
                  </p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 text-xs">
                    {Object.entries(exclusionBreakdown).map(([reason, count]) => (
                      <div key={reason} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                        <p className="font-semibold text-slate-900">{asNumber(count)}</p>
                        <p className="text-slate-600">{String(reason).replace(/_/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    to={`/admin/whatsapp-ops/messages?date=${selectedDate}${selectedKind ? `&messageKind=${selectedKind}` : ''}`}
                    className="mt-3 inline-block text-xs font-semibold text-primary-navy hover:underline"
                  >
                    Open messages (filter) →
                  </Link>
                </div>
              )}

              {!isRecipientDay && asNumber(retry2Exclusions.totalExcluded) > 0 && (
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

          <div className="mb-4 flex flex-wrap items-center gap-3">
            {isRecipientDay && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={waDiagnostics}
                  onChange={(e) => setWaDiagnostics(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Load data-quality diagnostics
              </label>
            )}
          </div>
          {dayView?.diagnostics && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
              <p className="font-semibold text-slate-900">Diagnostics (slot-day cohort)</p>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(dayView.diagnostics).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-mono font-semibold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            <ChartContainer
              title="Month trend (IST)"
              subtitle={monthData?.schemaVersion === 2 ? 'Bookings vs attempts + recipient metrics (all IST slot-day cohort)' : 'Bookings vs attempts vs failed by day'}
            >
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
                    {monthData?.schemaVersion === 2 && (
                      <>
                        <Line type="monotone" dataKey="recDelivered" name="Recipients delivered" stroke="#059669" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="recUnresolved" name="Recipients unresolved" stroke="#d97706" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="recPermanent" name="Recipients permanent" stroke="#b91c1c" strokeWidth={2} dot={false} />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>

            <ChartContainer title="Day status composition" subtitle={`Message attempts (IST slot-day cohort) on ${selectedDate}`}>
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

            <ChartContainer
              title={isRecipientDay ? 'Failure reason buckets' : 'Failure reasons (day range)'}
              subtitle={isRecipientDay ? 'Terminal failures in cohort day window' : 'Same taxonomy when recipient day view active'}
            >
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={failureReasonChart} margin={{ top: 12, left: 0, right: 16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#dbe7f3" />
                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [value, 'events']} />
                    <Bar dataKey="count" fill="#7c3aed" radius={[5, 5, 0, 0]} />
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
