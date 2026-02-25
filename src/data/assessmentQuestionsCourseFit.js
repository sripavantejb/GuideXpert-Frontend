/**
 * Course Fit Test: sections and questions (MCQ).
 * Question ids (cf1–cf10) match backend scoring.
 */
export const ASSESSMENT_SECTIONS_COURSE_FIT = [
  {
    title: 'Stream and subjects',
    questions: [
      {
        id: 'cf1',
        type: 'mcq',
        text: 'Which stream do you feel most drawn to?',
        options: [
          'Science (Engineering, Medicine, Pure Sciences)',
          'Commerce (Business, Finance, Economics)',
          'Arts/Humanities (Literature, History, Sociology)',
          'Still exploring multiple options',
        ],
      },
      {
        id: 'cf2',
        type: 'mcq',
        text: 'How do you prefer to learn?',
        options: [
          'Through experiments and hands-on work',
          'Through case studies and real examples',
          'Through reading and discussion',
          'Through a mix of all',
        ],
      },
      {
        id: 'cf3',
        type: 'mcq',
        text: 'What kind of assessments do you perform better in?',
        options: [
          'Exams with numerical or logical problems',
          'Projects and presentations',
          'Essays and long-form answers',
          'A combination of these',
        ],
      },
      {
        id: 'cf4',
        type: 'mcq',
        text: 'Which skill do you want to build the most?',
        options: [
          'Technical or analytical skills',
          'Communication and leadership',
          'Creative or design skills',
          'Research and critical thinking',
        ],
      },
    ],
  },
  {
    title: 'Goals and personality',
    questions: [
      {
        id: 'cf5',
        type: 'mcq',
        text: 'After graduation, what do you see yourself doing?',
        options: [
          'Working in tech, healthcare, or core industry',
          'Working in business, finance, or management',
          'Working in arts, media, or social sector',
          'Pursuing higher studies or research',
        ],
      },
      {
        id: 'cf6',
        type: 'mcq',
        text: 'How important is work-life balance to you?',
        options: [
          'Very important – I need clear boundaries',
          'Important but I can be flexible',
          'I am okay with intense phases if the work is meaningful',
          'It depends on the role',
        ],
      },
      {
        id: 'cf7',
        type: 'mcq',
        text: 'What role do you usually take in group projects?',
        options: [
          'Leading and organizing',
          'Doing the core technical or research work',
          'Presenting or communicating ideas',
          'Supporting and coordinating',
        ],
      },
      {
        id: 'cf8',
        type: 'mcq',
        text: 'Which statement fits you best?',
        options: [
          'I like following a structured curriculum',
          'I like choosing my own focus areas',
          'I like a balance of both',
          'I am still figuring this out',
        ],
      },
    ],
  },
  {
    title: 'Course alignment',
    questions: [
      {
        id: 'cf9',
        type: 'mcq',
        text: 'When you imagine your dream course, what stands out?',
        options: [
          'Strong placement and industry links',
          'Reputation and brand value',
          'Course content and faculty',
          'Campus life and peer group',
        ],
      },
      {
        id: 'cf10',
        type: 'mcq',
        text: 'What would make you feel the course was the right fit?',
        options: [
          'It matches my strengths and interests',
          'It opens the career options I want',
          'It challenges me in the right way',
          'It aligns with my values and goals',
        ],
      },
    ],
  },
];
