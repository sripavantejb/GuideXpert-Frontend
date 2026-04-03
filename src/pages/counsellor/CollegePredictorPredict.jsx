import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { getPredictedColleges } from '../../utils/counsellorApi';
import {
  getEntranceExamMeta,
  ENTRANCE_EXAMS,
  rankToCutoff,
  getApEamcetDistrictOptions,
} from '../../constants/collegePredictorOptions';
import { getAccentClasses } from '../../constants/examCardConfig';
import { FilterPanel, CollegeCard } from '../../components/Counsellor/CollegePredictor';

const PAGE_SIZE = 20;

const ERROR_MESSAGES = {
  INVALID_ENTRANCE_EXAM: 'Invalid entrance exam. Please select a valid option.',
  INVALID_ENTRANCE_EXAM_NAME_ENUM: 'Invalid entrance exam. Please select a valid option.',
  INVALID_ADMISSION_CATEGORY_NAME_ENUM: 'Invalid admission category. Please select a valid option.',
  INVALID_BRANCH_CODES: 'One or more branch codes are invalid.',
  INVALID_RESERVATION_CATEGORY_CODE: 'Invalid reservation category. Please select a valid option.',
  INVALID_CUTOFF_RANGE: 'Invalid cutoff range. Minimum must be less than maximum.',
  INVALID_INPUT_FORMAT: 'Please check your inputs (non-negative numbers for rank).',
  SERVICE_UNAVAILABLE: 'Predictor service is temporarily unavailable. Please try again later.',
  UPSTREAM_ERROR: 'The predictor service returned an error. Please try again.',
};

function getErrorMessage(resStatus, fallback) {
  return ERROR_MESSAGES[resStatus] || fallback || 'Something went wrong. Please try again.';
}

const SHIMMER_CLASS =
  'bg-[length:1400px_100%] bg-[linear-gradient(100deg,_#f3f4f6_30%,_#e5e7eb_50%,_#f3f4f6_70%)] animate-shimmer';

const TITLE_WIDTHS = ['w-3/4', 'w-2/3', 'w-1/2', 'w-5/6', 'w-3/5', 'w-4/5'];

function SkeletonCards({ count = 6 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden border-l-4 border-l-gray-200">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl shrink-0 ${SHIMMER_CLASS}`} />
              <div className="flex-1 space-y-3">
                <div className={`h-5 rounded-lg ${TITLE_WIDTHS[i % TITLE_WIDTHS.length]} ${SHIMMER_CLASS}`} />
                <div className={`h-3 rounded w-1/2 ${SHIMMER_CLASS}`} />
                <div className="flex gap-2.5 pt-0.5">
                  <div className={`h-7 rounded-lg w-24 ${SHIMMER_CLASS}`} />
                  <div className={`h-7 rounded-lg w-20 ${SHIMMER_CLASS}`} />
                  <div className={`h-7 rounded-lg w-28 ${SHIMMER_CLASS}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const resultsMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
};

const VALID_EXAM_VALUES = new Set(ENTRANCE_EXAMS.map((e) => e.value));

/** Stable JSON for comparing filter inputs that affect the predictor API. */
function getPredictorFilterSnapshot(f) {
  return JSON.stringify({
    rank: f.rank,
    admission_category_name_enum: f.admission_category_name_enum,
    reservation_category_codes: [...(f.reservation_category_codes || [])].sort(),
    branch_codes: [...(f.branch_codes || [])].sort(),
    districts: [...(f.districts || [])].sort(),
    sort_order: f.sort_order,
  });
}

export default function CollegePredictorPredict() {
  const { exam } = useParams();
  const navigate = useNavigate();

  const examMeta = getEntranceExamMeta(exam);
  const accent = getAccentClasses(examMeta?.accent);
  const defaultAdmission = examMeta?.admissionCategories?.[0]?.value ?? '';
  const defaultReservationList = examMeta?.defaultReservationCode
    ? [examMeta.defaultReservationCode]
    : [];

  const initialFilters = useMemo(
    () => ({
      rank: '',
      admission_category_name_enum: defaultAdmission,
      reservation_category_codes: defaultReservationList,
      branch_codes: [],
      districts: [],
      sort_order: 'ASC',
    }),
    [defaultAdmission, examMeta?.defaultReservationCode]
  );

  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const meta = getEntranceExamMeta(exam);
    if (!meta) return;
    setFilters({
      rank: '',
      admission_category_name_enum: meta.admissionCategories?.[0]?.value ?? '',
      reservation_category_codes: meta.defaultReservationCode ? [meta.defaultReservationCode] : [],
      branch_codes: [],
      districts: [],
      sort_order: 'ASC',
    });
    setCollegeSearch('');
    setHasSearched(false);
    setError(null);
    setColleges([]);
    setTotalCount(0);
    setOffset(0);
    setAdmissionCategoryName('');
    lastSuccessfulFilterSnapshotRef.current = null;
    hasSuccessfulPredictionRef.current = false;
  }, [exam]);

  /** AP EAMCET: region-specific district codes — drop selections invalid after switching AU ↔ SVU. */
  useEffect(() => {
    if (exam !== 'AP_EAMCET') return;
    const valid = new Set(getApEamcetDistrictOptions(filters.admission_category_name_enum).map((o) => o.value));
    setFilters((prev) => {
      const next = prev.districts.filter((d) => valid.has(d));
      if (next.length === prev.districts.length) return prev;
      return { ...prev, districts: next };
    });
  }, [exam, filters.admission_category_name_enum]);
  const [colleges, setColleges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [admissionCategoryName, setAdmissionCategoryName] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');

  /** Set after a successful API response; used to auto-refetch when filters change without duplicate runs after the first search. */
  const lastSuccessfulFilterSnapshotRef = useRef(null);
  const hasSuccessfulPredictionRef = useRef(false);

  const validate = useCallback(() => {
    const rank = Number(filters.rank);
    if (filters.rank === '' || Number.isNaN(rank) || rank < 1 || !Number.isInteger(rank)) {
      return 'Please enter a valid positive integer for your rank.';
    }
    return null;
  }, [filters]);

  const fetchColleges = useCallback(
    async (pageOffset = 0, append = false) => {
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }

      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const [cutoffFrom, cutoffTo] = rankToCutoff(Number(filters.rank));
      const apiExam = examMeta?.apiValue ?? exam;

      const body = {
        exam: apiExam,
        entrance_exam_name_enum: apiExam,
        admission_category_name_enum: filters.admission_category_name_enum,
        cutoff_from: cutoffFrom,
        cutoff_to: cutoffTo,
        sort_order: filters.sort_order,
      };
      const resCodes =
        filters.reservation_category_codes?.length > 0
          ? filters.reservation_category_codes
          : examMeta?.defaultReservationCode
            ? [examMeta.defaultReservationCode]
            : [];
      if (resCodes.length > 0) {
        body.reservation_category_codes = resCodes;
      }
      if (filters.branch_codes.length > 0) {
        body.branch_codes = filters.branch_codes;
      }
      if (filters.districts.length > 0) {
        body.districts = filters.districts;
      }

      const res = await getPredictedColleges({
        offset: pageOffset,
        limit: PAGE_SIZE,
        ...body,
      });

      append ? setLoadingMore(false) : setLoading(false);
      setHasSearched(true);

      if (!res.success) {
        const errData = res.data || {};
        setError(getErrorMessage(errData.res_status, errData.response || res.message));
        if (!append) {
          setColleges([]);
          setTotalCount(0);
        }
        hasSuccessfulPredictionRef.current = false;
        return;
      }

      const data = res.data;
      if (!append) {
        hasSuccessfulPredictionRef.current = true;
        lastSuccessfulFilterSnapshotRef.current = getPredictorFilterSnapshot(filters);
      }
      if (append) {
        setColleges((prev) => [...prev, ...(data.colleges || [])]);
      } else {
        setColleges(data.colleges || []);
      }
      setTotalCount(data.total_no_of_colleges ?? 0);
      setAdmissionCategoryName(data.admission_category_name || '');
      setOffset(pageOffset);
    },
    [exam, examMeta, filters, validate]
  );

  const handleSubmit = useCallback(() => {
    setColleges([]);
    setOffset(0);
    fetchColleges(0, false);
  }, [fetchColleges]);

  const handleLoadMore = useCallback(() => {
    fetchColleges(offset + PAGE_SIZE, true);
  }, [offset, fetchColleges]);

  /** After at least one successful search, refetch when districts/branches/category/region/sort/rank change (no need to click Predict again). */
  useEffect(() => {
    if (!hasSuccessfulPredictionRef.current) return;
    if (validate()) return;
    const current = getPredictorFilterSnapshot(filters);
    if (lastSuccessfulFilterSnapshotRef.current === current) return;
    setColleges([]);
    setOffset(0);
    fetchColleges(0, false);
  }, [filters, validate, fetchColleges]);

  if (!VALID_EXAM_VALUES.has(exam)) {
    return <Navigate to=".." replace />;
  }

  if (examMeta && examMeta.supported === false) {
    return <Navigate to=".." replace />;
  }

  const districtOptionsResolved = useMemo(() => {
    const byAdm = examMeta?.districtOptionsByAdmission;
    if (byAdm && filters.admission_category_name_enum) {
      const list = byAdm[filters.admission_category_name_enum];
      if (Array.isArray(list) && list.length > 0) return list;
    }
    return examMeta?.districtOptions;
  }, [examMeta, filters.admission_category_name_enum]);

  const normalizedSearch = collegeSearch.trim().toLowerCase();
  const filteredColleges = normalizedSearch
    ? colleges.filter((college) => {
      const haystack = [
        college.college_name,
        college.college_address,
        college.district_enum,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    })
    : colleges;

  const loadedCount = colleges.length;
  const visibleCount = filteredColleges.length;
  const hasMore = loadedCount < totalCount;
  const examLabel = examMeta?.label ?? exam;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header banner */}
      <div className={`rounded-2xl ${accent.headerBg} border border-gray-200/60 p-5 sm:p-6`}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('..')}
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/80 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className={`text-xl sm:text-2xl font-bold ${accent.headerText} tracking-tight`}>
              {examLabel} College Predictor
            </h2>
            <p className={`text-sm ${accent.headerSub} mt-0.5`}>
              Enter your rank and discover matching colleges
            </p>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        onSubmit={handleSubmit}
        loading={loading}
        selectedExamLabel={examLabel}
        accent={examMeta?.accent}
        admissionCategories={examMeta?.admissionCategories ?? []}
        admissionFieldLabel={examMeta?.admissionFieldLabel ?? 'Admission category'}
        reservationFieldLabel={examMeta?.reservationFieldLabel ?? 'Reservation categories'}
        rankFieldLabel={examMeta?.rankFieldLabel ?? 'Your Rank'}
        reservationOptions={examMeta?.reservationOptions}
        reservationSelectSingle={examMeta?.reservationSelectSingle ?? false}
        districtOptions={districtOptionsResolved}
        districtSelectionHint={examMeta?.districtSelectionHint}
      />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && <SkeletonCards />}

      {/* Results */}
      <AnimatePresence mode="wait">
        {!loading && hasSearched && (
          <motion.div key="results" {...resultsMotion} className="space-y-5">
            {colleges.length > 0 ? (
              <>
                {/* Results summary bar with integrated search */}
                <div className="rounded-xl bg-white border border-gray-200 px-5 py-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="font-semibold text-gray-800">
                        {totalCount} college{totalCount !== 1 ? 's' : ''} found
                      </span>
                      {admissionCategoryName && (
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${accent.badge}`}>
                          {admissionCategoryName}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        Showing {visibleCount} of {loadedCount} loaded
                      </span>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <FiSearch className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="college-search"
                        type="text"
                        value={collegeSearch}
                        onChange={(e) => setCollegeSearch(e.target.value)}
                        placeholder="Search colleges..."
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* College cards */}
                <div className="space-y-4">
                  {filteredColleges.map((college, idx) => (
                    <CollegeCard
                      key={college.college_id || `college-${idx}`}
                      college={college}
                      accentKey={examMeta?.accent}
                      index={idx + 1}
                    />
                  ))}
                </div>

                {normalizedSearch && filteredColleges.length === 0 && (
                  <div className="py-8 text-center rounded-xl bg-white border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">No colleges match your search.</p>
                  </div>
                )}

                {/* Load more skeleton */}
                {loadingMore && <SkeletonCards count={2} />}

                {/* Load more */}
                {hasMore && !loadingMore && (
                  <div className="pt-3 pb-2 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className={`rounded-xl px-6 py-3 text-sm font-semibold shadow-sm disabled:opacity-50 transition-all duration-300 hover:shadow-md ${accent.button}`}
                    >
                      Load more colleges ({totalCount - loadedCount} remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <FiSearch className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold text-lg">No colleges found</p>
                <p className="text-sm text-gray-400 mt-1.5 max-w-sm mx-auto">
                  Try a different rank, changing the admission category, or removing some filters
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial state */}
      {!loading && !hasSearched && (
        <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-gray-300">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <FiSearch className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Ready to predict</p>
          <p className="text-sm text-gray-400 mt-1">
            Enter your rank and filters above, then click <strong>Predict Colleges</strong>
          </p>
        </div>
      )}
    </div>
  );
}
