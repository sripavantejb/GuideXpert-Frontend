import { useState, useEffect } from 'react';
import { FiActivity, FiCrosshair, FiCopy, FiX } from 'react-icons/fi';
import { getAssessmentLinks, getAssessmentResults, getAssessmentResultById } from '../../utils/counsellorApi';

function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error('Clipboard not available'));
}

export default function StudentAssessmentsPanel({ type }) {
  const assessmentType = type === 'course-fit' ? 'course-fit' : 'career-dna';
  const title = assessmentType === 'career-dna' ? 'Career DNA Test' : 'Course Fit Test';

  const [links, setLinks] = useState(null);
  const [linksLoading, setLinksLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const limit = 10;

  useEffect(() => {
    let cancelled = false;
    setLinksLoading(true);
    getAssessmentLinks()
      .then((res) => {
        if (!cancelled && res.success && res.data?.data) setLinks(res.data.data);
      })
      .finally(() => { if (!cancelled) setLinksLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setResultsLoading(true);
    getAssessmentResults(assessmentType, { page, limit })
      .then((res) => {
        if (!cancelled && res.success && res.data?.data) {
          setSubmissions(res.data.data.submissions || []);
          setTotal(res.data.data.total ?? 0);
        }
      })
      .finally(() => { if (!cancelled) setResultsLoading(false); });
  }, [assessmentType, page]);

  useEffect(() => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    getAssessmentResultById(detailId, assessmentType)
      .then((res) => {
        if (!cancelled && res.success && res.data?.data) setDetail(res.data.data);
      })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
  }, [detailId, assessmentType]);

  const handleCopy = (link) => {
    copyToClipboard(link)
      .then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      })
      .catch(() => setCopyFeedback(false));
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const linkKey = assessmentType === 'career-dna' ? 'careerDna' : 'courseFit';
  const linkUrl = (links && links[linkKey]?.link) ?? '';

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-200/80 overflow-hidden transition-all duration-200">
      <div className="h-1 w-full bg-primary-navy" />
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-navy/10 text-primary-navy">
            {assessmentType === 'career-dna' ? <FiActivity className="w-6 h-6" /> : <FiCrosshair className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">Share your unique link with students. Their details and results will appear below.</p>
          </div>
        </div>

        <section className="mb-8" aria-labelledby="assessment-link-heading">
          <h4 id="assessment-link-heading" className="text-sm font-semibold uppercase tracking-wider text-primary-navy mb-3">My assessment link</h4>
          {linksLoading ? (
            <p className="text-sm text-gray-500">Loading link…</p>
          ) : links ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5 border-l-4 border-l-primary-navy">
              <div className="flex gap-3 flex-wrap items-stretch">
                <input
                  type="text"
                  readOnly
                  value={linkUrl}
                  className="flex-1 min-w-0 text-sm px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(linkUrl)}
                  className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-navy/90 transition-colors shadow-sm"
                >
                  <FiCopy className="w-4 h-4" /> Copy link
                </button>
              </div>
              {copyFeedback && <p className="mt-2 text-xs font-medium text-primary-navy">Copied to clipboard</p>}
            </div>
          ) : (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">Could not load link. Please try again later.</p>
          )}
        </section>

        <section aria-labelledby="results-heading">
          <h4 id="results-heading" className="text-sm font-semibold uppercase tracking-wider text-primary-navy mb-3">Results</h4>
          {resultsLoading ? (
            <p className="text-sm text-gray-500">Loading results…</p>
          ) : submissions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 px-5 py-8 text-center">
              <p className="text-sm text-gray-500">No submissions yet.</p>
              <p className="text-sm text-gray-400 mt-1">Share your link with students to see their results here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-primary-navy/5">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-primary-navy">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-navy">Mobile</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-navy">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-navy">Score</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-navy">Submitted</th>
                      <th className="px-4 py-3 text-right font-semibold text-primary-navy">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s._id} className="border-t border-gray-100 hover:bg-primary-navy/[0.04] transition-colors">
                        <td className="px-4 py-3 text-gray-900 font-medium">{s.fullName ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{s.phone ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{s.email || '—'}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 tabular-nums">{s.score ?? 0} / {s.maxScore ?? 10}</td>
                        <td className="px-4 py-3 text-gray-500">{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setDetailId(s._id)}
                            className="inline-flex items-center rounded-lg bg-primary-navy px-3 py-2 text-xs font-semibold text-white hover:bg-primary-navy/90 transition-colors shadow-sm"
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
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                  <p className="text-sm text-gray-600">Page <span className="font-medium text-gray-900">{page}</span> of {totalPages} <span className="text-gray-400">({total} total)</span></p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-lg px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg px-4 py-2 text-sm font-medium bg-primary-navy text-white hover:bg-primary-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {detailId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDetailId(null)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200" onClick={(e) => e.stopPropagation()}>
                <div className="h-1 w-full bg-primary-navy" />
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h4 id="modal-title" className="text-lg font-semibold text-gray-900">Submission details</h4>
                  <button type="button" onClick={() => setDetailId(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors" aria-label="Close">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-6 py-5 overflow-y-auto flex-1">
                  {detailLoading ? (
                    <p className="text-sm text-gray-500">Loading…</p>
                  ) : detail ? (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm rounded-xl border border-gray-200 bg-gray-50/50 p-5">
                        <div><span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider mb-0.5">Name</span><span className="text-gray-900">{detail.fullName ?? '—'}</span></div>
                        <div><span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider mb-0.5">Mobile</span><span className="text-gray-900">{detail.phone ?? '—'}</span></div>
                        <div><span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider mb-0.5">Email</span><span className="text-gray-900">{detail.email || '—'}</span></div>
                        <div><span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider mb-0.5">School</span><span className="text-gray-900">{detail.school || '—'}</span></div>
                        <div><span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider mb-0.5">Class</span><span className="text-gray-900">{detail.class || '—'}</span></div>
                        <div><span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider mb-0.5">Score</span><span className="font-semibold text-primary-navy tabular-nums">{detail.score ?? 0} / {detail.maxScore ?? 10}</span></div>
                        <div className="col-span-2"><span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider mb-0.5">Submitted</span><span className="text-gray-900">{detail.submittedAt ? new Date(detail.submittedAt).toLocaleString() : '—'}</span></div>
                      </div>
                      {detail.questionResults && detail.questionResults.length > 0 && (
                        <div className="rounded-xl border border-gray-200 p-5">
                          <h5 className="text-sm font-semibold uppercase tracking-wider text-primary-navy mb-3">Question-wise results</h5>
                          <ul className="space-y-2.5">
                            {detail.questionResults.map((r) => (
                              <li key={r.questionId} className="text-sm border-b border-gray-100 pb-2.5 last:border-0 last:pb-0">
                                <span className={r.correct ? 'text-emerald-600' : 'text-amber-600'}>{r.correct ? '✓' : '✗'}</span>
                                {' '}<span className="text-gray-700">Your answer: {r.userAnswer || '—'}</span>
                                {!r.correct && <><span className="text-gray-400"> → </span><span className="text-gray-600">Suggested: {r.correctAnswer}</span></>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Could not load details.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
