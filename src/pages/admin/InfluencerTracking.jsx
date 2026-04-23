import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCopy, FiRefreshCw, FiLink, FiBarChart2, FiEye, FiX } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  getInfluencerAnalytics,
  getInfluencerAnalyticsTrend,
  getAdminLeads,
  getStoredToken,
} from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import TableSkeleton from '../../components/UI/TableSkeleton';
import CopyToSheetsModal from '../../components/Admin/CopyToSheetsModal';
import InfluencerLinkCreationWorkspace from '../../components/Admin/InfluencerLinkCreationWorkspace';

const ANALYTICS_COPY_FIELDS = [
  { key: 'influencerName', label: 'Influencer Name' },
  { key: 'platform', label: 'Platform' },
  { key: 'totalRegistrations', label: 'Total Registrations' },
  { key: 'latestRegistration', label: 'Latest Registration' },
];

function getAnalyticsCellValue(row, key) {
  const v = row[key];
  if (key === 'latestRegistration') return v ? formatDate(v) : '';
  if (v == null || v === '') return '';
  return String(v);
}

function formatDate(value) {
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

function formatChartDate(isoDateStr) {
  if (!isoDateStr) return '—';
  const [y, m, d] = String(isoDateStr).split('-');
  if (!y || !m || !d) return isoDateStr;
  const date = new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10)));
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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

function normalizeInfluencerName(name) {
  if (name == null || typeof name !== 'string') return '';
  return name.trim().toLowerCase();
}

function formatCost(value) {
  if (value == null || value === '' || (typeof value === 'number' && Number.isNaN(value))) return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatCostPerLead(value) {
  if (value == null || (typeof value === 'number' && Number.isNaN(value))) return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ChartSkeleton() {
  return (
    <div className="h-[240px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
      <div className="text-gray-400 text-sm">Loading chart…</div>
    </div>
  );
}

export default function InfluencerTracking() {
  const { logout } = useAuth();
  /** Mirror of saved links from InfluencerLinkCreationWorkspace (for detail modal). */
  const [savedLinksSnapshot, setSavedLinksSnapshot] = useState([]);
  const [copyAnalyticsModalOpen, setCopyAnalyticsModalOpen] = useState(false);

  const [analytics, setAnalytics] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [analyticsFilters, setAnalyticsFilters] = useState({
    from: '',
    to: '',
    sort: 'registrations',
    preset: '',
  });
  const [analyticsSearch, setAnalyticsSearch] = useState('');

  const [detailInfluencer, setDetailInfluencer] = useState(null);
  const [detailLeads, setDetailLeads] = useState([]);
  const [detailLeadsPagination, setDetailLeadsPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [detailLeadsLoading, setDetailLeadsLoading] = useState(false);
  const [copiedDetailLinkId, setCopiedDetailLinkId] = useState(null);

  const navigate = useNavigate();
  const token = getStoredToken();

  const fetchAnalytics = useCallback(() => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    const params = {};
    if (analyticsFilters.from) params.from = analyticsFilters.from;
    if (analyticsFilters.to) params.to = analyticsFilters.to;
    if (analyticsFilters.sort) params.sort = analyticsFilters.sort;
    getInfluencerAnalytics(params, token).then((result) => {
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setAnalyticsError(result.message || 'Failed to load analytics');
        setAnalyticsLoading(false);
        return;
      }
      setAnalytics(result.data?.data ?? []);
      setAnalyticsLoading(false);
    });
  }, [token, analyticsFilters.from, analyticsFilters.to, analyticsFilters.sort, logout]);

  const fetchTrend = useCallback(() => {
    setTrendLoading(true);
    const params = {};
    if (analyticsFilters.from) params.from = analyticsFilters.from;
    if (analyticsFilters.to) params.to = analyticsFilters.to;
    getInfluencerAnalyticsTrend(params, token).then((result) => {
      if (!result.success) {
        setTrendData([]);
      } else {
        setTrendData(result.data?.data ?? []);
      }
      setTrendLoading(false);
    });
  }, [token, analyticsFilters.from, analyticsFilters.to]);

  useEffect(() => {
    const t = setTimeout(() => fetchAnalytics(), 0);
    return () => clearTimeout(t);
  }, [fetchAnalytics]);

  useEffect(() => {
    const t = setTimeout(() => fetchTrend(), 0);
    return () => clearTimeout(t);
  }, [fetchTrend]);

  // Refetch when user returns to this tab (e.g. after deleting data in MongoDB) so data stays live
  useEffect(() => {
    const onFocus = () => {
      fetchAnalytics();
      fetchTrend();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchAnalytics, fetchTrend]);

  // Poll analytics/trend every 60s while tab is visible so MongoDB changes show up live
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchAnalytics();
        fetchTrend();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchAnalytics, fetchTrend]);

  const totalRegistrations = useMemo(
    () => analytics.reduce((sum, r) => sum + (r.totalRegistrations ?? 0), 0),
    [analytics]
  );
  const topInfluencer = useMemo(() => {
    if (analytics.length === 0) return null;
    const top = analytics.reduce((a, b) =>
      (a.totalRegistrations ?? 0) >= (b.totalRegistrations ?? 0) ? a : b
    );
    return top.influencerName ?? '—';
  }, [analytics]);

  // Bar chart: always top 10 by registration count (crystal-clear, accurate)
  const barChartData = useMemo(() => {
    const byCount = [...analytics].sort((a, b) => (b.totalRegistrations ?? 0) - (a.totalRegistrations ?? 0));
    return byCount.slice(0, 10).map((r) => ({
      name: (r.influencerName || '').length > 14 ? (r.influencerName || '').slice(0, 14) + '…' : (r.influencerName || '—'),
      fullName: r.influencerName || '—',
      registrations: r.totalRegistrations ?? 0,
    }));
  }, [analytics]);

  const filteredAnalytics = useMemo(() => {
    if (!analyticsSearch.trim()) return analytics;
    const q = analyticsSearch.trim().toLowerCase();
    return analytics.filter((r) => (r.influencerName || '').toLowerCase().includes(q));
  }, [analytics, analyticsSearch]);

  const detailLinksForName = useMemo(() => {
    if (!detailInfluencer?.name) return [];
    const key = normalizeInfluencerName(detailInfluencer.name);
    return savedLinksSnapshot.filter((l) => normalizeInfluencerName(l.influencerName) === key);
  }, [detailInfluencer?.name, savedLinksSnapshot]);

  const detailTotalLeads = useMemo(() => {
    if (!detailInfluencer?.name) return 0;
    const key = normalizeInfluencerName(detailInfluencer.name);
    return analytics
      .filter((r) => normalizeInfluencerName(r.influencerName) === key)
      .reduce((sum, r) => sum + (r.totalRegistrations ?? 0), 0);
  }, [detailInfluencer?.name, analytics]);

  const fetchDetailLeads = useCallback(() => {
    if (!detailInfluencer?.name) return;
    setDetailLeadsLoading(true);
    getAdminLeads(
      {
        page: detailLeadsPagination.page,
        limit: detailLeadsPagination.limit,
        utm_content: detailInfluencer.name,
      },
      token
    ).then((result) => {
      setDetailLeadsLoading(false);
      if (!result.success) {
        setDetailLeads([]);
        setDetailLeadsPagination((p) => ({ ...p, total: 0, totalPages: 1 }));
        return;
      }
      const data = result.data?.data ?? [];
      const pagination = result.data?.pagination ?? {};
      setDetailLeads(data);
      setDetailLeadsPagination((p) => ({
        ...p,
        total: pagination.total ?? 0,
        totalPages: pagination.totalPages ?? 1,
      }));
    });
  }, [detailInfluencer?.name, token, detailLeadsPagination.page, detailLeadsPagination.limit]);

  useEffect(() => {
    if (!detailInfluencer) return;
    fetchDetailLeads();
  }, [detailInfluencer, detailLeadsPagination.page, fetchDetailLeads]);

  const openDetailView = (name, platform) => {
    if (!name) return;
    setDetailInfluencer({ name, platform: platform || '' });
    setDetailLeadsPagination((p) => ({ ...p, page: 1 }));
  };

  const copyDetailLinkUrl = (url, id) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedDetailLinkId(id);
      setTimeout(() => setCopiedDetailLinkId(null), 2000);
    });
  };

  const setDatePreset = (preset) => {
    const { from, to } = getDatePresetRange(preset);
    setAnalyticsFilters((p) => ({ ...p, from, to, preset }));
  };

  const exportAnalyticsCsv = () => {
    const headers = ['Influencer Name', 'Platform', 'Total Registrations', 'Latest Registration'];
    const rows = filteredAnalytics.map((r) => [
      r.influencerName ?? '',
      r.platform ?? '',
      r.totalRegistrations ?? 0,
      r.latestRegistration ? formatDate(r.latestRegistration) : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `influencer-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cardClass = 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden';
  const sectionHeaderClass = 'px-6 py-4 border-b border-gray-200 bg-gray-50/80 border-l-4 border-l-primary-navy';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Influencer Tracking</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create trackable registration links and view performance by influencer.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardClass + ' p-4'}>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FiLink className="w-4 h-4" />
            <span>Saved links</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{savedLinksSnapshot.length}</p>
        </div>
        <div className={cardClass + ' p-4'}>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FiBarChart2 className="w-4 h-4" />
            <span>Total registrations</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {analyticsLoading ? '—' : totalRegistrations}
          </p>
        </div>
        <div className={cardClass + ' p-4'}>
          <div className="text-gray-500 text-sm">Top influencer</div>
          <p className="text-lg font-medium text-gray-900 mt-1 truncate" title={topInfluencer || ''}>
            {analyticsLoading ? '—' : (topInfluencer || '—')}
          </p>
        </div>
        <div className={cardClass + ' p-4'}>
          <div className="text-gray-500 text-sm">In range</div>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {analyticsFilters.from || analyticsFilters.to ? totalRegistrations : 'All time'}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <div className={sectionHeaderClass}>
            <h3 className="text-sm font-semibold text-gray-800">Registrations by influencer</h3>
            <p className="text-xs text-gray-500 mt-0.5">Top 10 by registration count (current date range)</p>
          </div>
          <div className="p-4 h-[240px] min-h-[200px] w-full min-w-0">
            {analyticsLoading ? (
              <ChartSkeleton />
            ) : barChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <BarChart data={barChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [value, 'Registrations']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="registrations" fill="#003366" name="Registrations" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className={cardClass}>
          <div className={sectionHeaderClass}>
            <h3 className="text-sm font-semibold text-gray-800">Registrations over time</h3>
            <p className="text-xs text-gray-500 mt-0.5">Daily count (IST), current date range</p>
          </div>
          <div className="p-4 h-[240px] min-h-[200px] w-full min-w-0">
            {trendLoading ? (
              <ChartSkeleton />
            ) : trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => (v && v.length >= 10 ? `${v.slice(8, 10)}/${v.slice(5, 7)}` : v)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [value, 'Registrations']}
                    labelFormatter={(label) => (label ? formatChartDate(label) : '')}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#003366" strokeWidth={2} name="Registrations" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <InfluencerLinkCreationWorkspace
        onLinksMutated={() => {
          fetchAnalytics();
          fetchTrend();
        }}
        onLinksUpdated={setSavedLinksSnapshot}
        onAfterSave={(name, platform) => openDetailView(name, platform)}
        onOpenInfluencerDetail={openDetailView}
      />

      {/* Analytics */}
      <section className={cardClass}>
        <div className={sectionHeaderClass + ' flex flex-wrap items-center justify-between gap-4'}>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Influencer Analytics</h2>
            <p className="text-sm text-gray-500 mt-0.5">Registrations attributed to each influencer (slot booking completed).</p>
            <p className="text-xs text-gray-500 mt-0.5">Only influencers with a saved link are shown.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['7', '30', 'month', ''].map((preset) => (
              <button
                key={preset || 'all'}
                type="button"
                onClick={() => setDatePreset(preset)}
                className={`text-sm px-3 py-1.5 rounded-lg border ${analyticsFilters.preset === preset ? 'bg-primary-navy text-white border-primary-navy' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {preset === '7' ? 'Last 7 days' : preset === '30' ? 'Last 30 days' : preset === 'month' ? 'This month' : 'All time'}
              </button>
            ))}
            <div className="flex gap-2">
              <input type="date" value={analyticsFilters.from} onChange={(e) => setAnalyticsFilters((p) => ({ ...p, from: e.target.value, preset: '' }))} className="rounded border border-gray-300 px-2 py-1.5 text-sm" />
              <input type="date" value={analyticsFilters.to} onChange={(e) => setAnalyticsFilters((p) => ({ ...p, to: e.target.value, preset: '' }))} className="rounded border border-gray-300 px-2 py-1.5 text-sm" />
            </div>
            <select value={analyticsFilters.sort} onChange={(e) => setAnalyticsFilters((p) => ({ ...p, sort: e.target.value }))} className="rounded border border-gray-300 px-2 py-1.5 text-sm bg-white">
              <option value="registrations">Sort: Registrations</option>
              <option value="latest">Sort: Latest</option>
            </select>
            <button type="button" onClick={fetchAnalytics} disabled={analyticsLoading} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-50" title="Refresh">
              <FiRefreshCw className={`w-5 h-5 ${analyticsLoading ? 'animate-spin' : ''}`} />
            </button>
            <button type="button" onClick={exportAnalyticsCsv} disabled={filteredAnalytics.length === 0} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Export CSV</button>
          </div>
        </div>
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search by influencer name"
            value={analyticsSearch}
            onChange={(e) => setAnalyticsSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-56 focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none"
          />
          <button
            type="button"
            onClick={() => setCopyAnalyticsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Copy to sheets"
          >
            <FiCopy className="w-4 h-4" /> Copy
          </button>
        </div>
        {analyticsLoading ? (
          <div className="px-6 py-8"><TableSkeleton rows={6} cols={4} /></div>
        ) : analyticsError ? (
          <div className="px-6 py-6"><p className="text-red-600 text-sm" role="alert">{analyticsError}</p></div>
        ) : filteredAnalytics.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm">No influencer data yet.</p>
            <p className="text-gray-400 text-xs mt-1">Registrations with UTM parameters will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Influencer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Registrations</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Latest Registration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAnalytics.map((row, idx) => (
                  <tr key={(row.influencerName || '') + idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60 hover:bg-primary-blue-50/30'}>
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() => openDetailView(row.influencerName, row.platform)}
                        className="font-medium text-gray-900 hover:text-primary-navy hover:underline text-left"
                      >
                        {row.influencerName ?? '—'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.platform ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{row.totalRegistrations ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(row.latestRegistration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CopyToSheetsModal
        fields={ANALYTICS_COPY_FIELDS}
        records={filteredAnalytics}
        getCellValue={getAnalyticsCellValue}
        open={copyAnalyticsModalOpen}
        onClose={() => setCopyAnalyticsModalOpen(false)}
        recordLabel="influencers"
      />

      {/* Influencer detail modal: links + leads for this name */}
      {detailInfluencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h2 id="detail-modal-title" className="text-lg font-semibold text-gray-900">
                Influencer: {detailInfluencer.name}
                {detailInfluencer.platform ? ` (${detailInfluencer.platform})` : ''}
              </h2>
              <button
                type="button"
                onClick={() => setDetailInfluencer(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Links created</p>
                  <p className="text-2xl font-semibold text-gray-900">{detailLinksForName.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Leads captured</p>
                  <p className="text-2xl font-semibold text-gray-900">{detailTotalLeads}</p>
                </div>
              </div>

              <section>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Links for this name</h3>
                {detailLinksForName.length === 0 ? (
                  <p className="text-sm text-gray-500">No saved links for this influencer.</p>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Platform</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Campaign</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">UTM Link</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date created</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Leads</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Cost</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Cost per lead</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Latest lead</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detailLinksForName.map((link) => (
                          <tr key={link.id} className="bg-white hover:bg-gray-50/50">
                            <td className="px-4 py-2 text-sm text-gray-900">{link.platform ?? '—'}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{link.campaign ?? '—'}</td>
                            <td className="px-4 py-2 text-sm max-w-[220px]">
                              <a href={link.utmLink} target="_blank" rel="noopener noreferrer" className="text-primary-navy hover:underline truncate block font-mono text-xs" title={link.utmLink}>
                                {link.utmLink}
                              </a>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">{formatDate(link.createdAt)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{link.leadCount ?? 0}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 text-right">{formatCost(link.cost)}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 text-right">{formatCostPerLead(link.costPerLead)}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{link.latestLeadAt ? formatDate(link.latestLeadAt) : '—'}</td>
                            <td className="px-4 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => copyDetailLinkUrl(link.utmLink, link.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-100"
                              >
                                <FiCopy className="w-4 h-4" /> {copiedDetailLinkId === link.id ? 'Copied' : 'Copy'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Leads for this name</h3>
                {detailLeadsLoading ? (
                  <div className="py-6"><TableSkeleton rows={4} cols={5} /></div>
                ) : detailLeads.length === 0 && detailLeadsPagination.total === 0 ? (
                  <p className="text-sm text-gray-500">No leads attributed to this influencer yet.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {detailLeads.map((lead) => (
                            <tr key={lead.id} className="bg-white hover:bg-gray-50/50">
                              <td className="px-4 py-2 text-sm text-gray-900">{lead.fullName || '—'}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{lead.phone || '—'}</td>
                              <td className="px-4 py-2 text-sm">
                                {lead.applicationStatus ? (
                                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                    lead.applicationStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                    lead.applicationStatus === 'registered' ? 'bg-blue-100 text-blue-800' :
                                    'bg-amber-100 text-amber-800'
                                  }`}>
                                    {lead.applicationStatus}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">{formatDate(lead.createdAt)}</td>
                              <td className="px-4 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDetailInfluencer(null);
                                    navigate(`/admin/leads?utm_content=${encodeURIComponent(detailInfluencer.name)}`);
                                  }}
                                  className="inline-flex items-center gap-1 text-primary-navy hover:underline text-sm font-medium"
                                >
                                  <FiEye className="w-4 h-4" /> View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {detailLeadsPagination.totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                        <p className="text-sm text-gray-500">
                          Showing {(detailLeadsPagination.page - 1) * detailLeadsPagination.limit + 1}–
                          {Math.min(detailLeadsPagination.page * detailLeadsPagination.limit, detailLeadsPagination.total)} of {detailLeadsPagination.total}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailLeadsPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                            disabled={detailLeadsPagination.page <= 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-600 self-center">Page {detailLeadsPagination.page} of {detailLeadsPagination.totalPages}</span>
                          <button
                            type="button"
                            onClick={() => setDetailLeadsPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                            disabled={detailLeadsPagination.page >= detailLeadsPagination.totalPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
