/** Keep in sync with backend/constants/oneOnOneCounseling.js */

export const CURRENT_CLASS_OPTIONS = [
  '10th',
  'Inter 1st Year',
  'Inter 2nd Year',
  'Inter 2nd Year Completed',
  'Diploma',
  'Other',
];

export const INTERESTED_BRANCH_OPTIONS = [
  'CSE',
  'AI & ML',
  'IT',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
  'Biotechnology',
  'Not Sure',
];

export const COLLEGE_BUDGET_OPTIONS = [
  'Below ₹1 Lakh',
  '₹1–2 Lakhs',
  '₹2–4 Lakhs',
  '₹4–8 Lakhs',
  '₹8–15 Lakhs',
  'No Budget Constraint',
];

export const BIGGEST_CONCERN_OPTIONS = [
  'Placements',
  'Fees',
  'Scholarships',
  'College Selection',
  'Branch Selection',
  'Future Job Opportunities',
  'AI Impact on Jobs',
  'Abroad Opportunities',
  'Internships',
  'Campus Life',
  'Hostels',
  'Coding Culture',
];

export const PREFERRED_LANGUAGE_OPTIONS = ['Telugu', 'English', 'Hindi'];

export const SESSION_ATTENDEE_OPTIONS = ['Student', 'Parent', 'Student and Parent'];

export const LEAD_STATUS_OPTIONS = [
  'New Lead',
  'Contacted',
  'Demo Booked',
  'Counseling Done',
  'Converted',
  'Not Interested',
];

export const LEAD_RELEVANCE_FILTER_OPTIONS = [
  { value: '', label: 'All leads' },
  { value: 'relevant', label: 'Relevant (Inter 1st / 2nd / completed)' },
  { value: 'irrelevant', label: 'Irrelevant leads' },
];

export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export const GUIDEXPERT_LOGO_URL =
  'https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png';

export const INITIAL_FORM_STATE = {
  studentName: '',
  mobileNumber: '',
  parentName: '',
  parentMobileNumber: '',
  sessionAttendee: '',
  currentClass: '',
  city: '',
  entranceExamRank: '',
  interestedBranch: '',
  collegeBudget: '',
  biggestConcern: '',
  preferredLanguage: '',
  preferredTimeSlot: '',
  additionalQuestions: '',
};
