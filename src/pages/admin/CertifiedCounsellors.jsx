import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiRefreshCw, FiSearch, FiUsers, FiX } from 'react-icons/fi';
import TableSkeleton from '../../components/UI/TableSkeleton';
import { getCertifiedCounsellorDetail, getCertifiedCounsellors } from '../../utils/adminApi';

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
  const [selectedCounsellorId, setSelectedCounsellorId] = useState('');
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState('');
  const [drawerData, setDrawerData] = useState(null);

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

  const closeDrawer = () => {
    setSelectedCounsellorId('');
    setDrawerData(null);
    setDrawerError('');
    setDrawerLoading(false);
  };

  const openDrawer = async (id) => {
    if (!id) return;
    setSelectedCounsellorId(id);
    setDrawerError('');
    setDrawerData(null);
    setDrawerLoading(true);
    const res = await getCertifiedCounsellorDetail(id);
    if (res.success && res.data?.data) {
      setDrawerData(res.data.data);
    } else {
      setDrawerError(res.message || 'Failed to load counsellor detail.');
    }
    setDrawerLoading(false);
  };

  const getRowId = (row) => row?.id || row?._id || '';

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
                {rows.map((row, index) => {
                  const rowId = getRowId(row);
                  const canOpen = Boolean(rowId);
                  return (
                  <tr
                    key={rowId || `${row.phone || 'row'}-${index}`}
                    className={`hover:bg-gray-50/60 ${canOpen ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                    onClick={() => canOpen && openDrawer(rowId)}
                    title={canOpen ? 'View counsellor details' : 'Details unavailable for this row'}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{Number(row.studentCount) || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(row.createdAt)}</td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCounsellorId ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={closeDrawer}
            aria-label="Close counsellor detail drawer"
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Counsellor Details</h3>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                aria-label="Close"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {drawerLoading ? (
              <div className="p-4">
                <TableSkeleton columns={2} rows={6} />
              </div>
            ) : drawerError ? (
              <div className="p-6 text-sm text-red-600">{drawerError}</div>
            ) : !drawerData ? (
              <div className="p-6 text-sm text-gray-500">No details found.</div>
            ) : (
              <div className="p-5 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Counsellor name</p>
                    <p className="font-medium text-gray-900">{drawerData.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Counsellor email</p>
                    <p className="font-medium text-gray-900 break-all">{drawerData.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{drawerData.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Joined</p>
                    <p className="font-medium text-gray-900">{formatDate(drawerData.joinedAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Student count</p>
                    <p className="font-medium text-gray-900">{Number(drawerData.studentCount) || 0}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3">
                    {drawerData.notes?.trim() || '—'}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">Students</h4>
                  {Array.isArray(drawerData.students) && drawerData.students.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2">Name</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2">Phone</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2">Email</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2">Course</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2">Status</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2">Created</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {drawerData.students.map((student) => (
                            <tr key={student._id}>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">{student.fullName || '—'}</td>
                              <td className="px-3 py-2 text-sm text-gray-700">{student.phone || '—'}</td>
                              <td className="px-3 py-2 text-sm text-gray-700 break-all">{student.email || '—'}</td>
                              <td className="px-3 py-2 text-sm text-gray-700">{student.course || '—'}</td>
                              <td className="px-3 py-2 text-sm text-gray-700">{student.status || '—'}</td>
                              <td className="px-3 py-2 text-sm text-gray-700">{formatDate(student.createdAt)}</td>
                              <td className="px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">{student.notes?.trim() || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No students found for this counsellor.</p>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
