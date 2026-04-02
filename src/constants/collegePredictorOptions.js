/**
 * Option lists for the College Predictor (earlywave v2 API via CollegeDost).
 * Each exam key must match the backend SUPPORTED_EXAMS list.
 */

/**
 * @typedef {{ value: string, label: string, description: string, accent: 'blue'|'indigo'|'teal'|'green'|'orange'|'purple' }} EntranceExamOption
 * @type {EntranceExamOption[]}
 */
export const ENTRANCE_EXAMS = [
  {
    value: 'KCET',
    label: 'KCET',
    description: 'Predict engineering colleges in Karnataka based on your rank and preferences.',
    accent: 'blue',
  },
  {
    value: 'MHT_CET',
    label: 'MHT CET',
    description: 'Explore Maharashtra institutes using your CET score and seat matrix.',
    accent: 'indigo',
  },
  {
    value: 'KEAM',
    label: 'KEAM',
    description: 'Find Kerala professional college options aligned with your entrance rank.',
    accent: 'teal',
  },
  {
    value: 'AP_EAMCET',
    label: 'AP EAMCET',
    description: 'Match Andhra Pradesh engineering colleges to your EAMCET performance.',
    accent: 'green',
  },
  {
    value: 'TS_EAMCET',
    label: 'TS EAMCET',
    description: 'Discover Telangana colleges from your state EAMCET outcome.',
    accent: 'green',
  },
  {
    value: 'TNEA',
    label: 'TNEA',
    description: 'Tamil Nadu engineering admissions — cutoffs and branches in one place.',
    accent: 'orange',
  },
  {
    value: 'JEE',
    label: 'JEE',
    description: 'JEE Main / Advanced pathways to national and participating institutes.',
    accent: 'purple',
  },
];

export function getEntranceExamMeta(value) {
  return ENTRANCE_EXAMS.find((e) => e.value === value) ?? null;
}

export const ADMISSION_CATEGORIES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'MANAGEMENT', label: 'Management' },
  { value: 'NRI', label: 'NRI' },
  { value: 'ALL_INDIA', label: 'All India' },
  { value: 'STATE', label: 'State' },
];

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
