import { INDIAN_MOBILE_REGEX } from '../constants/oneOnOneCounselingForm';

export function validateName(value, label = 'Name') {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return `${label} is required`;
  if (t.length < 2) return `${label} must be at least 2 characters`;
  if (t.length > 100) return `${label} must be at most 100 characters`;
  return '';
}

export function validateIndianMobile(value, label = 'Mobile number') {
  const d = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (!d) return `${label} is required`;
  if (!INDIAN_MOBILE_REGEX.test(d)) return `Enter a valid 10-digit Indian ${label.toLowerCase()}`;
  return '';
}

export function validateRequiredSelect(value, label) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return `Please select ${label}`;
  return '';
}

export function validateEntranceExamRank(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Entrance exam rank is required';
  if (t.length > 120) return 'Maximum 120 characters';
  return '';
}

export function validateAdditionalQuestions(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (t.length > 2000) return 'Maximum 2000 characters';
  return '';
}

export function validateOneOnOneForm(form) {
  return {
    studentName: validateName(form.studentName, 'Student name'),
    mobileNumber: validateIndianMobile(form.mobileNumber, 'Student mobile'),
    parentName: validateName(form.parentName, 'Parent name'),
    parentMobileNumber: validateIndianMobile(form.parentMobileNumber, 'Parent mobile'),
    currentClass: validateRequiredSelect(form.currentClass, 'current class'),
    entranceExamRank: validateEntranceExamRank(form.entranceExamRank),
    interestedBranch: validateRequiredSelect(form.interestedBranch, 'branch'),
    collegeBudget: validateRequiredSelect(form.collegeBudget, 'college budget'),
    biggestConcern: validateRequiredSelect(form.biggestConcern, 'biggest concern'),
    preferredLanguage: validateRequiredSelect(form.preferredLanguage, 'language'),
    preferredTimeSlot: validateRequiredSelect(form.preferredTimeSlot, 'time slot'),
    additionalQuestions: validateAdditionalQuestions(form.additionalQuestions),
  };
}

export function hasValidationErrors(errors) {
  return Object.values(errors).some(Boolean);
}
