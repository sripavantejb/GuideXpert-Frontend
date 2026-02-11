import { useState, useEffect, useRef, useMemo } from 'react';
import { getAssessment3Submissions, getAssessment3SubmissionById, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';
import { ASSESSMENT_SECTIONS_3 } from '../../data/assessmentQuestions3';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

export default function Assessment3Results() {
  const { logout } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cancelledRef = useRef(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSubmission, setDetailSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const questionTextMap = useMemo(() => {
    const map = {};
    ASSESSMENT_SECTIONS_3.forEach((s) => {
      s.questions.forEach((q) => { map[q.id] = q.text; });
    });
    return map;
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    setLoading(true);
    setError('');
    getAssessment3Submissions(page, limit, getStoredToken()).then((result) => {
      if (cancelledRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load assessment 3 submissions');
        return;
      }
      setSubmissions(result.data?.submissions ?? []);
      setTotal(result.data?.total ?? 0);
    });
    return () => { cancelledRef.current = true; };
  }, [page, logout]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const openDetail = (row) => {
    if (!row._id) return;
    setDetailOpen(true);
    setDetailSubmission(null);
    setDetailError('');
    setDetailLoading(true);
    getAssessment3SubmissionById(row._id, getStoredToken()).then((result) => {
      setDetailLoading(false);
      if (!result.success) {
        setDetailError(result.message || 'Failed to load submission details');
        return;
      }
      setDetailSubmission(result.data?.submission ?? null);
    });
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailSubmission(null);
    setDetailError('');
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4" style={{ color: '#003366' }}>Assessment 3 Results</h1>
      <p className="text-sm text-gray-600 mb-6">
        Counsellor assessment 3 submissions with scores. Total: <strong>{total}</strong> submission{total !== 1 ? 's' : ''}.
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
          No assessment 3 submissions yet.
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
                  <th scope="col" className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Actions
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
                        {row.score ?? 0} / {row.maxScore ?? 20}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {formatDate(row.submittedAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openDetail(row)}
                        className="text-sm font-medium text-[#003366] hover:underline"
                      >
                        View details
                      </button>
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

      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeDetail} role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 id="detail-modal-title" className="text-lg font-semibold" style={{ color: '#003366' }}>Submission details</h2>
              <button type="button" onClick={closeDetail} className="p-1 rounded hover:bg-gray-100 text-gray-600" aria-label="Close">×</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {detailLoading && <div className="py-8 text-center text-gray-500">Loading...</div>}
              {detailError && <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{detailError}</div>}
              {!detailLoading && !detailError && detailSubmission && (
                <>
                  <dl className="grid grid-cols-1 gap-2 text-sm mb-4">
                    <div><dt className="text-gray-500">Name</dt><dd className="font-medium text-gray-900">{detailSubmission.fullName || '—'}</dd></div>
                    <div><dt className="text-gray-500">Phone</dt><dd className="font-medium text-gray-900">{detailSubmission.phone || '—'}</dd></div>
                    <div><dt className="text-gray-500">Score</dt><dd className="font-medium text-[#003366]">{detailSubmission.score ?? 0} / {detailSubmission.maxScore ?? 20}</dd></div>
                    <div><dt className="text-gray-500">Submitted at</dt><dd className="font-medium text-gray-900">{formatDate(detailSubmission.submittedAt)}</dd></div>
                  </dl>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2" style={{ color: '#003366' }}>Incorrect answers</h3>
                  {(!detailSubmission.questionResults || detailSubmission.questionResults.length === 0) ? (
                    <p className="text-sm text-gray-600">No question breakdown available.</p>
                  ) : (() => {
                    const incorrect = detailSubmission.questionResults.filter((r) => !r.correct);
                    if (incorrect.length === 0) {
                      return <p className="text-sm text-gray-600">All answers correct.</p>;
                    }
                    return (
                      <ul className="space-y-3">
                        {incorrect.map((r) => (
                          <li key={r.questionId} className="p-3 rounded-lg border border-gray-200 text-left">
                            <p className="text-sm font-medium text-gray-800 mb-1">{questionTextMap[r.questionId] ?? r.questionId}</p>
                            <p className="text-xs text-red-600"><span className="font-medium">User answer:</span> {r.userAnswer || '—'}</p>
                            <p className="text-xs text-green-700 mt-0.5"><span className="font-medium">Correct answer:</span> {r.correctAnswer}</p>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
