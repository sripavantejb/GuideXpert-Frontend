/**
 * Mock data for Webinar & Training Portal.
 * Single intro session (YouTube embed).
 */

export const DAYS = [
  { id: 1, label: 'Day 1' },
];

// Single intro session: YouTube embed. Lock logic: N/A (one day).
export const SESSIONS = [
  {
    id: 'intro',
    dayId: 1,
    title: 'Intro',
    duration: '8 mins',
    durationMinutes: 8,
    type: 'Overview',
    videoUrl: 'https://www.youtube.com/embed/_DTXIf_V5Fk?si=yWfGagUAqfPvAxdH',
    isYoutube: true,
    thumbnail: 'https://img.youtube.com/vi/_DTXIf_V5Fk/hqdefault.jpg',
    description: {
      startPoint: 'Introduction to company mission, values, and structure.',
      keyTopics: ['Mission & vision', 'Organizational structure', 'Key policies overview'],
      learningOutcome: 'Understand the company context and where you fit in.',
      importantNotes: 'Complete this session before moving to Terms & Conditions.',
    },
  },
  {
    id: 's2',
    dayId: 1,
    title: 'Session - 1',
    duration: '12 mins',
    durationMinutes: 12,
    type: 'Compliance',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    description: {
      startPoint: 'Core terms of engagement and contractual basics.',
      keyTopics: ['Scope of engagement', 'Rights and obligations', 'Term and termination'],
      learningOutcome: 'Know the main T&C clauses that apply to your role.',
      importantNotes: 'Part 2 continues in Day 2.',
    },
  },
  {
    id: 's3',
    dayId: 1,
    title: 'Session - 2',
    duration: '10 mins',
    durationMinutes: 10,
    type: 'Compliance',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    description: {
      startPoint: 'How we collect, use, and protect personal data.',
      keyTopics: ['Data we collect', 'Legal basis', 'Your rights', 'Retention'],
      learningOutcome: 'Apply privacy principles in daily work.',
      importantNotes: 'Mandatory for all staff.',
    },
  },
  {
    id: 's4',
    dayId: 1,
    title: 'Session - 3',
    duration: '15 mins',
    durationMinutes: 15,
    type: 'Compliance',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    description: {
      startPoint: 'Expected behavior and ethical standards.',
      keyTopics: ['Integrity', 'Respect', 'Confidentiality', 'Conflict of interest'],
      learningOutcome: 'Demonstrate conduct aligned with company standards.',
      importantNotes: 'Acknowledgment may be required.',
    },
  },
  // Day 2
  {
    id: 's5',
    dayId: 2,
    title: 'Session - 4',
    duration: '14 mins',
    durationMinutes: 14,
    type: 'Compliance',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    description: {
      startPoint: 'Extended terms, indemnity, and dispute resolution.',
      keyTopics: ['Liability', 'Indemnity', 'Dispute resolution', 'Governing law'],
      learningOutcome: 'Understand full T&C framework.',
      importantNotes: 'Complete after Part 1.',
    },
  },
  {
    id: 's6',
    dayId: 2,
    title: 'Session - 5',
    duration: '20 mins',
    durationMinutes: 20,
    type: 'Training',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    description: {
      startPoint: 'Tools, access, and workflows for new joiners.',
      keyTopics: ['Systems access', 'Key workflows', 'Contacts', 'Checklist'],
      learningOutcome: 'Be operational on day one.',
      importantNotes: 'IT will follow up on access requests.',
    },
  },
  {
    id: 's7',
    dayId: 2,
    title: 'Session - 6',
    duration: '12 mins',
    durationMinutes: 12,
    type: 'Compliance',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
    description: {
      startPoint: 'Handling sensitive information and security practices.',
      keyTopics: ['Classified information', 'Passwords', 'Devices', 'Reporting'],
      learningOutcome: 'Protect company and client data.',
      importantNotes: 'Annual refresh required.',
    },
  },
  // Day 3
  {
    id: 's8',
    dayId: 3,
    title: 'Session - 7',
    duration: '6 mins',
    durationMinutes: 6,
    type: 'Training',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    description: {
      startPoint: 'What the final assessment covers and how to prepare.',
      keyTopics: ['Topics covered', 'Format', 'Pass criteria'],
      learningOutcome: 'Ready to take the final assessment.',
      importantNotes: 'Certificate unlocked after Day 3 completion.',
    },
  },
  {
    id: 's9',
    dayId: 3,
    title: 'Session - 8',
    duration: '8 mins',
    durationMinutes: 8,
    type: 'Training',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
    description: {
      startPoint: 'How to obtain your certificate and what happens next.',
      keyTopics: ['Certificate process', 'Ongoing training', 'Support channels'],
      learningOutcome: 'Know how to get certified and where to get help.',
      importantNotes: 'Certificate unlocked after Day 3 completion.',
    },
  },
];

// Assessments shown after each session: Intro → Session - 1 → Assessment 1 → Session - 2 → Assessment 2 → ...
export const ASSESSMENTS = [
  { id: 'a1', dayId: 1, title: 'Assessment 1', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a2', dayId: 1, title: 'Assessment 2', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a3', dayId: 1, title: 'Assessment 3', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a4', dayId: 1, title: 'Assessment 4', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a5', dayId: 2, title: 'Assessment 5', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a6', dayId: 2, title: 'Assessment 6', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a7', dayId: 2, title: 'Assessment 7', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a8', dayId: 3, title: 'Assessment 8', duration: '5 mins', type: 'Assessment', thumbnail: null },
];

// Ordered list: Intro, Session - 1, Assessment 1, Session - 2, Assessment 2, ... Session - 8, Assessment 8
export const ALL_MODULES = (() => {
  const list = [];
  for (let i = 0; i < SESSIONS.length; i++) {
    list.push(SESSIONS[i]);
    if (i > 0 && i <= ASSESSMENTS.length) list.push(ASSESSMENTS[i - 1]);
  }
  return list;
})();

export function getSessionsByDay(dayId) {
  return SESSIONS.filter((s) => s.dayId === dayId);
}

/** All modules (sessions + assessments) for a day, in display order. */
export function getModulesByDay(dayId) {
  return ALL_MODULES.filter((m) => m.dayId === dayId);
}

export function getSessionById(sessionId) {
  return SESSIONS.find((s) => s.id === sessionId);
}

export function getModuleById(moduleId) {
  return ALL_MODULES.find((m) => m.id === moduleId) ?? null;
}

/** Next module in course order (ALL_MODULES), or null if at end. */
export function getNextModule(moduleId) {
  const idx = ALL_MODULES.findIndex((m) => m.id === moduleId);
  if (idx < 0 || idx >= ALL_MODULES.length - 1) return null;
  return ALL_MODULES[idx + 1];
}

export function isAssessmentId(id) {
  return ASSESSMENTS.some((a) => a.id === id);
}

export function getTotalDurationForDay(dayId) {
  const sessions = getSessionsByDay(dayId);
  return sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
}

export function getTotalSessions() {
  return SESSIONS.length;
}

// Resource library: PDFs, links, documents for training
export const RESOURCES = [
  {
    id: 'res1',
    title: 'Webinar Introduction Summary',
    description: 'Quick reference and key points from the intro video.',
    type: 'pdf',
    url: 'https://www.w3.org/WAI/WCAG21/quickref/',
    category: 'Handouts',
    sessionId: 'intro',
    format: 'PDF, 0.5 MB',
  },
  {
    id: 'res2',
    title: 'Certificate & Support Channels',
    description: 'How to obtain your certificate and where to find ongoing training and support.',
    type: 'link',
    url: '#',
    category: 'Onboarding',
    sessionId: 'intro',
    format: 'Web page',
  },
  {
    id: 'res3',
    title: 'Quick Reference Guide',
    description: 'All webinar-related resources in one place.',
    type: 'document',
    url: '#',
    category: 'Handouts',
    sessionId: null,
    format: 'PDF, 0.8 MB',
  },
  {
    id: 'res4',
    title: 'Internal Policy Index',
    description: 'Index of company policies with links and short descriptions.',
    type: 'link',
    url: '#',
    category: 'Policy',
    sessionId: null,
    format: 'Web page',
  },
];

export function getResourceById(resourceId) {
  return RESOURCES.find((r) => r.id === resourceId);
}

// Dashboard mock data (streak, community, next live session)
export const DASHBOARD_MOCK = {
  notesCount: 12,
  attendanceStreak: 3,
  averageAttendancePercent: 93,
  nextLiveSession: {
    title: 'React Fundamentals',
    instructor: 'John Smith',
    date: 'March 12',
    time: '7:00 PM',
    startsAt: null, // optional: Date for countdown
  },
  communityLearnersCount: 38,
  communityMessagesCount: 24,
  communityQuestionsToday: 8,
  communityReactions: { like: 15, fire: 4, target: 3 },
};

export function getNextIncompleteSession(completedSessionIds) {
  return SESSIONS.find((s) => !completedSessionIds.includes(s.id)) ?? null;
}

export function getRemainingSessionsMinutes(completedSessionIds) {
  return SESSIONS.filter((s) => !completedSessionIds.includes(s.id))
    .reduce((acc, s) => acc + s.durationMinutes, 0);
}
