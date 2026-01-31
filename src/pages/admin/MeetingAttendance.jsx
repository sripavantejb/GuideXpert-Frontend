import { useState, useEffect, useRef } from 'react';
import { getMeetingAttendance, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

export default function MeetingAttendance() {
  const { logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);

  const fetchAttendance = () => {
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;
    const page = pagination.page;
    setLoading(true);
    setError('');
    getMeetingAttendance({ page, limit: 50 }, getStoredToken()).then((result) => {
      if (cancelledRef.current) return;
      if (thisRequestId !== requestIdRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load meeting attendance');
        return;
      }
      setRecords(result.data.data || []);
      setPagination(result.data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
    });
  };

  useEffect(() => {
    fetchAttendance();
    return () => {
      cancelledRef.current = true;
    };
  }, [pagination.page]);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  return (
    <div className="max-w-[1400px] mx-auto px-1">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Meeting Attendance</h2>
        <button
          type="button"
          onClick={() => fetchAttendance()}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 py-2 px-3 bg-red-50 rounded-lg border border-red-100" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-sm">Loading attendance…</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm mb-4">
            <table className="min-w-[500px] w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Mobile Number</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider whitespace-nowrap">Time of Join</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-gray-500 text-sm">
                      No attendance records yet
                    </td>
                  </tr>
                ) : (
                  records.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-primary-blue-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
                    >
                      <td className="px-3 py-2 align-middle min-w-[120px] text-sm">{row.name || '—'}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap text-sm">{row.mobileNumber || '—'}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap text-gray-600 text-sm">{formatDate(row.timestamp)}</td>
                      <td className="px-3 py-2 align-middle">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {row.attendanceStatus || 'joined'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-1">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 min-w-[100px] text-center">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
