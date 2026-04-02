import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getPredictedColleges } from '../../../utils/counsellorApi';
import { getEntranceExamMeta } from '../../../constants/collegePredictorOptions';
import ExamGrid from './ExamGrid';
import FilterPanel from './FilterPanel';
import CollegeCard from './CollegeCard';

const PAGE_SIZE = 20;

const ERROR_MESSAGES = {
  INVALID_ENTRANCE_EXAM: 'Invalid entrance exam. Please select a valid option.',
  INVALID_ENTRANCE_EXAM_NAME_ENUM: 'Invalid entrance exam. Please select a valid option.',
  INVALID_ADMISSION_CATEGORY_NAME_ENUM: 'Invalid admission category. Please select a valid option.',
  INVALID_BRANCH_CODES: 'One or more branch codes are invalid.',
  INVALID_RESERVATION_CATEGORY_CODE: 'Invalid reservation category. Please select a valid option.',
  INVALID_CUTOFF_RANGE: 'Invalid cutoff range. Minimum must be less than maximum.',
  INVALID_INPUT_FORMAT: 'Please check your inputs (non-negative numbers for cutoff range).',
  SERVICE_UNAVAILABLE: 'Predictor service is temporarily unavailable. Please try again later.',
  UPSTREAM_ERROR: 'The predictor service returned an error. Please try again.',
};

function getErrorMessage(resStatus, fallback) {
  return ERROR_MESSAGES[resStatus] || fallback || 'Something went wrong. Please try again.';
}

const INITIAL_FILTERS = {
  cutoff_from: '',
  cutoff_to: '',
  admission_category_name_enum: 'GENERAL',
  reservation_category_codes: [],
  branch_codes: [],
  districts: [],
  sort_order: 'ASC',
};

function SkeletonCards() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl bg-white border border-gray-200 p-5">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

const sectionMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
};

export default function CollegePredictorPanel() {
  const [selectedExam, setSelectedExam] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [colleges, setColleges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [admissionCategoryName, setAdmissionCategoryName] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const filtersAnchorRef = useRef(null);

  const selectedExamMeta = selectedExam ? getEntranceExamMeta(selectedExam) : null;

  useEffect(() => {
    if (selectedExam && filtersAnchorRef.current) {
      filtersAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedExam]);

  const validate = useCallback(() => {
    const from = Number(filters.cutoff_from);
    const to = Number(filters.cutoff_to);
    if (filters.cutoff_from === '' || Number.isNaN(from) || from < 0) {
      return 'Please enter a valid non-negative number for "Cutoff from".';
    }
    if (filters.cutoff_to === '' || Number.isNaN(to) || to < 0) {
      return 'Please enter a valid non-negative number for "Cutoff to".';
    }
    if (from >= to) {
      return '"Cutoff from" must be less than "Cutoff to".';
    }
    return null;
  }, [filters]);

  const fetchColleges = useCallback(
    async (pageOffset = 0, append = false) => {
      if (!selectedExam) return;

      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }

      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const body = {
        exam: selectedExam,
        entrance_exam_name_enum: selectedExam,
        admission_category_name_enum: filters.admission_category_name_enum,
        cutoff_from: Number(filters.cutoff_from),
        cutoff_to: Number(filters.cutoff_to),
        sort_order: filters.sort_order,
      };
      if (filters.reservation_category_codes.length > 0) {
        body.reservation_category_codes = filters.reservation_category_codes;
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
        return;
      }

      const data = res.data;
      if (append) {
        setColleges((prev) => [...prev, ...(data.colleges || [])]);
      } else {
        setColleges(data.colleges || []);
      }
      setTotalCount(data.total_no_of_colleges ?? 0);
      setAdmissionCategoryName(data.admission_category_name || '');
      setOffset(pageOffset);
    },
    [selectedExam, filters, validate]
  );

  const handleSubmit = useCallback(() => {
    setColleges([]);
    setOffset(0);
    fetchColleges(0, false);
  }, [fetchColleges]);

  const handleLoadMore = useCallback(() => {
    const nextOffset = offset + PAGE_SIZE;
    fetchColleges(nextOffset, true);
  }, [offset, fetchColleges]);

  const handleExamChange = useCallback((exam) => {
    setSelectedExam(exam);
    setColleges([]);
    setTotalCount(0);
    setError(null);
    setHasSearched(false);
  }, []);

  const handleClearExam = useCallback(() => {
    setSelectedExam(null);
    setFilters(INITIAL_FILTERS);
    setColleges([]);
    setTotalCount(0);
    setError(null);
    setHasSearched(false);
    setOffset(0);
    setAdmissionCategoryName('');
  }, []);

  const loadedCount = colleges.length;
  const hasMore = loadedCount < totalCount;

  return (
    <div className="rounded-xl border border-gray-200/80 bg-slate-50 overflow-hidden shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            College Predictor
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
            Select your exam and predict colleges instantly
          </p>
        </header>

        <ExamGrid selectedExam={selectedExam} onSelect={handleExamChange} />

        <AnimatePresence mode="wait">
          {selectedExam && (
            <motion.div
              key="filters-results"
              ref={filtersAnchorRef}
              className="mt-10 space-y-6 scroll-mt-6"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                initial: { opacity: 0, y: 16 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -12 },
              }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleClearExam}
                  className="text-sm font-medium text-primary-navy hover:text-primary-navy/80 underline-offset-2 hover:underline transition-colors"
                >
                  Change exam
                </button>
              </div>

              <div className="sticky top-4 z-10">
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  onSubmit={handleSubmit}
                  loading={loading}
                  selectedExamLabel={selectedExamMeta?.label ?? selectedExam}
                  accent={selectedExamMeta?.accent}
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {loading && <SkeletonCards />}

              {!loading && hasSearched && (
                <motion.div
                  {...sectionMotion}
                  className="space-y-4"
                >
                  {colleges.length > 0 ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        {admissionCategoryName && (
                          <span className="text-sm font-medium text-gray-700">
                            {admissionCategoryName}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          Showing {loadedCount} of {totalCount} colleges
                        </span>
                      </div>

                      <div className="space-y-3">
                        {colleges.map((college, idx) => (
                          <CollegeCard
                            key={college.college_id || `college-${idx}`}
                            college={college}
                          />
                        ))}
                      </div>

                      {hasMore && (
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="rounded-lg bg-primary-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-navy/90 disabled:opacity-50 transition-colors duration-300"
                          >
                            {loadingMore ? 'Loading…' : `Load more (${totalCount - loadedCount} remaining)`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-12 text-center rounded-xl bg-white border border-gray-200">
                      <p className="text-gray-500 font-medium">No colleges found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your cutoff range or filters
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
