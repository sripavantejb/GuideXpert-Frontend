/**
 * Option lists for the College Predictor (earlywave v1 API).
 * Each exam key must match the backend SUPPORTED_EXAMS list.
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

/**
 * @typedef {{ value: string, label: string, description: string, accent: string, apiValue: string, supported: boolean, admissionCategories: {value:string,label:string}[] }} EntranceExamOption
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
    supported: false,
    admissionCategories: [],
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
    supported: false,
    admissionCategories: [],
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
    label: 'JEE',
    description: 'JEE Main / Advanced pathways to national and participating institutes.',
    accent: 'purple',
    apiValue: 'JEE',
    supported: false,
    admissionCategories: [],
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
