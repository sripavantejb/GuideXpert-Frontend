import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiRefreshCw, FiSearch, FiUsers } from 'react-icons/fi';
import TableSkeleton from '../../components/UI/TableSkeleton';
import { getCertifiedCounsellors } from '../../utils/adminApi';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function CertifiedCounsellors() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [searchDraft, setSearchDraft] = useState('');

  const loadRows = useCallback(async (search = '', background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError('');
    const res = await getCertifiedCounsellors({ q: search });
    if (res.success && Array.isArray(res.data?.data)) {
      setRows(res.data.data);
    } else {
      setError(res.message || 'Failed to load certified counsellors.');
    }
    if (background) setRefreshing(false);
    else setLoading(false);
  }, []);

  useEffect(() => {
    loadRows('');
  }, [loadRows]);

  const totalStudents = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.studentCount) || 0), 0),
    [rows]
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    const next = searchDraft.trim();
    setQuery(next);
    await loadRows(next, true);
  };

  const handleRefresh = async () => {
    await loadRows(query, true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Certified Counsellors</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Student totals are counted exactly like counsellor dashboard/student list ownership rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <FiUsers className="w-4 h-4 text-gray-500" aria-hidden />
            <span className="text-gray-700 font-medium">
              {rows.length} counsellors • {totalStudents} students
            </span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
            Refresh
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search by name, email or phone"
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || refreshing}
          className="px-4 py-2.5 rounded-lg bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 disabled:opacity-60"
        >
          Search
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton columns={5} rows={8} />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No counsellors found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Phone</th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Students</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{Number(row.studentCount) || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(row.createdAt)}</td>
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
