import { useState, useEffect, useRef, Fragment } from 'react';
import { getTrainingFeedback, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

function formatDob(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

export default function TrainingFeedback() {
  const { logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, byGender: {} });
  const [filters, setFilters] = useState({
    q: '',
    from: '',
    to: '',
    gender: '',
    occupation: ''
  });
  const [expandedId, setExpandedId] = useState(null);
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);

  const fetchData = () => {
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;
    setLoading(true);
    setError('');
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      q: filters.q.trim() || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      gender: filters.gender || undefined,
      occupation: filters.occupation.trim() || undefined
    };
    getTrainingFeedback(params, getStoredToken()).then((result) => {
      if (cancelledRef.current) return;
      if (thisRequestId !== requestIdRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load training feedback');
        return;
      }
      const dataList = result.data?.data || [];
      const paginationData = result.data?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 };
      const responseStats = result.data?.stats || {};
      setRecords(dataList);
      setPagination(paginationData);
      setStats({
        total: responseStats.total ?? paginationData.total ?? 0,
        byGender: responseStats.byGender || {}
      });
    });
  };

  useEffect(() => {
    fetchData();
    return () => { cancelledRef.current = true; };
  }, [pagination.page, pagination.limit, filters.q, filters.from, filters.to, filters.gender, filters.occupation]);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ q: '', from: '', to: '', gender: '', occupation: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = filters.q || filters.from || filters.to || filters.gender || filters.occupation;

  return (
    <div className="max-w-[1400px] mx-auto px-1">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1 tracking-tight">Training Feedback</h2>
        <p className="text-sm text-gray-500">View and filter all training feedback submissions.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search name, email, mobile..."
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm min-w-[180px] flex-1 max-w-xs"
            aria-label="Search feedback"
          />
          <input
            type="date"
            value={filters.from}
            onChange={(e) => handleFilterChange('from', e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 outline-none text-sm min-w-[130px]"
            aria-label="From date"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => handleFilterChange('to', e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 outline-none text-sm min-w-[130px]"
            aria-label="To date"
          />
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 outline-none text-sm min-w-[100px]"
            aria-label="Filter by gender"
          >
            <option value="">All genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="text"
            placeholder="Occupation"
            value={filters.occupation}
            onChange={(e) => handleFilterChange('occupation', e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 outline-none text-sm min-w-[120px]"
            aria-label="Filter by occupation"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 px-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 py-2 px-3 bg-red-50 rounded-lg border border-red-100" role="alert">
          {error}
        </p>
      )}

      {/* Stats */}
      {!loading && (
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="px-4 py-2 rounded-lg bg-primary-blue-50 border border-primary-blue-100">
            <span className="text-sm font-medium text-primary-blue-800">Total submissions: </span>
            <span className="text-sm font-semibold text-primary-blue-900">{stats.total}</span>
          </div>
          {(stats.byGender?.Male != null || stats.byGender?.Female != null) && (
            <div className="flex gap-3 text-sm text-gray-600">
              {stats.byGender.Male != null && <span>Male: {stats.byGender.Male}</span>}
              {stats.byGender.Female != null && <span>Female: {stats.byGender.Female}</span>}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-sm">Loading training feedback…</p>
          <div className="mt-3 h-1 w-32 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full w-1/2 bg-primary-blue-400 animate-pulse rounded-full" />
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-12 text-center">
          <p className="text-gray-500 text-sm">
            {hasActiveFilters ? 'No training feedback found for the selected filters.' : 'No training feedback submissions yet.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-primary-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm mb-4">
            <table className="min-w-[1000px] w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Mobile</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">WhatsApp</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Email</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Occupation</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Gender</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">DOB</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Education</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center">YOE</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Address</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider whitespace-nowrap">Submitted</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-xs uppercase tracking-wider w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((row, i) => (
                  <Fragment key={row.id}>
                    <tr
                      className={`hover:bg-primary-blue-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
                    >
                      <td className="px-3 py-2 align-middle font-medium text-gray-900 min-w-[100px]">{row.name || '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-700 whitespace-nowrap">{row.mobileNumber || '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-700 whitespace-nowrap">{row.whatsappNumber || '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-700 max-w-[160px] truncate" title={row.email || ''}>{row.email || '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-700 min-w-[90px]">{row.occupation || '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-700">{row.gender || '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-700 whitespace-nowrap">{formatDob(row.dateOfBirth)}</td>
                      <td className="px-3 py-2 align-middle text-gray-700 max-w-[140px] truncate" title={row.educationQualification || ''}>{row.educationQualification || '—'}</td>
                      <td className="px-3 py-2 align-middle text-center text-gray-700">{row.yearsOfExperience ?? '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-600 max-w-[180px] truncate" title={row.addressOfCommunication || ''}>{row.addressOfCommunication || '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-600 whitespace-nowrap text-xs">{formatDate(row.createdAt)}</td>
                      <td className="px-3 py-2 align-middle">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                          className="p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                          aria-label={expandedId === row.id ? 'Collapse' : 'Expand row'}
                        >
                          {expandedId === row.id ? '−' : '+'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === row.id && (
                      <tr key={`${row.id}-exp`} className="bg-primary-blue-50/30">
                        <td colSpan={12} className="px-3 py-3 text-sm text-gray-700 border-t border-primary-blue-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2"><span className="font-medium text-gray-600">Address: </span>{row.addressOfCommunication || '—'}</div>
                            <div><span className="font-medium text-gray-600">Education: </span>{row.educationQualification || '—'}</div>
                            <div><span className="font-medium text-gray-600">Anything to convey: </span>{row.anythingToConvey || '—'}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
              <p className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-2">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
