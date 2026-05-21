export const CALL_STATUS_OPTIONS = [
  { value: 'not_called', label: 'Not Called' },
  { value: 'connected', label: 'Connected' },
  { value: 'not_connected', label: 'Not Connected' },
];

export const LEAD_STATUS_OPTIONS = [
  { value: '', label: '—' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'callback_pending', label: 'Callback Pending' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

export const DEMO_STATUS_OPTIONS = [
  { value: 'not_scheduled', label: 'Not Scheduled' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'attended', label: 'Attended' },
  { value: 'not_attended', label: 'Not Attended' },
];

export const NIAT_STATUS_OPTIONS = [
  { value: 'not_registered', label: 'Not Registered' },
  { value: 'registered', label: 'Registered' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'initiated', label: 'Initiated' },
  { value: 'paid', label: 'Paid' },
];

export function labelForOption(options, value) {
  const found = options.find((o) => o.value === value);
  return found?.label || value || '—';
}
