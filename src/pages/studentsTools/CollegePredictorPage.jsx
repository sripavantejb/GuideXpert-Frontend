import { useMemo, useRef, useState } from 'react';
import { FiAlertCircle, FiLoader, FiSearch } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import ToolFactsPreview from './components/ToolFactsPreview';
import { CollegeCard } from '../../components/Counsellor/CollegePredictor';
import { getPredictedCollegesPublic } from '../../utils/api';
import { formatPredictorClientError } from '../../utils/collegePredictorErrors';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { useRequireLoginToUse } from '../../components/studentAuth/RequireStudentAuth';
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
  INDIAN_STATES_OPTIONS,
  MHT_CET_STATE_LEVEL_RESERVATION_OPTIONS,
  mhtCetApiAdmissionCategory,
  normalizeMhtReservationCodeForApi,
} from '../../constants/mhtCetOptions';
import { percentileToMhtCutoffRange } from '../../utils/mhtCetPercentile';
import {
  swBtnPrimary,
  swBtnSecondary,
  swError,
  swErrorBox,
  swLabel,
  swSelect,
  swInput,
  swSectionSubtitle,
  swSectionTitle,
} from './components/studentWorkspaceUi';

const PAGE_SIZE = 10;
const RESULT_CARD_ACCENT = 'green';

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

export default function CollegePredictorPage() {
  const { savePrediction } = useStudentAuth() || {};
  const requireLoginToUse = useRequireLoginToUse();
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
    state: '',
    gender: 'male',
    quota: WBJEE_QUOTA_ALL_INDIA,
  }));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef(null);

  const onExamChange = (nextExam) => {
    const meta = getEntranceExamMeta(nextExam);
    setExam(nextExam);
    setForm((prev) => ({
      ...prev,
      category: defaultCategory(meta),
      admission: defaultAdmission(meta),
      rank: '',
      percentile: '',
    }));
    setErrors({});
    setApiError(null);
    setColleges([]);
    setTotalCount(0);
    setHasSearched(false);
  };

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next = {};
    if (!exam) next.exam = 'Select an exam.';
    if (!form.category) next.category = 'Category is required.';
    if (!form.state) next.state = 'Home state is required.';
    if (isMht) {
      const p = Number(form.percentile);
      if (!form.percentile || Number.isNaN(p) || p <= 0 || p > 100) {
        next.percentile = 'Enter a valid percentile (0–100).';
      }
    } else if (isWbjee) {
      const r = Number(form.rank);
      if (!form.rank || Number.isNaN(r) || r < 1 || !Number.isInteger(r)) {
        next.rank = 'Enter a valid WBJEE / JEE Main rank.';
      }
    } else {
      const r = Number(form.rank);
      if (!form.rank || Number.isNaN(r) || r < 1 || !Number.isInteger(r)) {
        next.rank = 'Enter a valid rank.';
      }
    }
    if (isJee && !form.gender) next.gender = 'Select gender.';
    if (admOptions.length && !form.admission) next.admission = 'Select admission category.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = (pageOffset) => {
    const apiExam = examMeta?.apiValue ?? exam;
    const admission = form.admission || defaultAdmission(examMeta);

    if (isJee) {
      const apiExamMain = examMeta?.jeeMainApiExam || 'JEE_MAINS_2024';
      const [cutoff_from, cutoff_to] = rankToCutoff(Number(form.rank));
      const reservation_category_codes = getJeeReservationCategoryCodes(
        apiExamMain,
        form.gender,
        form.category
      );
      return {
        offset: pageOffset,
        limit: PAGE_SIZE,
        exam: apiExamMain,
        entrance_exam_name_enum: apiExamMain,
        admission_category_name_enum: 'DEFAULT',
        cutoff_from,
        cutoff_to,
        reservation_category_codes,
        branch_codes: [],
        districts: [],
        sort_order: 'ASC',
      };
    }

    if (isMht) {
      const [cutoff_from, cutoff_to] = percentileToMhtCutoffRange(Number(form.percentile));
      const code = normalizeMhtReservationCodeForApi('STATE_LEVEL', form.category);
      return {
        offset: pageOffset,
        limit: PAGE_SIZE,
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
        offset: pageOffset,
        limit: PAGE_SIZE,
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
      offset: pageOffset,
      limit: PAGE_SIZE,
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

  const fetchColleges = async (pageOffset = 0, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    setApiError(null);

    const payload = buildPayload(pageOffset);
    const res = await getPredictedCollegesPublic(payload);

    append ? setLoadingMore(false) : setLoading(false);
    setHasSearched(true);

    if (!res.success) {
      setApiError(getErrorMessage(res.data || {}, res.message));
      if (!append) {
        setColleges([]);
        setTotalCount(0);
      }
      return;
    }

    const data = res.data || {};
    const list = data.colleges || [];
    setOffset(pageOffset);
    setTotalCount(Number(data.total_no_of_colleges) || list.length);
    setColleges((prev) => (append ? [...prev, ...list] : list));

    if (!append && res.success) {
      const total = Number(data.total_no_of_colleges) || list.length;
      savePrediction?.({
        type: 'college_predictor',
        tool: 'College Predictor',
        title: 'Used College Predictor',
        summary: [
          examMeta?.label || exam,
          isMht ? `percentile ${form.percentile}` : `rank ${form.rank}`,
          form.category,
          `${total} colleges`,
        ]
          .filter(Boolean)
          .join(' · '),
        payload: {
          exam,
          rank: form.rank || null,
          percentile: form.percentile || null,
          category: form.category,
          admission: form.admission,
          gender: form.gender,
          quota: form.quota,
          totalColleges: total,
          sampleColleges: list.slice(0, 5).map((c) => c.college_name || c.name || c.collegeName).filter(Boolean),
        },
      });
    }

    if (!append) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!requireLoginToUse()) return;
    if (!validate()) return;
    setColleges([]);
    setOffset(0);
    await fetchColleges(0, false);
  };

  const onLoadMore = async () => {
    const nextOffset = offset + PAGE_SIZE;
    await fetchColleges(nextOffset, true);
  };

  const rankLabel = isMht
    ? 'Expected percentile'
    : examMeta?.rankFieldLabel || 'Expected rank';
  const categoryLabel = examMeta?.reservationFieldLabel || 'Category / caste group';
  const admissionLabel = examMeta?.admissionFieldLabel || 'Counselling / region';

  return (
    <ToolWorkspaceLayout
      title="College Predictor"
      subtitle="Get precise college predictions powered by multi-year cut-off trends"
      compactHero
      trustBadge="Trusted by 500K+ students"
      trustSubline="Built on multi-year cutoff trends"
      howItWorks={[
        {
          title: 'Match criteria',
          detail:
            'Your rank and category are compared with historical opening and closing ranks.',
        },
        {
          title: 'Apply filters',
          detail:
            'Home state and counselling filters narrow the college pool to relevant options.',
        },
        {
          title: 'Score chances',
          detail:
            'Each match is tagged using estimated admission probability from live cutoffs.',
        },
      ]}
      whatThisToolDoes={[
        'Predicts colleges you can realistically target based on exam rank, category, and counselling filters.',
        'Uses multi-year cutoff trends so shortlists stay grounded in recent admission data.',
        'Helps you prioritize likely, borderline, and reach options before preference filling.',
      ]}
      inputGuide={[
        'Exam: Choose the entrance exam you appeared for or plan to appear.',
        `${rankLabel}: Enter your expected or actual ${rankLabel.toLowerCase()}.`,
        `${categoryLabel}: Select the reservation / category used in counselling.`,
        `${admissionLabel}: Pick the counselling region or home-state filter when available.`,
      ]}
      preview={
        <ToolFactsPreview
          icon={FiSearch}
          iconClass="bg-[#fff4ed] text-[#f27921]"
          name="College Predictor"
          metricLabel="Best used for"
          metricValue="Shortlist"
          points={[
            'Building a first college list after rank prediction',
            'Comparing category and region impact on matches',
            'Planning counselling preference order',
          ]}
        />
      }
      results={
        hasSearched ? (
          <section ref={resultsRef} tabIndex={-1} className="space-y-5">
            <div>
              <h2 className={swSectionTitle}>Predicted colleges</h2>
              <p className={swSectionSubtitle}>
                {loading
                  ? 'Fetching matches…'
                  : totalCount > 0
                    ? `Showing ${colleges.length} of ${totalCount} colleges for ${examMeta?.label || exam}.`
                    : 'No colleges matched these filters. Try adjusting rank or category.'}
              </p>
            </div>

            {apiError ? (
              <div className={`${swErrorBox} flex items-start gap-2`}>
                <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{apiError}</span>
              </div>
            ) : null}

            <div className="space-y-4">
              {colleges.map((college, index) => (
                <CollegeCard
                  key={college.college_id || `${college.college_name}-${index}`}
                  college={college}
                  accentKey={RESULT_CARD_ACCENT}
                  index={index + 1}
                />
              ))}
            </div>

            {!loading && colleges.length > 0 && colleges.length < totalCount ? (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  className={swBtnSecondary}
                  onClick={onLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <FiLoader className="h-4 w-4 animate-spin" aria-hidden />
                      Loading…
                    </>
                  ) : (
                    'Load more colleges'
                  )}
                </button>
              </div>
            ) : null}
          </section>
        ) : null
      }
      insights={
        hasSearched && !loading && colleges.length > 0 ? (
          <section className="rounded-2xl border border-dashed border-[#cfd7e2] bg-[#f4f7fb]/70 p-6 sm:p-7">
            <h3 className="font-sw-display text-lg font-bold tracking-tight text-[#041e30] sm:text-xl">
              Next steps
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#5a6570]">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Move strong matches into College Comparison to weigh fees, placements, and location.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Use Branch Predictor on a shortlisted college to check realistic branch chances.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Keep a mix of likely, borderline, and stretch colleges in your preference list.
              </li>
            </ul>
          </section>
        ) : null
      }
    >
      <div>
        <h2 className="text-lg font-bold text-[#111827] sm:text-xl">Enter exam details</h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Get personalized college recommendations in seconds!
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <SelectField
          label="Select exam / counselling"
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
          label="Home state"
          value={form.state}
          onChange={(v) => onChange('state', v)}
          options={INDIAN_STATES_OPTIONS}
          placeholder="Select your home state"
          error={errors.state}
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
              placeholder="e.g. 12430"
              value={form.rank}
              onChange={(e) => onChange('rank', e.target.value)}
              className={swInput}
            />
            {errors.rank ? <span className={swError}>{errors.rank}</span> : null}
          </label>
        )}

        <SelectField
          label={categoryLabel}
          value={form.category}
          onChange={(v) => onChange('category', v)}
          options={catOptions}
          placeholder="Select category"
          error={errors.category}
        />

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

        <button type="submit" className={swBtnPrimary} disabled={loading}>
          {loading ? (
            <>
              <FiLoader className="h-4 w-4 animate-spin" aria-hidden />
              Predicting…
            </>
          ) : (
            'Predict My Colleges'
          )}
        </button>
      </form>
    </ToolWorkspaceLayout>
  );
}
