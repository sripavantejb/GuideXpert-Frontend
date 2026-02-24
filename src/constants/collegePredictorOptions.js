/**
 * Option lists for the College Predictor form (NW College Predictor API v1).
 * Replace with real enums from earlywave or an options API when available.
 */

export const ENTRANCE_EXAMS = [
  { value: 'JEE', label: 'JEE' },
  { value: 'MHT_CET', label: 'MHT CET' },
  { value: 'BITSAT', label: 'BITSAT' },
  { value: 'WBJEE', label: 'WBJEE' },
  { value: 'KCET', label: 'KCET' },
];

export const ADMISSION_CATEGORIES = [
  { value: 'NORTH_EASTERN', label: 'North Eastern' },
  { value: 'ALL_INDIA', label: 'All India' },
  { value: 'STATE', label: 'State' },
  { value: 'MANAGEMENT', label: 'Management' },
];

export const RESERVATION_CATEGORIES = [
  { value: 'GEN', label: 'General' },
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
  { value: 'MECH', label: 'Mechanical' },
  { value: 'CIVIL', label: 'Civil' },
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
