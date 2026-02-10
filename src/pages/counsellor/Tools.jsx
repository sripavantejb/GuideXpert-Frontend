import { useState, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { getPredictedColleges } from '../../utils/counsellorApi';

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none';

const DEFAULT_LIMIT = 10;
const LIMIT_OPTIONS = [10, 20, 50];

const initialForm = {
  entrance_exam_name_enum: 'JEE',
  admission_category_name_enum: 'NORTH_EASTERN',
  cutoff_from: '',
  cutoff_to: '',
  reservation_category_code: 'GEN',
  branch_codes: '',
  districts: '',
  sort_order: 'ASC',
};

export default function Tools() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const buildBody = useCallback(() => {
    const body = {
      entrance_exam_name_enum: form.entrance_exam_name_enum?.trim() || 'JEE',
      admission_category_name_enum: form.admission_category_name_enum?.trim() || 'NORTH_EASTERN',
      cutoff_from: Number(form.cutoff_from),
      cutoff_to: Number(form.cutoff_to),
      reservation_category_code: form.reservation_category_code?.trim() || 'GEN',
      sort_order: form.sort_order || 'ASC',
    };
    if (form.branch_codes?.trim()) {
      body.branch_codes = form.branch_codes.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (form.districts?.trim()) {
      body.districts = form.districts.split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      body.districts = [];
    }
    return body;
  }, [form]);

  const fetchColleges = useCallback(
    async (nextOffset = 0, nextLimit = limit) => {
      setLoading(true);
      setError(null);
      const body = buildBody();
      const res = await getPredictedColleges({ offset: nextOffset, limit: nextLimit, ...body });
      setLoading(false);
      if (res.success) {
        setResult(res.data);
        setOffset(nextOffset);
        setLimit(nextLimit);
      } else {
        setError(res.data?.response || res.message || 'Request failed');
        if (nextOffset === 0) setResult(null);
      }
    },
    [buildBody, limit]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchColleges(0, limit);
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    if (result) fetchColleges(0, newLimit);
  };

  const handlePrev = () => {
    const newOffset = Math.max(0, offset - limit);
    fetchColleges(newOffset, limit);
  };

  const handleNext = () => {
    const total = result?.total_no_of_colleges ?? 0;
    if (offset + (result?.colleges?.length ?? 0) >= total) return;
    fetchColleges(offset + limit, limit);
  };

  const totalColleges = result?.total_no_of_colleges ?? 0;
  const colleges = result?.colleges ?? [];
  const canPrev = offset > 0;
  const canNext = offset + colleges.length < totalColleges;

  const totalPages = Math.max(1, Math.ceil(totalColleges / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary-navy">
          College Predictor
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Search colleges by entrance exam, cutoff range, and filters</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 border-l-4 border-l-primary-navy rounded-t-xl">
          <h3 className="text-lg font-semibold text-primary-navy">Search criteria</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrance exam</label>
                <input
                  type="text"
                  value={form.entrance_exam_name_enum}
                  onChange={(e) => setForm((f) => ({ ...f, entrance_exam_name_enum: e.target.value }))}
                  placeholder="e.g. JEE"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission category</label>
                <input
                  type="text"
                  value={form.admission_category_name_enum}
                  onChange={(e) => setForm((f) => ({ ...f, admission_category_name_enum: e.target.value }))}
                  placeholder="e.g. NORTH_EASTERN"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cutoff from</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.cutoff_from}
                  onChange={(e) => setForm((f) => ({ ...f, cutoff_from: e.target.value }))}
                  placeholder="Min cutoff"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cutoff to</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.cutoff_to}
                  onChange={(e) => setForm((f) => ({ ...f, cutoff_to: e.target.value }))}
                  placeholder="Max cutoff"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reservation category</label>
                <input
                  type="text"
                  value={form.reservation_category_code}
                  onChange={(e) => setForm((f) => ({ ...f, reservation_category_code: e.target.value }))}
                  placeholder="e.g. GEN, OBC"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch codes (comma-separated)</label>
                <input
                  type="text"
                  value={form.branch_codes}
                  onChange={(e) => setForm((f) => ({ ...f, branch_codes: e.target.value }))}
                  placeholder="e.g. CSE, IT"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Districts (comma-separated)</label>
                <input
                  type="text"
                  value={form.districts}
                  onChange={(e) => setForm((f) => ({ ...f, districts: e.target.value }))}
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by cutoff</label>
                <select
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                  className={inputClass}
                >
                  <option value="ASC">Ascending (lowest first)</option>
                  <option value="DESC">Descending (highest first)</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-primary-navy hover:bg-primary-navy/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching…' : 'Search colleges'}
              </button>
              {loading && result && (
                <span className="inline-block w-5 h-5 border-2 border-primary-navy/30 border-t-primary-navy rounded-full animate-spin" aria-hidden />
              )}
            </div>
          </form>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
                <p className="text-sm text-red-700/80 mt-1">Please try again later or contact support.</p>
              </div>
            </div>
          )}

          {result && (
            <>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/80 border-l-4 border-l-primary-navy rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-primary-navy">
                  Results
                  <span className="font-normal text-gray-600 ml-2">
                    {result.total_no_of_colleges} colleges
                    {result.admission_category_name && ` • ${result.admission_category_name}`}
                  </span>
                </h3>
              </div>

              {result._demo && (
                <p className="mt-4 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  Showing demo data. Set <code className="bg-amber-100/80 px-1 rounded">NW_PREDICTORS_ACCESS_TOKEN</code> in the backend to use live results.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 p-4 mt-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Results per page</label>
                  <select
                    value={limit}
                    onChange={handleLimitChange}
                    disabled={loading}
                    className={inputClass + ' w-auto min-w-16'}
                  >
                    {LIMIT_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={!canPrev || loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    aria-label="Previous page"
                  >
                    <FiChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext || loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    aria-label="Next page"
                  >
                    Next <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {loading && (
                  <span className="inline-block w-5 h-5 border-2 border-primary-navy/30 border-t-primary-navy rounded-full animate-spin" aria-hidden />
                )}
              </div>

              {colleges.length === 0 && !loading ? (
                <div className="text-center py-12 px-4 mt-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-3" aria-hidden />
                  <p className="text-gray-600 font-medium">No colleges match your criteria.</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting the cutoff range or filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">College</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Address</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">District</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Branches</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {colleges.map((c, i) => (
                        <tr
                          key={c.college_id}
                          className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-primary-blue-50/30 transition-colors`}
                        >
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">{c.college_name}</span>
                            {c.is_promoted && (
                              <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Promoted</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{c.college_address || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{c.district_enum || '—'}</td>
                          <td className="px-4 py-3">
                            <ul className="space-y-1">
                              {(c.branches || []).map((b) => (
                                <li key={b.branch_code} className="text-gray-600">
                                  {b.branch_code} ({b.branch_name}): cutoff {b.cutoff != null ? b.cutoff : '—'}, fee {b.fee != null ? b.fee : '—'}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
