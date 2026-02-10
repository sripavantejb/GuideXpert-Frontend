import { useState, useCallback } from 'react';
import { FiTarget, FiBarChart2, FiZap, FiClock, FiArrowRight, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getPredictedColleges } from '../../utils/counsellorApi';

const tools = [
  {
    id: 'college-predictor',
    title: 'College Predictor',
    desc: 'Suggest colleges based on rank, region, budget and student preferences. Powered by historical data analysis.',
    icon: FiTarget,
    accuracy: '92%',
    features: ['Rank-based filtering', 'Region & budget preferences', 'Cut-off trend analysis'],
  },
  {
    id: 'rank-predictor',
    title: 'Rank Predictor',
    desc: 'Predict expected rank from exam performance scores using statistical models.',
    icon: FiBarChart2,
    accuracy: '88%',
    features: ['Multi-exam support', 'Percentile mapping', 'Historical accuracy data'],
  },
  {
    id: 'exam-predictor',
    title: 'Exam Predictor',
    desc: 'Suggest suitable competitive exams based on student profile, academic strengths, and career goals.',
    icon: FiZap,
    accuracy: '85%',
    features: ['Profile-based matching', 'Difficulty assessment', 'Preparation timeline'],
  },
  {
    id: 'deadline-manager',
    title: 'Deadline Manager',
    desc: 'Track all important exam registrations, admission deadlines, and counseling round dates.',
    icon: FiClock,
    accuracy: null,
    features: ['Auto-reminders', 'Calendar sync', 'Priority tagging'],
  },
];

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
  const [activeTool, setActiveTool] = useState(null);
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
          Assessment & Prediction Tools
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Comprehensive tools for data-driven counseling decisions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tools.map((t) => (
          <div key={t.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#003366]/5 flex items-center justify-center">
                <t.icon className="w-6 h-6 text-[#003366]" />
              </div>
              {t.accuracy && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {t.accuracy} accuracy
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontSize: '1.05rem' }}>{t.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{t.desc}</p>
            <ul className="space-y-1.5 mb-5">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003366]" /> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                if (t.id === 'college-predictor') {
                  setActiveTool('college-predictor');
                  setError(null);
                  setResult(null);
                } else {
                  setActiveTool(null);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors"
            >
              Launch Tool <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {activeTool === 'college-predictor' && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900" style={{ color: '#003366' }}>College Predictor</h3>
            <button
              type="button"
              onClick={() => { setActiveTool(null); setError(null); setResult(null); }}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrance exam</label>
                <input
                  type="text"
                  value={form.entrance_exam_name_enum}
                  onChange={(e) => setForm((f) => ({ ...f, entrance_exam_name_enum: e.target.value }))}
                  placeholder="e.g. JEE"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission category</label>
                <input
                  type="text"
                  value={form.admission_category_name_enum}
                  onChange={(e) => setForm((f) => ({ ...f, admission_category_name_enum: e.target.value }))}
                  placeholder="e.g. NORTH_EASTERN"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch codes (comma-separated)</label>
                <input
                  type="text"
                  value={form.branch_codes}
                  onChange={(e) => setForm((f) => ({ ...f, branch_codes: e.target.value }))}
                  placeholder="e.g. CSE, IT"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Districts (comma-separated)</label>
                <input
                  type="text"
                  value={form.districts}
                  onChange={(e) => setForm((f) => ({ ...f, districts: e.target.value }))}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by cutoff</label>
                <select
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                >
                  <option value="ASC">Ascending (lowest first)</option>
                  <option value="DESC">Descending (highest first)</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors disabled:opacity-60"
            >
              {loading ? 'Searching…' : 'Search colleges'}
            </button>
          </form>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          {result && (
            <>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-medium text-gray-900">{result.total_no_of_colleges}</span> colleges
                  {result.admission_category_name && (
                    <span className="ml-2 text-gray-500">({result.admission_category_name})</span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Results per page</label>
                  <select
                    value={limit}
                    onChange={handleLimitChange}
                    disabled={loading}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
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
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {Math.floor(offset / limit) + 1} (offset {offset})
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext || loading}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">College</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Address</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">District</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Branches</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {colleges.map((c) => (
                      <tr key={c.college_id}>
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
              {colleges.length === 0 && !loading && (
                <p className="text-sm text-gray-500 py-4">No colleges found for this criteria.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
