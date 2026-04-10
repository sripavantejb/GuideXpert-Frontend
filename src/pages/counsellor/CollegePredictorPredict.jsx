/* eslint-disable react-hooks/set-state-in-effect -- exam route reset, AP district sync, predictor refetch */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { getPredictedColleges } from '../../utils/counsellorApi';
import {
  getEntranceExamMeta,
  ENTRANCE_EXAMS,
  rankToCutoff,
  getApEamcetDistrictOptions,
  filterCollegesForApEamcetPredictor,
  apEamcetPredictorDisplayTotal,
  JEE_RESERVATION_OPTIONS,
  getJeeReservationCategoryCodes,
  mapKeamBranchCodesForApi,
  filterCollegesForKeamDistrictPredictor,
  getWbjeeReservationCategoryCode,
  filterCollegesForWbjeeDistrictPredictor,
  WBJEE_CATEGORY_OPTIONS,
} from '../../constants/collegePredictorOptions';
import {
  MHT_CET_ADMISSION_TYPE_OPTIONS,
  MHT_CET_DISTRICT_OPTIONS,
  getDistrictOptionsForNativeState,
  mhtCetApiAdmissionCategory,
  normalizeMhtReservationCodeForApi,
} from '../../constants/mhtCetOptions';
import { percentileToMhtCutoffRange } from '../../utils/mhtCetPercentile';
import { getAccentClasses } from '../../constants/examCardConfig';
import {
  FilterPanel,
  CollegeCard,
  JeeCombinedPredictorForm,
  MhtCetPredictorForm,
  TneaPredictorForm,
  KeamPredictorForm,
  WbjeePredictorForm,
} from '../../components/Counsellor/CollegePredictor';
import { formatPredictorClientError } from '../../utils/collegePredictorErrors';

const PAGE_SIZE = 20;

/** EAMCET-style result cards for every exam (see examCardConfig `green`). */
const RESULT_CARD_ACCENT = 'green';

const ERROR_MESSAGES = {
  INVALID_ENTRANCE_EXAM: 'Invalid entrance exam. Please select a valid option.',
  INVALID_ENTRANCE_EXAM_NAME_ENUM:
    'This exam is not enabled on the predictor service yet, or the exam name is invalid. Try again later or contact support.',
  INVALID_ADMISSION_CATEGORY_NAME_ENUM: 'Invalid admission category. Please select a valid option.',
  INVALID_BRANCH_CODES: 'One or more branch codes are invalid.',
  INVALID_DISTRICT:
    'District filter accepts Maharashtra districts only. Pick a valid option or leave native place outside Maharashtra (no district filter).',
  INVALID_RESERVATION_CATEGORY_CODE: 'Invalid reservation category. Please select a valid option.',
  INVALID_CUTOFF_RANGE: 'Invalid cutoff range. Minimum must be less than maximum.',
  INVALID_INPUT_FORMAT: 'Please check your inputs (non-negative numbers for rank).',
  SERVICE_UNAVAILABLE: 'Predictor service is temporarily unavailable. Please try again later.',
  UPSTREAM_ERROR: 'The predictor service returned an error. Please try again.',
};

function getErrorMessage(errData, fallbackMessage) {
  return formatPredictorClientError(ERROR_MESSAGES, errData, fallbackMessage);
}

const SHIMMER_CLASS =
  'bg-[length:1400px_100%] bg-[linear-gradient(100deg,_#f3f4f6_30%,_#e5e7eb_50%,_#f3f4f6_70%)] animate-shimmer';

const TITLE_WIDTHS = ['w-3/4', 'w-2/3', 'w-1/2', 'w-5/6', 'w-3/5', 'w-4/5'];

function SkeletonCards({ count = 6 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden border-l-4 border-l-emerald-200">
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

const VALID_EXAM_VALUES = new Set(ENTRANCE_EXAMS.map((e) => e.value));

const COLLEGE_PREDICTOR_EXAMS_PATH = '/counsellor/tools/college-predictor';

const emptyJeeSlot = () => ({
  colleges: [],
  total: 0,
  offset: 0,
  admissionCategoryName: '',
  error: null,
});

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

function getJeeFilterSnapshot(j) {
  return JSON.stringify({
    rankMain: j.rankMain,
    rankAdvanced: j.rankAdvanced,
    admission_category_name_enum: j.admission_category_name_enum,
    reservation_category_codes: [...(j.reservation_category_codes || [])].sort(),
    branch_codes: [...(j.branch_codes || [])].sort(),
    branchMode: j.branchMode,
    sort_order: j.sort_order,
    gender: j.gender,
  });
}

function initialMhtForm() {
  return {
    percentile: '',
    admission_type_enum: 'STATE_LEVEL',
    branchMode: 'all',
    branch_codes: [],
    sort_order: 'ASC',
    reservation_category_codes: [],
    district: '',
    mh_district: '',
    native_state: '',
  };
}

function getMhtFilterSnapshot(m) {
  return JSON.stringify({
    percentile: m.percentile,
    admission_type_enum: m.admission_type_enum,
    reservation_category_codes: [...(m.reservation_category_codes || [])].sort(),
    branch_codes: [...(m.branch_codes || [])].sort(),
    branchMode: m.branchMode,
    sort_order: m.sort_order,
    district: m.district,
    mh_district: m.mh_district,
    native_state: m.native_state,
  });
}

function initialTneaForm(defaultReservation) {
  return {
    rank: '',
    reservation_category_codes: defaultReservation ? [defaultReservation] : [],
    districtMode: 'all',
    districts: [],
    branchMode: 'all',
    branch_codes: [],
    sort_order: 'ASC',
    native_state: '',
    native_district: '',
  };
}

function getTneaFilterSnapshot(t) {
  return JSON.stringify({
    rank: t.rank,
    reservation_category_codes: [...(t.reservation_category_codes || [])].sort(),
    districts: [...(t.districts || [])].sort(),
    districtMode: t.districtMode,
    branch_codes: [...(t.branch_codes || [])].sort(),
    branchMode: t.branchMode,
    sort_order: t.sort_order,
    native_state: t.native_state,
    native_district: t.native_district,
  });
}

function initialKeamForm(defaultReservation) {
  return initialTneaForm(defaultReservation);
}

function getKeamFilterSnapshot(t) {
  return getTneaFilterSnapshot(t);
}

function initialWbjeeForm(defaultCategory) {
  const cat = defaultCategory || 'OPEN';
  return {
    rankWbjee: '',
    rankJeeMain: '',
    reservation_category_codes: [cat],
    quota: 'all_india',
    current_state: '',
    current_district: '',
    branchMode: 'all',
    branch_codes: [],
    sort_order: 'ASC',
    admission_category_name_enum: 'DEFAULT',
  };
}

function getWbjeeFilterSnapshot(w) {
  return JSON.stringify({
    rankWbjee: w.rankWbjee,
    rankJeeMain: w.rankJeeMain,
    reservation_category_codes: [...(w.reservation_category_codes || [])].sort(),
    quota: w.quota,
    current_state: w.current_state,
    current_district: w.current_district,
    branch_codes: [...(w.branch_codes || [])].sort(),
    branchMode: w.branchMode,
    sort_order: w.sort_order,
  });
}

function wbjeeCategoryLabel(base) {
  const o = WBJEE_CATEGORY_OPTIONS.find((x) => x.value === base);
  return o?.label ?? base ?? '';
}

function parsePositiveIntRank(s) {
  const n = Number(s);
  if (s === '' || Number.isNaN(n) || n < 1 || !Number.isInteger(n)) return null;
  return n;
}

function reservationLabelForValue(value) {
  const v = JEE_RESERVATION_OPTIONS.find((o) => o.value === value);
  return v?.label ?? value ?? '';
}

export default function CollegePredictorPredict() {
  const { exam } = useParams();
  const navigate = useNavigate();
  const isJee = exam === 'JEE';
  const isMhtCet = exam === 'MHT_CET';
  const isTnea = exam === 'TNEA';
  const isKeam = exam === 'KEAM';
  const isWbjee = exam === 'WBJEE';

  const examMeta = getEntranceExamMeta(exam);
  const accent = getAccentClasses(examMeta?.accent);

  const initialFilters = useMemo(() => {
    const meta = getEntranceExamMeta(exam);
    return {
      rank: '',
      admission_category_name_enum: meta?.admissionCategories?.[0]?.value ?? '',
      reservation_category_codes: meta?.defaultReservationCode ? [meta.defaultReservationCode] : [],
      branch_codes: [],
      districts: [],
      sort_order: 'ASC',
    };
  }, [exam]);

  const [filters, setFilters] = useState(initialFilters);

  const [jeeForm, setJeeForm] = useState(() => ({
    rankMain: '',
    rankAdvanced: '',
    reservation_category_codes: ['OPEN'],
    branchMode: 'all',
    branch_codes: [],
    sort_order: 'ASC',
    admission_category_name_enum: 'DEFAULT',
    gender: '',
  }));

  const [jeeSlots, setJeeSlots] = useState(() => ({
    main: emptyJeeSlot(),
    advanced: emptyJeeSlot(),
  }));
  const [jeeActiveTab, setJeeActiveTab] = useState('main');
  const [jeeHadMain, setJeeHadMain] = useState(false);
  const [jeeHadAdvanced, setJeeHadAdvanced] = useState(false);
  const [jeeLoading, setJeeLoading] = useState(false);
  const [jeeLoadingMore, setJeeLoadingMore] = useState(false);

  const [mhtForm, setMhtForm] = useState(() => initialMhtForm());

  const [tneaForm, setTneaForm] = useState(() =>
    initialTneaForm(getEntranceExamMeta('TNEA')?.defaultReservationCode)
  );

  const [keamForm, setKeamForm] = useState(() =>
    initialKeamForm(getEntranceExamMeta('KEAM')?.defaultReservationCode)
  );

  const [wbjeeForm, setWbjeeForm] = useState(() =>
    initialWbjeeForm(getEntranceExamMeta('WBJEE')?.defaultReservationCode)
  );

  const [colleges, setColleges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [admissionCategoryName, setAdmissionCategoryName] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');

  const lastSuccessfulFilterSnapshotRef = useRef(null);
  const hasSuccessfulPredictionRef = useRef(false);
  const lastSuccessfulJeeSnapshotRef = useRef(null);
  const hasSuccessfulJeePredictionRef = useRef(false);
  const lastSuccessfulMhtSnapshotRef = useRef(null);
  const hasSuccessfulMhtPredictionRef = useRef(false);
  const lastSuccessfulTneaSnapshotRef = useRef(null);
  const hasSuccessfulTneaPredictionRef = useRef(false);
  const lastSuccessfulKeamSnapshotRef = useRef(null);
  const hasSuccessfulKeamPredictionRef = useRef(false);
  const lastSuccessfulWbjeeSnapshotRef = useRef(null);
  const hasSuccessfulWbjeePredictionRef = useRef(false);

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
    setJeeForm({
      rankMain: '',
      rankAdvanced: '',
      reservation_category_codes: meta.defaultReservationCode ? [meta.defaultReservationCode] : ['OPEN'],
      branchMode: 'all',
      branch_codes: [],
      sort_order: 'ASC',
      admission_category_name_enum: meta.admissionCategories?.[0]?.value ?? 'DEFAULT',
      gender: '',
    });
    setJeeSlots({ main: emptyJeeSlot(), advanced: emptyJeeSlot() });
    setJeeActiveTab('main');
    setJeeHadMain(false);
    setJeeHadAdvanced(false);
    setCollegeSearch('');
    setHasSearched(false);
    setError(null);
    setColleges([]);
    setTotalCount(0);
    setOffset(0);
    setAdmissionCategoryName('');
    lastSuccessfulFilterSnapshotRef.current = null;
    hasSuccessfulPredictionRef.current = false;
    lastSuccessfulJeeSnapshotRef.current = null;
    hasSuccessfulJeePredictionRef.current = false;
    setMhtForm(initialMhtForm());
    lastSuccessfulMhtSnapshotRef.current = null;
    hasSuccessfulMhtPredictionRef.current = false;
    if (exam === 'TNEA') {
      setTneaForm(initialTneaForm(meta.defaultReservationCode));
      lastSuccessfulTneaSnapshotRef.current = null;
      hasSuccessfulTneaPredictionRef.current = false;
    }
    if (exam === 'KEAM') {
      setKeamForm(initialKeamForm(meta.defaultReservationCode));
      lastSuccessfulKeamSnapshotRef.current = null;
      hasSuccessfulKeamPredictionRef.current = false;
    }
    if (exam === 'WBJEE') {
      setWbjeeForm(initialWbjeeForm(meta.defaultReservationCode));
      lastSuccessfulWbjeeSnapshotRef.current = null;
      hasSuccessfulWbjeePredictionRef.current = false;
    }
  }, [exam]);

  useEffect(() => {
    if (exam !== 'AP_EAMCET') return;
    const valid = new Set(getApEamcetDistrictOptions(filters.admission_category_name_enum).map((o) => o.value));
    setFilters((prev) => {
      const next = prev.districts.filter((d) => valid.has(d));
      if (next.length === prev.districts.length) return prev;
      return { ...prev, districts: next };
    });
  }, [exam, filters.admission_category_name_enum]);

  const validate = useCallback(() => {
    const rank = Number(filters.rank);
    if (filters.rank === '' || Number.isNaN(rank) || rank < 1 || !Number.isInteger(rank)) {
      return 'Please enter a valid positive integer for your rank.';
    }
    return null;
  }, [filters]);

  const validateJee = useCallback(() => {
    const rm = parsePositiveIntRank(jeeForm.rankMain);
    const ra = parsePositiveIntRank(jeeForm.rankAdvanced);
    if (rm === null && ra === null) {
      return 'Enter at least one valid rank (JEE Main and/or JEE Advanced).';
    }
    const res = jeeForm.reservation_category_codes?.[0];
    if (!res || !String(res).trim()) {
      return 'Please select a category.';
    }
    if (!jeeForm.gender) {
      return 'Please select a gender (required for JEE category expansion).';
    }
    if (jeeForm.branchMode === 'specific' && (!jeeForm.branch_codes || jeeForm.branch_codes.length === 0)) {
      return 'Select at least one branch, or choose “All branches”.';
    }
    return null;
  }, [jeeForm]);

  const validateMht = useCallback(() => {
    const p = Number(mhtForm.percentile);
    if (mhtForm.percentile === '' || !Number.isFinite(p) || p < 1 || p > 100) {
      return 'Please enter a percentile between 1 and 100.';
    }
    if (mhtForm.branchMode === 'specific' && (!mhtForm.branch_codes || mhtForm.branch_codes.length === 0)) {
      return 'Select at least one branch, or choose “All branches”.';
    }
    if (!mhtForm.reservation_category_codes?.length) {
      return 'Please select a category.';
    }
    if (mhtForm.admission_type_enum === 'STATE_LEVEL') {
      if (!mhtForm.native_state || !mhtForm.mh_district) {
        return 'Select native state and district.';
      }
      const allowed = new Set(
        getDistrictOptionsForNativeState(mhtForm.native_state).map((o) => o.value)
      );
      if (!allowed.has(mhtForm.mh_district)) {
        return 'Select a district that belongs to your native state.';
      }
    } else if (!mhtForm.district) {
      return 'Please select a Maharashtra district.';
    }
    return null;
  }, [mhtForm]);

  const validateTnea = useCallback(() => {
    const rank = Number(tneaForm.rank);
    if (tneaForm.rank === '' || Number.isNaN(rank) || rank < 1 || !Number.isInteger(rank)) {
      return 'Please enter a valid positive integer for your TNEA rank.';
    }
    if (!tneaForm.reservation_category_codes?.length) {
      return 'Please select a category.';
    }
    if (tneaForm.branchMode === 'specific' && (!tneaForm.branch_codes || tneaForm.branch_codes.length === 0)) {
      return 'Select at least one branch, or choose “All branches”.';
    }
    if (tneaForm.districtMode === 'specific' && (!tneaForm.districts || tneaForm.districts.length === 0)) {
      return 'Select at least one Tamil Nadu district, or choose “All Districts”.';
    }
    if (!tneaForm.native_state || !tneaForm.native_district) {
      return 'Please select native state and current district.';
    }
    const allowed = new Set(
      getDistrictOptionsForNativeState(tneaForm.native_state).map((o) => o.value)
    );
    if (!allowed.has(tneaForm.native_district)) {
      return 'Select a district that belongs to your native state.';
    }
    return null;
  }, [tneaForm]);

  const validateKeam = useCallback(() => {
    const rank = Number(keamForm.rank);
    if (keamForm.rank === '' || Number.isNaN(rank) || rank < 1 || !Number.isInteger(rank)) {
      return 'Please enter a valid positive integer for your KEAM rank.';
    }
    if (!keamForm.reservation_category_codes?.length) {
      return 'Please select a category.';
    }
    if (keamForm.branchMode === 'specific' && (!keamForm.branch_codes || keamForm.branch_codes.length === 0)) {
      return 'Select at least one branch, or choose “All branches”.';
    }
    if (keamForm.districtMode === 'specific' && (!keamForm.districts || keamForm.districts.length === 0)) {
      return 'Select at least one Kerala district, or choose “All Districts”.';
    }
    if (!keamForm.native_state || !keamForm.native_district) {
      return 'Please select native state and current district.';
    }
    const allowed = new Set(
      getDistrictOptionsForNativeState(keamForm.native_state).map((o) => o.value)
    );
    if (!allowed.has(keamForm.native_district)) {
      return 'Select a district that belongs to your native state.';
    }
    return null;
  }, [keamForm]);

  const validateWbjee = useCallback(() => {
    const rw = parsePositiveIntRank(wbjeeForm.rankWbjee);
    const rj = parsePositiveIntRank(wbjeeForm.rankJeeMain);
    if (rw === null && rj === null) {
      return 'Enter at least one valid rank (WBJEE and/or JEE Main).';
    }
    const base = wbjeeForm.reservation_category_codes?.[0];
    if (!base || !String(base).trim()) {
      return 'Please select a category.';
    }
    if (!wbjeeForm.quota) {
      return 'Please select a quota (All India or Home State).';
    }
    const resCode = getWbjeeReservationCategoryCode(base, wbjeeForm.quota);
    if (!resCode) {
      return 'This category applies to Home State (West Bengal) quota only. Switch quota or category.';
    }
    if (wbjeeForm.branchMode === 'specific' && (!wbjeeForm.branch_codes || wbjeeForm.branch_codes.length === 0)) {
      return 'Select at least one branch, or choose “All branches”.';
    }
    if (!wbjeeForm.current_state || !wbjeeForm.current_district) {
      return 'Please select state and district.';
    }
    const allowed = new Set(
      getDistrictOptionsForNativeState(wbjeeForm.current_state).map((o) => o.value)
    );
    if (!allowed.has(wbjeeForm.current_district)) {
      return 'Select a district that belongs to the selected state.';
    }
    return null;
  }, [wbjeeForm]);

  const fetchMhtColleges = useCallback(
    async (pageOffset = 0, append = false) => {
      const validationError = validateMht();
      if (validationError) {
        setError(validationError);
        return;
      }

      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const [cutoffFrom, cutoffTo] = percentileToMhtCutoffRange(Number(mhtForm.percentile));
      const apiExam = examMeta?.apiValue ?? 'MHTCET';

      /**
       * Upstream filters by MH revenue districts only. For State Level + non-MH native state we
       * cannot send a non-MH district name; an empty list matches no rows — use all MH districts
       * so the predictor returns Maharashtra-wide results (native place stays UI-only).
       *
       * Home University / Other than Home University: a **single** district filter consistently
       * yields zero rows on the earlywave MHTCET dataset (HU/OHU seat rows are not keyed the same
       * way as one revenue district). Use all Maharashtra districts for the API call — same idea
       * as State Level + non-MH native. The user still picks a district in the form for context;
       * they can narrow results with the college search box.
       */
      const districts = [];
      if (mhtForm.admission_type_enum === 'STATE_LEVEL') {
        if (mhtForm.native_state === 'Maharashtra' && mhtForm.mh_district) {
          districts.push(mhtForm.mh_district);
        } else if (mhtForm.native_state && mhtForm.native_state !== 'Maharashtra') {
          districts.push(...MHT_CET_DISTRICT_OPTIONS.map((o) => o.value));
        }
      } else if (
        mhtForm.admission_type_enum === 'HOME_UNIVERSITY' ||
        mhtForm.admission_type_enum === 'OTHER_THAN_HOME_UNIVERSITY'
      ) {
        if (mhtForm.district) {
          districts.push(...MHT_CET_DISTRICT_OPTIONS.map((o) => o.value));
        }
      }

      const body = {
        exam: apiExam,
        entrance_exam_name_enum: apiExam,
        admission_category_name_enum: mhtCetApiAdmissionCategory(mhtForm.admission_type_enum),
        cutoff_from: cutoffFrom,
        cutoff_to: cutoffTo,
        sort_order: mhtForm.sort_order || 'ASC',
        branch_codes:
          mhtForm.branchMode === 'specific' && mhtForm.branch_codes?.length > 0
            ? mhtForm.branch_codes
            : [],
        districts,
        reservation_category_codes: (() => {
          const raw =
            mhtForm.reservation_category_codes?.length > 0
              ? mhtForm.reservation_category_codes
              : examMeta?.defaultReservationCode
                ? [examMeta.defaultReservationCode]
                : [];
          return raw.map((c) => normalizeMhtReservationCodeForApi(mhtForm.admission_type_enum, c));
        })(),
      };

      const res = await getPredictedColleges({
        offset: pageOffset,
        limit: PAGE_SIZE,
        ...body,
      });

      append ? setLoadingMore(false) : setLoading(false);
      setHasSearched(true);

      if (!res.success) {
        const errData = res.data || {};
        setError(getErrorMessage(errData, res.message));
        if (!append) {
          setColleges([]);
          setTotalCount(0);
        }
        hasSuccessfulMhtPredictionRef.current = false;
        return;
      }

      const data = res.data;
      if (!append) {
        hasSuccessfulMhtPredictionRef.current = true;
        lastSuccessfulMhtSnapshotRef.current = getMhtFilterSnapshot(mhtForm);
      }
      const rawList = data.colleges || [];
      if (append) {
        setColleges((prev) => [...prev, ...rawList]);
      } else {
        setColleges(rawList);
      }
      setTotalCount(data.total_no_of_colleges ?? 0);
      setAdmissionCategoryName(data.admission_category_name || '');
      setOffset(pageOffset);
    },
    [examMeta, mhtForm, validateMht]
  );

  const fetchTneaColleges = useCallback(
    async (pageOffset = 0, append = false) => {
      const validationError = validateTnea();
      if (validationError) {
        setError(validationError);
        return;
      }

      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const [cutoffFrom, cutoffTo] = rankToCutoff(Number(tneaForm.rank));
      const apiExam = examMeta?.apiValue ?? 'TNEA';

      const districts =
        tneaForm.districtMode === 'specific' && tneaForm.districts?.length > 0
          ? tneaForm.districts
          : [];
      const branch_codes =
        tneaForm.branchMode === 'specific' && tneaForm.branch_codes?.length > 0
          ? tneaForm.branch_codes
          : [];
      const resCodes =
        tneaForm.reservation_category_codes?.length > 0
          ? tneaForm.reservation_category_codes
          : examMeta?.defaultReservationCode
            ? [examMeta.defaultReservationCode]
            : ['OC'];

      const body = {
        exam: apiExam,
        entrance_exam_name_enum: apiExam,
        admission_category_name_enum: 'DEFAULT',
        cutoff_from: cutoffFrom,
        cutoff_to: cutoffTo,
        sort_order: tneaForm.sort_order || 'ASC',
        branch_codes,
        districts,
        reservation_category_codes: resCodes,
      };

      const res = await getPredictedColleges({
        offset: pageOffset,
        limit: PAGE_SIZE,
        ...body,
      });

      append ? setLoadingMore(false) : setLoading(false);
      setHasSearched(true);

      if (!res.success) {
        const errData = res.data || {};
        setError(getErrorMessage(errData, res.message));
        if (!append) {
          setColleges([]);
          setTotalCount(0);
        }
        hasSuccessfulTneaPredictionRef.current = false;
        return;
      }

      const data = res.data;
      if (!append) {
        hasSuccessfulTneaPredictionRef.current = true;
        lastSuccessfulTneaSnapshotRef.current = getTneaFilterSnapshot(tneaForm);
      }
      const rawList = data.colleges || [];
      if (append) {
        setColleges((prev) => [...prev, ...rawList]);
      } else {
        setColleges(rawList);
      }
      setTotalCount(data.total_no_of_colleges ?? 0);
      setAdmissionCategoryName(data.admission_category_name || '');
      setOffset(pageOffset);
    },
    [examMeta, tneaForm, validateTnea]
  );

  const fetchKeamColleges = useCallback(
    async (pageOffset = 0, append = false) => {
      const validationError = validateKeam();
      if (validationError) {
        setError(validationError);
        return;
      }

      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const [cutoffFrom, cutoffTo] = rankToCutoff(Number(keamForm.rank));
      const apiExam = examMeta?.apiValue ?? 'KEAM';

      // Upstream KEAM often has empty district_enum; sending district names returns 0 rows — filter client-side.
      const districts = [];
      const branch_codes = mapKeamBranchCodesForApi(
        keamForm.branchMode === 'specific' && keamForm.branch_codes?.length > 0
          ? keamForm.branch_codes
          : []
      );
      const resCodes =
        keamForm.reservation_category_codes?.length > 0
          ? keamForm.reservation_category_codes
          : examMeta?.defaultReservationCode
            ? [examMeta.defaultReservationCode]
            : ['SM'];

      const body = {
        exam: apiExam,
        entrance_exam_name_enum: apiExam,
        admission_category_name_enum: 'DEFAULT',
        cutoff_from: cutoffFrom,
        cutoff_to: cutoffTo,
        sort_order: keamForm.sort_order || 'ASC',
        branch_codes,
        districts,
        reservation_category_codes: resCodes,
      };

      const res = await getPredictedColleges({
        offset: pageOffset,
        limit: PAGE_SIZE,
        ...body,
      });

      append ? setLoadingMore(false) : setLoading(false);
      setHasSearched(true);

      if (!res.success) {
        const errData = res.data || {};
        setError(getErrorMessage(errData, res.message));
        if (!append) {
          setColleges([]);
          setTotalCount(0);
        }
        hasSuccessfulKeamPredictionRef.current = false;
        return;
      }

      const data = res.data;
      if (!append) {
        hasSuccessfulKeamPredictionRef.current = true;
        lastSuccessfulKeamSnapshotRef.current = getKeamFilterSnapshot(keamForm);
      }
      const rawList = data.colleges || [];
      if (append) {
        setColleges((prev) => [...prev, ...rawList]);
      } else {
        setColleges(rawList);
      }
      setTotalCount(data.total_no_of_colleges ?? 0);
      setAdmissionCategoryName(data.admission_category_name || '');
      setOffset(pageOffset);
    },
    [examMeta, keamForm, validateKeam]
  );

  const fetchWbjeeColleges = useCallback(
    async (pageOffset = 0, append = false) => {
      const validationError = validateWbjee();
      if (validationError) {
        setError(validationError);
        return;
      }

      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const rw = parsePositiveIntRank(wbjeeForm.rankWbjee);
      const rj = parsePositiveIntRank(wbjeeForm.rankJeeMain);
      const rankNum = rw ?? rj;
      const [cutoffFrom, cutoffTo] = rankToCutoff(rankNum);

      const apiExam = examMeta?.wbjeeApiExam ?? examMeta?.apiValue ?? 'WBJEE_2024';
      const base = wbjeeForm.reservation_category_codes?.[0];
      const resCode = getWbjeeReservationCategoryCode(base, wbjeeForm.quota);

      const branch_codes =
        wbjeeForm.branchMode === 'specific' && wbjeeForm.branch_codes?.length > 0
          ? wbjeeForm.branch_codes
          : [];
      // nw-predictors WBJEE: non-empty districts often yield zero rows (strict enum / token mismatch).
      // Match KEAM-style flow: wide server response + client-side location narrowing in UI.
      const districts = [];

      const body = {
        exam: 'WBJEE',
        entrance_exam_name_enum: apiExam,
        admission_category_name_enum: 'DEFAULT',
        cutoff_from: cutoffFrom,
        cutoff_to: cutoffTo,
        sort_order: wbjeeForm.sort_order || 'ASC',
        branch_codes,
        districts,
        reservation_category_codes: resCode ? [resCode] : [],
      };

      const res = await getPredictedColleges({
        offset: pageOffset,
        limit: PAGE_SIZE,
        ...body,
      });

      append ? setLoadingMore(false) : setLoading(false);
      setHasSearched(true);

      if (!res.success) {
        const errData = res.data || {};
        setError(getErrorMessage(errData, res.message));
        if (!append) {
          setColleges([]);
          setTotalCount(0);
        }
        hasSuccessfulWbjeePredictionRef.current = false;
        return;
      }

      const data = res.data;
      if (!append) {
        hasSuccessfulWbjeePredictionRef.current = true;
        lastSuccessfulWbjeeSnapshotRef.current = getWbjeeFilterSnapshot(wbjeeForm);
      }
      const rawList = data.colleges || [];
      if (append) {
        setColleges((prev) => [...prev, ...rawList]);
      } else {
        setColleges(rawList);
      }
      setTotalCount(data.total_no_of_colleges ?? 0);
      setAdmissionCategoryName(data.admission_category_name || '');
      setOffset(pageOffset);
    },
    [examMeta, wbjeeForm, validateWbjee]
  );

  const handleMhtSubmit = useCallback(() => {
    const validationError = validateMht();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setColleges([]);
    setOffset(0);
    fetchMhtColleges(0, false);
  }, [validateMht, fetchMhtColleges]);

  const handleTneaSubmit = useCallback(() => {
    const validationError = validateTnea();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setColleges([]);
    setOffset(0);
    fetchTneaColleges(0, false);
  }, [validateTnea, fetchTneaColleges]);

  const handleKeamSubmit = useCallback(() => {
    const validationError = validateKeam();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setColleges([]);
    setOffset(0);
    fetchKeamColleges(0, false);
  }, [validateKeam, fetchKeamColleges]);

  const handleWbjeeSubmit = useCallback(() => {
    const validationError = validateWbjee();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setColleges([]);
    setOffset(0);
    fetchWbjeeColleges(0, false);
  }, [validateWbjee, fetchWbjeeColleges]);

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
        branch_codes: Array.isArray(filters.branch_codes) && filters.branch_codes.length > 0
          ? filters.branch_codes
          : [],
        districts: Array.isArray(filters.districts) && filters.districts.length > 0
          ? filters.districts
          : [],
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

      const res = await getPredictedColleges({
        offset: pageOffset,
        limit: PAGE_SIZE,
        ...body,
      });

      append ? setLoadingMore(false) : setLoading(false);
      setHasSearched(true);

      if (!res.success) {
        const errData = res.data || {};
        setError(getErrorMessage(errData, res.message));
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
      const rawList = data.colleges || [];
      const listForUi =
        exam === 'AP_EAMCET' ? filterCollegesForApEamcetPredictor(rawList) : rawList;
      if (append) {
        setColleges((prev) => [...prev, ...listForUi]);
      } else {
        setColleges(listForUi);
      }
      const rawTotal = data.total_no_of_colleges ?? 0;
      setTotalCount(
        exam === 'AP_EAMCET' ? apEamcetPredictorDisplayTotal(rawTotal) : rawTotal
      );
      setAdmissionCategoryName(data.admission_category_name || '');
      setOffset(pageOffset);
    },
    [exam, examMeta, filters, validate]
  );

  const fetchJeeSlot = useCallback(
    async (slot, pageOffset, append, formSnapshot) => {
      const rankStr = slot === 'main' ? formSnapshot.rankMain : formSnapshot.rankAdvanced;
      const rankNum = parsePositiveIntRank(rankStr);
      if (rankNum === null) return { ok: false, skipped: true };

      const apiExam =
        slot === 'main'
          ? examMeta?.jeeMainApiExam ?? 'JEE_MAIN'
          : examMeta?.jeeAdvancedApiExam ?? 'JEE_ADVANCED';
      const [cutoffFrom, cutoffTo] = rankToCutoff(rankNum);

      const baseCategory =
        formSnapshot.reservation_category_codes?.[0] || 'OPEN';
      const gender = formSnapshot.gender || 'male';
      const resCodes = getJeeReservationCategoryCodes(apiExam, gender, baseCategory);

      const body = {
        exam: apiExam,
        entrance_exam_name_enum: apiExam,
        admission_category_name_enum: 'DEFAULT',
        cutoff_from: cutoffFrom,
        cutoff_to: cutoffTo,
        sort_order: formSnapshot.sort_order || 'ASC',
        reservation_category_codes: resCodes,
        branch_codes:
          formSnapshot.branchMode === 'specific' && formSnapshot.branch_codes?.length > 0
            ? formSnapshot.branch_codes
            : [],
        districts: [],
      };

      const res = await getPredictedColleges({
        offset: pageOffset,
        limit: PAGE_SIZE,
        ...body,
      });

      if (!res.success) {
        const errData = res.data || {};
        const msg = getErrorMessage(errData, res.message);
        setJeeSlots((prev) => ({
          ...prev,
          [slot]: append
            ? { ...prev[slot], error: msg }
            : {
                ...emptyJeeSlot(),
                error: msg,
              },
        }));
        return { ok: false, skipped: false };
      }

      const data = res.data;
      const rawList = data.colleges || [];
      setJeeSlots((prev) => {
        const cur = prev[slot];
        const nextList = append ? [...cur.colleges, ...rawList] : rawList;
        const rawTotal = data.total_no_of_colleges ?? 0;
        return {
          ...prev,
          [slot]: {
            colleges: nextList,
            total: rawTotal,
            offset: pageOffset,
            admissionCategoryName: data.admission_category_name || '',
            error: null,
          },
        };
      });
      return { ok: true, skipped: false };
    },
    [examMeta]
  );

  const runJeeFetch = useCallback(
    async (pageOffsetMain, pageOffsetAdv, appendMain, appendAdv, formSnapshot) => {
      const hasM = parsePositiveIntRank(formSnapshot.rankMain) !== null;
      const hasA = parsePositiveIntRank(formSnapshot.rankAdvanced) !== null;

      const tasks = [];
      if (hasM) tasks.push(fetchJeeSlot('main', pageOffsetMain, appendMain, formSnapshot));
      if (hasA) tasks.push(fetchJeeSlot('advanced', pageOffsetAdv, appendAdv, formSnapshot));

      const results = await Promise.all(tasks);
      const anyOk = results.some((r) => r && r.ok);
      return { anyOk, hasM, hasA };
    },
    [fetchJeeSlot]
  );

  const handleJeeSubmit = useCallback(async () => {
    const validationError = validateJee();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setJeeLoading(true);
    setHasSearched(true);

    const hasM = parsePositiveIntRank(jeeForm.rankMain) !== null;
    const hasA = parsePositiveIntRank(jeeForm.rankAdvanced) !== null;
    setJeeHadMain(hasM);
    setJeeHadAdvanced(hasA);
    setJeeActiveTab(hasM ? 'main' : 'advanced');

    if (!hasM) {
      setJeeSlots((prev) => ({ ...prev, main: emptyJeeSlot() }));
    }
    if (!hasA) {
      setJeeSlots((prev) => ({ ...prev, advanced: emptyJeeSlot() }));
    }

    const snap = { ...jeeForm };
    const { anyOk } = await runJeeFetch(0, 0, false, false, snap);

    setJeeLoading(false);
    if (anyOk) {
      hasSuccessfulJeePredictionRef.current = true;
      lastSuccessfulJeeSnapshotRef.current = getJeeFilterSnapshot(snap);
    } else {
      hasSuccessfulJeePredictionRef.current = false;
      lastSuccessfulJeeSnapshotRef.current = null;
    }
  }, [jeeForm, validateJee, runJeeFetch]);

  const handleJeeLoadMore = useCallback(async () => {
    const slot = jeeActiveTab;
    const cur = jeeSlots[slot];
    if (!cur || cur.colleges.length >= cur.total) return;
    setJeeLoadingMore(true);
    const nextOff = cur.offset + PAGE_SIZE;
    await fetchJeeSlot(slot, nextOff, true, jeeForm);
    setJeeLoadingMore(false);
  }, [jeeActiveTab, jeeSlots, jeeForm, fetchJeeSlot]);

  const handleSubmit = useCallback(() => {
    setColleges([]);
    setOffset(0);
    fetchColleges(0, false);
  }, [fetchColleges]);

  const handleLoadMore = useCallback(() => {
    if (isMhtCet) {
      fetchMhtColleges(offset + PAGE_SIZE, true);
    } else if (isTnea) {
      fetchTneaColleges(offset + PAGE_SIZE, true);
    } else if (isKeam) {
      fetchKeamColleges(offset + PAGE_SIZE, true);
    } else if (isWbjee) {
      fetchWbjeeColleges(offset + PAGE_SIZE, true);
    } else {
      fetchColleges(offset + PAGE_SIZE, true);
    }
  }, [isMhtCet, isTnea, isKeam, isWbjee, offset, fetchColleges, fetchMhtColleges, fetchTneaColleges, fetchKeamColleges, fetchWbjeeColleges]);

  // Intentionally no auto-refetch when filters change (including branch/district chips): users click
  // "Predict Colleges" again. Otherwise every branch toggle triggers a full fetch and feels broken.

  useEffect(() => {
    if (!isJee) return;
    if (!hasSuccessfulJeePredictionRef.current) return;
    if (validateJee()) return;
    const current = getJeeFilterSnapshot(jeeForm);
    if (lastSuccessfulJeeSnapshotRef.current === current) return;

    const hasM = parsePositiveIntRank(jeeForm.rankMain) !== null;
    const hasA = parsePositiveIntRank(jeeForm.rankAdvanced) !== null;
    setJeeHadMain(hasM);
    setJeeHadAdvanced(hasA);

    (async () => {
      setJeeLoading(true);
      setError(null);
      if (!hasM) setJeeSlots((prev) => ({ ...prev, main: emptyJeeSlot() }));
      if (!hasA) setJeeSlots((prev) => ({ ...prev, advanced: emptyJeeSlot() }));
      const snap = { ...jeeForm };
      const { anyOk } = await runJeeFetch(0, 0, false, false, snap);
      setJeeLoading(false);
      if (anyOk) {
        lastSuccessfulJeeSnapshotRef.current = getJeeFilterSnapshot(snap);
        hasSuccessfulJeePredictionRef.current = true;
      }
    })();
  }, [jeeForm, validateJee, runJeeFetch, isJee]);

  const districtOptionsResolved = useMemo(() => {
    const byAdm = examMeta?.districtOptionsByAdmission;
    if (byAdm && filters.admission_category_name_enum) {
      const list = byAdm[filters.admission_category_name_enum];
      if (Array.isArray(list) && list.length > 0) return list;
    }
    return examMeta?.districtOptions;
  }, [examMeta, filters.admission_category_name_enum]);

  const mhtAdmissionLabel = useMemo(() => {
    if (!isMhtCet) return '';
    return MHT_CET_ADMISSION_TYPE_OPTIONS.find((o) => o.value === mhtForm.admission_type_enum)?.label ?? '';
  }, [isMhtCet, mhtForm.admission_type_enum]);

  if (!VALID_EXAM_VALUES.has(exam)) {
    return <Navigate to={COLLEGE_PREDICTOR_EXAMS_PATH} replace />;
  }

  if (examMeta && examMeta.supported === false) {
    return <Navigate to={COLLEGE_PREDICTOR_EXAMS_PATH} replace />;
  }

  const normalizedSearch = collegeSearch.trim().toLowerCase();

  const collegesForDistrictFilteredList = useMemo(() => {
    if (isKeam) {
      if (keamForm.districtMode !== 'specific' || !keamForm.districts?.length) {
        return colleges;
      }
      return filterCollegesForKeamDistrictPredictor(colleges, keamForm.districts);
    }
    if (isWbjee) {
      if (!wbjeeForm.current_district) {
        return colleges;
      }
      const filtered = filterCollegesForWbjeeDistrictPredictor(colleges, [wbjeeForm.current_district]);
      // Upstream rows often miss district fields; avoid empty UI when filter text does not match.
      return filtered.length > 0 ? filtered : colleges;
    }
    return colleges;
  }, [
    isKeam,
    isWbjee,
    colleges,
    keamForm.districtMode,
    keamForm.districts,
    wbjeeForm.current_district,
  ]);

  const activeJeeSlotKey = jeeActiveTab === 'main' ? 'main' : 'advanced';
  const activeJeeList = jeeSlots[activeJeeSlotKey]?.colleges ?? [];
  const activeJeeTotal = jeeSlots[activeJeeSlotKey]?.total ?? 0;
  const activeJeeAdmissionName = jeeSlots[activeJeeSlotKey]?.admissionCategoryName ?? '';
  const activeJeeSlotError = jeeSlots[activeJeeSlotKey]?.error ?? null;

  const filteredColleges = !isJee
    ? normalizedSearch
      ? collegesForDistrictFilteredList.filter((college) => {
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
      : collegesForDistrictFilteredList
    : normalizedSearch
      ? activeJeeList.filter((college) => {
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
      : activeJeeList;

  const loadedCount = isJee ? activeJeeList.length : colleges.length;
  const visibleCount = filteredColleges.length;
  const hasMore = isJee ? loadedCount < activeJeeTotal : loadedCount < totalCount;

  const examLabel = examMeta?.label ?? exam;
  const pageTitle = examMeta?.predictorPageTitle ?? `${examLabel} College Predictor`;
  const pageSubtitle =
    examMeta?.predictorPageSubtitle ??
    (isMhtCet
      ? 'Enter percentile, admission type, and preferences to discover matching colleges.'
      : isWbjee
        ? 'Enter WBJEE and/or JEE Main rank, category, quota, and optional location filters.'
        : isTnea || isKeam
          ? 'Enter your expected rank, category, filters, and native place.'
          : 'Enter your rank and discover matching colleges');

  const categoryDisplay = reservationLabelForValue(jeeForm.reservation_category_codes?.[0]);
  const rankDisplayMain = parsePositiveIntRank(jeeForm.rankMain);
  const rankDisplayAdv = parsePositiveIntRank(jeeForm.rankAdvanced);

  const jeeBannerErrors = [jeeSlots.main?.error, jeeSlots.advanced?.error].filter(Boolean);
  const jeeUniqueErrors = [...new Set(jeeBannerErrors)];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className={`rounded-2xl ${accent.headerBg} border border-gray-200/60 p-5 sm:p-6`}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(COLLEGE_PREDICTOR_EXAMS_PATH)}
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/80 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className={`text-xl sm:text-2xl font-bold ${accent.headerText} tracking-tight`}>
              {pageTitle}
            </h2>
            <p className={`text-sm ${accent.headerSub} mt-0.5`}>{pageSubtitle}</p>
          </div>
        </div>
      </div>

      {isJee ? (
        <JeeCombinedPredictorForm
          values={jeeForm}
          onChange={setJeeForm}
          onSubmit={handleJeeSubmit}
          loading={jeeLoading}
          accentKey={examMeta?.accent}
          reservationOptions={examMeta?.reservationOptions ?? JEE_RESERVATION_OPTIONS}
          reservationFieldLabel={examMeta?.reservationFieldLabel ?? 'Select a Category'}
        />
      ) : isMhtCet ? (
        <MhtCetPredictorForm
          values={mhtForm}
          onChange={setMhtForm}
          onSubmit={handleMhtSubmit}
          loading={loading}
          accentKey={examMeta?.accent}
        />
      ) : isTnea ? (
        <TneaPredictorForm
          values={tneaForm}
          onChange={setTneaForm}
          onSubmit={handleTneaSubmit}
          loading={loading}
          accentKey={examMeta?.accent}
          reservationOptions={examMeta?.reservationOptions}
          districtOptions={examMeta?.districtOptions}
        />
      ) : isKeam ? (
        <KeamPredictorForm
          values={keamForm}
          onChange={setKeamForm}
          onSubmit={handleKeamSubmit}
          loading={loading}
          accentKey={examMeta?.accent}
          reservationOptions={examMeta?.reservationOptions}
          districtOptions={examMeta?.districtOptions}
        />
      ) : isWbjee ? (
        <WbjeePredictorForm
          values={wbjeeForm}
          onChange={setWbjeeForm}
          onSubmit={handleWbjeeSubmit}
          loading={loading}
          accentKey={examMeta?.accent}
          categoryOptions={examMeta?.reservationOptions ?? WBJEE_CATEGORY_OPTIONS}
        />
      ) : (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onSubmit={handleSubmit}
          loading={loading}
          selectedExamLabel={examLabel}
          accent={examMeta?.accent}
          admissionCategories={examMeta?.admissionCategories ?? []}
          admissionFieldLabel={examMeta?.admissionFieldLabel ?? 'Admission category'}
          hideAdmissionField={examMeta?.hideAdmissionField ?? false}
          reservationFieldLabel={examMeta?.reservationFieldLabel ?? 'Reservation categories'}
          rankFieldLabel={examMeta?.rankFieldLabel ?? 'Your Rank'}
          reservationOptions={examMeta?.reservationOptions}
          reservationSelectSingle={examMeta?.reservationSelectSingle ?? false}
          districtOptions={districtOptionsResolved}
          districtSelectionHint={examMeta?.districtSelectionHint}
        />
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {isJee && hasSearched && jeeUniqueErrors.length > 0 && !jeeLoading && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Predictor service note</p>
            {jeeUniqueErrors.map((msg) => (
              <p key={msg} className="mt-1">{msg}</p>
            ))}
          </div>
        </div>
      )}

      {(isJee ? jeeLoading : loading) && <SkeletonCards />}

      <AnimatePresence mode="wait">
        {!(isJee ? jeeLoading : loading) && hasSearched && (
          <div key="results" className="space-y-5">
            {isJee ? (
              <>
                {(jeeHadMain || jeeHadAdvanced) && (
                  <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
                    {jeeHadMain && (
                      <button
                        type="button"
                        onClick={() => setJeeActiveTab('main')}
                        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                          jeeActiveTab === 'main'
                            ? 'border-violet-600 text-violet-900'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                      >
                        JEE Main
                      </button>
                    )}
                    {jeeHadAdvanced && (
                      <button
                        type="button"
                        onClick={() => setJeeActiveTab('advanced')}
                        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                          jeeActiveTab === 'advanced'
                            ? 'border-violet-600 text-violet-900'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                      >
                        JEE Advanced
                      </button>
                    )}
                  </div>
                )}

                {(jeeHadMain || jeeHadAdvanced) && (
                  <div className={`rounded-xl ${accent.headerBg} border border-gray-200/80 px-5 py-4`}>
                    <p className="text-sm text-gray-700">
                      Based on your rank and category, you may get into the following colleges:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base">
                      {jeeActiveTab === 'main' && rankDisplayMain != null && (
                        <span>
                          <span className="font-semibold text-gray-800">Your rank: </span>
                          <span className={`font-bold ${accent.headerSub}`}>{rankDisplayMain}</span>
                        </span>
                      )}
                      {jeeActiveTab === 'advanced' && rankDisplayAdv != null && (
                        <span>
                          <span className="font-semibold text-gray-800">Your rank: </span>
                          <span className={`font-bold ${accent.headerSub}`}>{rankDisplayAdv}</span>
                        </span>
                      )}
                      <span>
                        <span className="font-semibold text-gray-800">Your category: </span>
                        <span className={`font-bold ${accent.headerSub}`}>{categoryDisplay}</span>
                      </span>
                    </div>
                  </div>
                )}

                {activeJeeSlotError && (
                  <div className="py-8 text-center rounded-xl bg-white border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">{activeJeeSlotError}</p>
                  </div>
                )}

                {!activeJeeSlotError && activeJeeList.length > 0 ? (
                  <>
                    <div className="rounded-xl bg-white border border-gray-200 px-5 py-3 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-sm">
                          <span className="font-semibold text-gray-800">
                            {activeJeeTotal} college{activeJeeTotal !== 1 ? 's' : ''} found
                          </span>
                          {activeJeeAdmissionName && (
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${accent.badge}`}>
                              {activeJeeAdmissionName}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            Showing {visibleCount} of {loadedCount} loaded
                          </span>
                        </div>
                        <div className="relative w-full sm:w-64">
                          <FiSearch className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={collegeSearch}
                            onChange={(e) => setCollegeSearch(e.target.value)}
                            placeholder="Search colleges..."
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredColleges.map((college, idx) => (
                        <CollegeCard
                          key={college.college_id || `college-${jeeActiveTab}-${idx}`}
                          college={college}
                          accentKey={RESULT_CARD_ACCENT}
                          index={idx + 1}
                        />
                      ))}
                    </div>

                    {normalizedSearch && filteredColleges.length === 0 && (
                      <div className="py-8 text-center rounded-xl bg-white border border-gray-200">
                        <p className="text-sm font-medium text-gray-600">No colleges match your search.</p>
                      </div>
                    )}

                    {jeeLoadingMore && <SkeletonCards count={2} />}

                    {hasMore && !jeeLoadingMore && (
                      <div className="pt-3 pb-2 text-center">
                        <button
                          type="button"
                          onClick={handleJeeLoadMore}
                          disabled={jeeLoadingMore}
                          className={`rounded-xl px-6 py-3 text-sm font-semibold shadow-sm disabled:opacity-50 transition-all duration-300 hover:shadow-md ${accent.button}`}
                        >
                          Load more colleges ({activeJeeTotal - loadedCount} remaining)
                        </button>
                      </div>
                    )}
                  </>
                ) : !activeJeeSlotError ? (
                  <div className="py-16 text-center rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <FiSearch className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-semibold text-lg">No colleges found</p>
                    <p className="text-sm text-gray-400 mt-1.5 max-w-sm mx-auto">
                      Try a different rank or category. If the service is new for JEE, the upstream API may still be rolling out support.
                    </p>
                  </div>
                ) : null}
              </>
            ) : colleges.length > 0 ? (
              <>
                {isMhtCet && (
                  <div className={`rounded-xl ${accent.headerBg} border border-gray-200/80 px-5 py-4`}>
                    <p className="text-sm text-gray-700">
                      Based on your percentile and category, you may get into the following colleges:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base">
                      <span>
                        <span className="font-semibold text-gray-800">Percentile: </span>
                        <span className={`font-bold ${accent.headerSub}`}>{mhtForm.percentile}</span>
                      </span>
                      <span>
                        <span className="font-semibold text-gray-800">Admission: </span>
                        <span className={`font-bold ${accent.headerSub}`}>{mhtAdmissionLabel}</span>
                      </span>
                      <span>
                        <span className="font-semibold text-gray-800">Category: </span>
                        <span className={`font-bold ${accent.headerSub}`}>
                          {mhtForm.reservation_category_codes?.[0] ?? '—'}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
                {isTnea && (
                  <div className={`rounded-xl ${accent.headerBg} border border-gray-200/80 px-5 py-4`}>
                    <p className="text-sm text-gray-700">
                      Based on your rank and category, you may get into the following colleges:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base">
                      <span>
                        <span className="font-semibold text-gray-800">Rank: </span>
                        <span className={`font-bold ${accent.headerSub}`}>{tneaForm.rank}</span>
                      </span>
                      <span>
                        <span className="font-semibold text-gray-800">Category: </span>
                        <span className={`font-bold ${accent.headerSub}`}>
                          {tneaForm.reservation_category_codes?.[0] ?? '—'}
                        </span>
                      </span>
                      <span>
                        <span className="font-semibold text-gray-800">Native: </span>
                        <span className={`font-bold ${accent.headerSub}`}>
                          {[tneaForm.native_state, tneaForm.native_district].filter(Boolean).join(' · ') || '—'}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
                {isKeam && (
                  <div className={`rounded-xl ${accent.headerBg} border border-gray-200/80 px-5 py-4`}>
                    <p className="text-sm text-gray-700">
                      Based on your rank and category, you may get into the following colleges:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base">
                      <span>
                        <span className="font-semibold text-gray-800">Rank: </span>
                        <span className={`font-bold ${accent.headerSub}`}>{keamForm.rank}</span>
                      </span>
                      <span>
                        <span className="font-semibold text-gray-800">Category: </span>
                        <span className={`font-bold ${accent.headerSub}`}>
                          {keamForm.reservation_category_codes?.[0] ?? '—'}
                        </span>
                      </span>
                      <span>
                        <span className="font-semibold text-gray-800">Native: </span>
                        <span className={`font-bold ${accent.headerSub}`}>
                          {[keamForm.native_state, keamForm.native_district].filter(Boolean).join(' · ') || '—'}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
                {isWbjee && (
                  <div className={`rounded-xl ${accent.headerBg} border border-gray-200/80 px-5 py-4`}>
                    <p className="text-sm text-gray-700">
                      Based on your ranks and category, you may get into the following colleges:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base">
                      {parsePositiveIntRank(wbjeeForm.rankWbjee) != null && (
                        <span>
                          <span className="font-semibold text-gray-800">WBJEE rank: </span>
                          <span className={`font-bold ${accent.headerSub}`}>{wbjeeForm.rankWbjee}</span>
                        </span>
                      )}
                      {parsePositiveIntRank(wbjeeForm.rankJeeMain) != null && (
                        <span>
                          <span className="font-semibold text-gray-800">JEE Main rank: </span>
                          <span className={`font-bold ${accent.headerSub}`}>{wbjeeForm.rankJeeMain}</span>
                        </span>
                      )}
                      <span>
                        <span className="font-semibold text-gray-800">Category: </span>
                        <span className={`font-bold ${accent.headerSub}`}>
                          {wbjeeCategoryLabel(wbjeeForm.reservation_category_codes?.[0])}
                        </span>
                      </span>
                      <span>
                        <span className="font-semibold text-gray-800">Quota: </span>
                        <span className={`font-bold ${accent.headerSub}`}>
                          {wbjeeForm.quota === 'home_state_wb' ? 'Home State (West Bengal)' : 'All India'}
                        </span>
                      </span>
                      <span>
                        <span className="font-semibold text-gray-800">Location: </span>
                        <span className={`font-bold ${accent.headerSub}`}>
                          {[wbjeeForm.current_state, wbjeeForm.current_district].filter(Boolean).join(' · ') || '—'}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
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

                <div className="space-y-4">
                  {filteredColleges.map((college, idx) => (
                    <CollegeCard
                      key={college.college_id || `college-${idx}`}
                      college={college}
                      accentKey={RESULT_CARD_ACCENT}
                      index={idx + 1}
                    />
                  ))}
                </div>

                {normalizedSearch && filteredColleges.length === 0 && (
                  <div className="py-8 text-center rounded-xl bg-white border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">No colleges match your search.</p>
                  </div>
                )}

                {loadingMore && <SkeletonCards count={2} />}

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
                  {isMhtCet
                    ? 'Try a different percentile, category, admission type, or district filters.'
                    : isTnea || isKeam || isWbjee
                      ? 'Try a different rank, category, quota, or widen district/branch filters.'
                      : 'Try a different rank, changing the admission category, or removing some filters'}
                </p>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {!loading && !jeeLoading && !hasSearched && (
        <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-gray-300">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <FiSearch className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Ready to predict</p>
          <p className="text-sm text-gray-400 mt-1">
            {isJee ? (
              <>Fill the form above and click <strong>Predict Colleges</strong></>
            ) : isMhtCet ? (
              <>Fill the form above and click <strong>Predict Colleges</strong></>
            ) : isTnea || isKeam || isWbjee ? (
              <>Fill the form above and click <strong>Predict Colleges</strong></>
            ) : (
              <>Enter your rank and filters above, then click <strong>Predict Colleges</strong></>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
