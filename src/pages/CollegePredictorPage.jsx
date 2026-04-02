import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getPredictedCollegesPublic } from '../utils/api';
import {
  ENTRANCE_EXAMS,
  RESERVATION_CATEGORIES,
  BRANCH_CODES,
  SORT_ORDER_OPTIONS,
  DISTRICTS,
} from '../constants/collegePredictorOptions';

const ADMISSION_CATEGORIES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'HK', label: 'Hyderabad-Karnataka (HK)' },
  { value: 'AU', label: 'Andhra University (AU)' },
  { value: 'SVU', label: 'Sri Venkateswara University (SVU)' },
];

const PAGE_SIZE = 10;

const ERROR_MESSAGES = {
  INVALID_ENTRANCE_EXAM_NAME_ENUM: 'The selected exam is not accepted by the predictor API. Please select a valid exam.',
  INVALID_ADMISSION_CATEGORY_NAME_ENUM: 'Invalid admission category. Please select a valid option.',
  INVALID_BRANCH_CODES: 'One or more branch codes are invalid.',
  INVALID_RESERVATION_CATEGORY_CODE: 'Invalid reservation category. Please select a valid option.',
  INVALID_CUTOFF_RANGE: 'Invalid cutoff range. Minimum must be less than or equal to maximum.',
  INVALID_INPUT_FORMAT: 'Please check your inputs (e.g. non-negative numbers for cutoff, offset, limit).',
  SERVICE_UNAVAILABLE: 'Predictor service is temporarily unavailable. Please try again later.',
  UPSTREAM_ERROR: 'The predictor service returned an error. Please try again.',
};

function getErrorMessage(resStatus, response) {
  const apiMessage = response && String(response).trim();
  if (apiMessage) return apiMessage;
  return ERROR_MESSAGES[resStatus] || 'Something went wrong. Please try again.';
}

const initialCollegeForm = {
  entrance_exam_name_enum: '',
  admission_category_name_enum: 'GENERAL',
  cutoff_from: '',
  cutoff_to: '',
  reservation_category_code: 'GNT2S',
  branch_codes: [],
  districts: [],
  sort_order: 'ASC',
};

export default function CollegePredictorPage() {
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
      const examValue = form.entrance_exam_name_enum != null && String(form.entrance_exam_name_enum).trim() !== '' ? String(form.entrance_exam_name_enum).trim() : '';
      if (!examValue) {
        setError('Please select an entrance exam.');
        return;
      }
      const rawFrom = form.cutoff_from;
      const rawTo = form.cutoff_to;
      if (rawFrom === '' || rawTo === '') {
        setError('Please enter both cutoff from and cutoff to.');
        return;
      }
      const cutoffFrom = parseInt(Number(rawFrom), 10);
      const cutoffTo = parseInt(Number(rawTo), 10);
      if (!Number.isInteger(cutoffFrom) || cutoffFrom < 0 || !Number.isInteger(cutoffTo) || cutoffTo < 0) {
        setError('Cutoff from and cutoff to must be non-negative integers.');
        return;
      }
      if (cutoffFrom >= cutoffTo) {
        setError('Cutoff to must be greater than cutoff from.');
        return;
      }
      setLoading(true);
      setError(null);
      const payload = {
        offset: pageOffset,
        limit: PAGE_SIZE,
        entrance_exam_name_enum: examValue,
        admission_category_name_enum: String(form.admission_category_name_enum ?? 'GENERAL'),
        cutoff_from: cutoffFrom,
        cutoff_to: cutoffTo,
        reservation_category_code: String(form.reservation_category_code ?? 'GNT2S'),
        sort_order: String(form.sort_order ?? 'ASC'),
      };
      if (form.branch_codes?.length > 0) payload.branch_codes = form.branch_codes;
      if (form.districts?.length > 0) payload.districts = form.districts;

      if (import.meta.env.DEV) {
        console.log('[College Predictor] Request payload:', { ...payload, entrance_exam_name_enum: payload.entrance_exam_name_enum });
      }
      const res = await getPredictedCollegesPublic(payload);

      setLoading(false);
      if (!res.success) {
        const errData = res.data || {};
        if (import.meta.env.DEV) {
          console.warn('[College Predictor] API error:', res.status, errData);
        }
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

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setResult(null);
      fetchColleges(0, false);
    },
    [fetchColleges]
  );

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    fetchColleges(nextOffset, true);
  };

  const total = result?.total_no_of_colleges ?? 0;
  const loaded = result?.colleges?.length ?? 0;
  const hasMore = loaded < total;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">College Predictor</h1>
          <Link
            to="/"
            className="text-sm font-medium text-primary-navy hover:underline"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <p className="text-sm text-gray-600 mb-4">
              Find colleges by entrance exam, cutoff range, reservation category, and optional branch or district filters.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-gray-500 mb-2">
                Fields marked with <span className="text-red-500">*</span> are required.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entrance exam <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="entrance_exam_name_enum"
                    value={form.entrance_exam_name_enum ?? ''}
                    onChange={(e) => updateForm('entrance_exam_name_enum', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-navy focus:border-primary-navy"
                  >
                    <option value="">Select exam</option>
                    {ENTRANCE_EXAMS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admission category <span className="text-red-500">*</span>
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reservation category <span className="text-red-500">*</span>
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cutoff from (min) <span className="text-red-500">*</span>
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cutoff to (max) <span className="text-red-500">*</span>
                  </label>
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
                  Showing demo data. Configure <code className="bg-amber-100/80 px-1 rounded">NW_PREDICTORS_ACCESS_TOKEN</code> in the backend to load real colleges.
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
                              {Array.isArray(branch.reservation_categories) && branch.reservation_categories.length > 0 && (
                                <span className="text-gray-500">
                                  Categories: {branch.reservation_categories.map((rc) => rc.category_code || rc.name).filter(Boolean).join(', ')}
                                </span>
                              )}
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
      </main>
    </div>
  );
}
