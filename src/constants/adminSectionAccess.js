/** Canonical admin section keys — must match AdminLayout nav sectionKey and backend adminSectionKeys. */

export const ADMIN_SECTION_OPTIONS = [
  { sectionKey: 'dashboard', label: 'Dashboard' },
  { sectionKey: 'funnel-analytics', label: 'Funnel Analytics' },
  { sectionKey: 'certified-counsellors', label: 'Certified Counsellors' },
  { sectionKey: 'leads', label: 'Lead Funnel' },
  { sectionKey: 'iit-counselling', label: 'IIT Counselling' },
  { sectionKey: 'calling-team', label: 'Calling Team' },
  { sectionKey: 'calling-data', label: 'Calling Data' },
  { sectionKey: 'analytics', label: 'Analytics' },
  { sectionKey: 'meeting-attendance', label: 'User Productivity' },
  { sectionKey: 'iit-meet-attendance', label: 'IIT Meet Attendance' },
  { sectionKey: 'export', label: 'Export Data' },
  { sectionKey: 'slots', label: 'Slots' },
  { sectionKey: 'training-form-responses', label: 'Training Form' },
  { sectionKey: 'one-on-one-counseling', label: '1-on-1 Counseling' },
  { sectionKey: 'lead-intelligence', label: 'Chatbot Lead Intelligence' },
  { sectionKey: 'guidance-slot-bookings', label: 'Guidance Slot Bookings' },
  { sectionKey: 'one-on-one-counselors-admin', label: 'One-on-One Counselors' },
  { sectionKey: 'training-feedback', label: 'Activation Form' },
  { sectionKey: 'influencer-tracking', label: 'Influencer / UTM Tracking' },
  { sectionKey: 'poster-downloads', label: 'Poster downloads' },
  { sectionKey: 'poster-automation', label: 'Poster automation' },
  { sectionKey: 'assessment-results', label: 'Custom Reports' },
  { sectionKey: 'webinar-progress', label: 'Webinar Progress' },
  { sectionKey: 'bulk-certificates', label: 'Bulk Certificates' },
  { sectionKey: 'blogs', label: 'Blog Management' },
  { sectionKey: 'osvi-calls', label: 'OSVI Calls' },
  { sectionKey: 'osvi-calls-data', label: 'OSVI calls Data' },
  { sectionKey: 'ai-calls', label: 'AI Calls' },
  { sectionKey: 'iit-ai-calls-summary', label: 'IITian AI Calls Summary' },
  { sectionKey: 'whatsapp-ops', label: 'WhatsApp ops' },
  { sectionKey: 'settings', label: 'Settings' },
];

export const ADMIN_SECTION_KEYS = ADMIN_SECTION_OPTIONS.map((o) => o.sectionKey);

export const ADMIN_SECTION_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    sectionKeys: ['dashboard', 'funnel-analytics', 'analytics'],
  },
  {
    id: 'leads',
    label: 'Leads & counselling',
    sectionKeys: [
      'leads',
      'iit-counselling',
      'one-on-one-counseling',
      'guidance-slot-bookings',
      'one-on-one-counselors-admin',
      'calling-team',
      'calling-data',
      'certified-counsellors',
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    sectionKeys: [
      'slots',
      'export',
      'meeting-attendance',
      'iit-meet-attendance',
      'training-form-responses',
      'training-feedback',
      'osvi-calls',
      'osvi-calls-data',
      'ai-calls',
      'iit-ai-calls-summary',
      'whatsapp-ops',
      'lead-intelligence',
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & content',
    sectionKeys: [
      'influencer-tracking',
      'poster-downloads',
      'poster-automation',
      'blogs',
      'webinar-progress',
      'bulk-certificates',
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    sectionKeys: ['settings', 'assessment-results'],
  },
];

const labelByKey = Object.fromEntries(ADMIN_SECTION_OPTIONS.map((o) => [o.sectionKey, o.label]));

export function getSectionLabel(sectionKey) {
  return labelByKey[sectionKey] || sectionKey;
}

export function getSectionLabels(keys) {
  if (!Array.isArray(keys)) return [];
  return keys.map((k) => getSectionLabel(k)).filter(Boolean);
}

export const ALL_SECTION_KEYS = [...ADMIN_SECTION_KEYS];
