import { useMemo, useRef, useState } from 'react';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import { getPredictedCollegesPublic } from '../../utils/api';
import { formatPredictorClientError } from '../../utils/collegePredictorErrors';
import {
  ENTRANCE_EXAMS,
  RESERVATION_CATEGORIES,
  WBJEE_QUOTA_ALL_INDIA,
  WBJEE_QUOTA_OPTIONS,
  getEntranceExamMeta,
  getJeeReservationCategoryCodes,
  getWbjeeReservationCategoryCode,
  rankToCutoff,
} from '../../constants/collegePredictorOptions';
import {
  MHT_CET_STATE_LEVEL_RESERVATION_OPTIONS,
  mhtCetApiAdmissionCategory,
  normalizeMhtReservationCodeForApi,
} from '../../constants/mhtCetOptions';
import { percentileToMhtCutoffRange } from '../../utils/mhtCetPercentile';
import {
  swBtnPrimary,
  swError,
  swErrorBox,
  swInput,
  swLabel,
  swProgressBar,
  swProgressTrack,
  swResultCard,
  swResultsHighlight,
  swSectionSubtitle,
  swSectionTitle,
  swSelect,
  swInsightsPanel,
} from './components/studentWorkspaceUi';

const FETCH_LIMIT = 80;

const ERROR_MESSAGES = {
  INVALID_ENTRANCE_EXAM_NAME_ENUM:
    'This exam is not enabled on the predictor service yet. Try another exam or try again later.',
  INVALID_ADMISSION_CATEGORY_NAME_ENUM: 'Invalid admission category. Please select a valid option.',
  INVALID_RESERVATION_CATEGORY_CODE: 'Invalid category. Please select a valid option.',
  INVALID_CUTOFF_RANGE: 'Invalid rank range. Please check your rank.',
  INVALID_INPUT_FORMAT: 'Please check your inputs and try again.',
  SERVICE_UNAVAILABLE: 'Predictor service is temporarily unavailable. Please try again later.',
  UPSTREAM_ERROR: 'The predictor service returned an error. Please try again.',
};

function getErrorMessage(errData, fallbackMessage) {
  return formatPredictorClientError(ERROR_MESSAGES, errData, fallbackMessage, {
    preferResponseFirst: true,
  });
}

function categoryOptionsForExam(examMeta) {
  if (!examMeta) return RESERVATION_CATEGORIES;
  if (examMeta.value === 'MHT_CET') return MHT_CET_STATE_LEVEL_RESERVATION_OPTIONS;
  if (Array.isArray(examMeta.reservationOptions) && examMeta.reservationOptions.length) {
    return examMeta.reservationOptions;
  }
  return RESERVATION_CATEGORIES;
}

function admissionOptionsForExam(examMeta) {
  if (!examMeta?.admissionCategories?.length) return [];
  if (examMeta.hideAdmissionField) return [];
  return examMeta.admissionCategories;
}

function defaultCategory(examMeta) {
  return examMeta?.defaultReservationCode || categoryOptionsForExam(examMeta)[0]?.value || '';
}

function defaultAdmission(examMeta) {
  return examMeta?.admissionCategories?.[0]?.value || 'DEFAULT';
}

function collegeKey(college, index) {
  return String(college.college_id || college.college_name || index);
}

function branchCutoff(branch) {
  if (branch?.cutoff != null && !Number.isNaN(Number(branch.cutoff))) return Number(branch.cutoff);
  const cats = branch?.reservation_categories;
  if (!Array.isArray(cats)) return null;
  const values = cats.map((c) => c.cutoff).filter((c) => c != null && !Number.isNaN(Number(c))).map(Number);
  return values.length ? Math.min(...values) : null;
}

function chanceForBranch(rank, cutoff) {
  if (cutoff == null) return { chance: 'Medium', fit: 50 };
  const r = Number(rank);
  const c = Number(cutoff);
  if (!Number.isFinite(r) || !Number.isFinite(c) || c <= 0) return { chance: 'Medium', fit: 50 };
  if (r <= c * 0.85) return { chance: 'High', fit: 92 };
  if (r <= c) return { chance: 'High', fit: 80 };
  if (r <= c * 1.2) return { chance: 'Medium', fit: 58 };
  return { chance: 'Low', fit: 28 };
}

function mapBranches(college, rank) {
  const list = Array.isArray(college?.branches) ? college.branches : [];
  return list
    .map((branch, index) => {
      const cutoff = branchCutoff(branch);
      const { chance, fit } = chanceForBranch(rank, cutoff);
      return {
        id: `${branch.branch_code || branch.branch_name || 'branch'}-${index}`,
        name: branch.branch_name || branch.branch_code || `Branch ${index + 1}`,
        cutoff,
        fee: branch.fee,
        chance,
        fit,
      };
    })
    .sort((a, b) => (b.fit || 0) - (a.fit || 0));
}

function SelectField({ label, value, onChange, options, placeholder, error, disabled }) {
  return (
    <label className={swLabel}>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${swSelect} ${!value ? 'text-[#9aa3ae]' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className={swError}>{error}</span> : null}
    </label>
  );
}

export default function BranchPredictorPage() {
  const [exam, setExam] = useState('JEE');
  const examMeta = useMemo(() => getEntranceExamMeta(exam), [exam]);
  const catOptions = useMemo(() => categoryOptionsForExam(examMeta), [examMeta]);
  const admOptions = useMemo(() => admissionOptionsForExam(examMeta), [examMeta]);
  const isMht = exam === 'MHT_CET';
  const isJee = exam === 'JEE';
  const isWbjee = exam === 'WBJEE';

  const [form, setForm] = useState(() => ({
    rank: '',
    percentile: '',
    category: 'OPEN',
    admission: 'DEFAULT',
    gender: 'male',
    quota: WBJEE_QUOTA_ALL_INDIA,
    collegeId: '',
  }));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [branches, setBranches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef(null);

  const collegeOptions = useMemo(
    () =>
      colleges.map((college, index) => ({
        value: collegeKey(college, index),
        label: college.college_name || `College ${index + 1}`,
      })),
    [colleges]
  );

  const onExamChange = (nextExam) => {
    const meta = getEntranceExamMeta(nextExam);
    setExam(nextExam);
    setForm((prev) => ({
      ...prev,
      category: defaultCategory(meta),
      admission: defaultAdmission(meta),
      collegeId: '',
      rank: '',
      percentile: '',
    }));
    setColleges([]);
    setSelectedCollege(null);
    setBranches([]);
    setHasSearched(false);
    setErrors({});
    setApiError(null);
  };

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onCollegeChange = (id) => {
    onChange('collegeId', id);
    const college = colleges.find((c, index) => collegeKey(c, index) === id) || null;
    setSelectedCollege(college);
    const score = isMht ? form.percentile : form.rank;
    setBranches(college ? mapBranches(college, score) : []);
  };

  const validate = () => {
    const next = {};
    if (!exam) next.exam = 'Select an exam.';
    if (!form.category) next.category = 'Category is required.';
    if (isMht) {
      const p = Number(form.percentile);
      if (!form.percentile || Number.isNaN(p) || p <= 0 || p > 100) {
        next.percentile = 'Enter a valid percentile (0–100).';
      }
    } else {
      const r = Number(form.rank);
      if (!form.rank || Number.isNaN(r) || r < 1 || !Number.isInteger(r)) {
        next.rank = 'Enter a valid rank.';
      }
    }
    if (admOptions.length && !form.admission) next.admission = 'Select admission category.';
    if (isJee && !form.gender) next.gender = 'Select gender.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => {
    const apiExam = examMeta?.apiValue ?? exam;
    const admission = form.admission || defaultAdmission(examMeta);

    if (isJee) {
      const apiExamMain = examMeta?.jeeMainApiExam || 'JEE_MAINS_2024';
      const [cutoff_from, cutoff_to] = rankToCutoff(Number(form.rank));
      return {
        offset: 0,
        limit: FETCH_LIMIT,
        exam: apiExamMain,
        entrance_exam_name_enum: apiExamMain,
        admission_category_name_enum: 'DEFAULT',
        cutoff_from,
        cutoff_to,
        reservation_category_codes: getJeeReservationCategoryCodes(
          apiExamMain,
          form.gender,
          form.category
        ),
        branch_codes: [],
        districts: [],
        sort_order: 'ASC',
      };
    }

    if (isMht) {
      const [cutoff_from, cutoff_to] = percentileToMhtCutoffRange(Number(form.percentile));
      const code = normalizeMhtReservationCodeForApi('STATE_LEVEL', form.category);
      return {
        offset: 0,
        limit: FETCH_LIMIT,
        exam: apiExam,
        entrance_exam_name_enum: apiExam,
        admission_category_name_enum: mhtCetApiAdmissionCategory('STATE_LEVEL'),
        cutoff_from,
        cutoff_to,
        reservation_category_codes: code ? [code] : [form.category],
        branch_codes: [],
        districts: [],
        sort_order: 'ASC',
      };
    }

    if (isWbjee) {
      const apiExamWb = examMeta?.wbjeeApiExam || 'WBJEE_2024';
      const [cutoff_from, cutoff_to] = rankToCutoff(Number(form.rank));
      const resCode = getWbjeeReservationCategoryCode(form.category, form.quota);
      return {
        offset: 0,
        limit: FETCH_LIMIT,
        exam: apiExamWb,
        entrance_exam_name_enum: apiExamWb,
        admission_category_name_enum: 'DEFAULT',
        cutoff_from,
        cutoff_to,
        reservation_category_codes: resCode ? [resCode] : [form.category],
        branch_codes: [],
        districts: [],
        sort_order: 'ASC',
        quota: form.quota,
      };
    }

    const [cutoff_from, cutoff_to] = rankToCutoff(Number(form.rank));
    return {
      offset: 0,
      limit: FETCH_LIMIT,
      exam: apiExam,
      entrance_exam_name_enum: apiExam,
      admission_category_name_enum: admission,
      cutoff_from,
      cutoff_to,
      reservation_category_codes: [form.category],
      branch_codes: [],
      districts: [],
      sort_order: 'ASC',
    };
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    setHasSearched(true);

    const res = await getPredictedCollegesPublic(buildPayload());
    setLoading(false);

    if (!res.success) {
      setApiError(getErrorMessage(res.data || {}, res.message));
      setColleges([]);
      setSelectedCollege(null);
      setBranches([]);
      onChange('collegeId', '');
      return;
    }

    const list = res.data?.colleges || [];
    setColleges(list);

    if (!list.length) {
      setSelectedCollege(null);
      setBranches([]);
      onChange('collegeId', '');
      setApiError('No colleges matched these filters. Try adjusting exam, rank, or category.');
      return;
    }

    const preferredId = form.collegeId;
    const preferred =
      (preferredId && list.find((c, i) => collegeKey(c, i) === preferredId)) || list[0];
    const id = collegeKey(preferred, list.indexOf(preferred));
    onChange('collegeId', id);
    setSelectedCollege(preferred);
    const score = isMht ? form.percentile : form.rank;
    setBranches(mapBranches(preferred, score));

    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const rankLabel = isMht
    ? 'Expected percentile'
    : examMeta?.rankFieldLabel || 'Current rank';
  const categoryLabel = examMeta?.reservationFieldLabel || 'Category / caste group';
  const admissionLabel = examMeta?.admissionFieldLabel || 'Counselling / region';

  return (
    <ToolWorkspaceLayout
      title="Branch Predictor"
      subtitle="Pick your exam and college to estimate realistic branch opportunities from live cutoffs."
      howItWorks={[
        'Your exam, category, and rank are matched against historical college cutoffs.',
        'Colleges are loaded from the same predictor service used for College Predictor.',
        'Branch chances are estimated by comparing your rank with each branch cutoff from the predictor.',
      ]}
      whatThisToolDoes={[
        'Estimates branch-level chances inside a selected college using live cutoff data.',
        'Helps you decide core vs emerging branches for the same rank and category.',
        'Works with the same exam filters as College Predictor for consistent shortlisting.',
      ]}
      inputGuide={[
        'Exam: Select the entrance exam used for counselling.',
        `${rankLabel}: Enter your expected or actual ${rankLabel.toLowerCase()}.`,
        `${categoryLabel}: Choose the reservation / category that applies to you.`,
        `${admissionLabel}: Apply counselling or home-state filters when shown.`,
        'College: After prediction, pick a college to view branch-wise outlook.',
      ]}
      preview={
        <div className="space-y-3 text-sm text-[#5a6570]">
          <p className="font-semibold text-[#041e30]">You will see</p>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
              High / medium / low branch chances
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
              Cutoff rank comparison for each branch
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
              Relative likelihood bars to compare options quickly
            </li>
          </ul>
        </div>
      }
      results={
        hasSearched ? (
          <section ref={resultsRef} tabIndex={-1} className="space-y-5">
            {apiError ? (
              <div className={`${swErrorBox} flex items-start gap-2`}>
                <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{apiError}</span>
              </div>
            ) : null}

            {branches.length ? (
              <section className={swResultsHighlight}>
                <h2 className={swSectionTitle}>Branch outlook</h2>
                <p className={swSectionSubtitle}>
                  Indicative probabilities for{' '}
                  <span className="font-semibold text-[#041e30]">
                    {selectedCollege?.college_name || 'selected college'}
                  </span>{' '}
                  at {isMht ? 'percentile' : 'rank'}{' '}
                  <span className="font-semibold tabular-nums text-[#041e30]">
                    {isMht ? form.percentile : form.rank}
                  </span>
                  .
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {branches.map((branch) => (
                    <article key={branch.id} className={swResultCard}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-sw-display text-lg font-bold text-[#041e30]">
                          {branch.name}
                        </h3>
                        <span
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                            branch.chance === 'High'
                              ? 'bg-[#fff4ed] text-[#c45a0c]'
                              : branch.chance === 'Low'
                                ? 'bg-[#fef2f2] text-[#b91c1c]'
                                : 'bg-[#eef2f7] text-[#2c3640]'
                          }`}
                        >
                          {branch.chance}
                        </span>
                      </div>
                      {branch.cutoff != null ? (
                        <p className="mt-2 text-sm text-[#5a6570]">
                          Cutoff rank:{' '}
                          <span className="font-semibold tabular-nums text-[#041e30]">
                            {Number(branch.cutoff).toLocaleString('en-IN')}
                          </span>
                        </p>
                      ) : null}
                      <div className="mt-4">
                        <div className="mb-1.5 flex justify-between text-xs font-semibold text-[#5a6570]">
                          <span>Relative likelihood</span>
                          <span className="tabular-nums text-[#041e30]">{branch.fit}%</span>
                        </div>
                        <div className={swProgressTrack}>
                          <div className={swProgressBar} style={{ width: `${branch.fit}%` }} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {!loading && !apiError && colleges.length > 0 && !branches.length ? (
              <p className="text-sm text-[#5a6570]">
                No branch data for this college. Try another college from the dropdown.
              </p>
            ) : null}
          </section>
        ) : null
      }
      insights={
        branches.length ? (
          <section className={swInsightsPanel}>
            <h3 className={swSectionTitle}>Next steps</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#5a6570]">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Keep one core and one emerging branch in your top preferences for flexibility.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Switch colleges in the dropdown to compare branch outlooks without re-entering rank.
              </li>
            </ul>
          </section>
        ) : null
      }
    >
      <div>
        <h2 className="text-lg font-bold text-[#111827] sm:text-xl">Enter branch prediction details</h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Choose exam and filters, then predict to load colleges and branch chances.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <SelectField
          label="Select exam"
          value={exam}
          onChange={onExamChange}
          options={ENTRANCE_EXAMS.filter((e) => e.supported !== false).map((e) => ({
            value: e.value,
            label: e.label,
          }))}
          placeholder="Select exam"
          error={errors.exam}
        />

        {admOptions.length ? (
          <SelectField
            label={admissionLabel}
            value={form.admission}
            onChange={(v) => onChange('admission', v)}
            options={admOptions}
            placeholder={`Select ${admissionLabel.toLowerCase()}`}
            error={errors.admission}
          />
        ) : null}

        <SelectField
          label={categoryLabel}
          value={form.category}
          onChange={(v) => onChange('category', v)}
          options={catOptions}
          placeholder="Select category"
          error={errors.category}
        />

        {isMht ? (
          <label className={swLabel}>
            {rankLabel}
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="e.g. 92.5"
              value={form.percentile}
              onChange={(e) => onChange('percentile', e.target.value)}
              className={swInput}
            />
            {errors.percentile ? <span className={swError}>{errors.percentile}</span> : null}
          </label>
        ) : (
          <label className={swLabel}>
            {rankLabel}
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 8420"
              value={form.rank}
              onChange={(e) => onChange('rank', e.target.value)}
              className={swInput}
            />
            {errors.rank ? <span className={swError}>{errors.rank}</span> : null}
          </label>
        )}

        {(isJee || isWbjee) && (
          <div>
            <p className={`${swLabel} mb-2`}>Gender</p>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#d0d7e1] bg-white p-1">
              {['female', 'male'].map((g) => {
                const active = form.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onChange('gender', g)}
                    className={`rounded-lg py-2.5 text-sm font-semibold capitalize transition ${
                      active
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : 'text-[#5a6570] hover:bg-[#f3f5f8]'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            {errors.gender ? <span className={swError}>{errors.gender}</span> : null}
          </div>
        )}

        {isWbjee ? (
          <SelectField
            label="Quota"
            value={form.quota}
            onChange={(v) => onChange('quota', v)}
            options={WBJEE_QUOTA_OPTIONS}
            placeholder="Select quota"
          />
        ) : null}

        <SelectField
          label="College"
          value={form.collegeId}
          onChange={onCollegeChange}
          options={collegeOptions}
          placeholder={
            colleges.length
              ? 'Select a college'
              : 'Predict once to load colleges from the predictor'
          }
          disabled={!colleges.length}
          error={errors.collegeId}
        />

        <button type="submit" className={swBtnPrimary} disabled={loading}>
          {loading ? (
            <>
              <FiLoader className="h-4 w-4 animate-spin" aria-hidden />
              Loading colleges…
            </>
          ) : (
            'Predict My Branches'
          )}
        </button>
      </form>
    </ToolWorkspaceLayout>
  );
}
