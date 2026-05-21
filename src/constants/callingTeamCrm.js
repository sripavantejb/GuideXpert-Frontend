export const CALL_STATUS_OPTIONS = [
  { value: 'not_called', label: 'Not Called' },
  { value: 'call_connected', label: 'Call Connected' },
  { value: 'connected', label: 'Call Connected' },
  { value: 'not_connected', label: 'Not Connected' },
  { value: 'busy', label: 'Busy' },
  { value: 'switched_off', label: 'Switched Off' },
  { value: 'not_reachable', label: 'Not Reachable' },
  { value: 'wrong_number', label: 'Wrong Number' },
  { value: 'call_back_later', label: 'Call Back Later' },
];

export const LEAD_STATUS_OPTIONS = [
  { value: '', label: '—' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'callback_pending', label: 'Callback Pending' },
  { value: 'call_back_needed', label: 'Call Back Needed' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

export const DEMO_STATUS_OPTIONS = [
  { value: 'not_scheduled', label: 'Not Scheduled' },
  { value: 'demo_scheduled', label: 'Demo Scheduled' },
  { value: 'scheduled', label: 'Demo Scheduled' },
  { value: 'attended', label: 'Demo Attended' },
  { value: 'not_attended', label: 'Demo Not Attended' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

export const NIAT_STATUS_OPTIONS = [
  { value: 'not_registered', label: 'Not Registered' },
  { value: 'registered', label: 'Registered' },
  { value: 'registration_initiated', label: 'Registration Initiated' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'not_paid', label: 'Not Paid' },
  { value: 'payment_initiated', label: 'Payment Initiated' },
  { value: 'amount_paid', label: 'Amount Paid' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'none', label: 'Not Paid' },
  { value: 'initiated', label: 'Payment Initiated' },
  { value: 'paid', label: 'Amount Paid' },
];

export function labelForOption(options, value) {
  const found = options.find((o) => o.value === value);
  return found?.label || value || '—';
}

export function statusBadgeClass(kind, value) {
  if (!value) return 'bg-gray-100 text-gray-700';
  if (kind === 'call') {
    if (value === 'call_connected' || value === 'connected') return 'bg-green-100 text-green-800';
    if (value === 'not_connected') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-700';
  }
  if (kind === 'lead') {
    if (value === 'interested' || value === 'converted') return 'bg-green-100 text-green-800';
    if (value === 'not_interested' || value === 'lost') return 'bg-red-100 text-red-800';
    if (value === 'callback_pending' || value === 'call_back_needed') return 'bg-amber-100 text-amber-900';
    return 'bg-gray-100 text-gray-700';
  }
  if (kind === 'demo') {
    if (value === 'attended') return 'bg-green-100 text-green-800';
    if (value === 'not_attended') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-700';
  }
  if (kind === 'niat') {
    if (value === 'registered' || value === 'registration_initiated') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-700';
  }
  if (kind === 'payment') {
    if (value === 'amount_paid' || value === 'paid') return 'bg-green-100 text-green-800';
    if (value === 'payment_initiated' || value === 'initiated') return 'bg-amber-100 text-amber-900';
    return 'bg-gray-100 text-gray-700';
  }
  return 'bg-gray-100 text-gray-700';
}
