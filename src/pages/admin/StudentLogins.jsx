import { useCallback, useEffect, useRef, useState } from 'react';
import { FiPhone, FiSearch, FiUser, FiClock } from 'react-icons/fi';
import { getStudentLogins, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import { useAdminDateRange } from '../../hooks/useAdminDateRange';
import TableSkeleton from '../../components/UI/TableSkeleton';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return (
    date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  );
}

export default function StudentLogins() {
  const { logout } = useAuth();
  const { dateRange } = useAdminDateRange();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [q, setQ] = useState('');
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setQ(searchDraft.trim()), 300);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const load = useCallback(() => {
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;
    setLoading(true);
    setError('');
    getStudentLogins(
      {
        page: pagination.page,
        limit: pagination.limit,
        ...(dateRange.from && { from: dateRange.from }),
        ...(dateRange.to && { to: dateRange.to }),
        ...(q ? { q } : {}),
        source: 'student_workspace',
      },
      getStoredToken()
    ).then((result) => {
      if (cancelledRef.current || thisRequestId !== requestIdRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          return;
        }
        setError(result.message || 'Failed to load student logins');
        setRows([]);
        return;
      }
      setRows(result.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        ...(result.data?.pagination || {}),
      }));
    });
  }, [dateRange.from, dateRange.to, q, pagination.page, pagination.limit, logout]);

  useEffect(() => {
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Student logins</h1>
          <p className="mt-1 text-sm text-slate-500">
            OTP logins from the students workspace, with linked user/lead data when available.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => {
              setSearchDraft(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search name or phone"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total logins</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{pagination.total}</p>
        </div>
        <div className="rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700/70">Page</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-orange-900">
            {pagination.page} / {pagination.totalPages}
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700/70">With user profile</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">
            {rows.filter((r) => r.user).length}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} cols={5} />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">No student logins found for this range.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Logged in</th>
                  <th className="px-4 py-3">User data</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <FiUser className="h-4 w-4 text-slate-400" aria-hidden />
                        {row.fullName || row.user?.fullName || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <FiPhone className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                        {row.phone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <FiClock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                        {formatDate(row.loggedInAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.user ? (
                        <div className="space-y-0.5 text-xs">
                          <p>
                            Status: <span className="font-medium">{row.user.applicationStatus || '—'}</span>
                          </p>
                          <p>
                            OTP:{' '}
                            <span className="font-medium">{row.user.otpVerified ? 'Verified' : 'No'}</span>
                          </p>
                          <p>
                            Predictors:{' '}
                            <span className="font-medium">
                              {[
                                row.user.hasRankPredictor ? 'Rank' : null,
                                row.user.hasCollegePredictor ? 'College' : null,
                              ]
                                .filter(Boolean)
                                .join(', ') || '—'}
                            </span>
                          </p>
                          {row.user.utm_content ? (
                            <p className="text-slate-400">utm: {row.user.utm_content}</p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-slate-400">No linked lead yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-100">
                        {row.source || 'student_workspace'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() =>
              setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))
            }
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
