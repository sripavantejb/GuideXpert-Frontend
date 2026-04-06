import { useCallback, useEffect, useState } from 'react';
import { getOsviCallSessionsData } from '../../utils/adminApi';

function formatDateTime(value) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function OsviCallsData() {
  const LIMIT = 25;
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCallSessions = useCallback(async (nextPage) => {
    setLoading(true);
    setError('');
    const response = await getOsviCallSessionsData({ page: nextPage, limit: LIMIT });
    if (!response.success) {
      setRows([]);
      setTotal(0);
      setError(response.message || 'Failed to load OSVI call sessions.');
      setLoading(false);
      return;
    }

    setRows(Array.isArray(response.data?.rows) ? response.data.rows : []);
    setTotal(Number(response.data?.total) || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCallSessions(page);
  }, [loadCallSessions, page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-800">OSVI calls Data</h2>
        <p className="text-sm text-gray-500 mt-1">CRM-stored call sessions pushed by OSVI webhook.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Call Sessions</h3>
            {!loading && <p className="text-xs text-gray-500 mt-0.5">{total} record{total !== 1 ? 's' : ''}</p>}
          </div>
          <button
            type="button"
            onClick={() => loadCallSessions(page)}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium"
          >
            Refresh
          </button>
        </div>

        {error && <div className="px-5 py-4 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="px-5 py-8 text-sm text-gray-500 text-center">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-gray-600">No OSVI call session records yet.</p>
            <p className="text-xs text-gray-400 mt-1">Data appears here once webhook payloads are received.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-semibold">Call ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold">Agent</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Duration</th>
                    <th className="px-4 py-3 text-left font-semibold">Call Time</th>
                    <th className="px-4 py-3 text-left font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={String(row._id)} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">{row.callId || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.phone || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.agentName || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.callType || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.status || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.duration != null ? `${row.duration}s` : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(row.callTime)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 font-medium"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
