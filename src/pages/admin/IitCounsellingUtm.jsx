import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCopy,
  FiExternalLink,
  FiEye,
  FiLink,
  FiRefreshCw,
  FiSave,
  FiTrash2,
} from 'react-icons/fi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  createIitCounsellingSavedUtmLink,
  deleteIitCounsellingSavedUtmLink,
  getIitCounsellingSavedUtmLinks,
  getIitCounsellingUtmAnalytics,
  getIitCounsellingVisitAnalytics,
  getStoredToken,
} from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import TableSkeleton from '../../components/UI/TableSkeleton';
import CopyToSheetsModal from '../../components/Admin/CopyToSheetsModal';
import {
  PLATFORMS,
  DEFAULT_CAMPAIGN,
  PLATFORM_TO_UTM_SOURCE,
} from '../../constants/influencerAdminConstants';

const COMBO_COPY_FIELDS = [
  { key: 'utm_source', label: 'utm_source' },
  { key: 'utm_medium', label: 'utm_medium' },
  { key: 'utm_campaign', label: 'utm_campaign' },
  { key: 'utm_content', label: 'utm_content' },
  { key: 'visits', label: 'Visits' },
  { key: 'uniqueVisitors', label: 'Unique visitors' },
  { key: 'linkedSubmissions', label: 'Linked submissions' },
];

const DEFAULT_IIT_COUNSELLING_PAGE_URL = (
  import.meta.env.VITE_IIT_COUNSELLING_PAGE_URL || 'https://guidexpert.co.in/iit-counselling'
).trim();

function buildIitCounsellingShareUrl(baseUrl, { utm_source, utm_medium, utm_campaign, utm_content }) {
  const base = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!base) return '';
  const p = new URLSearchParams();
  if (String(utm_source || '').trim()) p.set('utm_source', String(utm_source).trim());
  if (String(utm_medium || '').trim()) p.set('utm_medium', String(utm_medium).trim());
  if (String(utm_campaign || '').trim()) p.set('utm_campaign', String(utm_campaign).trim());
  if (String(utm_content || '').trim()) p.set('utm_content', String(utm_content).trim());
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Decoded UTM tuple as stored on IIT counselling visits (same as combo table / CSV keys). */
function parseUtmParamsFromHref(href) {
  if (!href || typeof href !== 'string') return null;
  try {
    const u = new URL(href);
    return {
      utm_source: u.searchParams.get('utm_source') ?? '',
      utm_medium: u.searchParams.get('utm_medium') ?? '',
      utm_campaign: u.searchParams.get('utm_campaign') ?? '',
      utm_content: u.searchParams.get('utm_content') ?? '',
    };
  } catch {
    return null;
  }
}

/** Map POST saved-utm-links response to table row shape. */
function mapCreateResponseToSavedLinkRow(saved) {
  if (!saved || typeof saved !== 'object') return null;
  const id = saved.id != null ? String(saved.id) : (saved._id != null ? String(saved._id) : '');
  if (!id) return null;
  return {
    id,
    influencerName: saved.influencerName,
    platform: saved.platform,
    campaign: saved.campaign,
    utmLink: saved.utmLink,
    cost: saved.cost ?? null,
    createdAt: saved.createdAt,
  };
}

function getDatePresetRange(preset) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  if (preset === '7') {
    from.setDate(from.getDate() - 7);
    return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
  }
  if (preset === '30') {
    from.setDate(from.getDate() - 30);
    return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
  }
  if (preset === 'month') {
    from.setDate(1);
    return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
  }
  return { from: '', to: '' };
}

function formatChartDate(isoDateStr) {
  if (!isoDateStr) return '—';
  const s = String(isoDateStr);
  const [y, m, d] = s.split(/[-T\s]/);
  if (!y || !m || !d) return s;
  const date = new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10)));
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ChartSkeleton() {
  return (
    <div className="h-[220px] min-h-[220px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
      <div className="text-gray-400 text-sm">Loading chart…</div>
    </div>
  );
}

function getComboCellValue(row, key) {
  const v = row[key];
  if (v == null || v === '') return '';
  return String(v);
}

function formatSavedLinkDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSavedCost(value) {
  if (value == null || value === '' || (typeof value === 'number' && Number.isNaN(value))) return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const cardClass = 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden';
const sectionHeaderClass = 'px-6 py-4 border-b border-gray-200 bg-gray-50/80 border-l-4 border-l-primary-navy';

const LINE_POINT_CAP = 90;

export default function IitCounsellingUtm() {
  const { logout } = useAuth();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromTime, setFromTime] = useState('00:00');
  const [toTime, setToTime] = useState('23:59');
  const [rangePreset, setRangePreset] = useState('');

  const [data, setData] = useState(null);
  const [visitTrend, setVisitTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [error, setError] = useState('');

  const [comboSearch, setComboSearch] = useState('');
  const [comboSort, setComboSort] = useState('visits');
  const [copyComboModalOpen, setCopyComboModalOpen] = useState(false);

  const [genInfluencerName, setGenInfluencerName] = useState('');
  const [genPlatform, setGenPlatform] = useState('Instagram');
  const [genCampaign, setGenCampaign] = useState(DEFAULT_CAMPAIGN);
  const [genCost, setGenCost] = useState('');
  const [genCopied, setGenCopied] = useState(false);
  const [genLinkError, setGenLinkError] = useState('');
  const [genSaveLoading, setGenSaveLoading] = useState(false);
  const [genSaveSuccess, setGenSaveSuccess] = useState('');
  /** After save, server-built URL (aligns DB link with env base). Cleared when UTM inputs change. */
  const [canonicalIitUtmLink, setCanonicalIitUtmLink] = useState(null);

  const [savedIitLinks, setSavedIitLinks] = useState([]);
  const [savedLinksLoading, setSavedLinksLoading] = useState(true);
  const [savedLinksError, setSavedLinksError] = useState('');
  /** Set when the API returns 404 (route missing on host) or wrong handler (legacy server). */
  const [savedLinksEnvHint, setSavedLinksEnvHint] = useState('');
  const [deletingLinkId, setDeletingLinkId] = useState(null);

  const sharedFilters = useMemo(() => ({
    fromDate,
    toDate,
    fromTime,
    toTime,
    granularity: 'daily',
  }), [fromDate, toDate, fromTime, toTime]);

  const loadData = useCallback(() => {
    const token = getStoredToken();
    setLoading(true);
    setTrendLoading(true);
    setError('');

    Promise.all([
      getIitCounsellingUtmAnalytics(sharedFilters, token),
      getIitCounsellingVisitAnalytics(sharedFilters, token),
    ]).then(([utmRes, visitRes]) => {
      setLoading(false);
      setTrendLoading(false);
      if (!utmRes.success) {
        setError(utmRes.message || 'Failed to load UTM analytics');
        setData(null);
        setVisitTrend([]);
        return;
      }
      setData(utmRes.data?.data || null);
      if (visitRes.success && visitRes.data?.data?.trend) {
        setVisitTrend(visitRes.data.data.trend);
      } else {
        setVisitTrend([]);
      }
    });
  }, [sharedFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fetchSavedIitLinks = useCallback(() => {
    const t = getStoredToken();
    setSavedLinksLoading(true);
    setSavedLinksError('');
    setSavedLinksEnvHint('');
    getIitCounsellingSavedUtmLinks(t).then((result) => {
      setSavedLinksLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        const msg = String(result.message || '').toLowerCase();
        const missingSavedLinksRoute =
          result.status === 404 &&
          (msg === 'not found' || msg.includes('submission not found'));
        if (missingSavedLinksRoute) {
          setSavedIitLinks([]);
          setSavedLinksEnvHint(
            'Saved links need a backend with GET /api/admin/iit-counselling/saved-utm-links. Deploy the latest API, or point the Vite dev proxy at your local server (e.g. VITE_PROXY_TARGET=http://127.0.0.1:5000 in frontend/.env.development.local).',
          );
          return;
        }
        setSavedLinksError(result.message || 'Failed to load saved links');
        setSavedIitLinks([]);
        return;
      }
      const list = result.data?.data ?? [];
      setSavedIitLinks(Array.isArray(list) ? list : []);
    });
  }, [logout]);

  useEffect(() => {
    const id = window.setTimeout(() => fetchSavedIitLinks(), 0);
    return () => window.clearTimeout(id);
  }, [fetchSavedIitLinks]);

  useEffect(() => {
    const onFocus = () => fetchSavedIitLinks();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchSavedIitLinks]);

  useEffect(() => {
    if (window.location.hash !== '#iit-utm-generator') return undefined;
    const t = window.setTimeout(() => {
      document.getElementById('iit-utm-generator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(t);
  }, []);

  const summary = data?.summary || {};

  const applyRangePreset = (preset) => {
    const { from, to } = getDatePresetRange(preset);
    setRangePreset(preset);
    setFromDate(from);
    setToDate(to);
    setFromTime('00:00');
    setToTime('23:59');
  };

  const barChartData = useMemo(() => {
    const src = [...(data?.byContent || [])]
      .sort((a, b) => (Number(b.visits) || 0) - (Number(a.visits) || 0))
      .slice(0, 10);
    return src.map((row, i) => {
      const label = row.utm_content || '—';
      const short = label.length > 14 ? `${String(label).slice(0, 14)}…` : label;
      return {
        // Recharts keys bars by `name`; suffix keeps keys unique when truncated labels match.
        name: `${short}\u200c${i}`,
        visits: row.visits ?? 0,
        fullName: label,
      };
    });
  }, [data?.byContent]);

  const topUtmContentLabel = useMemo(() => {
    const rows = [...(data?.byContent || [])].filter((r) => r.utm_content && r.utm_content !== '(none)');
    if (rows.length === 0) return '—';
    rows.sort((a, b) => (Number(b.visits) || 0) - (Number(a.visits) || 0));
    return rows[0].utm_content || '—';
  }, [data?.byContent]);

  const lineChartData = useMemo(() => {
    const raw = (visitTrend || []).map((p) => ({
      date: p.bucket || '',
      count: Number(p.totalVisits) || 0,
    }));
    const byDay = new Map();
    for (const row of raw) {
      const d = row.date;
      if (!d) continue;
      byDay.set(d, (byDay.get(d) || 0) + row.count);
    }
    const merged = [...byDay.entries()].map(([date, count]) => ({ date, count }));
    merged.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    if (merged.length > LINE_POINT_CAP) return merged.slice(-LINE_POINT_CAP);
    return merged;
  }, [visitTrend]);

  const filteredSortedCombo = useMemo(() => {
    const rows = [...(data?.byCombo || [])];
    const q = comboSearch.trim().toLowerCase();
    let filtered = rows;
    if (q) {
      filtered = rows.filter((r) =>
        [r.utm_source, r.utm_medium, r.utm_campaign, r.utm_content]
          .some((v) => String(v || '').toLowerCase().includes(q))
      );
    }
    const key = comboSort === 'unique' ? 'uniqueVisitors' : comboSort === 'linked' ? 'linkedSubmissions' : 'visits';
    filtered.sort((a, b) => (Number(b[key]) || 0) - (Number(a[key]) || 0));
    return filtered;
  }, [data?.byCombo, comboSearch, comboSort]);

  const exportComboCsv = () => {
    const headers = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'Visits', 'Unique visitors', 'Linked submissions'];
    const rows = filteredSortedCombo.map((r) => [
      r.utm_source ?? '',
      r.utm_medium ?? '',
      r.utm_campaign ?? '',
      r.utm_content ?? '',
      r.visits ?? 0,
      r.uniqueVisitors ?? 0,
      r.linkedSubmissions ?? 0,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iit-counselling-utm-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatedIitUtmLink = useMemo(() => {
    const name = genInfluencerName.trim();
    if (!name) return '';
    const utmSource = PLATFORM_TO_UTM_SOURCE[genPlatform] || String(genPlatform || '').toLowerCase();
    const campaign = (genCampaign || '').trim() || DEFAULT_CAMPAIGN;
    return buildIitCounsellingShareUrl(DEFAULT_IIT_COUNSELLING_PAGE_URL, {
      utm_source: utmSource,
      utm_medium: 'influencer',
      utm_campaign: campaign,
      utm_content: name,
    });
  }, [genInfluencerName, genPlatform, genCampaign]);

  const displayIitUtmLink = canonicalIitUtmLink || generatedIitUtmLink;

  const generatorDecodedUtms = useMemo(() => parseUtmParamsFromHref(displayIitUtmLink), [displayIitUtmLink]);

  const copyGeneratedIitLink = () => {
    if (!displayIitUtmLink) return;
    navigator.clipboard.writeText(displayIitUtmLink).then(() => {
      setGenCopied(true);
      setTimeout(() => setGenCopied(false), 2000);
    });
  };

  const handleGenerateIitLink = () => {
    setGenLinkError('');
    setGenSaveSuccess('');
    setCanonicalIitUtmLink(null);
    if (!genInfluencerName.trim()) {
      setGenLinkError('Influencer name is required.');
      return;
    }
    document.getElementById('iit-generated-link-preview')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleSaveIitLinkToList = async () => {
    setGenLinkError('');
    setGenSaveSuccess('');
    if (!genInfluencerName.trim()) {
      setGenLinkError('Influencer name is required.');
      return;
    }
    const t = getStoredToken();
    setGenSaveLoading(true);
    const payload = {
      influencerName: genInfluencerName.trim(),
      platform: genPlatform,
      campaign: (genCampaign || '').trim() || DEFAULT_CAMPAIGN,
    };
    const costTrimmed = typeof genCost === 'string' ? genCost.trim() : '';
    if (costTrimmed !== '') {
      const costNum = Number(costTrimmed);
      if (!Number.isNaN(costNum) && costNum >= 0) payload.cost = costNum;
    }
    const result = await createIitCounsellingSavedUtmLink(payload, t);
    setGenSaveLoading(false);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      const errMsg = result.message || result.data?.message || 'Failed to save link';
      setGenLinkError(errMsg);
      return;
    }
    const apiBody = result.data;
    const saved = apiBody?.data != null && typeof apiBody.data === 'object' ? apiBody.data : apiBody;
    const savedId = saved?.id ?? saved?._id;
    // Persisted save includes a Mongo id; a "generate only" response has no id.
    if (savedId == null) {
      setGenLinkError(
        apiBody?.message
        || 'Link was not saved (no record id returned). If the API is older than this screen, redeploy the backend.'
      );
      return;
    }
    const row = mapCreateResponseToSavedLinkRow(saved);
    if (!row) {
      setGenLinkError('Invalid save response from server.');
      return;
    }
    const savedUrl = typeof row.utmLink === 'string' ? row.utmLink.trim() : '';
    if (savedUrl) {
      setCanonicalIitUtmLink(savedUrl);
    }
    setGenSaveSuccess('Saved to the list.');
    setSavedIitLinks((prev) => {
      const idStr = String(row.id);
      const rest = prev.filter((r) => String(r.id) !== idStr);
      return [row, ...rest];
    });
    fetchSavedIitLinks();
  };

  const handleDeleteSavedIitLink = async (id) => {
    if (!id || !window.confirm('Delete this saved IIT counselling link?')) return;
    const t = getStoredToken();
    setDeletingLinkId(id);
    setSavedLinksError('');
    const result = await deleteIitCounsellingSavedUtmLink(id, t);
    setDeletingLinkId(null);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setSavedLinksError(result.message || 'Failed to delete link');
      return;
    }
    fetchSavedIitLinks();
  };

  const dateRangeToolbar = (
    <div className="flex flex-wrap items-center gap-2">
      {['7', '30', 'month', ''].map((preset) => (
        <button
          key={preset || 'all'}
          type="button"
          onClick={() => applyRangePreset(preset)}
          className={`text-sm px-3 py-1.5 rounded-lg border ${rangePreset === preset ? 'bg-primary-navy text-white border-primary-navy' : 'border-gray-300 hover:bg-gray-50'}`}
        >
          {preset === '7' ? 'Last 7 days' : preset === '30' ? 'Last 30 days' : preset === 'month' ? 'This month' : 'All time'}
        </button>
      ))}
      <input
        type="date"
        value={fromDate}
        onChange={(e) => { setRangePreset(''); setFromDate(e.target.value); }}
        className="rounded border border-gray-300 px-2 py-1.5 text-sm"
      />
      <input
        type="date"
        value={toDate}
        onChange={(e) => { setRangePreset(''); setToDate(e.target.value); }}
        className="rounded border border-gray-300 px-2 py-1.5 text-sm"
      />
      <input
        type="time"
        value={fromTime}
        onChange={(e) => { setRangePreset(''); setFromTime(e.target.value); }}
        className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        title="From time (IST)"
      />
      <input
        type="time"
        value={toTime}
        onChange={(e) => { setRangePreset(''); setToTime(e.target.value); }}
        className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        title="To time (IST)"
      />
      <button
        type="button"
        onClick={() => {
          setRangePreset('');
          setFromDate('');
          setToDate('');
          setFromTime('00:00');
          setToTime('23:59');
        }}
        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
      >
        Reset range
      </button>
      <button
        type="button"
        onClick={loadData}
        disabled={loading}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-50"
        title="Refresh"
      >
        <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      </button>
      <select
        value={comboSort}
        onChange={(e) => setComboSort(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1.5 text-sm bg-white"
      >
        <option value="visits">Sort: Visits</option>
        <option value="unique">Sort: Unique</option>
        <option value="linked">Sort: Linked</option>
      </select>
      <button
        type="button"
        onClick={exportComboCsv}
        disabled={filteredSortedCombo.length === 0}
        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
      >
        Export CSV
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">IIT Counselling UTM</h2>
        <p className="text-sm text-gray-500 mt-1">
          Same charts and layout as Influencer / UTM Tracking. All data is for the public route{' '}
          <span className="font-mono text-xs bg-gray-100 px-1 rounded">/iit-counselling</span>
          {' '}only (page visits and UTMs from that URL).
        </p>
        <p className="text-xs text-gray-500 mt-1">
          <Link to="/admin/iit-counselling" className="text-primary-navy hover:underline">IIT Counselling submissions</Link>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardClass + ' p-4'}>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FiEye className="w-4 h-4" />
            <span>Total visits</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{loading ? '—' : (summary.totalVisits ?? 0)}</p>
        </div>
        <div className={cardClass + ' p-4'}>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FiLink className="w-4 h-4" />
            <span>Visits with any UTM</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{loading ? '—' : (summary.visitsWithAnyUtm ?? 0)}</p>
        </div>
        <div className={cardClass + ' p-4'}>
          <div className="text-gray-500 text-sm">Top utm_content</div>
          <p className="text-lg font-medium text-gray-900 mt-1 truncate" title={topUtmContentLabel === '—' ? '' : topUtmContentLabel}>
            {loading ? '—' : topUtmContentLabel}
          </p>
        </div>
        <div className={cardClass + ' p-4'}>
          <div className="text-gray-500 text-sm">In range</div>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {loading ? '—' : (fromDate || toDate ? (summary.totalVisits ?? 0) : 'All time')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <div className={`${cardClass} min-w-0`}>
          <div className={sectionHeaderClass}>
            <h3 className="text-sm font-semibold text-gray-800">Visits by utm_content</h3>
            <p className="text-xs text-gray-500 mt-0.5">Top 10 by visit count (current date range)</p>
          </div>
          <div className="p-4 h-[260px] min-h-[220px] w-full min-w-0">
            {loading ? (
              <ChartSkeleton />
            ) : barChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220} debounce={50}>
                <BarChart data={barChartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => (typeof v === 'string' && v.includes('\u200c') ? v.split('\u200c')[0] : v)}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                  <Tooltip
                    formatter={(value) => [value, 'Visits']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="visits" fill="#003366" name="Visits" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`iit-utm-bar-${index}-${String(entry.fullName)}`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className={`${cardClass} min-w-0`}>
          <div className={sectionHeaderClass}>
            <h3 className="text-sm font-semibold text-gray-800">Visits over time</h3>
            <p className="text-xs text-gray-500 mt-0.5">Daily count (IST), current date range</p>
          </div>
          <div className="p-4 h-[260px] min-h-[220px] w-full min-w-0">
            {trendLoading ? (
              <ChartSkeleton />
            ) : lineChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220} debounce={50}>
                <LineChart data={lineChartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => (v && v.length >= 10 ? `${v.slice(8, 10)}/${v.slice(5, 7)}` : v)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                  <Tooltip
                    formatter={(value) => [value, 'Visits']}
                    labelFormatter={(label) => (label ? formatChartDate(label) : '')}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#003366"
                    strokeWidth={2}
                    name="Visits"
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <section id="iit-utm-generator" className={cardClass}>
        <div className={`${sectionHeaderClass} py-2 sm:py-3`}>
          <h2 className="text-base font-semibold text-gray-800">Generate UTM Link</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Links point to <span className="font-mono text-xs">/iit-counselling</span>. Query keys match the analytics table exactly:{' '}
            <span className="font-mono text-xs">utm_source</span> (from platform),{' '}
            <span className="font-mono text-xs">utm_medium</span>=<span className="font-mono text-xs">influencer</span>,{' '}
            <span className="font-mono text-xs">utm_campaign</span>,{' '}
            <span className="font-mono text-xs">utm_content</span> (influencer name)—same decoding as{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">URLSearchParams</code> on the public page.
          </p>
        </div>
        <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); handleGenerateIitLink(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="iitGenInfluencerName" className="block text-sm font-medium text-gray-700 mb-1.5">Influencer Name</label>
              <input
                id="iitGenInfluencerName"
                type="text"
                value={genInfluencerName}
                onChange={(e) => {
                  setGenInfluencerName(e.target.value);
                  setGenLinkError('');
                  setGenSaveSuccess('');
                  setCanonicalIitUtmLink(null);
                }}
                placeholder="e.g. John Doe"
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none"
              />
            </div>
            <div>
              <label htmlFor="iitGenPlatform" className="block text-sm font-medium text-gray-700 mb-1.5">Platform</label>
              <select
                id="iitGenPlatform"
                value={genPlatform}
                onChange={(e) => {
                  setGenPlatform(e.target.value);
                  setGenSaveSuccess('');
                  setCanonicalIitUtmLink(null);
                }}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none bg-white"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="iitGenCampaignName" className="block text-sm font-medium text-gray-700 mb-1.5">Campaign Name</label>
              <input
                id="iitGenCampaignName"
                type="text"
                value={genCampaign}
                onChange={(e) => {
                  setGenCampaign(e.target.value);
                  setGenSaveSuccess('');
                  setCanonicalIitUtmLink(null);
                }}
                placeholder={DEFAULT_CAMPAIGN}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none"
              />
            </div>
            <div>
              <label htmlFor="iitGenCost" className="block text-sm font-medium text-gray-700 mb-1.5">Cost (₹)</label>
              <input
                id="iitGenCost"
                type="number"
                min="0"
                step="0.01"
                value={genCost}
                onChange={(e) => {
                  setGenCost(e.target.value);
                  setGenSaveSuccess('');
                }}
                placeholder="Optional"
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none"
              />
              <p className="text-xs text-gray-500 mt-0.5">Optional; included when you use Save to list.</p>
            </div>
          </div>
          {genLinkError ? (
            <p className="text-sm text-red-600" role="alert">{genLinkError}</p>
          ) : null}
          {genSaveSuccess ? (
            <p className="text-sm text-green-700" role="status">{genSaveSuccess}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!genInfluencerName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-navy hover:bg-primary-navy/90 focus:ring-2 focus:ring-primary-navy focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              Generate Link
            </button>
            <button
              type="button"
              onClick={handleSaveIitLinkToList}
              disabled={!genInfluencerName.trim() || genSaveLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <FiSave className="w-4 h-4" aria-hidden />
              {genSaveLoading ? 'Saving…' : 'Save to list'}
            </button>
            <button
              type="button"
              onClick={copyGeneratedIitLink}
              disabled={!displayIitUtmLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 disabled:opacity-50 disabled:pointer-events-none"
            >
              <FiCopy className="w-4 h-4" aria-hidden />
              {genCopied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={() => displayIitUtmLink && window.open(displayIitUtmLink, '_blank', 'noopener,noreferrer')}
              disabled={!displayIitUtmLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 disabled:opacity-50 disabled:pointer-events-none"
            >
              <FiExternalLink className="w-4 h-4" aria-hidden />
              Open page
            </button>
          </div>
          {displayIitUtmLink ? (
            <div id="iit-generated-link-preview" className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50 scroll-mt-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Generated link</p>
              <p className="text-sm text-gray-800 break-all font-mono">{displayIitUtmLink}</p>
              {canonicalIitUtmLink ? (
                <p className="text-xs text-gray-500 mt-2">Showing saved URL from server (matches list and visit tracking).</p>
              ) : null}
              {generatorDecodedUtms ? (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Decoded UTM fields (same as combo table)</p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-mono text-xs text-gray-500 shrink-0">utm_source</dt>
                      <dd className="text-gray-900 font-medium break-all">{generatorDecodedUtms.utm_source || <span className="text-gray-400">(none)</span>}</dd>
                    </div>
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-mono text-xs text-gray-500 shrink-0">utm_medium</dt>
                      <dd className="text-gray-900 font-medium break-all">{generatorDecodedUtms.utm_medium || <span className="text-gray-400">(none)</span>}</dd>
                    </div>
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-mono text-xs text-gray-500 shrink-0">utm_campaign</dt>
                      <dd className="text-gray-900 font-medium break-all">{generatorDecodedUtms.utm_campaign || <span className="text-gray-400">(none)</span>}</dd>
                    </div>
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-mono text-xs text-gray-500 shrink-0">utm_content</dt>
                      <dd className="text-gray-900 font-medium break-all">{generatorDecodedUtms.utm_content || <span className="text-gray-400">(none)</span>}</dd>
                    </div>
                  </dl>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/50">
              <p className="text-sm text-gray-600 leading-relaxed">Enter an influencer name to preview the counselling page URL (utm_content).</p>
            </div>
          )}
        </form>

        <div className="border-t border-gray-200 px-6 py-5 bg-gray-50/40">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Saved IIT counselling links</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Stored in a dedicated database collection for this page only—not the Influencer / UTM Tracking (<span className="font-mono">/register</span>) list.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchSavedIitLinks}
              disabled={savedLinksLoading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${savedLinksLoading ? 'animate-spin' : ''}`} aria-hidden />
              Refresh
            </button>
          </div>
          {savedLinksError ? (
            <p className="text-sm text-red-600 mb-3" role="alert">{savedLinksError}</p>
          ) : null}
          {savedLinksEnvHint ? (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3" role="status">
              {savedLinksEnvHint}
            </p>
          ) : null}
          {savedLinksLoading ? (
            <div className="py-6"><TableSkeleton rows={4} cols={7} /></div>
          ) : savedIitLinks.length === 0 ? (
            savedLinksEnvHint ? null : (
              <p className="text-sm text-gray-500 py-4">No saved links yet. Generate a URL and use Save to list.</p>
            )
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Influencer</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Campaign</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Link</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {savedIitLinks.map((row) => (
                    <tr key={`iit-saved-${String(row.id)}-${row.createdAt || ''}`} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[140px] truncate" title={row.influencerName}>{row.influencerName}</td>
                      <td className="px-4 py-3 text-gray-700">{row.platform}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate" title={row.campaign}>{row.campaign}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[min(280px,40vw)] truncate font-mono text-xs" title={row.utmLink}>{row.utmLink}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">{formatSavedCost(row.cost)}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatSavedLinkDate(row.createdAt)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => row.utmLink && navigator.clipboard.writeText(row.utmLink)}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 mr-1"
                          title="Copy link"
                          aria-label="Copy link"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedIitLink(row.id)}
                          disabled={deletingLinkId === row.id}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
                          aria-label="Delete saved link"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className={cardClass}>
        <div className={`${sectionHeaderClass} flex flex-wrap items-center justify-between gap-4`}>
          <div>
            <h2 className="text-base font-semibold text-gray-800">IIT Counselling UTM analytics</h2>
            <p className="text-sm text-gray-500 mt-0.5">Full UTM combinations from visits on <span className="font-mono text-xs">/iit-counselling</span>. Linked = visit tied to section 1 save.</p>
            <p className="text-xs text-gray-500 mt-0.5">Date filters apply to this table, KPIs, and charts above.</p>
          </div>
          {dateRangeToolbar}
        </div>

        {error ? (
          <div className="px-6 py-6">
            <p className="text-red-600 text-sm" role="alert">{error}</p>
          </div>
        ) : null}

        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search source, medium, campaign, content"
            value={comboSearch}
            onChange={(e) => setComboSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-56 focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none"
          />
          <button
            type="button"
            onClick={() => setCopyComboModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Copy to sheets"
          >
            <FiCopy className="w-4 h-4" /> Copy
          </button>
          {comboSearch ? (
            <span className="text-sm text-gray-500 self-center">
              Showing {filteredSortedCombo.length} of {(data?.byCombo || []).length} rows
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="px-6 py-8"><TableSkeleton rows={8} cols={7} /></div>
        ) : (data?.byCombo || []).length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm">No visit data in this range.</p>
            <p className="text-gray-400 text-xs mt-1">Traffic with UTM tags on /iit-counselling will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">utm_source</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">utm_medium</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">utm_campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">utm_content</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Visits</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Unique</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Linked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSortedCombo.map((row, idx) => (
                  <tr key={`${row.utm_source}-${row.utm_medium}-${row.utm_campaign}-${row.utm_content}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60 hover:bg-primary-blue-50/30'}>
                    <td className="px-6 py-4 text-sm max-w-[160px] truncate" title={row.utm_source}>{row.utm_source === '(none)' ? <span className="text-gray-400">(none)</span> : row.utm_source}</td>
                    <td className="px-6 py-4 text-sm max-w-[140px] truncate" title={row.utm_medium}>{row.utm_medium === '(none)' ? <span className="text-gray-400">(none)</span> : row.utm_medium}</td>
                    <td className="px-6 py-4 text-sm max-w-[160px] truncate" title={row.utm_campaign}>{row.utm_campaign === '(none)' ? <span className="text-gray-400">(none)</span> : row.utm_campaign}</td>
                    <td className="px-6 py-4 text-sm max-w-[160px] truncate" title={row.utm_content}>{row.utm_content === '(none)' ? <span className="text-gray-400">(none)</span> : row.utm_content}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 tabular-nums">{row.visits}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 tabular-nums">{row.uniqueVisitors}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 tabular-nums">{row.linkedSubmissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CopyToSheetsModal
        fields={COMBO_COPY_FIELDS}
        records={filteredSortedCombo}
        getCellValue={getComboCellValue}
        open={copyComboModalOpen}
        onClose={() => setCopyComboModalOpen(false)}
        recordLabel="UTM rows"
      />
    </div>
  );
}
