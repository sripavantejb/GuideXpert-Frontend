/**
 * Option lists for the College Predictor form (NW College Predictor API v1).
 * Aligned with earlywave API spec: KCET, JEE, TS_EAMCET, AP_EAMCET, COMEDK, WBJEE; GENERAL, MANAGEMENT, NRI; CSE, IT, ECE, EEE, ME, CE.
 */

export const ENTRANCE_EXAMS = [
  { value: 'KCET', label: 'KCET' },
  { value: 'JEE', label: 'JEE' },
  { value: 'TS_EAMCET', label: 'TS EAMCET' },
  { value: 'AP_EAMCET', label: 'AP EAMCET' },
  { value: 'COMEDK', label: 'COMEDK' },
  { value: 'WBJEE', label: 'WBJEE' },
  { value: 'MHT_CET', label: 'MHT CET' },
  { value: 'BITSAT', label: 'BITSAT' },
];

export const ADMISSION_CATEGORIES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'MANAGEMENT', label: 'Management' },
  { value: 'NRI', label: 'NRI' },
  { value: 'NORTH_EASTERN', label: 'North Eastern' },
  { value: 'ALL_INDIA', label: 'All India' },
  { value: 'STATE', label: 'State' },
];

export const RESERVATION_CATEGORIES = [
  { value: 'GEN', label: 'General' },
  { value: 'GNT2S', label: 'GNT 2S' },
  { value: 'OBC', label: 'OBC' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'EWS', label: 'EWS' },
  { value: 'PWD', label: 'PWD' },
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

/** Default districts placeholder; replace with real district enums when available. */
export const DISTRICTS = [
  { value: 'district_1', label: 'District 1' },
  { value: 'district_2', label: 'District 2' },
  { value: 'district_3', label: 'District 3' },
];
