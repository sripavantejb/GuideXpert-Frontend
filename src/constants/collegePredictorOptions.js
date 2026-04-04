/**
 * Option lists for the College Predictor (earlywave v1/v2 API).
 * Each exam `value` must match route params and backend EXAM_API_MAP keys where applicable.
 *
 * AP EAMCET reservation codes verified against beta API: use **spaced** labels (e.g. `OC GIRLS`), not
 * Karnataka-style `1G` — `1G` returns a minimal list; AP category strings match the official EAPCET form.
 */

const CUTOFF_UPPER_BOUND = 500000;

/**
 * Convert a student's rank into a [cutoff_from, cutoff_to] range.
 * Formula reverse-engineered from CollegeDost JS bundles.
 */
export function rankToCutoff(rank) {
  const r = Number(rank);
  if (!Number.isFinite(r) || r <= 0) return [0, 0];

  let buffer;
  if (r <= 50) buffer = 3;
  else if (r <= 100) buffer = 10;
  else if (r <= 1000) buffer = 30;
  else if (r <= 5000) buffer = 50;
  else if (r <= 10000) buffer = 100;
  else if (r <= 16000) buffer = 500;
  else if (r <= 30000) buffer = 800;
  else if (r <= 50000) buffer = 1000;
  else if (r <= 100000) buffer = 1200;
  else buffer = 2000;

  return [Math.max(1, r - buffer), CUTOFF_UPPER_BOUND];
}

/** Official EAPCET-style category strings (value === label) — verified HTTP 200 on beta for AP_EAMCET + AU. */
export const AP_EAMCET_RESERVATION_OPTIONS = [
  { value: 'OC GIRLS', label: 'OC GIRLS' },
  { value: 'BCC GIRLS', label: 'BCC GIRLS' },
  { value: 'BCB BOYS', label: 'BCB BOYS' },
  { value: 'OC EWS BOYS', label: 'OC EWS BOYS' },
  { value: 'ST GIRLS', label: 'ST GIRLS' },
  { value: 'ST BOYS', label: 'ST BOYS' },
  { value: 'OC EWS GIRLS', label: 'OC EWS GIRLS' },
  { value: 'BCA GIRLS', label: 'BCA GIRLS' },
  { value: 'BCE BOYS', label: 'BCE BOYS' },
  { value: 'BCD GIRLS', label: 'BCD GIRLS' },
  { value: 'BCE GIRLS', label: 'BCE GIRLS' },
  { value: 'BCD BOYS', label: 'BCD BOYS' },
  { value: 'SC BOYS', label: 'SC BOYS' },
  { value: 'BCC BOYS', label: 'BCC BOYS' },
  { value: 'SC GIRLS', label: 'SC GIRLS' },
  { value: 'BCB GIRLS', label: 'BCB GIRLS' },
  { value: 'BCA BOYS', label: 'BCA BOYS' },
];

/**
 * AP EAMCET district filter: earlywave expects **short district_enum codes**, not full names.
 * Sending display names (e.g. "Visakhapatnam") yields a single promoted college; codes like VSP/GTR work.
 * Codes differ by counselling **region** (AU vs SVU). Derived from live API responses (district_enum).
 */
export const AP_EAMCET_DISTRICT_OPTIONS_BY_ADMISSION = {
  AU: [
    { value: 'EG', label: 'East Godavari' },
    { value: 'GTR', label: 'Guntur' },
    { value: 'KRI', label: 'Krishna' },
    { value: 'PKS', label: 'Prakasam' },
    { value: 'SKL', label: 'Srikakulam' },
    { value: 'VSP', label: 'Visakhapatnam' },
    { value: 'VZM', label: 'Vizianagaram' },
    { value: 'WG', label: 'West Godavari' },
  ],
  SVU: [
    { value: 'ATP', label: 'Anantapur' },
    { value: 'CTR', label: 'Chittoor / Tirupati' },
    { value: 'KDP', label: 'Kadapa (YSR)' },
    { value: 'KNL', label: 'Kurnool' },
    { value: 'NLR', label: 'Sri Potti Sriramulu Nellore' },
  ],
};

/** @param {string} admission AU | SVU */
export function getApEamcetDistrictOptions(admission) {
  const key = String(admission || '').trim();
  return AP_EAMCET_DISTRICT_OPTIONS_BY_ADMISSION[key] ?? AP_EAMCET_DISTRICT_OPTIONS_BY_ADMISSION.AU;
}

/**
 * TS EAMCET category strings (value === label) — verified HTTP 200 on beta for TS_EAMCET + admission **DEFAULT**.
 * Order matches reference UI. Admission must be `DEFAULT` (not GENERAL) for this exam on earlywave.
 */
export const TS_EAMCET_RESERVATION_OPTIONS = [
  { value: 'OC BOYS', label: 'OC BOYS' },
  { value: 'OC GIRLS', label: 'OC GIRLS' },
  { value: 'BCC GIRLS', label: 'BCC GIRLS' },
  { value: 'BCB BOYS', label: 'BCB BOYS' },
  { value: 'OC EWS BOYS', label: 'OC EWS BOYS' },
  { value: 'ST GIRLS', label: 'ST GIRLS' },
  { value: 'ST BOYS', label: 'ST BOYS' },
  { value: 'OC EWS GIRLS', label: 'OC EWS GIRLS' },
  { value: 'BCA GIRLS', label: 'BCA GIRLS' },
  { value: 'BCE BOYS', label: 'BCE BOYS' },
  { value: 'BCD GIRLS', label: 'BCD GIRLS' },
  { value: 'BCE GIRLS', label: 'BCE GIRLS' },
  { value: 'BCD BOYS', label: 'BCD BOYS' },
  { value: 'SC BOYS', label: 'SC BOYS' },
  { value: 'BCC BOYS', label: 'BCC BOYS' },
  { value: 'SC GIRLS', label: 'SC GIRLS' },
  { value: 'BCB GIRLS', label: 'BCB GIRLS' },
  { value: 'BCA BOYS', label: 'BCA BOYS' },
  { value: 'EWS GEN OU', label: 'EWS GEN OU' },
];

/**
 * Telangana districts for TS EAMCET: earlywave expects **district_enum** short codes (like AP).
 * Labels aligned to TS geography; verified from TS_EAMCET + DEFAULT + OC BOYS responses on beta.
 */
/** JEE Main / Advanced — national category strings (upstream must accept these for JEE_MAIN / JEE_ADVANCED). */
export const JEE_RESERVATION_OPTIONS = [
  { value: 'OPEN', label: 'OPEN' },
  { value: 'OPEN (PwD)', label: 'OPEN (PwD)' },
  { value: 'EWS', label: 'EWS' },
  { value: 'EWS (PwD)', label: 'EWS (PwD)' },
  { value: 'OBC-NCL', label: 'OBC-NCL' },
  { value: 'OBC-NCL (PwD)', label: 'OBC-NCL (PwD)' },
  { value: 'SC', label: 'SC' },
  { value: 'SC (PwD)', label: 'SC (PwD)' },
  { value: 'ST', label: 'ST' },
  { value: 'ST (PwD)', label: 'ST (PwD)' },
];

export const TS_EAMCET_DISTRICT_OPTIONS = [
  { value: 'HNK', label: 'Hanamkonda / Warangal' },
  { value: 'HYD', label: 'Hyderabad' },
  { value: 'JTL', label: 'Jagtial' },
  { value: 'KGM', label: 'Kothagudem' },
  { value: 'KHM', label: 'Khammam' },
  { value: 'KMR', label: 'Kamareddy' },
  { value: 'KRM', label: 'Karimnagar' },
  { value: 'MBN', label: 'Mahabubnagar' },
  { value: 'MDL', label: 'Medchal Malkajgiri' },
  { value: 'MED', label: 'Medak' },
  { value: 'NLG', label: 'Nalgonda' },
  { value: 'NZB', label: 'Nizamabad' },
  { value: 'PDL', label: 'Peddapalli' },
  { value: 'RR', label: 'Rangareddy' },
  { value: 'SDP', label: 'Siddipet' },
  { value: 'SRC', label: 'Rajanna Sircilla' },
  { value: 'SRD', label: 'Suryapet (Sultanpur)' },
  { value: 'SRP', label: 'Suryapet' },
  { value: 'WGL', label: 'Warangal' },
  { value: 'WNP', label: 'Wanaparthy' },
  { value: 'YBG', label: 'Yadadri Bhuvanagiri' },
];

/** Upstream promoted slot (Hyderabad); not shown in AP EAMCET predictor results. */
const AP_EAMCET_HIDDEN_PROMOTED_COLLEGE_ID = '6f3cf78b-c152-4dad-b52a-0642baad860c';

export function shouldHideCollegeFromApEamcetPredictor(college) {
  if (!college) return false;
  if (String(college.college_id || '') === AP_EAMCET_HIDDEN_PROMOTED_COLLEGE_ID) return true;
  const name = (college.college_name || '').toLowerCase();
  return name.includes('malla reddy') && name.includes('deemed');
}

export function filterCollegesForApEamcetPredictor(colleges) {
  if (!Array.isArray(colleges)) return [];
  return colleges.filter((c) => !shouldHideCollegeFromApEamcetPredictor(c));
}

/** API total includes the hidden promoted row once; use for summary counts. */
export function apEamcetPredictorDisplayTotal(apiTotal) {
  const n = Number(apiTotal);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(0, n - 1);
}

/**
 * @typedef {{
 *   value: string,
 *   label: string,
 *   description: string,
 *   accent: string,
 *   apiValue: string,
 *   supported: boolean,
 *   defaultReservationCode?: string,
 *   upstreamDataNote?: string,
 *   admissionFieldLabel?: string,
 *   reservationFieldLabel?: string,
 *   rankFieldLabel?: string,
 *   reservationOptions?: { value: string, label: string }[],
 *   reservationSelectSingle?: boolean,
 *   districtOptions?: { value: string, label: string }[],
 *   districtOptionsByAdmission?: Record<string, { value: string, label: string }[]>,
 *   districtSelectionHint?: string,
 *   hideAdmissionField?: boolean,
 *   predictorPageTitle?: string,
 *   predictorPageSubtitle?: string,
 *   jeeMainApiExam?: string,
 *   jeeAdvancedApiExam?: string,
 *   admissionCategories: { value: string, label: string }[],
 * }} EntranceExamOption
 * @type {EntranceExamOption[]}
 */
export const ENTRANCE_EXAMS = [
  {
    value: 'KCET',
    label: 'KCET',
    description: 'Predict engineering colleges in Karnataka based on your rank and preferences.',
    accent: 'blue',
    apiValue: 'KCET',
    supported: true,
    defaultReservationCode: '1G',
    admissionCategories: [
      { value: 'GENERAL', label: 'General' },
      { value: 'HK', label: 'Hyderabad-Karnataka (HK)' },
    ],
  },
  {
    value: 'MHT_CET',
    label: 'MHT CET',
    description: 'Explore Maharashtra institutes using your CET score and seat matrix.',
    accent: 'indigo',
    apiValue: 'MHTCET',
    supported: true,
    defaultReservationCode: 'GOPENS',
    predictorPageTitle: 'MHT CET College Predictor',
    predictorPageSubtitle:
      'Enter your expected percentile, admission type (State / Home / Other), category, and optional district filters.',
    reservationFieldLabel: 'Select a Category',
    admissionCategories: [{ value: 'GENERAL', label: 'MHT-CET' }],
  },
  {
    value: 'KEAM',
    label: 'KEAM',
    description: 'Find Kerala professional college options aligned with your entrance rank.',
    accent: 'teal',
    apiValue: 'KEAM',
    supported: false,
    admissionCategories: [],
  },
  {
    value: 'AP_EAMCET',
    label: 'AP EAMCET',
    description: 'Match Andhra Pradesh engineering colleges to your EAMCET performance.',
    accent: 'green',
    apiValue: 'AP_EAMCET',
    supported: true,
    defaultReservationCode: 'OC GIRLS',
    admissionFieldLabel: 'Region',
    reservationFieldLabel: 'Category',
    rankFieldLabel: 'Expected AP EAPCET rank',
    reservationOptions: AP_EAMCET_RESERVATION_OPTIONS,
    reservationSelectSingle: true,
    districtOptionsByAdmission: AP_EAMCET_DISTRICT_OPTIONS_BY_ADMISSION,
    districtSelectionHint:
      'Pick one or more districts for your selected region (AU vs SVU lists differ). Leave empty to include all districts in the results.',
    admissionCategories: [
      { value: 'AU', label: 'Andhra University (AU)' },
      { value: 'SVU', label: 'Sri Venkateswara University (SVU)' },
    ],
  },
  {
    value: 'TS_EAMCET',
    label: 'TS EAMCET',
    description: 'Discover Telangana colleges from your state EAMCET outcome.',
    accent: 'green',
    apiValue: 'TS_EAMCET',
    supported: true,
    defaultReservationCode: 'OC BOYS',
    hideAdmissionField: true,
    reservationFieldLabel: 'Category',
    rankFieldLabel: 'Expected TS EAMCET rank',
    reservationOptions: TS_EAMCET_RESERVATION_OPTIONS,
    reservationSelectSingle: true,
    districtOptions: TS_EAMCET_DISTRICT_OPTIONS,
    districtSelectionHint:
      'Select more districts for increased college options. Leave empty to include all districts.',
    admissionCategories: [
      { value: 'DEFAULT', label: 'All Telangana engineering colleges' },
    ],
  },
  {
    value: 'TNEA',
    label: 'TNEA',
    description: 'Tamil Nadu engineering admissions — cutoffs and branches in one place.',
    accent: 'orange',
    apiValue: 'TNEA',
    supported: false,
    admissionCategories: [],
  },
  {
    value: 'JEE',
    label: 'JEE Main & Advanced',
    description: 'JEE Main and JEE Advanced college prediction with national categories.',
    accent: 'purple',
    apiValue: 'JEE',
    supported: true,
    predictorPageTitle: 'JEE Main and JEE Advanced College Predictor',
    predictorPageSubtitle:
      'Enter at least one expected rank (Main and/or Advanced), category, and optional branch filters.',
    defaultReservationCode: 'OPEN',
    hideAdmissionField: true,
    reservationFieldLabel: 'Select a Category',
    reservationOptions: JEE_RESERVATION_OPTIONS,
    reservationSelectSingle: true,
    jeeMainApiExam: 'JEE_MAIN',
    jeeAdvancedApiExam: 'JEE_ADVANCED',
    admissionCategories: [{ value: 'GENERAL', label: 'General' }],
  },
];

export function getEntranceExamMeta(value) {
  return ENTRANCE_EXAMS.find((e) => e.value === value) ?? null;
}

export const RESERVATION_CATEGORIES = [
  { value: '1G', label: '1G (General)' },
  { value: '2AG', label: '2AG' },
  { value: '2BG', label: '2BG' },
  { value: '3AG', label: '3AG' },
  { value: '3BG', label: '3BG' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'GM', label: 'GM' },
  { value: 'EWS', label: 'EWS' },
  { value: 'GNT2S', label: 'GNT 2S' },
];

export const BRANCH_CODES = [
  { value: 'CSE', label: 'CSE' },
  { value: 'IT', label: 'IT' },
  { value: 'ECE', label: 'ECE' },
  { value: 'EEE', label: 'EEE' },
  { value: 'ME', label: 'Mechanical' },
  { value: 'CE', label: 'Civil' },
];

export const SORT_ORDER_OPTIONS = [
  { value: 'ASC', label: 'Lowest cutoff first' },
  { value: 'DESC', label: 'Highest cutoff first' },
];

export const DISTRICTS = [
  { value: 'Bangalore Urban', label: 'Bangalore Urban' },
  { value: 'Bangalore Rural', label: 'Bangalore Rural' },
  { value: 'Mysore', label: 'Mysore' },
  { value: 'Belgaum', label: 'Belgaum' },
  { value: 'Mangalore', label: 'Mangalore' },
  { value: 'Hubli', label: 'Hubli' },
  { value: 'Gulbarga', label: 'Gulbarga' },
  { value: 'Shimoga', label: 'Shimoga' },
  { value: 'Tumkur', label: 'Tumkur' },
  { value: 'Davangere', label: 'Davangere' },
];
