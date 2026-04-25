import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiUsers, FiBarChart2, FiCheckCircle } from 'react-icons/fi';
import {
  getAllIitCounsellingSubmissionsPaginated,
  getIitCounsellingSubmissions,
  getIitCounsellingSubmission,
  getIitCounsellingVisitAnalytics,
  getStoredToken
} from '../../utils/adminApi';

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleDateString('en-IN', { dateStyle: 'short' })} ${date.toLocaleTimeString('en-IN', { timeStyle: 'short' })}`;
}

function formatLabel(raw) {
  return String(raw || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatTopColleges(value) {
  if (!Array.isArray(value) || value.length === 0) return '—';
  const cleaned = value.map((item) => String(item || '').trim()).filter(Boolean);
  return cleaned.length ? cleaned.join('\n') : '—';
}

const IIT_SUBMISSION_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'currentStep', label: 'Current Step' },
  { key: 'completed', label: 'Completed' },
  { key: 'topColleges', label: 'Top Colleges' },
  { key: 'utmSource', label: 'UTM Source' },
  { key: 'utmMedium', label: 'UTM Medium' },
  { key: 'utmCampaign', label: 'UTM Campaign' },
  { key: 'utmContent', label: 'UTM Content' },
  { key: 'updated', label: 'Updated' },
];

function mapIitSubmissionRecord(row) {
  const utm = row?.utm || {};
  const topColleges = formatTopColleges(row?.section1Data?.top5Colleges);
  const updatedDate = row?.updatedAt ? new Date(row.updatedAt) : null;
  const updatedEpoch = updatedDate && !Number.isNaN(updatedDate.getTime()) ? updatedDate.getTime() : null;
  const updatedIso = updatedDate && !Number.isNaN(updatedDate.getTime()) ? updatedDate.toISOString() : '';
  return {
    id: row?.id || '',
    name: row?.fullName || '—',
    phone: row?.phone || '—',
    currentStep: row?.currentStep || 1,
    completed: row?.isCompleted ? 'Yes' : 'No',
    topColleges,
    topCollegesDisplay: topColleges === '—' ? '—' : topColleges.replace(/\n+/g, ', '),
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
  const updatedFromMs = viewFilters.updatedFrom ? new Date(viewFilters.updatedFrom).getTime() : null;
  const updatedToMs = viewFilters.updatedTo ? new Date(viewFilters.updatedTo).getTime() : null;

  return mappedRows.filter((row) => {
    if (sourceQ && !String(row.utmSource || '').toLowerCase().includes(sourceQ)) return false;
    if (mediumQ && !String(row.utmMedium || '').toLowerCase().includes(mediumQ)) return false;
    if (campaignQ && !String(row.utmCampaign || '').toLowerCase().includes(campaignQ)) return false;
    if (contentQ && !String(row.utmContent || '').toLowerCase().includes(contentQ)) return false;
    if (updatedFromMs != null && Number.isFinite(updatedFromMs) && (!Number.isFinite(row.updatedEpoch) || row.updatedEpoch < updatedFromMs)) return false;
    if (updatedToMs != null && Number.isFinite(updatedToMs) && (!Number.isFinite(row.updatedEpoch) || row.updatedEpoch > updatedToMs)) return false;
    return true;
  });
}

function tsvEscapeCell(value) {
  const text = String(value ?? '');
  if (/[\t\n\r"]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function serializeRowsToTsv(columns, rows) {
  const header = columns.map((c) => tsvEscapeCell(c.label)).join('\t');
  const body = rows
    .map((row) => columns.map((c) => tsvEscapeCell(row[c.key] ?? '')).join('\t'))
    .join('\n');
  return body ? `${header}\n${body}` : header;
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
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
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
                stroke="#0f3d75"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={uniquePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 4"
              />
            </>
          ) : null}

          {totalSeries.map((point) => (
            <g key={`total-${point.label}`}>
              <circle cx={point.x} cy={point.y} r={isSinglePoint ? 5 : 4} fill="#ffffff" stroke="#0f3d75" strokeWidth="2.5" />
              <title>{`${point.label} · Total Visits: ${point.value}`}</title>
            </g>
          ))}
          {uniqueSeries.map((point) => (
            <g key={`unique-${point.label}`}>
              <circle cx={point.x} cy={point.y} r={isSinglePoint ? 5 : 4} fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
              <title>{`${point.label} · Unique Visitors: ${point.value}`}</title>
            </g>
          ))}

          {!isSinglePoint && totalLast && uniqueLast ? (
            <>
              <text x={endLabelX} y={totalLast.y + 4} fontSize="10" fontWeight="600" fill="#0f3d75">
                Total
              </text>
              <text x={endLabelX} y={uniqueLast.y + 4} fontSize="10" fontWeight="600" fill="#6366f1">
                Unique
              </text>
            </>
          ) : null}

          {axisTicks.map((point) => {
            const index = series.findIndex((item) => item.bucket === point.bucket);
            const x = getX(index);
            return (
              <text
                key={`x-${point.bucket}`}
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
            <svg width="18" height="6" viewBox="0 0 18 6"><line x1="0" y1="3" x2="18" y2="3" stroke="#0f3d75" strokeWidth="3" strokeLinecap="round" /></svg>
            <span className="text-gray-700">Total Visits (solid)</span>
          </span>
          <span className="flex items-center gap-1">
            <svg width="18" height="6" viewBox="0 0 18 6"><line x1="0" y1="3" x2="18" y2="3" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 3" /></svg>
            <span className="text-gray-700">Unique Visitors (dashed)</span>
          </span>
        </span>
      </div>
    </div>
  );
}

export default function IitCounselling() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromTime, setFromTime] = useState('00:00');
  const [toTime, setToTime] = useState('23:59');
  const [granularity, setGranularity] = useState('daily');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submissionsViewAllOpen, setSubmissionsViewAllOpen] = useState(false);
  const [submissionsCopied, setSubmissionsCopied] = useState(false);
  const [copyingAll, setCopyingAll] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [allSubmissionRows, setAllSubmissionRows] = useState([]);
  const [allSubmissionRowsLoading, setAllSubmissionRowsLoading] = useState(false);
  const [allSubmissionRowsError, setAllSubmissionRowsError] = useState('');
  const [viewFilters, setViewFilters] = useState({
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
    updatedFrom: '',
    updatedTo: '',
  });

  const sharedFilters = useMemo(() => ({
    fromDate,
    toDate,
    fromTime,
    toTime,
    granularity,
  }), [fromDate, toDate, fromTime, toTime, granularity]);

  useEffect(() => {
    let cancelled = false;
    getIitCounsellingSubmissions({ page, limit: 25, q: search, ...sharedFilters }, getStoredToken()).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.success) {
        setError(res.message || 'Failed to load IIT counselling submissions');
        return;
      }
      setRows(res.data?.data || []);
      setPagination(res.data?.pagination || { total: 0, totalPages: 1 });
    });
    return () => { cancelled = true; };
  }, [page, search, sharedFilters]);

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

  const copyTextFallback = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'readonly');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  };

  const pageMappedRows = useMemo(() => rows.map(mapIitSubmissionRecord), [rows]);
  const viewSourceRows = useMemo(() => (allSubmissionRows.length ? allSubmissionRows : pageMappedRows), [allSubmissionRows, pageMappedRows]);
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
    const updatedSet = new Set();

    viewSourceRows.forEach((row) => {
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
      sources: Array.from(sourceSet).sort(sortText),
      mediums: Array.from(mediumSet).sort(sortText),
      campaigns: Array.from(campaignSet).sort(sortText),
      contents: Array.from(contentSet).sort(sortText),
      updatedTimes: Array.from(updatedSet).sort(sortTimeDesc),
    };
  }, [viewSourceRows]);

  useEffect(() => {
    setAllSubmissionRows([]);
    setAllSubmissionRowsError('');
  }, [search, sharedFilters]);

  const fetchAllMatchingSubmissions = useCallback(async () => {
    setAllSubmissionRowsLoading(true);
    setAllSubmissionRowsError('');
    try {
      const token = getStoredToken();
      const res = await getAllIitCounsellingSubmissionsPaginated(
        { q: search, ...sharedFilters, limit: 200 },
        token
      );
      if (!res.success) throw new Error(res.message || 'Failed to load all submissions');
      const rowsData = Array.isArray(res.data?.data) ? res.data.data : [];
      const aggregated = rowsData.map(mapIitSubmissionRecord);

      setAllSubmissionRows(aggregated);
      return aggregated;
    } catch (err) {
      const message = err?.message || 'Failed to fetch all submissions.';
      setAllSubmissionRowsError(message);
      return [];
    } finally {
      setAllSubmissionRowsLoading(false);
    }
  }, [search, sharedFilters]);

  useEffect(() => {
    if (!submissionsViewAllOpen) return;
    fetchAllMatchingSubmissions();
  }, [submissionsViewAllOpen, fetchAllMatchingSubmissions]);

  const copyAllSubmissions = async () => {
    setCopyError('');
    setCopyingAll(true);
    const fetchedRows = await fetchAllMatchingSubmissions();
    const copyRows = applySubmissionViewFilters(
      fetchedRows.length ? fetchedRows : viewSourceRows,
      viewFilters
    ).map((row) => ({
      name: row.name,
      phone: row.phone,
      currentStep: row.currentStep,
      completed: row.completed,
      topColleges: row.topColleges,
      utmSource: row.utmSource,
      utmMedium: row.utmMedium,
      utmCampaign: row.utmCampaign,
      utmContent: row.utmContent,
      updated: row.updated,
    }));
    if (!copyRows.length) {
      setCopyingAll(false);
      setCopyError('No rows available to copy for current filters.');
      return;
    }
    const text = serializeRowsToTsv(IIT_SUBMISSION_COLUMNS, copyRows);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyTextFallback(text);
      }
    } catch {
      copyTextFallback(text);
    }
    setCopyingAll(false);
    setSubmissionsCopied(true);
    window.setTimeout(() => setSubmissionsCopied(false), 1400);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-1 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">IIT Counselling Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Page visits, conversion insights, and submission details in one place.</p>
          <Link
            to="/admin/iit-counselling-utm#iit-utm-generator"
            className="inline-flex mt-2 text-sm font-medium text-primary-navy hover:underline"
          >
            Generate UTM link for campaigns
          </Link>
        </div>
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setAnalyticsLoading(true);
                setLoading(true);
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
                setLoading(true);
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
                setLoading(true);
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
                setLoading(true);
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
                  setLoading(true);
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
                  setLoading(true);
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
              setLoading(true);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard title="Total Visits" value={totalVisits} icon={<FiBarChart2 className="w-4 h-4" />} accent="bg-blue-50 text-blue-700" loading={analyticsLoading} />
        <StatCard title="Unique Visitors" value={uniqueVisitors} icon={<FiUsers className="w-4 h-4" />} accent="bg-indigo-50 text-indigo-700" loading={analyticsLoading} />
        <StatCard title="Total Submissions" value={totalSubmissions} icon={<FiCheckCircle className="w-4 h-4" />} accent="bg-emerald-50 text-emerald-700" loading={analyticsLoading} />
        <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon={<FiBarChart2 className="w-4 h-4" />} accent="bg-amber-50 text-amber-700" loading={analyticsLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
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
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Unique Visitors
              </span>
            </div>
          </div>
          <TrendChart points={analytics?.trend || []} granularity={granularity} filters={sharedFilters} />
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

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900">
            IIT Counselling Submissions <span className="text-gray-500">({pagination.total || 0})</span>
          </h3>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setSubmissionsViewAllOpen(true)}
              disabled={pageMappedRows.length === 0}
              className="h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              View all
            </button>
            <button
              type="button"
              onClick={copyAllSubmissions}
              disabled={pageMappedRows.length === 0 || copyingAll}
              className="h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {copyingAll ? 'Copying...' : (submissionsCopied ? 'Copied' : 'Copy all')}
            </button>
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
              className="w-full sm:w-72 h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm"
            />
          </div>
        </div>
        {error ? <p className="text-red-600 text-sm">{error}</p> : null}
        {copyError ? <p className="text-red-600 text-sm">{copyError}</p> : null}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-[1180px] w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2 text-xs uppercase tracking-wider">Name</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wider">Phone</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wider">Current Step</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wider">Completed</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wider">Top Colleges</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wider">UTM Source</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wider">UTM Medium</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wider">UTM Campaign</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wider">UTM Content</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wider">Updated</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={11} className="px-3 py-6 text-center text-gray-500">Loading...</td></tr>
            ) : pageMappedRows.length === 0 ? (
              <tr><td colSpan={11} className="px-3 py-6 text-center text-gray-500">No submissions found</td></tr>
            ) : pageMappedRows.map((row) => {
              const utmCell = (value) => (
                <span
                  className={value ? 'text-gray-800' : 'text-gray-400'}
                  title={value || 'No UTM data'}
                >
                  {value || '—'}
                </span>
              );
              return (
                <tr key={row.id}>
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.phone}</td>
                  <td className="px-3 py-2">{row.currentStep}</td>
                  <td className="px-3 py-2">{row.completed}</td>
                  <td className="px-3 py-2 max-w-[300px] truncate" title={row.topColleges}>{row.topCollegesDisplay}</td>
                  <td className="px-3 py-2 max-w-[180px] truncate">{utmCell(row.utmSource)}</td>
                  <td className="px-3 py-2 max-w-[180px] truncate">{utmCell(row.utmMedium)}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{utmCell(row.utmCampaign)}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{utmCell(row.utmContent)}</td>
                  <td className="px-3 py-2">{row.updated}</td>
                  <td className="px-3 py-2 text-center">
                    <button type="button" onClick={() => openDetail(row.raw?.id || row.id)} className="inline-flex items-center gap-1 text-primary-navy hover:underline">
                      <FiEye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
                  onClick={copyAllSubmissions}
                  disabled={copyingAll || allSubmissionRowsLoading}
                  className="rounded border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  {copyingAll ? 'Copying...' : (submissionsCopied ? 'Copied' : 'Copy all')}
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
              {allSubmissionRowsLoading ? (
                <p className="mb-3 text-sm text-gray-500">Loading all matching rows...</p>
              ) : null}
              {allSubmissionRowsError ? (
                <p className="mb-3 text-sm text-red-600">{allSubmissionRowsError}</p>
              ) : null}
              <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
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
                    onClick={() => setViewFilters({ utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', updatedFrom: '', updatedTo: '' })}
                    className="h-9 shrink-0 rounded border border-gray-300 px-3 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <table className="min-w-[1180px] w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Phone</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Current Step</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Completed</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider">Top Colleges</th>
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
                        <td className="px-3 py-2">{row.currentStep}</td>
                        <td className="px-3 py-2">{row.completed}</td>
                        <td className="px-3 py-2 break-all whitespace-pre-wrap">{row.topColleges}</td>
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
                      <td colSpan={10} className="px-3 py-6 text-center text-gray-500">No rows match current filters.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Page {page} of {pagination.totalPages || 1}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setLoading(true); setPage((p) => Math.max(1, p - 1)); }} disabled={page <= 1} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40">Previous</button>
          <button type="button" onClick={() => { setLoading(true); setPage((p) => Math.min(pagination.totalPages || 1, p + 1)); }} disabled={page >= (pagination.totalPages || 1)} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40">Next</button>
        </div>
      </div>

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
