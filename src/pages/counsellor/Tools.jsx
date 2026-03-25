import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTarget, FiBarChart2, FiZap, FiClock, FiArrowRight, FiChevronDown, FiChevronUp, FiActivity, FiCrosshair, FiStar } from 'react-icons/fi';
import { getPredictedColleges } from '../../utils/counsellorApi';
import StudentAssessmentsPanel from '../../components/Counsellor/StudentAssessmentsPanel';
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
    title: 'Psychometric Test',
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
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden flex flex-col h-full">
      <div className="h-1.5 w-full shrink-0 bg-primary-navy" />
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <div className="mb-4 shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-navy">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="mb-2 text-base font-bold text-gray-900 shrink-0">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-500 flex-1 min-h-0 mb-6">{desc}</p>
        <button
          type="button"
          onClick={onLaunch}
          className="mt-auto shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90 w-fit"
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

const COMING_SOON_IDS = ['rank', 'exam', 'deadline', 'future-fit'];

function Tools() {
  const [activeTool, setActiveTool] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="w-full">
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
            onLaunch={() => (t.id === 'rank' ? navigate('/rank-predictor') : setActiveTool(t.id))}
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
      {activeTool === 'career-dna' && <StudentAssessmentsPanel type="career-dna" />}
      {activeTool === 'course-fit' && <StudentAssessmentsPanel type="course-fit" />}
      {activeTool && COMING_SOON_IDS.includes(activeTool) && <ComingSoonPanel />}
    </div>
  );
}

export default Tools;
