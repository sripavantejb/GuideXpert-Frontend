import { useState, useEffect, useCallback } from 'react';
import {
  FiImage,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiAlertCircle,
  FiDownload,
  FiUser,
  FiCalendar,
  FiFilter,
} from 'react-icons/fi';
import { getPosterDownloads, getStoredToken, getAdminApiBaseUrl } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import TableSkeleton from '../../components/UI/TableSkeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

const POSTER_FILTER_OPTIONS = [
  { value: '', label: 'All posters' },
  { value: 'holi', label: 'Holi' },
  { value: 'inter', label: 'Inter' },
  { value: 'gx', label: 'GX' },
  { value: 'sid', label: 'SID' },
  { value: 'jee', label: 'JEE' },
  { value: 'certified', label: 'Certified' },
];

const POSTER_LABELS = {
  holi: 'Holi',
  inter: 'Inter',
  gx: 'GX',
  sid: 'SID',
  jee: 'JEE',
  certified: 'Certified',
};

const POSTER_COLORS = {
  Holi: '#e11d48',
  Inter: '#7c3aed',
  GX: '#003366',
  SID: '#0891b2',
  JEE: '#0f766e',
  Certified: '#059669',
};

const DATE_PRESETS = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'This month', value: 'month' },
  { label: 'All time', value: '' },
];

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

function posterBadge(key) {
  const label = POSTER_LABELS[key] || key;
  const colorMap = {
    holi: 'bg-rose-50 text-rose-700 ring-rose-200/60',
    inter: 'bg-violet-50 text-violet-700 ring-violet-200/60',
    gx: 'bg-sky-50 text-sky-700 ring-sky-200/60',
    sid: 'bg-cyan-50 text-cyan-700 ring-cyan-200/60',
    jee: 'bg-teal-50 text-teal-700 ring-teal-200/60',
    certified: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  };
  const cls = colorMap[key] || 'bg-gray-100 text-gray-600 ring-gray-200/60';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ${cls}`}>
      {label}
    </span>
  );
}

function formatBadge(fmt) {
  const upper = String(fmt).toUpperCase();
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.6875rem] font-bold tracking-wider bg-gray-100 text-gray-600">
      {upper}
    </span>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white shadow-lg border border-gray-200 px-3 py-2">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        {payload[0].value} download{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export default function PosterDownloads() {
  const { logout } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [byPoster, setByPoster] = useState([]);
  const [datePreset, setDatePreset] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    posterKey: '',
    q: '',
  });

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await getPosterDownloads(
      {
        page,
        limit,
        includeStats: true,
        from: filters.from || undefined,
        to: filters.to || undefined,
        posterKey: filters.posterKey || undefined,
        q: filters.q.trim() || undefined,
      },
      getStoredToken()
    );
    setLoading(false);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      if (result.status === 404) {
        setError(
          `Poster downloads API not found (404). Current base: ${getAdminApiBaseUrl()}. Redeploy backend with poster-downloads routes.`
        );
        setItems([]);
        setTotal(0);
        setTotalPages(1);
        setByPoster([]);
        return;
      }
      setError(result.message || 'Failed to load poster downloads');
      return;
    }
    const payload = result.data?.data ?? result.data;
    setItems(payload?.items || []);
    setTotal(payload?.total ?? 0);
    setTotalPages(Math.max(1, payload?.totalPages ?? 1));
    const st = payload?.stats;
    setByPoster(st?.byPoster || []);
  }, [page, limit, filters.from, filters.to, filters.posterKey, filters.q, logout]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const setFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  };

  const handleDatePreset = (preset) => {
    setDatePreset(preset);
    const { from, to } = getDatePresetRange(preset);
    setFilters((p) => ({ ...p, from, to }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ from: '', to: '', posterKey: '', q: '' });
    setDatePreset('');
    setPage(1);
  };

  const hasActiveFilters = filters.from || filters.to || filters.posterKey || filters.q;

  const chartData = byPoster.map((row) => ({
    name: POSTER_LABELS[row.posterKey] || row.posterKey,
    count: row.count,
    fill: POSTER_COLORS[POSTER_LABELS[row.posterKey]] || '#003366',
  }));

  const totalDownloads = byPoster.reduce((s, r) => s + (r.count || 0), 0);
  const linkedCount = items.filter((r) => r.counsellor).length;

  return (
    <div className="max-w-[1400px] mx-auto px-1 pb-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#003366] to-[#004d99] text-white shadow-lg">
            <FiImage className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Poster Downloads</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Who downloaded which poster, format, and whether they match a counsellor account
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              filtersOpen || hasActiveFilters
                ? 'bg-[#003366] text-white shadow-md hover:bg-[#004080]'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-[0.625rem] font-bold">
                {[filters.from, filters.to, filters.posterKey, filters.q].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => loadPage()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Stats strip */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#003366] to-[#004d99]" />
            <div className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#003366]/10 text-[#003366]">
                <FiDownload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalDownloads}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <div className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Linked</p>
                <p className="text-2xl font-bold text-gray-900">{linkedCount}<span className="text-sm font-normal text-gray-400">/{items.length}</span></p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-violet-400 to-violet-600" />
            <div className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 text-violet-600">
                <FiImage className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Posters</p>
                <p className="text-2xl font-bold text-gray-900">{byPoster.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-amber-600" />
            <div className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600">
                <FiCalendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Page</p>
                <p className="text-2xl font-bold text-gray-900">{page}<span className="text-sm font-normal text-gray-400">/{totalPages}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters panel */}
      {filtersOpen && (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 mb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Filters</h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[#003366] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => handleDatePreset(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  datePreset === p.value
                    ? 'bg-[#003366] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">From</span>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => { setFilter('from', e.target.value); setDatePreset(''); }}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">To</span>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => { setFilter('to', e.target.value); setDatePreset(''); }}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Poster type</span>
              <select
                value={filters.posterKey}
                onChange={(e) => setFilter('posterKey', e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
              >
                {POSTER_FILTER_OPTIONS.map((o) => (
                  <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search</span>
              <div className="mt-1.5 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  value={filters.q}
                  onChange={(e) => setFilter('q', e.target.value)}
                  placeholder="Name or mobile..."
                  className="block w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
                />
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Downloads by Poster</h2>
            <p className="text-xs text-gray-500 mt-0.5">Distribution across poster types</p>
          </div>
          {!loading && (
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
              {totalDownloads} total
            </span>
          )}
        </div>
        <div className="px-5 py-4">
          <div className="h-52 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#003366] border-t-transparent animate-spin" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FiImage className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">No downloads in this range</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,51,102,0.04)', radius: 8 }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Downloads" maxBarSize={64}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Download Events</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading ? 'Loading...' : `${total} event${total === 1 ? '' : 's'} tracked`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all"
              aria-label="Previous page"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-gray-600 tabular-nums px-2">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all"
              aria-label="Next page"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-5">
            <TableSkeleton rows={8} />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <FiDownload className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No downloads match your filters</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-xs font-semibold text-[#003366] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-5 py-3.5 text-left text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">Poster</th>
                  <th className="px-5 py-3.5 text-left text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">Format</th>
                  <th className="px-5 py-3.5 text-left text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">Counsellor</th>
                  <th className="px-5 py-3.5 text-left text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((row) => (
                  <tr key={row._id} className="group hover:bg-[#003366]/[0.015] transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm text-gray-800 font-medium">{formatDate(row.downloadedAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">{posterBadge(row.posterKey)}</td>
                    <td className="px-5 py-3.5">{formatBadge(row.format)}</td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      {row.counsellor ? (
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#003366]/10 text-[#003366] text-xs font-bold shrink-0">
                            {(row.counsellor.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{row.counsellor.name || '—'}</p>
                            {row.counsellor.phone && (
                              <p className="text-xs text-gray-500">+91 {row.counsellor.phone}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unlinked</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 max-w-[220px]">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 truncate">{row.displayNameSnapshot || '—'}</p>
                        {row.mobileSnapshot && (
                          <p className="text-xs text-gray-400 font-mono">{row.mobileSnapshot}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
