import { useCallback, useEffect, useMemo, useState } from 'react';
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

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/70 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200/80 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Overview</h1>
            <p className="text-sm text-gray-600 mt-1 max-w-3xl">
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
              onClick={loadAll}
              className="mt-6 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <section className="mt-4 rounded-xl border border-gray-200 bg-white/95 p-3 sm:p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Template message type</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedKind(null)}
              aria-pressed={selectedKind === null}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold border transition-colors ${
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
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold border transition-colors ${
                  selectedKind === kind.id
                    ? 'bg-primary-navy text-white border-primary-navy'
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
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden lg:col-span-1">
              <div className="bg-gradient-to-r from-primary-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg shadow-sm">
                    <button
                      type="button"
                      onClick={() => setCalendarMode('day')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        calendarMode === 'day'
                          ? 'bg-primary-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMode('range')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        calendarMode === 'range'
                          ? 'bg-primary-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Range
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1.5 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600"
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
                  <span className="text-sm font-bold text-gray-900 min-w-[100px] text-center">{monthStartLabel(monthCursor)}</span>
                  <button
                    type="button"
                    className="p-1.5 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600"
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

              <div className="p-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
                      <th key={w} className="text-center text-[10px] font-bold text-gray-400 uppercase py-2">
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
                                  ? 'bg-white text-gray-900 border-primary-blue-400 ring-1 ring-primary-blue-300'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              } ${isToday ? 'ring-2 ring-primary-blue-300' : ''}`}
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
              <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">Select a date to filter</span>
              </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Selected day overview ({selectedDate}) {selectedTemplate ? `· ${selectedTemplate.label}` : '· all templates'}
              </h2>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 px-4 py-3 text-xs text-indigo-900">
                Daily drilldown is IST-based and shows exact stored booking + WhatsApp pipeline metrics for the selected date.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard label="Slots booked" value={asNumber(dayData?.bookedSlotsCount)} accent />
                <KpiCard label="WhatsApp attempts" value={asNumber(dailyOverall.whatsappAttempts)} />
                <KpiCard label="Slot-booked attempts" value={asNumber(dailyOverall.slotBookedAttempts)} />
                <KpiCard label="Failed" value={asNumber(dailyOverall.whatsappFailed)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard label="Submitted" value={asNumber(dailyOverall.providerAcceptedCount)} />
                <KpiCard label="Delivered" value={asNumber(dailyOverall.deliveredCount)} />
                <KpiCard label="Read" value={asNumber(dailyOverall.readCount)} />
                <KpiCard label="Retried / Exhausted" value={`${asNumber(dailyOverall.retried)} / ${asNumber(dailyOverall.retryExhausted)}`} />
              </div>
              {selectedKind && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <KpiCard label="Selected kind attempts" value={asNumber(dailySelected.whatsappAttempts)} />
                  <KpiCard label="Selected kind failed" value={asNumber(dailySelected.whatsappFailed)} />
                  <KpiCard label="Selected kind delivered" value={asNumber(dailySelected.deliveredCount)} />
                  <KpiCard label="Selected kind retries" value={asNumber(dailySelected.retried)} />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ChartContainer title="Month trend (IST)" subtitle="Bookings vs attempts vs failed by day">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={monthTrend} margin={{ top: 12, left: 0, right: 16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bookings" stroke="#1d4ed8" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="attempts" stroke="#0f766e" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="failed" stroke="#be123c" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>

            <ChartContainer title="Day status composition" subtitle={`Message statuses on ${selectedDate}`}>
              <div style={{ width: '100%', height: 300 }}>
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

            <ChartContainer title="Per-template breakdown" subtitle={`All template events on ${selectedDate}`}>
              <div style={{ width: '100%', height: 300 }}>
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
