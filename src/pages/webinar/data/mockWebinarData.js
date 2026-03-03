/**
 * Mock data for Webinar & Training Portal.
 * Days 1–3; sessions with descriptions for T&C, onboarding, compliance.
 */

export const DAYS = [
  { id: 1, label: 'Day 1' },
  { id: 2, label: 'Day 2' },
  { id: 3, label: 'Day 3' },
];

// Single source: all sessions with dayId. Lock logic: Day 2 unlocks when Day 1 complete; Day 3 when Day 2 complete.
export const SESSIONS = [
  // Day 1
  {
    id: 's1',
    dayId: 1,
    title: 'Company Overview',
    duration: '8 mins',
    durationMinutes: 8,
    type: 'Overview',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
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
    title: 'Terms & Conditions Part 1',
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
    title: 'Privacy Policy',
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
    title: 'Code of Conduct',
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
    title: 'Terms & Conditions Part 2',
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
    title: 'Internal Onboarding',
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
    title: 'Security & Confidentiality',
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
    title: 'Final Assessment Overview',
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
    title: 'Certification & Next Steps',
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

export function getSessionsByDay(dayId) {
  return SESSIONS.filter((s) => s.dayId === dayId);
}

export function getSessionById(sessionId) {
  return SESSIONS.find((s) => s.id === sessionId);
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
    title: 'Company Overview Summary',
    description: 'One-page summary of company mission, values, and structure. Use as a quick reference after the session.',
    type: 'pdf',
    url: 'https://www.w3.org/WAI/WCAG21/quickref/',
    category: 'Handouts',
    sessionId: 's1',
    format: 'PDF, 0.5 MB',
  },
  {
    id: 'res2',
    title: 'Terms & Conditions Full Document',
    description: 'Complete T&C document for reference. Covers scope, rights, obligations, and termination.',
    type: 'pdf',
    url: '#',
    category: 'Compliance',
    sessionId: 's2',
    format: 'PDF, 1.2 MB',
  },
  {
    id: 'res3',
    title: 'Privacy Policy Summary',
    description: 'Key points on data collection, legal basis, and your rights under the privacy policy.',
    type: 'document',
    url: '#',
    category: 'Policy',
    sessionId: 's3',
    format: 'PDF, 0.8 MB',
  },
  {
    id: 'res4',
    title: 'Code of Conduct Guidelines',
    description: 'Expected behavior, integrity, respect, and confidentiality standards.',
    type: 'pdf',
    url: '#',
    category: 'Compliance',
    sessionId: 's4',
    format: 'PDF, 0.9 MB',
  },
  {
    id: 'res5',
    title: 'T&C Part 2 – Liability & Disputes',
    description: 'Extended terms: liability, indemnity, dispute resolution, and governing law.',
    type: 'pdf',
    url: '#',
    category: 'Compliance',
    sessionId: 's5',
    format: 'PDF, 1.1 MB',
  },
  {
    id: 'res6',
    title: 'Onboarding Checklist',
    description: 'Step-by-step checklist for new joiners: systems access, workflows, and key contacts.',
    type: 'link',
    url: '#',
    category: 'Onboarding',
    sessionId: 's6',
    format: 'Web page',
  },
  {
    id: 'res7',
    title: 'Security Best Practices',
    description: 'Handling sensitive information, passwords, devices, and reporting incidents.',
    type: 'document',
    url: '#',
    category: 'Policy',
    sessionId: 's7',
    format: 'PDF, 0.7 MB',
  },
  {
    id: 'res8',
    title: 'Final Assessment Guide',
    description: 'What the assessment covers, format, and pass criteria. Prepare with this guide.',
    type: 'pdf',
    url: '#',
    category: 'Handouts',
    sessionId: 's8',
    format: 'PDF, 0.4 MB',
  },
  {
    id: 'res9',
    title: 'Certificate & Support Channels',
    description: 'How to obtain your certificate and where to find ongoing training and support.',
    type: 'link',
    url: '#',
    category: 'Onboarding',
    sessionId: 's9',
    format: 'Web page',
  },
  {
    id: 'res10',
    title: 'Compliance Quick Reference',
    description: 'All compliance-related policies in one place: T&C, privacy, code of conduct, security.',
    type: 'document',
    url: '#',
    category: 'Compliance',
    sessionId: null,
    format: 'PDF, 2.1 MB',
  },
  {
    id: 'res11',
    title: 'Internal Policy Index',
    description: 'Index of all company policies with links and short descriptions.',
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
