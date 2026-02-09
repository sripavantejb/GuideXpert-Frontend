/**
 * Counsellor assessment: sections and questions (MCQ + short answer).
 * Question ids match backend scoring (q1, q2, q3, q5, q6, q7, q9, q10, q12, q13).
 */
export const ASSESSMENT_SECTIONS = [
  {
    title: 'SECTION 1: Counselling at GuideXpert',
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        text: 'What is the primary role of a GuideXpert counsellor?',
        options: [
          'To sell admissions quickly',
          'To promote one college',
          'To guide students based on their needs and suitability',
          'To close maximum conversions'
        ]
      },
      {
        id: 'q2',
        type: 'mcq',
        text: 'How is a counsellor different from an agent?',
        options: [
          'Counsellor focuses on commission',
          'Counsellor explains all suitable options ethically',
          'Counsellor pushes fast decisions',
          'Counsellor works only with backend'
        ]
      },
      {
        id: 'q3',
        type: 'mcq',
        text: 'Counselling at GuideXpert should be treated as:',
        options: [
          'A sales pitch',
          'A one-way explanation',
          'A structured conversation',
          'A marketing activity'
        ]
      }
    ]
  },
  {
    title: 'SECTION 2: Ethics & Responsibility',
    questions: [
      {
        id: 'q5',
        type: 'mcq',
        text: 'Which of the following is strictly NOT allowed at GuideXpert?',
        options: [
          'Explaining multiple options',
          'Asking budget-related questions',
          'Giving false guarantees',
          'Taking time to counsel'
        ]
      },
      {
        id: 'q6',
        type: 'mcq',
        text: 'Why are ethics non-negotiable in counselling?',
        options: [
          'To look professional',
          'To increase conversions',
          'Because wrong guidance affects student futures',
          'Because it is company policy'
        ]
      },
      {
        id: 'q7',
        type: 'mcq',
        text: 'A student wants admission immediately, but the course is not suitable. What should you do?',
        options: [
          'Proceed to close admission',
          'Ask backend to handle',
          'Explain the risk and guide properly',
          'Ignore the concern'
        ]
      }
    ]
  },
  {
    title: 'SECTION 3: Lead Generation',
    questions: [
      {
        id: 'q9',
        type: 'mcq',
        text: 'Which is an ethical way to generate leads?',
        options: [
          'Promising guaranteed placement',
          'Cold messaging with false claims',
          'Referrals and personal networks',
          'Pressure tactics'
        ]
      },
      {
        id: 'q10',
        type: 'mcq',
        text: 'What is the correct first approach to a student?',
        options: [
          'Push admission details',
          'Ask for documents',
          'Build rapport and understand needs',
          'Discuss fees immediately'
        ]
      }
    ]
  },
  {
    title: 'SECTION 4: Lead Qualification',
    questions: [
      {
        id: 'q12',
        type: 'mcq',
        text: 'Why is lead qualification important?',
        options: [
          'To reject students',
          'To save time and ensure right fit',
          'To increase enquiry count',
          'To reduce counselling effort'
        ]
      },
      {
        id: 'q13',
        type: 'mcq',
        text: 'Which lead should you NOT proceed with immediately?',
        options: [
          'Student with clear goals',
          'Parent ready to discuss',
          'Student with no clarity and urgency pressure',
          'Student asking genuine questions'
        ]
      }
    ]
  }
];
