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
      startPoint: 'Introduction to GuideXpert and career counselling for students after intermediate.',
      keyTopics: ['Career clarity', 'Course options', 'GuideXpert vision'],
      learningOutcome: 'Understand what students need and how GuideXpert helps with career roadmap and upskilling.',
      importantNotes: 'Complete this intro before moving to later sessions.',
      outline: [
        { title: 'Welcome to GuideXpert', points: ['Intro session opening', 'Session start context'] },
        { title: 'Problems Students Face After Intermediate', points: ['Confusion & lack of clarity', 'Wrong college/course selection', 'Skill gap & unemployment'] },
        { title: 'What Students Actually Need', points: ['Clarity', 'Career roadmap', 'Proper support'] },
        { title: 'How GuideXpert Solves This', points: ['Industry-aligned curriculum', 'Modern technologies (AI/ML, Full Stack)', 'Real-world projects', 'Industry-ready upskilling'] },
        { title: 'GuideXpert Vision / Network', points: ["Building India's trusted counselling network", 'Presence across locations'] },
        { title: 'Courses After 12th (Overview)', points: ['Introduction to all career paths'] },
        { title: 'Professional Courses', points: ['CA', 'CS', 'CMA', 'Law (LLB)'] },
        { title: 'Degree Courses', points: ['B.Sc, B.Com, BBA, BA', 'Future paths (MBA, Govt Jobs, Masters)'] },
        { title: 'Engineering Courses (B.Tech / B.E.)', points: ['Branch overview', 'Popular options'] },
        { title: 'Engineering Overview', points: ['Transition slide to deep dive'] },
        { title: 'Computer Science Engineering (CSE)', points: ['Focus areas', 'Career opportunities'] },
        { title: 'Electronics & Communication (ECE)', points: ['Focus areas', 'Career opportunities'] },
        { title: 'Electrical Engineering (EEE)', points: ['Focus areas', 'Career opportunities'] },
        { title: 'Mechanical Engineering', points: ['Focus areas', 'Career opportunities'] },
        { title: 'Civil Engineering', points: ['Focus areas', 'Career opportunities'] },
        { title: 'Training Importance & Next Steps', points: ['Importance of upcoming sessions', 'Activation journey'] },
      ],
    },
  },
  {
    id: 's2',
    dayId: 1,
    title: 'Session - 1',
    duration: '12 mins',
    durationMinutes: 12,
    type: 'Overview',
    videoUrl: 'https://www.youtube.com/embed/WQ2YttHj2EE',
    isYoutube: true,
    thumbnail: 'https://img.youtube.com/vi/WQ2YttHj2EE/hqdefault.jpg',
    description: {
      startPoint: 'Introduction to GuideXpert and career counselling for students after intermediate.',
      keyTopics: ['Career clarity', 'Course options', 'GuideXpert vision'],
      learningOutcome: 'Understand what students need and how GuideXpert helps with career roadmap and upskilling.',
      importantNotes: 'Complete this session before moving to later sessions.',
      outline: [
        { title: 'Welcome to GuideXpert', points: ['Intro session opening', 'Session start context'] },
        { title: 'Problems Students Face After Intermediate', points: ['Confusion & lack of clarity', 'Wrong college/course selection', 'Skill gap & unemployment'] },
        { title: 'What Students Actually Need', points: ['Clarity', 'Career roadmap', 'Proper support'] },
        { title: 'How GuideXpert Solves This', points: ['Industry-aligned curriculum', 'Modern technologies (AI/ML, Full Stack)', 'Real-world projects', 'Industry-ready upskilling'] },
        { title: 'GuideXpert Vision / Network', points: ["Building India's trusted counselling network", 'Presence across locations'] },
        { title: 'Courses After 12th (Overview)', points: ['Introduction to all career paths'] },
        { title: 'Professional Courses', points: ['CA', 'CS', 'CMA', 'Law (LLB)'] },
        { title: 'Degree Courses', points: ['B.Sc, B.Com, BBA, BA', 'Future paths (MBA, Govt Jobs, Masters)'] },
        { title: 'Engineering Courses (B.Tech / B.E.)', points: ['Branch overview', 'Popular options'] },
        { title: 'Engineering Overview', points: ['Transition slide to deep dive'] },
        { title: 'Computer Science Engineering (CSE)', points: ['Focus areas', 'Career opportunities'] },
        { title: 'Electronics & Communication (ECE)', points: ['Focus areas', 'Career opportunities'] },
        { title: 'Electrical Engineering (EEE)', points: ['Focus areas', 'Career opportunities'] },
        { title: 'Mechanical Engineering', points: ['Focus areas', 'Career opportunities'] },
        { title: 'Civil Engineering', points: ['Focus areas', 'Career opportunities'] },
        { title: 'Training Importance & Next Steps', points: ['Importance of upcoming sessions', 'Activation journey'] },
      ],
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
];

// Assessments shown after each session: Intro → Session - 1 → Assessment 1 → Session - 2 → Assessment 2 → ...
export const ASSESSMENTS = [
  { id: 'a1', dayId: 1, title: 'Assessment 1', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a2', dayId: 1, title: 'Assessment 2', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a3', dayId: 1, title: 'Assessment 3', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a4', dayId: 1, title: 'Assessment 4', duration: '5 mins', type: 'Assessment', thumbnail: null },
  { id: 'a5', dayId: 2, title: 'Assessment 5', duration: '5 mins', type: 'Assessment', thumbnail: null },
];

// Ordered list: Intro, Session - 1, Assessment 1, Session - 2, Assessment 2, ... Session - 5, Assessment 5
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
