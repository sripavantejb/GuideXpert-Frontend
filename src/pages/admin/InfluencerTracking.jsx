import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCopy, FiSave, FiRefreshCw, FiTrash2, FiLink, FiBarChart2, FiEye, FiX } from 'react-icons/fi';
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
  getInfluencerLinks,
  createInfluencerLink,
  deleteInfluencerLink,
  getInfluencerAnalytics,
  getInfluencerAnalyticsTrend,
  getAdminLeads,
  getStoredToken,
} from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

const PLATFORMS = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Telegram', label: 'Telegram' },
];

const DEFAULT_CAMPAIGN = 'guide_xperts';

const LINKS_SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date created (newest first)' },
  { value: 'date-asc', label: 'Date created (oldest first)' },
  { value: 'name-asc', label: 'Influencer name A–Z' },
  { value: 'name-desc', label: 'Influencer name Z–A' },
  { value: 'platform', label: 'Platform' },
];

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

function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded flex-1 max-w-[120px]" />
          ))}
        </div>
      ))}
    </div>
  );
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
  const [form, setForm] = useState({
    influencerName: '',
    platform: 'Instagram',
    campaign: DEFAULT_CAMPAIGN,
  });
  const [generatedLink, setGeneratedLink] = useState(null);
  const [linkError, setLinkError] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [savedLinks, setSavedLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  const [savedLinksSearch, setSavedLinksSearch] = useState('');
  const [savedLinksPlatform, setSavedLinksPlatform] = useState('');
  const [linksSort, setLinksSort] = useState('date-desc');
  const [linksPage, setLinksPage] = useState(1);
  const linksPerPage = 10;
  const [selectedLinkIds, setSelectedLinkIds] = useState(new Set());
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

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

  const navigate = useNavigate();
  const token = getStoredToken();

  const fetchLinks = useCallback(() => {
    setLinksLoading(true);
    setLinksError('');
    getInfluencerLinks(token).then((result) => {
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setLinksError(result.message || 'Failed to load links');
        setLinksLoading(false);
        return;
      }
      setSavedLinks(result.data?.data ?? []);
      setLinksLoading(false);
    });
  }, [token, logout]);

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
    const t = setTimeout(() => fetchLinks(), 0);
    return () => clearTimeout(t);
  }, [fetchLinks]);

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
      fetchLinks();
      fetchAnalytics();
      fetchTrend();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchLinks, fetchAnalytics, fetchTrend]);

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

  const filteredSavedLinks = useMemo(() => {
    let list = savedLinks;
    const q = savedLinksSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          (l.influencerName || '').toLowerCase().includes(q) ||
          (l.campaign || '').toLowerCase().includes(q)
      );
    }
    if (savedLinksPlatform) {
      list = list.filter((l) => l.platform === savedLinksPlatform);
    }
    if (linksSort === 'date-desc') list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (linksSort === 'date-asc') list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (linksSort === 'name-asc') list = [...list].sort((a, b) => (a.influencerName || '').localeCompare(b.influencerName || ''));
    else if (linksSort === 'name-desc') list = [...list].sort((a, b) => (b.influencerName || '').localeCompare(a.influencerName || ''));
    else if (linksSort === 'platform') list = [...list].sort((a, b) => (a.platform || '').localeCompare(b.platform || ''));
    return list;
  }, [savedLinks, savedLinksSearch, savedLinksPlatform, linksSort]);

  const paginatedLinks = useMemo(() => {
    const start = (linksPage - 1) * linksPerPage;
    return filteredSavedLinks.slice(start, start + linksPerPage);
  }, [filteredSavedLinks, linksPage, linksPerPage]);

  const linksTotalPages = Math.max(1, Math.ceil(filteredSavedLinks.length / linksPerPage));

  const filteredAnalytics = useMemo(() => {
    if (!analyticsSearch.trim()) return analytics;
    const q = analyticsSearch.trim().toLowerCase();
    return analytics.filter((r) => (r.influencerName || '').toLowerCase().includes(q));
  }, [analytics, analyticsSearch]);

  const detailLinksForName = useMemo(() => {
    if (!detailInfluencer?.name) return [];
    const key = normalizeInfluencerName(detailInfluencer.name);
    return savedLinks.filter((l) => normalizeInfluencerName(l.influencerName) === key);
  }, [detailInfluencer?.name, savedLinks]);

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLinkError('');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLinkError('');
    if (!form.influencerName.trim()) {
      setLinkError('Influencer name is required.');
      return;
    }
    setLinkLoading(true);
    setGeneratedLink(null);
    const result = await createInfluencerLink(
      {
        influencerName: form.influencerName.trim(),
        platform: form.platform,
        campaign: form.campaign.trim() || DEFAULT_CAMPAIGN,
      },
      false,
      token
    );
    setLinkLoading(false);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setLinkError(result.message || 'Failed to generate link');
      return;
    }
    setGeneratedLink(result.data?.data?.utmLink ?? null);
  };

  const handleCopy = (url, id) => {
    const toCopy = url || generatedLink;
    if (!toCopy) return;
    navigator.clipboard.writeText(toCopy).then(() => {
      if (id) {
        setCopiedLinkId(id);
        setTimeout(() => setCopiedLinkId(null), 2000);
      } else {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      }
    });
  };

  const handleSave = async () => {
    if (!form.influencerName.trim()) return;
    setSaveLoading(true);
    setLinkError('');
    const result = await createInfluencerLink(
      {
        influencerName: form.influencerName.trim(),
        platform: form.platform,
        campaign: form.campaign.trim() || DEFAULT_CAMPAIGN,
      },
      true,
      token
    );
    setSaveLoading(false);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setLinkError(result.message || 'Failed to save link');
      return;
    }
    setGeneratedLink(result.data?.data?.utmLink ?? generatedLink);
    fetchLinks();
    openDetailView(form.influencerName.trim(), form.platform);
  };

  const openDetailView = (name, platform) => {
    if (!name) return;
    setDetailInfluencer({ name, platform: platform || '' });
    setDetailLeadsPagination((p) => ({ ...p, page: 1 }));
  };

  const handleDeleteClick = (link) => setLinkToDelete(link);

  const handleDeleteConfirm = async () => {
    if (!linkToDelete?.id) {
      setLinkToDelete(null);
      return;
    }
    setDeletingId(linkToDelete.id);
    setLinksError('');
    const result = await deleteInfluencerLink(linkToDelete.id, token);
    setDeletingId(null);
    setLinkToDelete(null);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setLinksError(result.message || 'Failed to delete link');
      return;
    }
    fetchLinks();
    fetchAnalytics();
    fetchTrend();
  };

  const handleBulkDeleteConfirm = async () => {
    const ids = Array.from(selectedLinkIds);
    if (ids.length === 0) {
      setBulkDeleteConfirm(false);
      return;
    }
    setLinksError('');
    for (const id of ids) {
      await deleteInfluencerLink(id, token);
    }
    setSelectedLinkIds(new Set());
    setBulkDeleteConfirm(false);
    fetchLinks();
    fetchAnalytics();
    fetchTrend();
  };

  const toggleSelectLink = (id) => {
    setSelectedLinkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllLinks = () => {
    if (selectedLinkIds.size === paginatedLinks.length) {
      setSelectedLinkIds(new Set());
    } else {
      setSelectedLinkIds(new Set(paginatedLinks.map((l) => l.id)));
    }
  };

  const setDatePreset = (preset) => {
    const { from, to } = getDatePresetRange(preset);
    setAnalyticsFilters((p) => ({ ...p, from, to, preset }));
  };

  const exportLinksCsv = () => {
    const headers = ['Influencer', 'Platform', 'Campaign', 'UTM Link', 'Date created'];
    const rows = filteredSavedLinks.map((l) => [
      l.influencerName ?? '',
      l.platform ?? '',
      l.campaign ?? '',
      l.utmLink ?? '',
      l.createdAt ? formatDate(l.createdAt) : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `influencer-links-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <p className="text-2xl font-semibold text-gray-900 mt-1">{savedLinks.length}</p>
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
          <div className="p-4 h-[240px]">
            {analyticsLoading ? (
              <ChartSkeleton />
            ) : barChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
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
          <div className="p-4 h-[240px]">
            {trendLoading ? (
              <ChartSkeleton />
            ) : trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
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

      {/* Generate UTM Link */}
      <section className={cardClass}>
        <div className={sectionHeaderClass}>
          <h2 className="text-base font-semibold text-gray-800">Generate UTM Link</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Create a unique registration link. Copy to share or Save to store below.
          </p>
        </div>
        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label htmlFor="influencerName" className="block text-sm font-medium text-gray-700 mb-1.5">Influencer Name</label>
              <input
                id="influencerName"
                name="influencerName"
                type="text"
                value={form.influencerName}
                onChange={handleFormChange}
                placeholder="e.g. John Doe"
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none"
              />
            </div>
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1.5">Platform</label>
              <select
                id="platform"
                name="platform"
                value={form.platform}
                onChange={handleFormChange}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none bg-white"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-1.5">Campaign Name</label>
              <input
                id="campaign"
                name="campaign"
                type="text"
                value={form.campaign}
                onChange={handleFormChange}
                placeholder={DEFAULT_CAMPAIGN}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none"
              />
            </div>
          </div>
          {linkError && <p className="text-sm text-red-600" role="alert">{linkError}</p>}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={linkLoading || !form.influencerName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-navy hover:bg-primary-navy/90 focus:ring-2 focus:ring-primary-navy focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {linkLoading ? 'Generating…' : 'Generate Link'}
            </button>
            {generatedLink && (
              <>
                <button type="button" onClick={() => handleCopy(null)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300">
                  <FiCopy className="w-4 h-4" />{copyFeedback ? 'Copied' : 'Copy'}
                </button>
                <button type="button" onClick={handleSave} disabled={saveLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-navy hover:bg-primary-navy/90 disabled:opacity-50">
                  <FiSave className="w-4 h-4" />{saveLoading ? 'Saving…' : 'Save to list'}
                </button>
              </>
            )}
          </div>
          {generatedLink && (
            <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-1">Generated link</p>
              <p className="text-sm text-gray-800 break-all font-mono">{generatedLink}</p>
            </div>
          )}
        </form>
      </section>

      {/* Saved links */}
      <section className={cardClass}>
        <div className={sectionHeaderClass + ' flex flex-wrap items-center justify-between gap-4'}>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Saved Influencer Links</h2>
            <p className="text-sm text-gray-500 mt-0.5">Links saved for reuse. Leads column shows count per link. Search, filter, export or bulk delete.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={fetchLinks} disabled={linksLoading} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-50" title="Refresh">
              <FiRefreshCw className={`w-5 h-5 ${linksLoading ? 'animate-spin' : ''}`} />
            </button>
            <button type="button" onClick={exportLinksCsv} disabled={filteredSavedLinks.length === 0} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
              Export CSV
            </button>
          </div>
        </div>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <input
            type="search"
            placeholder="Search by influencer or campaign"
            value={savedLinksSearch}
            onChange={(e) => { setSavedLinksSearch(e.target.value); setLinksPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-56 focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none"
          />
          <select
            value={savedLinksPlatform}
            onChange={(e) => { setSavedLinksPlatform(e.target.value); setLinksPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none bg-white"
          >
            <option value="">All platforms</option>
            {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select
            value={linksSort}
            onChange={(e) => setLinksSort(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/30 outline-none bg-white"
          >
            {LINKS_SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {(savedLinksSearch || savedLinksPlatform) && (
            <span className="text-sm text-gray-500 self-center">Showing {filteredSavedLinks.length} of {savedLinks.length} links</span>
          )}
          {selectedLinkIds.size > 0 && (
            <button
              type="button"
              onClick={() => setBulkDeleteConfirm(true)}
              className="text-sm px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete selected ({selectedLinkIds.size})
            </button>
          )}
        </div>
        {linksLoading ? (
          <div className="px-6 py-8"><TableSkeleton rows={8} cols={9} /></div>
        ) : linksError ? (
          <div className="px-6 py-6"><p className="text-red-600 text-sm" role="alert">{linksError}</p></div>
        ) : filteredSavedLinks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm">No saved links yet.</p>
            <p className="text-gray-400 text-xs mt-1">Generate and save a link above to see it here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 w-10">
                      <input
                        type="checkbox"
                        checked={paginatedLinks.length > 0 && selectedLinkIds.size === paginatedLinks.length}
                        onChange={toggleSelectAllLinks}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Influencer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">UTM Link</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date created</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Leads</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Latest lead</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedLinks.map((link, i) => (
                    <tr key={link.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60 hover:bg-primary-blue-50/30'}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedLinkIds.has(link.id)}
                          onChange={() => toggleSelectLink(link.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDetailView(link.influencerName, link.platform)}
                            className="font-medium text-gray-900 hover:text-primary-navy hover:underline text-left"
                          >
                            {link.influencerName}
                          </button>
                          {(() => {
                            const sameNameCount = savedLinks.filter(
                              (l) => normalizeInfluencerName(l.influencerName) === normalizeInfluencerName(link.influencerName)
                            ).length;
                            if (sameNameCount > 1) {
                              return (
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {sameNameCount} links
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{link.platform}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{link.campaign}</td>
                      <td className="px-6 py-3 text-sm max-w-[200px]">
                        <a href={link.utmLink} target="_blank" rel="noopener noreferrer" title={link.utmLink} className="text-primary-navy hover:underline truncate block font-mono text-xs">
                          {link.utmLink}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{formatDate(link.createdAt)}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">{link.leadCount ?? 0}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{link.latestLeadAt ? formatDate(link.latestLeadAt) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {linksTotalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">Page {linksPage} of {linksTotalPages}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setLinksPage((p) => Math.max(1, p - 1))} disabled={linksPage <= 1} className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50">Previous</button>
                  <button type="button" onClick={() => setLinksPage((p) => Math.min(linksTotalPages, p + 1))} disabled={linksPage >= linksTotalPages} className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

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
        <div className="p-4 border-b border-gray-100">
          <input
            type="search"
            placeholder="Search by influencer name"
            value={analyticsSearch}
            onChange={(e) => setAnalyticsSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-56 focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none"
          />
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
                            <td className="px-4 py-2 text-sm text-gray-500">{link.latestLeadAt ? formatDate(link.latestLeadAt) : '—'}</td>
                            <td className="px-4 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleCopy(link.utmLink, link.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-100"
                              >
                                <FiCopy className="w-4 h-4" /> {copiedLinkId === link.id ? 'Copied' : 'Copy'}
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

      {/* Delete single modal */}
      {linkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-800">Delete link?</h3>
            <p className="text-sm text-gray-600 mt-2">Delete the link for &quot;{linkToDelete.influencerName}&quot;? This cannot be undone.</p>
            <div className="flex gap-3 mt-6 justify-end">
              <button type="button" onClick={() => setLinkToDelete(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete modal */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-800">Delete selected links?</h3>
            <p className="text-sm text-gray-600 mt-2">Delete {selectedLinkIds.size} link(s)? This cannot be undone.</p>
            <div className="flex gap-3 mt-6 justify-end">
              <button type="button" onClick={() => setBulkDeleteConfirm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleBulkDeleteConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">Delete all</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
