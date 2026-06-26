import { useState, useEffect, useRef } from 'react';
import { getNatCampaignSubmissions, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import {
  FiClipboard,
  FiUsers,
  FiSearch,
  FiSliders,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiInbox,
  FiCopy,
} from 'react-icons/fi';
import CopyToSheetsModal from '../../components/Admin/CopyToSheetsModal';
import { ADMIN_VIEW_ALL_LIMIT } from '../../constants/adminListLimits';
import { fetchAllPaginatedRows } from '../../utils/adminPagedFetch';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

const COLLEGE_LABELS = {
  'zenith-school-of-ai': 'Zenith School of AI',
  niat: 'NIAT',
  scaler: 'Scaler',
  newton: 'Newton',
  others: 'Others',
};

function formatCollegePreferences(row) {
  const preferences = Array.isArray(row.collegePreferences) ? row.collegePreferences : [];
  if (!preferences.length) return '—';

  return preferences
    .map((value) => {
      if (value === 'others') {
        return row.collegePreferenceOther ? `Others: ${row.collegePreferenceOther}` : 'Others';
      }
      return COLLEGE_LABELS[value] || value;
    })
    .join(', ');
}

const COPY_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'mobileNumber', label: 'Mobile' },
  { key: 'collegePreferences', label: 'College preferences' },
  { key: 'timestamp', label: 'Submitted' },
];

function getCellValue(row, key) {
  const v = row[key];
  if (key === 'timestamp') return v ? formatDate(v) : '';
  if (key === 'collegePreferences') return formatCollegePreferences(row);
  if (v == null || v === '') return '';
  return String(v);
}

export default function NatCampaignSubmissions() {
  const { logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', from: '', to: '' });
  const [viewAll, setViewAll] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyRecords, setCopyRecords] = useState([]);
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;
    const page = viewAll ? 1 : pagination.page;
    const limit = viewAll ? ADMIN_VIEW_ALL_LIMIT : pagination.limit;
    const params = {
      page,
      limit,
      q: filters.q.trim() || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    };
    queueMicrotask(() => {
      if (cancelledRef.current) return;
      setLoading(true);
      setError('');
    });
    getNatCampaignSubmissions(params, getStoredToken()).then((result) => {
      if (cancelledRef.current) return;
      if (thisRequestId !== requestIdRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load One on One IIT Session submissions');
        return;
      }
      const dataList = result.data?.data || [];
      const paginationData = result.data?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 };
      setRecords(dataList);
      setPagination(paginationData);
    });
    return () => { cancelledRef.current = true; };
  }, [viewAll, pagination.page, pagination.limit, filters.q, filters.from, filters.to, logout]);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleViewAllChange = (e) => {
    setViewAll(e.target.checked);
    if (!e.target.checked) setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ q: '', from: '', to: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = filters.q || filters.from || filters.to;

  const prepareCopyRecords = async () => {
    setCopyLoading(true);
    setError('');
    const baseParams = {
      q: filters.q.trim() || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    };
    const result = await fetchAllPaginatedRows((page, limit) =>
      getNatCampaignSubmissions({ ...baseParams, page, limit }, getStoredToken())
    );
    setCopyLoading(false);
    if (!result.success) {
      const r = result.result;
      if (r?.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(r?.message || 'Failed to load records for copy');
      return;
    }
    setCopyRecords(result.rows || []);
    setCopyModalOpen(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-1">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#673ab7] text-white shadow-lg">
            <FiClipboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">One on One IIT Session</h1>
            <p className="text-sm text-gray-500 mt-0.5">Form submissions from /nat-campaign</p>
          </div>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden md:col-span-2">
            <div className="h-1 w-full bg-[#673ab7]" />
            <div className="p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#673ab7]/10 text-[#673ab7]">
                <FiUsers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total submissions</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden mb-6">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center gap-2">
          <FiSliders className="w-5 h-5 text-gray-500" />
          <span className="font-semibold text-gray-800">Filters</span>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search name or mobile..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none text-sm"
                aria-label="Search"
              />
            </div>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              className="py-2.5 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#673ab7]/20 outline-none text-sm min-w-[140px]"
              aria-label="From date"
            />
            <input
              type="date"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              className="py-2.5 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#673ab7]/20 outline-none text-sm min-w-[140px]"
              aria-label="To date"
            />
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 ml-2 pl-2 border-l border-gray-200">
              <input
                type="checkbox"
                checked={viewAll}
                onChange={handleViewAllChange}
                className="rounded border-gray-300 text-[#673ab7] focus:ring-[#673ab7]"
                aria-label="View all in one list"
              />
              View all
            </label>
            <button
              type="button"
              onClick={prepareCopyRecords}
              disabled={copyLoading}
              className="inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
              aria-label="Copy all records"
            >
              <FiCopy className="w-4 h-4" /> {copyLoading ? 'Preparing...' : 'Copy all'}
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-[#673ab7] hover:underline font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-2">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading submissions…</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <FiInbox className="w-10 h-10 text-gray-300" />
            <p>No submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-600">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Mobile</th>
                  <th className="px-5 py-3 font-semibold">College preferences</th>
                  <th className="px-5 py-3 font-semibold">Submitted at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{row.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-700">{row.mobileNumber || '—'}</td>
                    <td className="px-5 py-3 text-gray-700">{formatCollegePreferences(row)}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatDate(row.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && records.length > 0 && !viewAll && pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CopyToSheetsModal
        fields={COPY_FIELDS}
        records={copyRecords}
        getCellValue={getCellValue}
        open={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        recordLabel="submissions"
        dedupeByPhoneKey="mobileNumber"
        loading={copyLoading}
      />
    </div>
  );
}
