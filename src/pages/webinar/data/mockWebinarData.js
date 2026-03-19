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
    title: 'Introduction to GuideXpert Counsellor training program',
    duration: '8 mins',
    durationMinutes: 8,
    type: 'Overview',
    videoUrl: 'https://www.youtube.com/embed/2MzzVkijtPo',
    isYoutube: true,
    thumbnail: 'https://img.youtube.com/vi/2MzzVkijtPo/hqdefault.jpg',
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
    title: 'Introduction to GuideXpert Counselling & Core Principles',
    duration: '12 mins',
    durationMinutes: 12,
    type: 'Overview',
    videoUrl: 'https://www.youtube.com/embed/WQ2YttHj2EE',
    isYoutube: true,
    thumbnail: 'https://img.youtube.com/vi/WQ2YttHj2EE/hqdefault.jpg',
    description: {
      startPoint: 'This session builds the foundation of ethical, student-centric counselling at GuideXpert.',
      keyTopics: ['GuideXpert mission', 'Counselling principles', 'Counselling flow', 'Information vs guidance vs counselling', "Do's and don'ts", 'Handling common questions'],
      learningOutcome: 'Use a structured counselling approach that is honest, practical, and focused on student outcomes.',
      importantNotes: 'Always avoid false promises on admission, placements, or shortcuts.',
      outline: [
        {
          title: 'Introduction to GuideXpert',
          points: ['Mission and vision of GuideXpert', 'Role and responsibility of a career counsellor'],
        },
        {
          title: 'GuideXpert Counselling Principles',
          points: ['Student-centric approach', 'Integrity and transparency', 'Professional mentorship', 'Quality-driven and future-ready counselling'],
        },
        {
          title: 'Student-Centric Counselling Flow',
          points: ['Listen to student needs', 'Share clear and accurate information', 'Guide toward the right choice', 'Support throughout admission'],
        },
        {
          title: 'Information vs Guidance vs Counselling',
          points: ['Information: facts only', 'Guidance: directional support', 'Counselling: deep, personalized decision support'],
        },
        {
          title: 'Counselling Process and Ethics',
          points: ['Counselling is a two-way process', 'Ask questions to understand student and parent concerns', 'Help families make informed decisions'],
        },
        {
          title: 'Counselling Dos and Donts',
          points: ['Be honest about fees, scholarships, and eligibility', 'Do not guarantee admission or placements', 'Never manipulate ranks or suggest shortcuts'],
        },
        {
          title: 'Handling Common Questions',
          points: ['Placement guarantee concerns', 'Government vs private college confusion', 'Fee concerns and parent objections'],
        },
      ],
    },
  },
  {
    id: 's3',
    dayId: 1,
    title: 'Mastering Counselling: Objection Handling & Communication Skills',
    duration: '10 mins',
    durationMinutes: 10,
    type: 'Compliance',
    videoUrl: 'https://www.youtube.com/watch?v=cQ6h1ZwM_qs',
    isYoutube: true,
    thumbnail: 'https://img.youtube.com/vi/cQ6h1ZwM_qs/hqdefault.jpg',
    description: {
      startPoint: 'This session teaches how to handle counselling objections with calm, structured communication.',
      keyTopics: ['Objection handling', 'Parent vs student conflict', '4-step response flow', 'Communication skills', 'Body language', 'Lead generation basics'],
      learningOutcome: 'Respond to difficult counselling situations with empathy, clarity, and practical guidance.',
      importantNotes: 'Avoid pressure language; guide students with balanced options and realistic outcomes.',
      outline: [
        {
          title: 'Handling Objections in Counselling',
          points: ['Understand conflicts between parent expectations and student preferences'],
        },
        {
          title: 'Real Counselling Situations',
          points: ['Parent expectations vs student goals', 'Budget vs college preference', 'Placement vs passion', 'Safety vs exposure', 'Career confusion and urgency'],
        },
        {
          title: 'Counsellor Response Strategy',
          points: ['Acknowledge both sides', 'Validate emotions', 'Balance expectations', 'Guide toward practical options'],
        },
        {
          title: '4-Step Counselling Flow',
          points: ['Acknowledge', 'Validate', 'Balance', 'Guide'],
        },
        {
          title: 'Communication Skills',
          points: ['Keep tone calm and steady', 'Speak clearly and avoid aggressive sales tone', 'Use phrases like "Let us explore" and "Based on your goals"'],
        },
        {
          title: 'Body Language in Counselling',
          points: ['Maintain eye contact and open posture', 'Avoid looking at phone, crossing arms, or casual disengaged posture'],
        },
        {
          title: 'Practice and Improvement',
          points: ['Record mock counselling', 'Identify filler words', 'Practice objection handling', 'Collect feedback consistently'],
        },
        {
          title: 'Lead Generation Basics',
          points: ['Use social media, network, and referrals', 'Learn to identify serious vs casual leads'],
        },
      ],
    },
  },
  {
    id: 's4',
    dayId: 1,
    title: 'Lead Generation Methods & Strategies for Career Counsellors',
    duration: '15 mins',
    durationMinutes: 15,
    type: 'Compliance',
    videoUrl: 'https://www.youtube.com/embed/aEe6b2l8Nbk',
    isYoutube: true,
    thumbnail: 'https://img.youtube.com/vi/aEe6b2l8Nbk/hqdefault.jpg',
    description: {
      startPoint: 'This session explains practical online lead generation for counsellors.',
      keyTopics: ['Digital presence', 'Social media leads', 'Personal network', 'Referrals', 'College outreach', 'Lead qualification'],
      learningOutcome: 'Create a repeatable lead flow using online channels, referrals, and college relationships.',
      importantNotes: 'Focus on trust and clarity; avoid hard selling while engaging students and parents.',
      outline: [
        {
          title: 'Introduction and Session Overview',
          points: ['Welcome to GuideXpert', 'Understand the lead generation framework'],
        },
        {
          title: 'Generating Leads Online',
          points: ['Build digital presence', 'Stay visible with useful career content'],
        },
        {
          title: 'Lead Generation Through Social Media',
          points: ['Post consistently', 'Share career guidance content', 'Create curiosity with relevant topics'],
        },
        {
          title: 'Lead Generation Through Personal Network',
          points: ['Start meaningful conversations', 'Ask the right qualifying questions', 'Share Career Clarity Test links and follow up'],
        },
        {
          title: 'Building Trust and Authority',
          points: ['Hold meaningful discussions', 'Build a professional image', 'Guide before you pitch'],
        },
        {
          title: 'Lead Generation Through Referrals',
          points: ['Encourage student and parent referrals', 'Build a consistent network effect'],
        },
        {
          title: 'College-Based Lead Generation',
          points: ['Build relationships with college authorities', 'Conduct career guidance sessions'],
        },
        {
          title: 'Approaching Authorities and Running Sessions',
          points: ['Begin with student problems', 'Offer value through tests and sessions', 'Use soft closing without pressure'],
        },
        {
          title: 'Identifying Right Leads',
          points: ['Differentiate serious and casual leads', 'Evaluate interest, budget, timeline, and decision maker'],
        },
      ],
    },
  },
  // Day 2 — Session 4: How to Position Yourself as a Trusted Career Counsellor
  {
    id: 's5',
    dayId: 2,
    title: 'How to Position Yourself as a Trusted Career Counsellor',
    duration: '14 mins',
    durationMinutes: 14,
    type: 'Compliance',
    videoUrl: 'https://www.youtube.com/embed/A8TCyFUIKbo',
    isYoutube: true,
    thumbnail: 'https://img.youtube.com/vi/A8TCyFUIKbo/hqdefault.jpg',
    description: {
      startPoint: 'This session focuses on counsellor positioning and personal branding online.',
      keyTopics: ['Personal branding', 'Right positioning', 'Professional bio', 'Perception building', 'Trust-based enquiries', 'GuideXpert network'],
      learningOutcome: 'Position yourself as a trusted career counsellor and attract high-quality long-term enquiries.',
      importantNotes: 'Avoid seat-first or fee-first messaging; lead with career clarity and transparency.',
      outline: [
        {
          title: 'Introduction and Session Objective',
          points: ['Welcome to GuideXpert', 'Understand why online positioning matters'],
        },
        {
          title: 'Positioning Yourself Online',
          points: ['Build a professional counsellor identity', 'Use consistent and value-driven messaging'],
        },
        {
          title: 'Wrong Approach to Avoid',
          points: ['Agent-style content', 'Seat-focused and fee-focused posts', 'Pressure-driven communication'],
        },
        {
          title: 'Right Approach to Follow',
          points: ['Post as a career counsellor', 'Explain branches and outcomes clearly', 'Share practical and transparent guidance'],
        },
        {
          title: 'Professional Bio and Perception Building',
          points: ['Highlight counsellor identity and structured process', 'Build image as guide, not seller', 'Be seen as honest and reliable'],
        },
        {
          title: 'Outcomes of Right Positioning',
          points: ['Trust-based enquiries', 'Better conversion quality', 'Long-term referral growth'],
        },
        {
          title: 'GuideXpert Collaboration and Presence',
          points: ['Partnered colleges across India', 'PAN India counselling support'],
        },
        {
          title: 'College Lists and Locations',
          points: ['Coverage across South, West, North, and Central India'],
        },
      ],
    },
  },
  {
    id: 's6',
    dayId: 2,
    title: 'GuideXpert Portal, Tools & Referral Process',
    duration: '20 mins',
    durationMinutes: 20,
    type: 'Training',
    videoUrl: 'https://www.youtube.com/embed/eNnDD9MdWs0',
    isYoutube: true,
    thumbnail: 'https://img.youtube.com/vi/eNnDD9MdWs0/hqdefault.jpg',
    description: {
      startPoint: 'This session covers counsellor platform usage and the NIAT admission and referral workflow.',
      keyTopics: ['Session recap', 'Counsellor login', 'Dashboard overview', 'AI predictors', 'Counsellor tools', 'NIAT referral and journey'],
      learningOutcome: 'Use the dashboard confidently to manage students, track admissions, and handle referrals end to end.',
      importantNotes: 'Track every student stage in the dashboard to avoid follow-up gaps and delays.',
      outline: [
        {
          title: 'Introduction and Session Recap',
          points: ['Welcome to GuideXpert', 'Quick revision of Session 1 to Session 4 learnings'],
        },
        {
          title: 'Counsellor Login Process',
          points: ['Login with mobile number', 'Verify using OTP', 'Access counsellor dashboard'],
        },
        {
          title: 'GuideXpert Dashboard Overview',
          points: ['Professional tools portal', 'Student and admission tracking', 'Session and activity overview'],
        },
        {
          title: 'AI and Prediction Tools',
          points: ['College Predictor', 'Rank Predictor'],
        },
        {
          title: 'Counsellor Tools and Features',
          points: ['Student management', 'Admissions tracker', 'Session scheduler', 'Assessment tools'],
        },
        {
          title: 'Referral System (NIAT)',
          points: ['Referral dashboard overview', 'Share referral links', 'Earn referral rewards'],
        },
        {
          title: 'NIAT Admission Journey',
          points: ['Application fee', 'NIAT exam', 'Interview or campus visit', 'Admission fee', 'Enrollment'],
        },
        {
          title: 'Tracking and System Issues',
          points: ['Monitor student progress regularly', 'Resolve tracking gaps quickly'],
        },
      ],
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
