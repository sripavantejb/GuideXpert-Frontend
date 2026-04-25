/** Shared lead-list filter keys for admin dashboard / Leads / Export. */

export const ALL_SLOT_IDS = [
  'MONDAY_7PM', 'TUESDAY_7PM', 'WEDNESDAY_7PM', 'THURSDAY_7PM',
  'FRIDAY_7PM', 'SATURDAY_7PM', 'SUNDAY_3PM', 'SUNDAY_11AM',
  'MONDAY_6PM', 'TUESDAY_6PM', 'WEDNESDAY_6PM', 'THURSDAY_6PM',
  'FRIDAY_6PM', 'SATURDAY_6PM', 'SUNDAY_6PM',
];

export const ALLOWED_APPLICATION_STATUSES = ['in_progress', 'registered', 'completed'];

export function defaultLeadListFilters() {
  return {
    applicationStatus: '',
    otpVerified: '',
    slotBooked: '',
    demoAttended: '',
    assessmentWritten: '',
    activationCompleted: '',
    trainingFormFilled: '',
    selectedSlot: '',
    slotDate: '',
    utm_content: '',
    q: '',
  };
}

export function leadListFiltersFromSearchParams(searchParams) {
  const status = searchParams.get('applicationStatus') || '';
  const slot = searchParams.get('selectedSlot') || '';
  const utm = searchParams.get('utm_content') || '';
  const slotDate = searchParams.get('slotDate') || '';
  const otp = searchParams.get('otpVerified') || '';
  const slotB = searchParams.get('slotBooked') || '';
  const q = searchParams.get('q') || '';
  const demoAttendedRaw = searchParams.get('demoAttended') || '';
  const demoAttended = ['true', 'false'].includes(demoAttendedRaw) ? demoAttendedRaw : '';
  const assessmentWritten = searchParams.get('assessmentWritten') === 'true' ? 'true' : '';
  const activationCompleted = searchParams.get('activationCompleted') === 'true' ? 'true' : '';
  const trainingFormFilledRaw = searchParams.get('trainingFormFilled') || '';
  const trainingFormFilled = ['true', 'false'].includes(trainingFormFilledRaw) ? trainingFormFilledRaw : '';
  return {
    applicationStatus: ALLOWED_APPLICATION_STATUSES.includes(status) ? status : '',
    otpVerified: ['true', 'false'].includes(otp) ? otp : '',
    slotBooked: ['true', 'false'].includes(slotB) ? slotB : '',
    demoAttended,
    assessmentWritten,
    activationCompleted,
    trainingFormFilled,
    selectedSlot: slot,
    slotDate,
    utm_content: utm,
    q,
  };
}

/** Same fields as GET /admin/leads query (omit empty values). Use with card-specific params overlaid second. */
export function leadListFiltersToApiParams(filters) {
  const f = filters || defaultLeadListFilters();
  return {
    ...(f.applicationStatus && { applicationStatus: f.applicationStatus }),
    ...(f.otpVerified !== '' && f.otpVerified != null && { otpVerified: f.otpVerified }),
    ...(f.slotBooked !== '' && f.slotBooked != null && { slotBooked: f.slotBooked }),
    ...(f.demoAttended !== '' && f.demoAttended != null && { demoAttended: String(f.demoAttended) }),
    ...(f.assessmentWritten === 'true' && { assessmentWritten: 'true' }),
    ...(f.activationCompleted === 'true' && { activationCompleted: 'true' }),
    ...(f.trainingFormFilled !== '' && f.trainingFormFilled != null && { trainingFormFilled: String(f.trainingFormFilled) }),
    ...(f.selectedSlot && { selectedSlot: f.selectedSlot }),
    ...(f.slotDate && { slotDate: f.slotDate }),
    ...(f.utm_content && { utm_content: f.utm_content }),
    ...(f.q && { q: f.q }),
  };
}

/** Build URLSearchParams for /admin/leads (omit empty values). */
export function leadListFiltersToSearchParams(filters) {
  const search = new URLSearchParams();
  if (filters.applicationStatus) search.set('applicationStatus', filters.applicationStatus);
  if (filters.otpVerified !== '' && filters.otpVerified != null) search.set('otpVerified', String(filters.otpVerified));
  if (filters.slotBooked !== '' && filters.slotBooked != null) search.set('slotBooked', String(filters.slotBooked));
  if (filters.demoAttended !== '' && filters.demoAttended != null) search.set('demoAttended', String(filters.demoAttended));
  if (filters.assessmentWritten === 'true') search.set('assessmentWritten', 'true');
  if (filters.activationCompleted === 'true') search.set('activationCompleted', 'true');
  if (filters.trainingFormFilled !== '' && filters.trainingFormFilled != null) search.set('trainingFormFilled', String(filters.trainingFormFilled));
  if (filters.selectedSlot) search.set('selectedSlot', filters.selectedSlot);
  if (filters.slotDate) search.set('slotDate', filters.slotDate);
  if (filters.utm_content) search.set('utm_content', filters.utm_content);
  if (filters.q) search.set('q', filters.q);
  return search;
}

export function countActiveLeadFilters(filters) {
  const f = filters || defaultLeadListFilters();
  let n = 0;
  if (f.applicationStatus) n += 1;
  if (f.otpVerified !== '' && f.otpVerified != null) n += 1;
  if (f.slotBooked !== '' && f.slotBooked != null) n += 1;
  if (f.demoAttended !== '' && f.demoAttended != null) n += 1;
  if (f.assessmentWritten === 'true') n += 1;
  if (f.activationCompleted === 'true') n += 1;
  if (f.trainingFormFilled !== '' && f.trainingFormFilled != null) n += 1;
  if (f.selectedSlot) n += 1;
  if (f.slotDate) n += 1;
  if (f.utm_content) n += 1;
  if (f.q) n += 1;
  return n;
}
