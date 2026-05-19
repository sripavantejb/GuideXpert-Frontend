import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiUsers, FiBarChart2, FiCheckCircle, FiClipboard, FiCalendar, FiClock, FiSearch } from 'react-icons/fi';
import {
  getAllIitCounsellingSubmissionsPaginated,
  getIitCounsellingSubmissions,
  getIitCounsellingSubmission,
  getIitCounsellingVisitAnalytics,
  getStoredToken
} from '../../utils/adminApi';
import CopyToSheetsModal from '../../components/Admin/CopyToSheetsModal';
import {
  encodeSlotFilterOption,
  normalizeIitSlotValue,
  parseSlotFilterOption,
  rowMatchesDemoDateRange,
  rowMatchesSlotFilter,
} from '../../utils/iitCounsellingSlots';
import { deriveSlotDemoDateKeyIST, getAvailableSlots } from '../../utils/weekendSlots';
import {
  isRelevantIitClassStatus,
  matchesIitLeadRelevance,
} from '../../utils/iitCounsellingClassStatus';

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleDateString('en-IN', { dateStyle: 'short' })} ${date.toLocaleTimeString('en-IN', { timeStyle: 'short' })}`;
}

function formatLabel(raw) {
  const key = String(raw || '');
  if (key === 'classStatus') return 'Current studying';
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatTopColleges(value) {
  if (!Array.isArray(value) || value.length === 0) return '—';
  const cleaned = value.map((item) => String(item || '').trim()).filter(Boolean);
  return cleaned.length ? cleaned.join('\n') : '—';
}

function formatDemoDateDisplay(dateKey) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey))) return '—';
  const d = new Date(`${dateKey}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

const IIT_SUBMISSION_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'classStatus', label: 'Current studying' },
  { key: 'currentStep', label: 'Current Step' },
  { key: 'completed', label: 'Completed' },
  { key: 'topColleges', label: 'Top Colleges' },
  { key: 'slot', label: 'Slot' },
  { key: 'demoDate', label: 'Demo date' },
  { key: 'utmSource', label: 'UTM Source' },
  { key: 'utmMedium', label: 'UTM Medium' },
  { key: 'utmCampaign', label: 'UTM Campaign' },
  { key: 'utmContent', label: 'UTM Content' },
  { key: 'updated', label: 'Updated' },
];

function mapIitSubmissionRecord(row) {
  const utm = row?.utm || {};
  const topColleges = formatTopColleges(row?.section1Data?.top5Colleges);
  const slotRaw = String(row?.section1Data?.slotBooking ?? '').trim();
  const classStatusRaw = String(row?.section1Data?.classStatus ?? '').trim();
  const demoDateKey = deriveSlotDemoDateKeyIST(row);
  const updatedDate = row?.updatedAt ? new Date(row.updatedAt) : null;
  const updatedEpoch = updatedDate && !Number.isNaN(updatedDate.getTime()) ? updatedDate.getTime() : null;
  const updatedIso = updatedDate && !Number.isNaN(updatedDate.getTime()) ? updatedDate.toISOString() : '';
  return {
    id: row?.id || '',
    name: row?.fullName || '—',
    phone: row?.phone || '—',
    classStatus: classStatusRaw,
    currentStep: row?.currentStep || 1,
    completed: row?.isCompleted ? 'Yes' : 'No',
    topColleges,
    topCollegesDisplay: topColleges === '—' ? '—' : topColleges.replace(/\n+/g, ', '),
    slot: slotRaw || '—',
    demoDate: formatDemoDateDisplay(demoDateKey),
    demoDateKey,
    utmSource: utm.utm_source || '—',
    utmMedium: utm.utm_medium || '—',
    utmCampaign: utm.utm_campaign || '—',
    utmContent: utm.utm_content || '—',
    updated: formatDateTime(row?.updatedAt),
    updatedIso,
    updatedEpoch,
    raw: row,
  };
}

function applySubmissionViewFilters(mappedRows, viewFilters) {
  const sourceQ = viewFilters.utmSource.trim().toLowerCase();
  const mediumQ = viewFilters.utmMedium.trim().toLowerCase();
  const campaignQ = viewFilters.utmCampaign.trim().toLowerCase();
  const contentQ = viewFilters.utmContent.trim().toLowerCase();
  const slotEnc = viewFilters.slot.trim();
  const updatedFromMs = viewFilters.updatedFrom ? new Date(viewFilters.updatedFrom).getTime() : null;
  const updatedToMs = viewFilters.updatedTo ? new Date(viewFilters.updatedTo).getTime() : null;

  return mappedRows.filter((row) => {
    if (!rowMatchesSlotFilter(row, slotEnc)) return false;
    if (sourceQ && !String(row.utmSource || '').toLowerCase().includes(sourceQ)) return false;
    if (mediumQ && !String(row.utmMedium || '').toLowerCase().includes(mediumQ)) return false;
    if (campaignQ && !String(row.utmCampaign || '').toLowerCase().includes(campaignQ)) return false;
    if (contentQ && !String(row.utmContent || '').toLowerCase().includes(contentQ)) return false;
    if (updatedFromMs != null && Number.isFinite(updatedFromMs) && (!Number.isFinite(row.updatedEpoch) || row.updatedEpoch < updatedFromMs)) return false;
    if (updatedToMs != null && Number.isFinite(updatedToMs) && (!Number.isFinite(row.updatedEpoch) || row.updatedEpoch > updatedToMs)) return false;
    return true;
  });
}

function SectionBlock({ title, data }) {
  if (!data) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
      <dl className="grid grid-cols-1 gap-2 text-sm">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 gap-0.5">
            <dt className="text-gray-500">{formatLabel(key)}</dt>
            <dd className="text-gray-900 wrap-break-word">
              {Array.isArray(value) ? (value.length ? value.join(', ') : '—') : (value ?? '—') || '—'}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function buildLinePath(points, getX, getY) {
  if (!points.length) return '';
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(point)} ${getY(point)}`)
    .join(' ');
}

function formatIstDayKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatIstHourKey(date) {
  const day = formatIstDayKey(date);
  const hour = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    hour12: false,
  }).format(date);
  return `${day} ${hour}:00`;
}

function buildBucketSeries(points, { fromDate, toDate, fromTime, toTime, granularity }) {
  const byBucket = new Map();
  for (const point of points) {
    byBucket.set(point.bucket, point);
  }

  let start;
  let end;

  if (fromDate && toDate) {
    start = new Date(`${fromDate}T${fromTime || '00:00'}:00+05:30`);
    end = new Date(`${toDate}T${toTime || '23:59'}:59+05:30`);
  } else {
    end = new Date();
    start = new Date(end);
    if (granularity === 'hourly') {
      start.setHours(end.getHours() - 23);
    } else {
      start.setDate(end.getDate() - 13);
    }
  }

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return points;
  }

  const result = [];
  const cursor = new Date(start);
  const safetyLimit = granularity === 'hourly' ? 24 * 90 : 366 * 2;
  let iterations = 0;
  while (cursor <= end && iterations < safetyLimit) {
    const bucket = granularity === 'hourly' ? formatIstHourKey(cursor) : formatIstDayKey(cursor);
    const match = byBucket.get(bucket);
    result.push({
      bucket,
      totalVisits: match ? Number(match.totalVisits) || 0 : 0,
      uniqueVisitors: match ? Number(match.uniqueVisitors) || 0 : 0,
    });
    if (granularity === 'hourly') {
      cursor.setHours(cursor.getHours() + 1);
    } else {
      cursor.setDate(cursor.getDate() + 1);
    }
    iterations += 1;
  }
  return result;
}

function TrendChart({ points = [], granularity = 'daily', filters = {} }) {
  const series = useMemo(
    () => buildBucketSeries(points, { ...filters, granularity }),
    [points, filters, granularity]
  );

  if (!series.length) {
    return <p className="text-sm text-gray-500 py-8 text-center">No visit data for the selected range.</p>;
  }

  const width = 940;
  const height = 300;
  const margin = { top: 18, right: 24, bottom: 48, left: 48 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const rawMax = series.reduce(
    (max, point) => Math.max(max, Number(point.totalVisits) || 0, Number(point.uniqueVisitors) || 0),
    0
  );
  const maxValue = Math.max(1, Math.ceil(rawMax * 1.15));
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, idx) => Math.round((maxValue * idx) / (tickCount - 1)));

  const getX = (index) => {
    if (series.length <= 1) return margin.left + plotWidth / 2;
    return margin.left + (index / (series.length - 1)) * plotWidth;
  };
  const getY = (value) => margin.top + (1 - value / maxValue) * plotHeight;

  const TOTAL_Y_OFFSET = -2;
  const UNIQUE_Y_OFFSET = 2;

  const totalSeries = series.map((point, index) => ({
    x: getX(index),
    y: getY(Number(point.totalVisits) || 0) + TOTAL_Y_OFFSET,
    value: Number(point.totalVisits) || 0,
    label: point.bucket,
  }));
  const uniqueSeries = series.map((point, index) => ({
    x: getX(index),
    y: getY(Number(point.uniqueVisitors) || 0) + UNIQUE_Y_OFFSET,
    value: Number(point.uniqueVisitors) || 0,
    label: point.bucket,
  }));

  const totalPath = buildLinePath(totalSeries, (p) => p.x, (p) => p.y);
  const uniquePath = buildLinePath(uniqueSeries, (p) => p.x, (p) => p.y);

  const maxLabels = granularity === 'hourly' ? 12 : 10;
  const axisStep = Math.max(1, Math.ceil(series.length / maxLabels));
  const axisTicks = series.filter((_, idx) => idx % axisStep === 0 || idx === series.length - 1);
  const isSinglePoint = series.length === 1;

  const totalLast = totalSeries[totalSeries.length - 1];
  const uniqueLast = uniqueSeries[uniqueSeries.length - 1];
  const endLabelX = isSinglePoint ? margin.left + plotWidth / 2 + 12 : width - margin.right + 6;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[760px] w-full">
          {yTicks.map((tick, tickIdx) => {
            const y = getY(tick);
            return (
              <g key={`y-grid-${tickIdx}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? '0' : '3 3'}
                />
                <text x={margin.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#6b7280">
                  {tick}
                </text>
              </g>
            );
          })}

          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#d1d5db" />
          <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#d1d5db" />

          {!isSinglePoint ? (
            <>
              <path
                d={totalPath}
                fill="none"
                stroke="#003366"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={uniquePath}
                fill="none"
                stroke="#4d8ec7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 4"
              />
            </>
          ) : null}

          {totalSeries.map((point, pi) => (
            <g key={`total-${pi}-${point.label}`}>
              <circle cx={point.x} cy={point.y} r={isSinglePoint ? 5 : 4} fill="#ffffff" stroke="#003366" strokeWidth="2.5" />
              <title>{`${point.label} · Total Visits: ${point.value}`}</title>
            </g>
          ))}
          {uniqueSeries.map((point, pi) => (
            <g key={`unique-${pi}-${point.label}`}>
              <circle cx={point.x} cy={point.y} r={isSinglePoint ? 5 : 4} fill="#ffffff" stroke="#4d8ec7" strokeWidth="2.5" />
              <title>{`${point.label} · Unique Visitors: ${point.value}`}</title>
            </g>
          ))}

          {!isSinglePoint && totalLast && uniqueLast ? (
            <>
              <text x={endLabelX} y={totalLast.y + 4} fontSize="10" fontWeight="600" fill="#003366">
                Total
              </text>
              <text x={endLabelX} y={uniqueLast.y + 4} fontSize="10" fontWeight="600" fill="#4d8ec7">
                Unique
              </text>
            </>
          ) : null}

          {axisTicks.map((point, xi) => {
            const index = series.findIndex((item) => item.bucket === point.bucket);
            const x = getX(index);
            return (
              <text
                key={`x-axis-${xi}-${point.bucket}`}
                x={x}
                y={height - margin.bottom + 18}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {granularity === 'hourly' ? point.bucket.slice(11) : point.bucket.slice(5)}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
        <span>
          {series.length} {granularity === 'hourly' ? 'hour' : 'day'} bucket{series.length === 1 ? '' : 's'} · Missing buckets are plotted as 0.
        </span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <svg width="18" height="6" viewBox="0 0 18 6"><line x1="0" y1="3" x2="18" y2="3" stroke="#003366" strokeWidth="3" strokeLinecap="round" /></svg>
            <span className="text-gray-700">Total Visits (solid)</span>
          </span>
          <span className="flex items-center gap-1">
            <svg width="18" height="6" viewBox="0 0 18 6"><line x1="0" y1="3" x2="18" y2="3" stroke="#4d8ec7" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 3" /></svg>
            <span className="text-gray-700">Unique Visitors (dashed)</span>
          </span>
        </span>
      </div>
    </div>
  );
}

const WEEKDAY_HEADER_CAL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES_CAL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function toYYYYMMDDLocal(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildMonthGridCounsel(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startBlank = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startBlank; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const total = 42;
  while (cells.length < total) cells.push(null);
  const rowsOut = [];
  for (let r = 0; r < 6; r++) rowsOut.push(cells.slice(r * 7, (r + 1) * 7));
  return rowsOut;
}

const EMPTY_VIEW_FILTERS = {
  slot: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmContent: '',
  updatedFrom: '',
  updatedTo: '',
};

export default function IitCounselling() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [slotFilter, setSlotFilter] = useState('');
  /** 'all' | 'relevant' | 'irrelevant' — filters by Current studying (classStatus). */
  const [leadRelevanceFilter, setLeadRelevanceFilter] = useState('all');
  /** Visit analytics range (top KPIs & charts only). */
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  /** Demo slot calendar / submissions table (independent of visit analytics). */
  const [demoFromDate, setDemoFromDate] = useState('');
  const [demoToDate, setDemoToDate] = useState('');
  const [fromTime, setFromTime] = useState('00:00');
  const [toTime, setToTime] = useState('23:59');
  const [granularity, setGranularity] = useState('daily');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submissionsViewAllOpen, setSubmissionsViewAllOpen] = useState(false);
  const [submissionAggRows, setSubmissionAggRows] = useState([]);
  const [aggLoading, setAggLoading] = useState(false);
  const [aggError, setAggError] = useState('');
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyModalRecords, setCopyModalRecords] = useState([]);
  const [copyPrepareError, setCopyPrepareError] = useState('');
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [viewFilters, setViewFilters] = useState({ ...EMPTY_VIEW_FILTERS });

  const aggFetchGen = useRef(0);
  const listFetchGen = useRef(0);

  const sharedFilters = useMemo(() => ({
    fromDate,
    toDate,
    fromTime,
    toTime,
    granularity,
  }), [fromDate, toDate, fromTime, toTime, granularity]);

  /** Full mapped list for calendar + client-side demo/slot filters (search via API `q` only). */
  useEffect(() => {
    const gen = ++aggFetchGen.current;
    setAggLoading(true);
    setAggError('');
    getAllIitCounsellingSubmissionsPaginated({ q: search, limit: 200 }, getStoredToken())
      .then((res) => {
        if (gen !== aggFetchGen.current) return;
        setAggLoading(false);
        if (!res?.success) {
          setAggError(res?.message || 'Failed to load submissions for calendar');
          setSubmissionAggRows([]);
          return;
        }
        const rowsData = Array.isArray(res.data?.data) ? res.data.data : [];
        setSubmissionAggRows(rowsData.map(mapIitSubmissionRecord));
      })
      .catch((err) => {
        if (gen !== aggFetchGen.current) return;
        setAggLoading(false);
        setAggError(err?.message || 'Failed to load submissions for calendar');
        setSubmissionAggRows([]);
      });
  }, [search]);

  /** Client-side table mode when demo date, slot, or relevance filters are active. */
  const heavyClientFilter = Boolean(
    String(demoFromDate || '').trim()
    || String(demoToDate || '').trim()
    || String(slotFilter || '').trim()
    || leadRelevanceFilter !== 'all'
  );

  /** Canonical range for comparisons when only one bound is set or user picks to before from. */
  const effectiveDemoRange = useMemo(() => {
    const rawFrom = String(demoFromDate || '').trim();
    const rawTo = String(demoToDate || '').trim();
    if (rawFrom && rawTo && rawFrom > rawTo) {
      return { from: rawTo, to: rawFrom };
    }
    return { from: rawFrom, to: rawTo };
  }, [demoFromDate, demoToDate]);

  const demoFilteredBaseRows = useMemo(
    () => submissionAggRows.filter((row) => rowMatchesDemoDateRange(row, effectiveDemoRange.from, effectiveDemoRange.to)),
    [submissionAggRows, effectiveDemoRange.from, effectiveDemoRange.to]
  );

  const toolbarSlotFilteredRows = useMemo(
    () => demoFilteredBaseRows.filter((row) => rowMatchesSlotFilter(row, slotFilter)),
    [demoFilteredBaseRows, slotFilter]
  );

  const relevanceFilteredRows = useMemo(
    () => toolbarSlotFilteredRows.filter((row) => matchesIitLeadRelevance(row, leadRelevanceFilter)),
    [toolbarSlotFilteredRows, leadRelevanceFilter]
  );

  useEffect(() => {
    if (heavyClientFilter) {
      setLoading(false);
      return;
    }
    const gen = ++listFetchGen.current;
    setLoading(true);
    setError('');
    getIitCounsellingSubmissions({ page, limit: 25, q: search }, getStoredToken())
      .then((res) => {
        if (gen !== listFetchGen.current) return;
        setLoading(false);
        if (!res?.success) {
          setError(res.message || 'Failed to load IIT counselling submissions');
          return;
        }
        setRows(res.data?.data || []);
        setPagination(res.data?.pagination || { total: 0, totalPages: 1 });
      })
      .catch((err) => {
        if (gen !== listFetchGen.current) return;
        setLoading(false);
        setError(err?.message || 'Failed to load IIT counselling submissions');
      });
  }, [page, search, heavyClientFilter]);

  useEffect(() => {
    if (!heavyClientFilter) return;
    if (aggError) setError(aggError);
    else setError('');
  }, [heavyClientFilter, aggError]);

  /** Server-paged path uses `loading`; demo/slot client path uses `aggLoading` only (avoids stuck spinner when demo dates or page change without a new agg request). */
  const submissionsListLoading = heavyClientFilter ? aggLoading : loading;

  useEffect(() => {
    if (!heavyClientFilter || relevanceFilteredRows.length === 0) return;
    const totalPages = Math.max(1, Math.ceil(relevanceFilteredRows.length / 25));
    if (page > totalPages) setPage(totalPages);
  }, [heavyClientFilter, relevanceFilteredRows, page]);

  useEffect(() => {
    let cancelled = false;
    getIitCounsellingVisitAnalytics(sharedFilters, getStoredToken()).then((res) => {
      if (cancelled) return;
      setAnalyticsLoading(false);
      if (!res.success) return;
      setAnalytics(res.data?.data || null);
    });
    return () => { cancelled = true; };
  }, [sharedFilters]);

  const openDetail = (id) => {
    setDetail(null);
    setDetailLoading(true);
    getIitCounsellingSubmission(id, getStoredToken()).then((res) => {
      setDetailLoading(false);
      if (res.success && res.data?.data) {
        setDetail(res.data.data);
      }
    });
  };

  const totalVisits = analytics?.totalVisits || 0;
  const uniqueVisitors = analytics?.uniqueVisitors || 0;
  const totalSubmissions = analytics?.totalSubmissions || pagination.total || 0;
  const conversionRate = analytics?.conversionRate || 0;

  const submissionPagination = useMemo(() => {
    if (heavyClientFilter) {
      const total = relevanceFilteredRows.length;
      const totalPages = Math.max(1, Math.ceil(total / 25));
      return { total, totalPages };
    }
    return {
      total: pagination.total || 0,
      totalPages: pagination.totalPages || 1,
    };
  }, [heavyClientFilter, relevanceFilteredRows, pagination]);

  const pageMappedRows = useMemo(() => {
    if (heavyClientFilter) {
      const start = (page - 1) * 25;
      return relevanceFilteredRows.slice(start, start + 25);
    }
    return rows.map(mapIitSubmissionRecord);
  }, [heavyClientFilter, relevanceFilteredRows, page, rows]);

  const slotToolbarOptions = useMemo(() => {
    const seen = new Set();
    const opts = [];
    const pushOpt = (value, label) => {
      if (!value || seen.has(value)) return;
      seen.add(value);
      opts.push({ value, label });
    };
    getAvailableSlots().forEach((o) => {
      const norm = normalizeIitSlotValue(o.value);
      pushOpt(encodeSlotFilterOption('', norm), o.label);
    });
    const slotSource = demoFilteredBaseRows.length ? demoFilteredBaseRows : pageMappedRows;
    slotSource.forEach((row) => {
      const raw = row.slot === '—' ? '' : row.slot;
      const norm = normalizeIitSlotValue(raw);
      if (!norm) return;
      const key = encodeSlotFilterOption(row.demoDateKey, norm);
      const label =
        row.demoDateKey && /^\d{4}-\d{2}-\d{2}$/.test(row.demoDateKey)
          ? `${norm} · ${formatDemoDateDisplay(row.demoDateKey)}`
          : norm;
      pushOpt(key, label);
    });
    opts.sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));
    return opts;
  }, [demoFilteredBaseRows, pageMappedRows]);

  const viewSourceRows = useMemo(
    () => (submissionsViewAllOpen ? relevanceFilteredRows : pageMappedRows),
    [submissionsViewAllOpen, relevanceFilteredRows, pageMappedRows]
  );
  const filteredSubmissionRows = useMemo(
    () => applySubmissionViewFilters(viewSourceRows, viewFilters),
    [viewSourceRows, viewFilters]
  );

  const viewFilterOptions = useMemo(() => {
    const addUnique = (arr, value) => {
      const v = String(value || '').trim();
      if (v && v !== '—') arr.add(v);
    };
    const sourceSet = new Set();
    const mediumSet = new Set();
    const campaignSet = new Set();
    const contentSet = new Set();
    const slotSet = new Set();
    const updatedSet = new Set();

    viewSourceRows.forEach((row) => {
      const raw = row.slot === '—' ? '' : row.slot;
      const norm = normalizeIitSlotValue(raw);
      if (norm) {
        addUnique(slotSet, encodeSlotFilterOption(row.demoDateKey, norm));
      }
      addUnique(sourceSet, row.utmSource);
      addUnique(mediumSet, row.utmMedium);
      addUnique(campaignSet, row.utmCampaign);
      addUnique(contentSet, row.utmContent);
      if (row.updatedIso) {
        updatedSet.add(row.updatedIso);
      }
    });

    const sortText = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' });
    const sortTimeDesc = (a, b) => new Date(b).getTime() - new Date(a).getTime();

    return {
      slots: Array.from(slotSet).sort(sortText),
      sources: Array.from(sourceSet).sort(sortText),
      mediums: Array.from(mediumSet).sort(sortText),
      campaigns: Array.from(campaignSet).sort(sortText),
      contents: Array.from(contentSet).sort(sortText),
      updatedTimes: Array.from(updatedSet).sort(sortTimeDesc),
    };
  }, [viewSourceRows]);

  const modalSlotSelectOptions = useMemo(() => {
    const seen = new Set();
    const out = [];
    getAvailableSlots().forEach((o) => {
      const norm = normalizeIitSlotValue(o.value);
      const enc = encodeSlotFilterOption('', norm);
      if (!seen.has(enc)) {
        seen.add(enc);
        out.push({ value: enc, label: o.label });
      }
    });
    viewFilterOptions.slots.forEach((v) => {
      if (!seen.has(v)) {
        seen.add(v);
        const { demoDateKey: dk, slotNorm } = parseSlotFilterOption(v);
        const label =
          dk && slotNorm ? `${slotNorm} · ${formatDemoDateDisplay(dk)}` : (slotNorm || v);
        out.push({ value: v, label });
      }
    });
    out.sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));
    return out;
  }, [viewFilterOptions.slots]);

  const getCopyCellValue = useCallback((record, key) => {
    if (key === 'topColleges') return record.topCollegesDisplay ?? record.topColleges ?? '';
    const v = record[key];
    if (v == null || v === '') return '';
    return String(v);
  }, []);

  const prepareCopySubmissions = useCallback(() => {
    setCopyPrepareError('');
    if (aggLoading) {
      setCopyPrepareError('Still loading submissions; try again in a moment.');
      return;
    }
    try {
      if (aggError && submissionAggRows.length === 0) {
        throw new Error(aggError);
      }
      const base = relevanceFilteredRows;
      const vf = submissionsViewAllOpen ? viewFilters : EMPTY_VIEW_FILTERS;
      const filtered = applySubmissionViewFilters(base, vf);
      setCopyModalRecords(filtered);
      setCopyModalOpen(true);
    } catch (err) {
      setCopyPrepareError(err?.message || 'Failed to prepare copy.');
      setCopyModalRecords([]);
    }
  }, [
    aggLoading,
    aggError,
    submissionAggRows.length,
    relevanceFilteredRows,
    submissionsViewAllOpen,
    viewFilters,
  ]);

  const demoCountsByDay = useMemo(() => {
    const map = new Map();
    const source =
      leadRelevanceFilter === 'all'
        ? submissionAggRows
        : submissionAggRows.filter((row) => matchesIitLeadRelevance(row, leadRelevanceFilter));
    source.forEach((row) => {
      const k = row.demoDateKey;
      if (!k) return;
      map.set(k, (map.get(k) || 0) + 1);
    });
    return map;
  }, [submissionAggRows, leadRelevanceFilter]);

  /** Relevant vs irrelevant counts for current demo/slot filters (always shown). */
  const submissionRelevanceSplit = useMemo(() => {
    let relevant = 0;
    let irrelevant = 0;
    toolbarSlotFilteredRows.forEach((row) => {
      if (isRelevantIitClassStatus(row.classStatus)) relevant += 1;
      else irrelevant += 1;
    });
    return { relevant, irrelevant };
  }, [toolbarSlotFilteredRows]);

  /** Submission KPIs for current toolbar filters (aligned with table totals). */
  const submissionFilteredOverview = useMemo(() => {
    const list = relevanceFilteredRows;
    const total = list.length;
    const completed = list.filter((r) => r.completed === 'Yes').length;
    const completedPct = total ? Math.round((completed / total) * 1000) / 10 : 0;
    const demoDateKeys = new Set();
    list.forEach((r) => {
      if (r.demoDateKey) demoDateKeys.add(r.demoDateKey);
    });
    const slotCounts = new Map();
    list.forEach((r) => {
      const norm = normalizeIitSlotValue(r.slot === '—' ? '' : r.slot);
      if (!norm) return;
      slotCounts.set(norm, (slotCounts.get(norm) || 0) + 1);
    });
    let topSlot = '';
    let topSlotCount = 0;
    slotCounts.forEach((count, slot) => {
      if (count > topSlotCount) {
        topSlotCount = count;
        topSlot = slot;
      }
    });
    return {
      total,
      completed,
      completedPct,
      demoDatesCount: demoDateKeys.size,
      topSlot: topSlot || '—',
      topSlotCount,
    };
  }, [relevanceFilteredRows]);

  const todayStrLocal = toYYYYMMDDLocal(new Date());
  const monthGridCounsel = useMemo(
    () => buildMonthGridCounsel(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const handleDemoCalendarDayClick = (dateStr) => {
    setDemoFromDate(dateStr);
    setDemoToDate(dateStr);
    setPage(1);
  };

  const clearDemoDateFilters = () => {
    setDemoFromDate('');
    setDemoToDate('');
    setPage(1);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-1 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#003366] to-[#004080] text-white shadow-lg ring-2 ring-[#003366]/10">
            <FiBarChart2 className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">IIT Counselling Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Page visits, conversion insights, and submission details in one place.</p>
            <Link
              to="/admin/iit-counselling-utm#iit-utm-generator"
              className="inline-flex mt-2 text-sm font-semibold text-primary-navy hover:underline underline-offset-2"
            >
              Generate UTM link for campaigns
            </Link>
          </div>
        </div>

        <div className="w-full min-w-0 lg:max-w-none lg:w-auto rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="h-px w-full bg-linear-to-r from-[#003366] to-[#004080]" aria-hidden />
          <div className="bg-linear-to-r from-gray-50 to-[#f0f5fa] px-3 py-2 border-b border-gray-200">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Visit analytics range</span>
          </div>
          <div className="flex flex-wrap items-end gap-2 px-3 py-3">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setAnalyticsLoading(true);
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setAnalyticsLoading(true);
                setToDate(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">From Time</label>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => {
                setAnalyticsLoading(true);
                setFromTime(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">To Time</label>
            <input
              type="time"
              value={toTime}
              onChange={(e) => {
                setAnalyticsLoading(true);
                setToTime(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Granularity</label>
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden h-9">
              <button
                type="button"
                onClick={() => {
                  setAnalyticsLoading(true);
                  setGranularity('daily');
                  setPage(1);
                }}
                className={`px-3 text-xs font-medium ${granularity === 'daily' ? 'bg-primary-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnalyticsLoading(true);
                  setGranularity('hourly');
                  setPage(1);
                }}
                className={`px-3 text-xs font-medium border-l border-gray-300 ${granularity === 'hourly' ? 'bg-primary-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                Hourly
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAnalyticsLoading(true);
              setFromDate('');
              setToDate('');
              setFromTime('00:00');
              setToTime('23:59');
              setGranularity('daily');
              setPage(1);
            }}
            className="h-9 px-3 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard title="Total Visits" value={totalVisits} icon={<FiBarChart2 className="w-4 h-4" />} accent="bg-primary-blue-50 text-primary-navy" loading={analyticsLoading} />
        <StatCard title="Unique Visitors" value={uniqueVisitors} icon={<FiUsers className="w-4 h-4" />} accent="bg-[#f0f5fa] text-[#004080]" loading={analyticsLoading} />
        <StatCard title="Total Submissions" value={totalSubmissions} icon={<FiCheckCircle className="w-4 h-4" />} accent="bg-emerald-50 text-emerald-700" loading={analyticsLoading} />
        <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon={<FiBarChart2 className="w-4 h-4" />} accent="bg-amber-50 text-amber-700" loading={analyticsLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
          <div className="h-0.5 w-full bg-linear-to-r from-[#003366] to-[#004080]" aria-hidden />
          <div className="p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              {granularity === 'hourly' ? 'Hourly Visit Trend' : 'Daily Visit Trend'}
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-primary-blue-500" />
                Total Visits
              </span>
              <span className="inline-flex items-center gap-1 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-primary-blue-400" />
                Unique Visitors
              </span>
            </div>
          </div>
          <TrendChart points={analytics?.trend || []} granularity={granularity} filters={sharedFilters} />
          </div>
        </div>
        <div className="space-y-4">
          <ListCard
            title="Top Referrers"
            rows={(analytics?.topReferrers || []).map((row) => ({ label: row.referrer, value: row.visits }))}
            empty="No referrer data."
          />
          <ListCard
            title="Top UTM Sources"
            rows={(analytics?.topUtmSources || []).map((row) => ({ label: row.source, value: row.visits }))}
            empty="No UTM source data."
          />
          <ListCard
            title="Top Campaigns"
            rows={(analytics?.topCampaigns || []).map((row) => ({ label: row.campaign, value: row.visits }))}
            empty="No campaign data."
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md p-5 sm:p-6 space-y-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#003366] to-[#004080]" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-lg font-bold tracking-tight text-gray-900">
                IIT Counselling Submissions
              </h3>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-gray-700 ring-1 ring-gray-200/80">
                {submissionPagination.total || 0}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2 max-w-3xl leading-relaxed">
              <strong className="font-semibold text-gray-600">Visit KPIs</strong> use the analytics range above.
              <span className="mx-1.5 text-gray-300">·</span>
              <strong className="font-semibold text-gray-600">This table</strong> shows one row per phone (latest demo date, then most recently updated). Totals match that unique-lead view.
              <span className="mx-1.5 text-gray-300">·</span>
              Demo filters use booking dates and slots.
              <span className="mx-1.5 text-gray-300">·</span>
              <strong className="font-semibold text-gray-600">Relevant leads</strong> are 11th/12th (Current studying); all other values count as irrelevant.
              {heavyClientFilter ? (
                <span className="block sm:inline sm:ml-1 mt-1 sm:mt-0 text-primary-navy font-medium"> {submissionPagination.total} row(s) after demo filters.</span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,308px)_1fr] gap-5 pb-5 border-b border-gray-100">
          <div className="rounded-2xl border border-gray-200/80 bg-linear-to-b from-gray-50 to-white p-4 shadow-sm ring-1 ring-black/[0.02]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Demo calendar</span>
              <div className="flex items-center gap-0.5 rounded-full bg-white/90 p-0.5 shadow-sm ring-1 ring-gray-200/80">
                <button
                  type="button"
                  className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Previous month"
                  onClick={() => {
                    if (viewMonth === 0) {
                      setViewMonth(11);
                      setViewYear((y) => y - 1);
                    } else setViewMonth((m) => m - 1);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-xs font-bold text-gray-800 min-w-[100px] text-center tabular-nums">
                  {MONTH_NAMES_CAL[viewMonth].slice(0, 3)} {viewYear}
                </span>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Next month"
                  onClick={() => {
                    if (viewMonth === 11) {
                      setViewMonth(0);
                      setViewYear((y) => y + 1);
                    } else setViewMonth((m) => m + 1);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mb-3 leading-snug">Submission counts per demo day (respects search). Click a day to filter.</p>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {WEEKDAY_HEADER_CAL.map((day) => (
                    <th key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest py-1.5">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthGridCounsel.map((gridRow, ri) => (
                  <tr key={ri}>
                    {gridRow.map((dayNum, ci) => {
                      if (dayNum === null) {
                        return <td key={`${ri}-${ci}`} className="p-0.5" />;
                      }
                      const dateStr = toYYYYMMDDLocal(new Date(viewYear, viewMonth, dayNum));
                      const count = demoCountsByDay.get(dateStr) || 0;
                      const isToday = dateStr === todayStrLocal;
                      const { from: rFrom, to: rTo } = effectiveDemoRange;
                      const singleSelected = rFrom && rTo && rFrom === rTo && rFrom === dateStr;
                      const inRange =
                        rFrom
                        && rTo
                        && rFrom !== rTo
                        && dateStr >= rFrom
                        && dateStr <= rTo;
                      let cellClass = 'text-gray-700 hover:bg-white border border-transparent hover:shadow-sm';
                      if (singleSelected) {
                        cellClass = 'bg-linear-to-br from-primary-navy to-[#004080] text-white border-primary-navy shadow-md';
                      } else if (inRange) {
                        cellClass = 'bg-primary-blue-50 text-primary-navy border-primary-blue-200/80';
                      }
                      return (
                        <td key={`${ri}-${ci}`} className="p-0.5 align-top">
                          <button
                            type="button"
                            onClick={() => handleDemoCalendarDayClick(dateStr)}
                            className={`w-full min-h-[2.35rem] rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-0 leading-tight transition-all ${cellClass} ${isToday && !singleSelected ? 'ring-2 ring-primary-blue-400/80 ring-offset-1' : ''} ${isToday && singleSelected ? 'ring-2 ring-white/40 ring-offset-1' : ''}`}
                          >
                            <span>{dayNum}</span>
                            {count > 0 ? (
                              <span className={`text-[9px] font-extrabold tabular-nums ${singleSelected ? 'text-white/95' : 'text-primary-navy'}`}>{count}</span>
                            ) : null}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={clearDemoDateFilters}
              className="mt-3 w-full text-xs font-semibold text-gray-600 hover:text-primary-navy py-2.5 rounded-xl border border-gray-200/90 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Clear demo date filter
            </button>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <SubmissionOverviewTile
                title="Submissions"
                value={submissionFilteredOverview.total}
                subtitle="Matching current filters"
                icon={<FiClipboard className="w-[18px] h-[18px]" />}
              />
              <SubmissionOverviewTile
                title="Completed"
                value={
                  submissionFilteredOverview.total
                    ? `${submissionFilteredOverview.completed} (${submissionFilteredOverview.completedPct}%)`
                    : '0'
                }
                subtitle="Finished intake"
                icon={<FiCheckCircle className="w-[18px] h-[18px]" />}
              />
              <SubmissionOverviewTile
                title="Demo dates"
                value={submissionFilteredOverview.demoDatesCount}
                subtitle="Distinct booking days"
                icon={<FiCalendar className="w-[18px] h-[18px]" />}
              />
              <SubmissionOverviewTile
                title="Top slot"
                value={submissionFilteredOverview.topSlotCount ? submissionFilteredOverview.topSlot : '—'}
                subtitle={
                  submissionFilteredOverview.topSlotCount
                    ? `${submissionFilteredOverview.topSlotCount} in filtered set`
                    : 'No slot data'
                }
                icon={<FiClock className="w-[18px] h-[18px]" />}
              />
              <SubmissionOverviewTile
                title="Relevant"
                value={submissionRelevanceSplit.relevant}
                subtitle="11th/12th · current demo/slot filters"
                icon={<FiUsers className="w-[18px] h-[18px]" />}
              />
              <SubmissionOverviewTile
                title="Irrelevant"
                value={submissionRelevanceSplit.irrelevant}
                subtitle="Other or missing Current studying"
                icon={<FiUsers className="w-[18px] h-[18px]" />}
              />
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-linear-to-br from-gray-50/90 via-white to-white px-4 py-4 shadow-sm ring-1 ring-black/[0.02]">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Demo date range</span>
              <p className="text-[11px] text-gray-500 mt-1.5 mb-3.5">Filter by scheduled demo day (IST). Works with the calendar.</p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="min-w-0">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Demo from</label>
                  <input
                    type="date"
                    value={demoFromDate}
                    onChange={(e) => {
                      setLoading(true);
                      setError('');
                      setDemoFromDate(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full min-w-[140px] px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-primary-blue-500/25 focus:border-primary-blue-500"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Demo to</label>
                  <input
                    type="date"
                    value={demoToDate}
                    onChange={(e) => {
                      setLoading(true);
                      setError('');
                      setDemoToDate(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full min-w-[140px] px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-primary-blue-500/25 focus:border-primary-blue-500"
                  />
                </div>
              </div>
              {aggLoading ? <p className="text-[11px] text-gray-500 mt-3 flex items-center gap-2"><span className="inline-block h-3.5 w-3.5 animate-pulse rounded-full bg-gray-300" aria-hidden />Updating list…</p> : null}
              {aggError ? <p className="text-[11px] text-red-600 mt-3 font-medium">{aggError}</p> : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-3 sm:p-4 ring-1 ring-black/[0.02]">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => setSubmissionsViewAllOpen(true)}
              disabled={relevanceFilteredRows.length === 0 || aggLoading}
              className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-colors"
            >
              View all
            </button>
            <button
              type="button"
              onClick={prepareCopySubmissions}
              disabled={relevanceFilteredRows.length === 0 || aggLoading}
              className="h-10 rounded-xl bg-primary-navy px-4 text-sm font-semibold text-white shadow-md shadow-primary-navy/20 hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              Copy all
            </button>
            <select
              value={leadRelevanceFilter}
              onChange={(e) => {
                setLoading(true);
                setError('');
                setLeadRelevanceFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 min-w-[11rem] max-w-[18rem] rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-primary-blue-500/25 focus:border-primary-blue-500"
              aria-label="Filter by lead relevance"
            >
              <option value="all">All leads</option>
              <option value="relevant">Relevant leads (11th/12th)</option>
              <option value="irrelevant">Irrelevant leads</option>
            </select>
            <select
              value={slotFilter}
              onChange={(e) => {
                setLoading(true);
                setError('');
                setSlotFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 min-w-[12rem] max-w-[20rem] rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-primary-blue-500/25 focus:border-primary-blue-500"
              aria-label="Filter by demo slot"
            >
              <option value="">All slots</option>
              {slotToolbarOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="relative w-full sm:w-72">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -trangray-y-1/2 text-gray-400" aria-hidden />
              <input
                type="search"
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => {
                  setLoading(true);
                  setError('');
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full pl-10 pr-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary-blue-500/25 focus:border-primary-blue-500"
              />
            </div>
            </div>
          </div>
        </div>
        {error ? <p className="text-red-600 text-sm">{error}</p> : null}
        {copyPrepareError ? <p className="text-red-600 text-sm">{copyPrepareError}</p> : null}
        <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md ring-1 ring-black/[0.03]">
        <div className="overflow-x-auto max-h-[min(70vh,720px)]">
        <table className="min-w-[1520px] w-full text-left text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-primary-blue-50/90 backdrop-blur-sm border-b border-primary-blue-100/70 shadow-[0_1px_0_0_rgba(0,51,102,0.06)]">
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Name</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Phone</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Current studying</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Step</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Done</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Top Colleges</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Slot</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Demo</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">UTM Src</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Medium</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Campaign</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Content</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Updated</th>
              <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {submissionsListLoading ? (
              <tr><td colSpan={14} className="px-4 py-14 text-center text-sm font-medium text-gray-500 bg-gray-50/60">Loading submissions…</td></tr>
            ) : pageMappedRows.length === 0 ? (
              <tr><td colSpan={14} className="px-4 py-14 text-center text-sm font-medium text-gray-500 bg-gray-50/50">No submissions match the current filters.</td></tr>
            ) : pageMappedRows.map((row) => {
              const rowIsIrrelevant =
                leadRelevanceFilter === 'all' && !isRelevantIitClassStatus(row.classStatus);
              const utmCell = (value) => (
                <span
                  className={value ? 'text-gray-800' : 'text-gray-400'}
                  title={value || 'No UTM data'}
                >
                  {value || '—'}
                </span>
              );
              const completedBadge =
                row.completed === 'Yes' ? (
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200/90">
                    {row.completed}
                  </span>
                );
              return (
                <tr
                  key={row.id}
                  className={`group transition-colors odd:bg-white even:bg-gray-50/40 hover:bg-primary-blue-50/80 border-l-2 border-l-transparent hover:border-l-primary-blue-500${rowIsIrrelevant ? ' opacity-70' : ''}`}
                >
                  <td className="px-4 py-3 font-semibold text-gray-900">{row.name}</td>
                  <td className="px-4 py-3 tabular-nums font-mono text-[13px] text-gray-700">{row.phone}</td>
                  <td className={`px-4 py-3 max-w-[220px] truncate text-[13px]${rowIsIrrelevant ? ' text-gray-500' : ' text-gray-700'}`} title={row.classStatus || undefined}>{row.classStatus || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex min-w-[1.5rem] justify-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-bold text-gray-700 tabular-nums">
                      {row.currentStep}
                    </span>
                  </td>
                  <td className="px-4 py-3">{completedBadge}</td>
                  <td className="px-4 py-3 max-w-[300px] truncate text-gray-700 text-[13px]" title={row.topColleges}>{row.topCollegesDisplay}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-gray-800 text-[13px] font-medium" title={row.slot}>{row.slot}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800 text-[13px] font-semibold">{row.demoDate}</td>
                  <td className="px-4 py-3 max-w-[180px] truncate text-[13px]">{utmCell(row.utmSource)}</td>
                  <td className="px-4 py-3 max-w-[180px] truncate text-[13px]">{utmCell(row.utmMedium)}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-[13px]">{utmCell(row.utmCampaign)}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-[13px]">{utmCell(row.utmContent)}</td>
                  <td className="px-4 py-3 text-gray-500 text-[12px] whitespace-nowrap">{row.updated}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => openDetail(row.raw?.id || row.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-primary-navy shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <FiEye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        </div>

      </div>

      {submissionsViewAllOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-6xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h4 className="text-sm font-semibold text-gray-900">
                IIT Counselling Submissions - Viewed ({filteredSubmissionRows.length}/{viewSourceRows.length})
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prepareCopySubmissions}
                  disabled={relevanceFilteredRows.length === 0 || aggLoading}
                  className="rounded border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Copy all
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionsViewAllOpen(false)}
                  className="rounded border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto p-4">
              <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
                <select
                  value={viewFilters.slot}
                  onChange={(e) => setViewFilters((prev) => ({ ...prev, slot: e.target.value }))}
                  className="h-9 rounded border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500 bg-white"
                >
                  <option value="">Slot (All)</option>
                  {modalSlotSelectOptions.map((o) => (
                    <option key={`slot-${o.value}`} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <select
                  value={viewFilters.utmSource}
                  onChange={(e) => setViewFilters((prev) => ({ ...prev, utmSource: e.target.value }))}
                  className="h-9 rounded border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500 bg-white"
                >
                  <option value="">UTM Source (All)</option>
                  {viewFilterOptions.sources.map((v) => (
                    <option key={`src-${v}`} value={v}>{v}</option>
                  ))}
                </select>
                <select
                  value={viewFilters.utmMedium}
                  onChange={(e) => setViewFilters((prev) => ({ ...prev, utmMedium: e.target.value }))}
                  className="h-9 rounded border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500 bg-white"
                >
                  <option value="">UTM Medium (All)</option>
                  {viewFilterOptions.mediums.map((v) => (
                    <option key={`med-${v}`} value={v}>{v}</option>
                  ))}
                </select>
                <select
                  value={viewFilters.utmCampaign}
                  onChange={(e) => setViewFilters((prev) => ({ ...prev, utmCampaign: e.target.value }))}
                  className="h-9 rounded border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500 bg-white"
                >
                  <option value="">UTM Campaign (All)</option>
                  {viewFilterOptions.campaigns.map((v) => (
                    <option key={`cmp-${v}`} value={v}>{v}</option>
                  ))}
                </select>
                <select
                  value={viewFilters.utmContent}
                  onChange={(e) => setViewFilters((prev) => ({ ...prev, utmContent: e.target.value }))}
                  className="h-9 rounded border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500 bg-white"
                >
                  <option value="">UTM Content (All)</option>
                  {viewFilterOptions.contents.map((v) => (
                    <option key={`cnt-${v}`} value={v}>{v}</option>
                  ))}
                </select>
                <select
                  value={viewFilters.updatedFrom}
                  onChange={(e) => setViewFilters((prev) => ({ ...prev, updatedFrom: e.target.value }))}
                  className="h-9 rounded border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500 bg-white"
                  title="Updated from"
                >
                  <option value="">Updated From (All)</option>
                  {viewFilterOptions.updatedTimes.map((v) => (
                    <option key={`from-${v}`} value={v}>{formatDateTime(v)}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <select
                    value={viewFilters.updatedTo}
                    onChange={(e) => setViewFilters((prev) => ({ ...prev, updatedTo: e.target.value }))}
                    className="h-9 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500 bg-white"
                    title="Updated to"
                  >
                    <option value="">Updated To (All)</option>
                    {viewFilterOptions.updatedTimes.map((v) => (
                      <option key={`to-${v}`} value={v}>{formatDateTime(v)}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setViewFilters({ ...EMPTY_VIEW_FILTERS })}
                    className="h-9 shrink-0 rounded border border-gray-300 px-3 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <table className="min-w-[1520px] w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Phone</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Current studying</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Current Step</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Completed</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Top Colleges</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Slot</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Demo date</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">UTM Source</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">UTM Medium</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">UTM Campaign</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">UTM Content</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubmissionRows.map((row) => {
                    return (
                      <tr key={`viewall-${row.id}`}>
                        <td className="px-3 py-2 break-all">{row.name}</td>
                        <td className="px-3 py-2">{row.phone}</td>
                        <td className="px-3 py-2 break-all max-w-[240px]">{row.classStatus || '—'}</td>
                        <td className="px-3 py-2">{row.currentStep}</td>
                        <td className="px-3 py-2">{row.completed}</td>
                        <td className="px-3 py-2 break-all whitespace-pre-wrap">{row.topColleges}</td>
                        <td className="px-3 py-2 break-all">{row.slot}</td>
                        <td className="px-3 py-2 break-all whitespace-nowrap">{row.demoDate}</td>
                        <td className="px-3 py-2 break-all">{row.utmSource}</td>
                        <td className="px-3 py-2 break-all">{row.utmMedium}</td>
                        <td className="px-3 py-2 break-all">{row.utmCampaign}</td>
                        <td className="px-3 py-2 break-all">{row.utmContent}</td>
                        <td className="px-3 py-2">{row.updated}</td>
                      </tr>
                    );
                  })}
                  {filteredSubmissionRows.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-3 py-6 text-center text-gray-500">No rows match current filters.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
        <span className="font-medium tabular-nums text-gray-700">
          Page <span className="text-gray-900 font-semibold">{page}</span>
          <span className="text-gray-400 mx-1">/</span>
          {submissionPagination.totalPages || 1}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!heavyClientFilter) setLoading(true);
              setPage((p) => Math.max(1, p - 1));
            }}
            disabled={page <= 1}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => {
              if (!heavyClientFilter) setLoading(true);
              setPage((p) => Math.min(submissionPagination.totalPages || 1, p + 1));
            }}
            disabled={page >= (submissionPagination.totalPages || 1)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      <CopyToSheetsModal
        fields={IIT_SUBMISSION_COLUMNS}
        records={copyModalRecords}
        getCellValue={getCopyCellValue}
        open={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        recordLabel="submissions"
        loading={false}
      />

      {(detailLoading || detail) ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">IIT Counselling Details</h3>
              <button type="button" onClick={() => setDetail(null)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Close">×</button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
              {detailLoading ? <p className="text-gray-500 text-sm">Loading...</p> : null}
              {detail ? (
                <>
                  <SectionBlock title="Section 1: Basic Details" data={detail.section1Data} />
                  <SectionBlock title="Section 2" data={detail.section2Data} />
                  <SectionBlock title="Section 3" data={detail.section3Data} />
                  {detail.utm ? (
                    <SectionBlock
                      title="UTM Attribution"
                      data={{
                        Source: detail.utm.utm_source || '—',
                        Medium: detail.utm.utm_medium || '—',
                        Campaign: detail.utm.utm_campaign || '—',
                        Content: detail.utm.utm_content || '—',
                        Referrer: detail.utm.referrer || '—',
                      }}
                    />
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Shared enterprise navy styling for IIT submissions overview tiles */
const SUBMISSION_OVERVIEW_TILE_THEME = {
  iconWrap:
    'bg-linear-to-br from-primary-navy to-[#004080] text-white shadow-md shadow-primary-navy/28 ring-1 ring-white/25',
  glow: 'from-primary-blue-400/18',
  border: 'border-primary-blue-200/80',
  ring: 'ring-primary-blue-500/[0.07]',
};

function SubmissionOverviewTile({ title, value, subtitle, icon }) {
  const valueStr = value == null ? '' : String(value);
  const v = SUBMISSION_OVERVIEW_TILE_THEME;
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-linear-to-br from-white via-white to-primary-blue-50/50 p-3.5 shadow-md transition-shadow duration-200 hover:shadow-lg hover:border-primary-blue-200 min-h-[100px] flex flex-col ${v.border} ring-1 ${v.ring}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary-navy to-[#004080]" aria-hidden />
      <div className={`pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-linear-to-br ${v.glow} to-transparent blur-2xl opacity-90`} aria-hidden />
      <div className="relative flex gap-3 min-h-full pt-0.5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${v.iconWrap}`}>
          {icon}
        </div>
        <div className="min-w-0 flex flex-1 flex-col">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">{title}</p>
          <p className="mt-1.5 text-lg font-bold leading-tight tracking-tight text-gray-900 tabular-nums line-clamp-2" title={valueStr}>
            {valueStr}
          </p>
          <p className="mt-auto pt-2 text-[10px] font-medium leading-snug text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, accent, loading }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className={`inline-flex items-center justify-center rounded-md px-2 py-1 ${accent}`}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900">{loading ? '...' : value}</p>
    </div>
  );
}

function ListCard({ title, rows, empty }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600 truncate" title={row.label}>{row.label}</span>
              <span className="text-xs font-semibold text-gray-900">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
