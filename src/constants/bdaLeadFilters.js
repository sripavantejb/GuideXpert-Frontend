export const EMPTY_BDA_LEAD_FILTERS = {
  q: '',
  preferredLanguage: '',
  meetVariant: '',
  meetFrom: '',
  meetTo: '',
  meetPresence: '',
  slotDate: '',
  applicationStatus: '',
};

export const MEET_VARIANT_OPTIONS = [
  { value: '', label: 'Any meet type' },
  { value: 'english', label: 'English IIT meet' },
  { value: 'hindi', label: 'Hindi IIT meet' },
  { value: 'either', label: 'English or Hindi meet' },
];

export const MEET_PRESENCE_OPTIONS = [
  { value: '', label: 'Any attendance' },
  { value: 'attended', label: 'Attended meet' },
  { value: 'not_attended', label: 'Did not attend meet' },
];

export const APPLICATION_STATUS_OPTIONS = [
  { value: '', label: 'Any application status' },
  { value: 'completed', label: 'Application completed' },
  { value: 'in_progress', label: 'Application in progress' },
];

/** Query params for list / auto-assign APIs after filters are applied. */
export function bdaLeadFiltersToQuery(filters) {
  if (!filters) return {};
  const params = { filtersApplied: 'true' };
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params[key] = String(value).trim();
    }
  });
  return params;
}

export function hasActiveBdaLeadFilters(filters) {
  if (!filters) return false;
  return Object.values(filters).some((v) => v !== undefined && v !== null && String(v).trim() !== '');
}
