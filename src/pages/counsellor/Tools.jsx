import { useState, useCallback, useEffect } from 'react';
import { FiTarget, FiBarChart2, FiZap, FiClock, FiArrowRight, FiChevronDown, FiChevronUp, FiActivity, FiCrosshair, FiStar, FiCopy, FiX } from 'react-icons/fi';
import { getPredictedColleges, getAssessmentLinks, getAssessmentResults, getAssessmentResultById } from '../../utils/counsellorApi';
import {
  ENTRANCE_EXAMS,
  ADMISSION_CATEGORIES,
  RESERVATION_CATEGORIES,
  BRANCH_CODES,
  SORT_ORDER_OPTIONS,
  DISTRICTS,
} from '../../constants/collegePredictorOptions';

const PAGE_SIZE = 10;

const toolCards = [
  { id: 'college', title: 'College Predictor', desc: 'Suggest colleges based on rank, region, budget and preferences.', icon: FiTarget },
  { id: 'rank', title: 'Rank Predictor', desc: 'Predict expected rank from exam performance scores.', icon: FiBarChart2 },
  { id: 'exam', title: 'Exam Predictor', desc: 'Suggest suitable exams based on student profile and strengths.', icon: FiZap },
  { id: 'deadline', title: 'Deadline Manager', desc: 'Track important exam and admission deadlines at a glance.', icon: FiClock },
];

const assessmentToolCards = [
  {
    id: 'career-dna',
    title: 'Career DNA Test',
    desc: 'Explore what your dream course might be, even if it differs from what you first thought. Students are often surprised by their results – find out what your profile reveals.',
    icon: FiActivity,
  },
  {
    id: 'course-fit',
    title: 'Course Fit Test',
    desc: 'Find out which stream feels made for you. See how closely your goals align with your personality.',
    icon: FiCrosshair,
  },
  {
    id: 'future-fit',
    title: 'Future Fit Test',
    desc: 'Match with college vibes that truly suit your personality. Your strengths might point you toward a course you never expected.',
    icon: FiStar,
  },
];

const ERROR_MESSAGES = {
  INVALID_ENTRANCE_EXAM_NAME_ENUM: 'Invalid entrance exam. Please select a valid option.',
  INVALID_ADMISSION_CATEGORY_NAME_ENUM: 'Invalid admission category. Please select a valid option.',
  INVALID_BRANCH_CODES: 'One or more branch codes are invalid.',
  INVALID_RESERVATION_CATEGORY_CODE: 'Invalid reservation category. Please select a valid option.',
  INVALID_CUTOFF_RANGE: 'Invalid cutoff range. Minimum must be less than or equal to maximum.',
  INVALID_INPUT_FORMAT: 'Please check your inputs (e.g. non-negative numbers for cutoff, offset, limit).',
  SERVICE_UNAVAILABLE: 'Predictor service is temporarily unavailable. Please try again later.',
  UPSTREAM_ERROR: 'The predictor service returned an error. Please try again.',
};

function getErrorMessage(resStatus, response) {
  return ERROR_MESSAGES[resStatus] || response || 'Something went wrong. Please try again.';
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-6 rounded-full bg-primary-navy" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-500 ml-4">{subtitle}</p>}
    </div>
  );
}

function ToolCard({ title, desc, icon, onLaunch }) {
  const Icon = icon;
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-navy/10">
          <Icon className="w-5 h-5 text-primary-navy" />
        </div>
      </div>
      <h3 className="mb-1 text-base font-bold text-gray-900">{title}</h3>
      <p className="mb-5 text-sm leading-relaxed text-gray-500">{desc}</p>
      <button
        type="button"
        onClick={onLaunch}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90"
      >
        Launch Tool <FiArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function AssessmentToolCard({ title, desc, icon, onLaunch }) {
  const Icon = icon;
  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-green-600 to-green-400" />
      <div className="p-6">
        <div className="mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="mb-1 text-base font-bold text-gray-900">{title}</h3>
        <p className="mb-5 text-sm leading-relaxed text-gray-500">{desc}</p>
        <button
          type="button"
          onClick={onLaunch}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90"
        >
          Launch Tool <FiArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

const initialCollegeForm = {
  entrance_exam_name_enum: 'JEE',
  admission_category_name_enum: 'NORTH_EASTERN',
  cutoff_from: '',
  cutoff_to: '',
  reservation_category_code: 'GEN',
  branch_codes: [],
  districts: [],
  sort_order: 'ASC',
};

function CollegePredictorPanel() {
  const [form, setForm] = useState(initialCollegeForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [offset, setOffset] = useState(0);
  const [expandedCollegeId, setExpandedCollegeId] = useState(null);

  const updateForm = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const toggleBranchMulti = useCallback((field, value) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
    setError(null);
  }, []);

  const fetchColleges = useCallback(
    async (pageOffset = 0, append = false) => {
      const cutoffFrom = Number(form.cutoff_from);
      const cutoffTo = Number(form.cutoff_to);
      if (Number.isNaN(cutoffFrom) || cutoffFrom < 0 || Number.isNaN(cutoffTo) || cutoffTo < 0) {
        setError('Please enter valid non-negative numbers for cutoff range.');
        return;
      }
      if (cutoffFrom > cutoffTo) {
        setError('Minimum cutoff must be less than or equal to maximum cutoff.');
        return;
      }
      setLoading(true);
      setError(null);
      const body = {
        entrance_exam_name_enum: form.entrance_exam_name_enum,
        admission_category_name_enum: form.admission_category_name_enum,
        cutoff_from: cutoffFrom,
        cutoff_to: cutoffTo,
        reservation_category_code: form.reservation_category_code,
        sort_order: form.sort_order,
      };
      if (form.branch_codes.length > 0) body.branch_codes = form.branch_codes;
      if (form.districts.length > 0) body.districts = form.districts;

      const res = await getPredictedColleges({
        offset: pageOffset,
        limit: PAGE_SIZE,
        ...body,
      });

      setLoading(false);
      if (!res.success) {
        const errData = res.data || {};
        setError(getErrorMessage(errData.res_status, errData.response || res.message));
        if (!append) setResult(null);
        return;
      }
      const data = res.data;
      if (append && result) {
        setResult((prev) => ({
          ...data,
          colleges: [...(prev.colleges || []), ...(data.colleges || [])],
        }));
      } else {
        setResult(data);
      }
      setOffset(pageOffset);
    },
    [form, result]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setResult(null);
    fetchColleges(0, false);
  };

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    fetchColleges(nextOffset, true);
  };

  const total = result?.total_no_of_colleges ?? 0;
  const loaded = result?.colleges?.length ?? 0;
  const hasMore = loaded < total;

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">College Predictor</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 mb-2">Fields marked with <span className="text-red-500">*</span> are required by the API.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entrance exam <span className="text-red-500">*</span></label>
              <select
                value={form.entrance_exam_name_enum}
                onChange={(e) => updateForm('entrance_exam_name_enum', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-navy focus:border-primary-navy"
              >
                {ENTRANCE_EXAMS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission category <span className="text-red-500">*</span></label>
              <select
                value={form.admission_category_name_enum}
                onChange={(e) => updateForm('admission_category_name_enum', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-navy focus:border-primary-navy"
              >
                {ADMISSION_CATEGORIES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reservation category <span className="text-red-500">*</span></label>
              <select
                value={form.reservation_category_code}
                onChange={(e) => updateForm('reservation_category_code', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-navy focus:border-primary-navy"
              >
                {RESERVATION_CATEGORIES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cutoff from (min) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                step="any"
                value={form.cutoff_from}
                onChange={(e) => updateForm('cutoff_from', e.target.value)}
                placeholder="e.g. 100"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-navy focus:border-primary-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cutoff to (max) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                step="any"
                value={form.cutoff_to}
                onChange={(e) => updateForm('cutoff_to', e.target.value)}
                placeholder="e.g. 500"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-navy focus:border-primary-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by cutoff (optional)</label>
              <select
                value={form.sort_order}
                onChange={(e) => updateForm('sort_order', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-navy focus:border-primary-navy"
              >
                {SORT_ORDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch codes (optional)</label>
              <div className="flex flex-wrap gap-2">
                {BRANCH_CODES.map((o) => (
                  <label key={o.value} className="inline-flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={form.branch_codes.includes(o.value)}
                      onChange={() => toggleBranchMulti('branch_codes', o.value)}
                      className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Districts (optional)</label>
              <div className="flex flex-wrap gap-2">
                {DISTRICTS.map((o) => (
                  <label key={o.value} className="inline-flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={form.districts.includes(o.value)}
                      onChange={() => toggleBranchMulti('districts', o.value)}
                      className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary-navy px-4 py-2 text-sm font-semibold text-white hover:bg-primary-navy/90 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Get colleges'}
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="p-6 bg-gray-50">
          {result._demo && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              Showing demo data. Set <code className="bg-amber-100/80 px-1 rounded">NW_PREDICTORS_ACCESS_TOKEN</code> in the backend to load real colleges.
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">
            {result.admission_category_name && (
              <span className="font-medium">{result.admission_category_name}</span>
            )}
            {' — '}
            Showing {loaded} of {total} colleges
          </p>
          <ul className="space-y-3">
            {(result.colleges || []).map((college) => (
              <li
                key={college.college_id}
                className="rounded-lg bg-white border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedCollegeId((id) => (id === college.college_id ? null : college.college_id))}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <div>
                    <span className="font-semibold text-gray-900">{college.college_name}</span>
                    {college.is_promoted && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Promoted</span>
                    )}
                    <p className="text-sm text-gray-500 mt-0.5">{college.college_address}</p>
                    {college.district_enum && (
                      <p className="text-xs text-gray-400">{college.district_enum}</p>
                    )}
                  </div>
                  {expandedCollegeId === college.college_id ? (
                    <FiChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {expandedCollegeId === college.college_id && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2 mb-2">Branches</p>
                    <div className="space-y-2">
                      {(college.branches || []).map((branch, idx) => (
                        <div
                          key={branch.branch_code + String(idx)}
                          className="flex flex-wrap items-center gap-4 text-sm py-2 px-3 rounded bg-gray-50"
                        >
                          <span className="font-medium text-gray-900">{branch.branch_name || branch.branch_code}</span>
                          <span className="text-gray-600">Cutoff: {Number(branch.cutoff)}</span>
                          <span className="text-gray-600">Fee: ₹{Number(branch.fee).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {hasMore && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loading}
                className="rounded-lg bg-primary-navy px-4 py-2 text-sm font-semibold text-white hover:bg-primary-navy/90 disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ComingSoonPanel() {
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-8 text-center">
      <p className="text-gray-500 font-medium">This tool is coming soon.</p>
      <p className="text-sm text-gray-400 mt-1">Check back later for updates.</p>
    </div>
  );
}

function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error('Clipboard not available'));
}

function StudentAssessmentsPanel() {
  const [links, setLinks] = useState(null);
  const [linksLoading, setLinksLoading] = useState(true);
  const [resultsType, setResultsType] = useState('career-dna');
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

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
    getAssessmentResults(resultsType, { page, limit })
      .then((res) => {
        if (!cancelled && res.success && res.data?.data) {
          setSubmissions(res.data.data.submissions || []);
          setTotal(res.data.data.total ?? 0);
        }
      })
      .finally(() => { if (!cancelled) setResultsLoading(false); });
  }, [resultsType, page]);

  useEffect(() => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    getAssessmentResultById(detailId, resultsType)
      .then((res) => {
        if (!cancelled && res.success && res.data?.data) setDetail(res.data.data);
      })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
  }, [detailId, resultsType]);

  const handleCopy = (link, label) => {
    copyToClipboard(link)
      .then(() => {
        setCopyFeedback(label);
        setTimeout(() => setCopyFeedback(null), 2000);
      })
      .catch(() => setCopyFeedback('Failed to copy'));
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Student assessments</h3>
        <p className="text-sm text-gray-500 mt-1">Share your unique links with students. View their details and results here.</p>
      </div>

      {/* My links */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">My assessment links</h4>
        {linksLoading ? (
          <p className="text-sm text-gray-500">Loading links…</p>
        ) : links ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{links.careerDna?.title ?? 'Career DNA Test'}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={links.careerDna?.link ?? ''}
                  className="flex-1 text-sm px-2 py-1.5 border border-gray-200 rounded bg-white truncate"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(links.careerDna?.link ?? '', 'Career DNA')}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-navy/90"
                >
                  <FiCopy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              {copyFeedback === 'Career DNA' && <p className="mt-1 text-xs text-green-600">Copied!</p>}
            </div>
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{links.courseFit?.title ?? 'Course Fit Test'}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={links.courseFit?.link ?? ''}
                  className="flex-1 text-sm px-2 py-1.5 border border-gray-200 rounded bg-white truncate"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(links.courseFit?.link ?? '', 'Course Fit')}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-navy/90"
                >
                  <FiCopy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              {copyFeedback === 'Course Fit' && <p className="mt-1 text-xs text-green-600">Copied!</p>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-amber-600">Could not load links. Try again later.</p>
        )}
      </div>

      {/* Results */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Results</h4>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => { setResultsType('career-dna'); setPage(1); setDetailId(null); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${resultsType === 'career-dna' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Career DNA
          </button>
          <button
            type="button"
            onClick={() => { setResultsType('course-fit'); setPage(1); setDetailId(null); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${resultsType === 'course-fit' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Course Fit
          </button>
        </div>

        {resultsLoading ? (
          <p className="text-sm text-gray-500">Loading results…</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions yet. Share your link with students to see their results here.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Mobile</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Score</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Submitted</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s._id} className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-2 text-gray-900">{s.fullName ?? '—'}</td>
                      <td className="px-4 py-2 text-gray-600">{s.phone ?? '—'}</td>
                      <td className="px-4 py-2 text-gray-600">{s.email || '—'}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">{s.score ?? 0} / {s.maxScore ?? 10}</td>
                      <td className="px-4 py-2 text-gray-500">{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setDetailId(s._id)}
                          className="text-primary-navy hover:underline font-medium text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">Page {page} of {totalPages} ({total} total)</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Detail modal */}
        {detailId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDetailId(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900">Submission details</h4>
                <button type="button" onClick={() => setDetailId(null)} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
                  <FiX className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {detailLoading ? (
                  <p className="text-sm text-gray-500">Loading…</p>
                ) : detail ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Name</span><br />{detail.fullName ?? '—'}</div>
                      <div><span className="text-gray-500">Mobile</span><br />{detail.phone ?? '—'}</div>
                      <div><span className="text-gray-500">Email</span><br />{detail.email || '—'}</div>
                      <div><span className="text-gray-500">School</span><br />{detail.school || '—'}</div>
                      <div><span className="text-gray-500">Class</span><br />{detail.class || '—'}</div>
                      <div><span className="text-gray-500">Score</span><br /><strong>{detail.score ?? 0} / {detail.maxScore ?? 10}</strong></div>
                      <div><span className="text-gray-500">Submitted</span><br />{detail.submittedAt ? new Date(detail.submittedAt).toLocaleString() : '—'}</div>
                    </div>
                    {detail.questionResults && detail.questionResults.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Question-wise results</h5>
                        <ul className="space-y-2">
                          {detail.questionResults.map((r) => (
                            <li key={r.questionId} className="text-sm border-b border-gray-100 pb-2">
                              <span className={r.correct ? 'text-green-600' : 'text-amber-600'}>{r.correct ? '✓' : '✗'}</span>
                              {' '}Your answer: {r.userAnswer || '—'}
                              {!r.correct && <> → Suggested: {r.correctAnswer}</>}
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
  );
}

const COMING_SOON_IDS = ['rank', 'exam', 'deadline', 'future-fit'];

export default function Tools() {
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="Comprehensive Counselor Tools"
        subtitle="All-in-one platform for managing your counseling practice"
      />

      <SectionHeader
        title="Prediction tools"
        subtitle="Rank, college, exam and deadline helpers"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {toolCards.map((t) => (
          <ToolCard
            key={t.id}
            title={t.title}
            desc={t.desc}
            icon={t.icon}
            onLaunch={() => setActiveTool(t.id)}
          />
        ))}
      </div>

      <SectionHeader
        title="Student assessments"
        subtitle="Tests to help students discover their fit"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {assessmentToolCards.map((t) => (
          <AssessmentToolCard
            key={t.id}
            title={t.title}
            desc={t.desc}
            icon={t.icon}
            onLaunch={() => setActiveTool(t.id)}
          />
        ))}
      </div>

      {activeTool === 'college' && <CollegePredictorPanel />}
      {(activeTool === 'career-dna' || activeTool === 'course-fit') && <StudentAssessmentsPanel />}
      {activeTool && COMING_SOON_IDS.includes(activeTool) && <ComingSoonPanel />}
    </div>
  );
}
