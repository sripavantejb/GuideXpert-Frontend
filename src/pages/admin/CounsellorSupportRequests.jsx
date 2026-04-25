import { useEffect, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiHeadphones,
  FiInbox,
  FiSearch,
  FiSliders,
  FiUsers,
} from 'react-icons/fi';
import CopyToSheetsModal from '../../components/Admin/CopyToSheetsModal';
import { ADMIN_VIEW_ALL_LIMIT } from '../../constants/adminListLimits';
import { useAuth } from '../../hooks/useAuth';
import { getCounsellorSupportRequests, getStoredToken } from '../../utils/adminApi';
import { fetchAllPaginatedRows } from '../../utils/adminPagedFetch';

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleDateString('en-IN', { dateStyle: 'short' })} ${date.toLocaleTimeString('en-IN', { timeStyle: 'short' })}`;
}

const COPY_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'registeredMobileNumber', label: 'Registered Mobile' },
  { key: 'dashboardLeadBucket', label: 'Dashboard Leads' },
  { key: 'contactedLeadBucket', label: 'Contacted Leads' },
  { key: 'natLeadBucket', label: 'Leads Near NAT' },
  { key: 'stuckStage', label: 'Stuck Stage' },
  { key: 'supportNeeded', label: 'Support Needed' },
  { key: 'otherQuestions', label: 'Other Questions' },
  { key: 'createdAt', label: 'Submitted At' },
];

function getCellValue(row, key) {
  if (key === 'createdAt') return formatDateTime(row.createdAt);
  const value = row?.[key];
  if (value == null) return '';
  return String(value);
}

export default function CounsellorSupportRequests() {
  const { logout } = useAuth();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyRows, setCopyRows] = useState([]);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [viewAll, setViewAll] = useState(false);
  const [filters, setFilters] = useState({ q: '', from: '', to: '' });
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
      if (!cancelledRef.current) {
        setLoading(true);
        setError('');
      }
    });
    getCounsellorSupportRequests(params, getStoredToken()).then((result) => {
      if (cancelledRef.current || thisRequestId !== requestIdRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setRows([]);
        setError(result.message || 'Failed to load counsellor support requests');
        return;
      }
      setRows(Array.isArray(result.data?.data) ? result.data.data : []);
      setPagination(result.data?.pagination || { page: 1, limit, total: 0, totalPages: 1 });
    });
    return () => {
      cancelledRef.current = true;
    };
  }, [filters.from, filters.q, filters.to, logout, pagination.limit, pagination.page, viewAll]);

  const hasActiveFilters = filters.q || filters.from || filters.to;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ q: '', from: '', to: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const goToPage = (nextPage) => {
    const clamped = Math.max(1, Math.min(nextPage, pagination.totalPages || 1));
    setPagination((prev) => ({ ...prev, page: clamped }));
  };

  const prepareCopyRows = async () => {
    setCopyLoading(true);
    setError('');
    const baseParams = {
      q: filters.q.trim() || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    };
    const result = await fetchAllPaginatedRows((page, limit) =>
      getCounsellorSupportRequests({ ...baseParams, page, limit }, getStoredToken())
    );
    setCopyLoading(false);
    if (!result.success) {
      const failed = result.result;
      if (failed?.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(failed?.message || 'Failed to fetch support requests for copy');
      return;
    }
    setCopyRows(result.rows || []);
    setCopyModalOpen(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-1">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-[#003366] to-[#004080] text-white shadow-lg">
            <FiHeadphones className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Counsellor Support Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">All submissions from `/counsellor-support` with clear view and copy flow.</p>
          </div>
        </div>
      </div>

      {!loading ? (
        <div className="mb-6 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-linear-to-r from-[#003366] to-[#004080]" />
          <div className="p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#003366]/10 text-[#003366]">
              <FiUsers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total requests</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden mb-6">
        <div className="bg-linear-to-r from-gray-50 to-slate-50 px-5 py-3 border-b border-gray-200 flex items-center gap-2">
          <FiSliders className="w-5 h-5 text-gray-500" />
          <span className="font-semibold text-gray-800">Filters & Actions</span>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search name, mobile, support type..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none text-sm"
              />
            </div>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              className="py-2.5 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#003366]/20 outline-none text-sm min-w-[145px]"
            />
            <input
              type="date"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              className="py-2.5 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#003366]/20 outline-none text-sm min-w-[145px]"
            />
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 ml-1 pl-3 border-l border-gray-200">
              <input
                type="checkbox"
                checked={viewAll}
                onChange={(e) => {
                  setViewAll(e.target.checked);
                  if (!e.target.checked) setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="rounded border-gray-300 text-primary-blue-500 focus:ring-primary-blue-500"
              />
              View all
            </label>
            <button
              type="button"
              onClick={prepareCopyRows}
              disabled={copyLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiCopy className="w-4 h-4" /> {copyLoading ? 'Preparing...' : 'Copy all'}
            </button>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800" role="alert">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="p-12 text-center text-gray-500 font-medium">Loading support requests...</div>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="p-14 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mb-4">
              <FiInbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No support requests found</h3>
            <p className="text-gray-500 text-sm">
              {hasActiveFilters ? 'Try changing filters to view matching submissions.' : 'New submissions from /counsellor-support will appear here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1300px] w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Registered Mobile</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Dashboard Leads</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Contacted Leads</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Near NAT</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Stuck Stage</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Support Needed</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Other Questions</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#003366]/4 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">{row.registeredMobileNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{row.dashboardLeadBucket || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{row.contactedLeadBucket || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{row.natLeadBucket || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{row.stuckStage || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[220px] truncate" title={row.supportNeeded || ''}>{row.supportNeeded || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[260px] truncate" title={row.otherQuestions || ''}>{row.otherQuestions || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 bg-gray-50/80 border-t border-gray-200">
            {viewAll ? (
              <p className="text-sm text-gray-500">
                {pagination.total > ADMIN_VIEW_ALL_LIMIT
                  ? `Showing first ${ADMIN_VIEW_ALL_LIMIT.toLocaleString()} of ${pagination.total} requests`
                  : `Showing all ${pagination.total} requests`}
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Page <span className="font-semibold text-gray-900">{pagination.page}</span> of <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
                  <span className="text-gray-500 ml-1">({pagination.total} total)</span>
                </p>
                {pagination.totalPages > 1 ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50"
                    >
                      <FiChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50"
                    >
                      Next <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}

      <CopyToSheetsModal
        fields={COPY_FIELDS}
        records={copyRows}
        getCellValue={getCellValue}
        open={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        recordLabel="support requests"
        dedupeByPhoneKey="registeredMobileNumber"
        loading={copyLoading}
      />
    </div>
  );
}
