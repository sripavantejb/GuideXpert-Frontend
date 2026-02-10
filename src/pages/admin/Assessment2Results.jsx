import { useState, useEffect, useRef } from 'react';
import { getAssessment2Submissions, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

export default function Assessment2Results() {
  const { logout } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setLoading(true);
    setError('');
    getAssessment2Submissions(page, limit, getStoredToken()).then((result) => {
      if (cancelledRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load assessment 2 submissions');
        return;
      }
      setSubmissions(result.data?.submissions ?? []);
      setTotal(result.data?.total ?? 0);
    });
    return () => { cancelledRef.current = true; };
  }, [page, logout]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4" style={{ color: '#003366' }}>Assessment 2 Results</h1>
      <p className="text-sm text-gray-600 mb-6">
        Counsellor assessment 2 submissions with scores. Total: <strong>{total}</strong> submission{total !== 1 ? 's' : ''}.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          No assessment 2 submissions yet.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center">
                    Score
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Submitted at
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((row) => (
                  <tr key={row.phone || row._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                      {row.fullName || '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {row.phone || '—'}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <span className="font-medium text-[#003366]">
                        {row.score ?? 0} / {row.maxScore ?? 15}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {formatDate(row.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded border border-[#003366] text-sm font-medium text-white bg-[#003366] hover:bg-[#004080] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300 disabled:hover:bg-gray-200"
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
