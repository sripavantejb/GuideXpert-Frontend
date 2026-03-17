/**
 * Counsellor assessment 1 (Session 1): Mission, Information, Guidance, student-centric step, role of Counselling.
 * Question ids q1–q5 match backend scoring.
 */
export const ASSESSMENT_SECTIONS = [
  {
    title: 'Session 1: Mission & counselling basics',
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        text: 'What is the main mission of GuideXpert?',
        options: [
          'A. Promote specific colleges',
          'B. Help students with honest, ethical and personalised career guidance',
          'C. Increase admissions in partner colleges',
          'D. Promote engineering courses only'
        ]
      },
      {
        id: 'q2',
        type: 'mcq',
        text: 'What does Information mean in counselling?',
        options: [
          'A. Helping students decide',
          'B. Convincing students to choose a course',
          'C. Sharing facts only',
          'D. Giving personal advice'
        ]
      },
      {
        id: 'q3',
        type: 'mcq',
        text: 'What does Guidance mean?',
        options: [
          'A. Suggesting options or recommendations',
          'B. Sharing facts only',
          'C. Forcing students to choose a course',
          'D. Guaranteeing placements'
        ]
      },
      {
        id: 'q4',
        type: 'mcq',
        text: 'What is the first step in a student-centric counselling approach?',
        options: [
          "A. Listen to the student's needs",
          'B. Suggest a college immediately',
          'C. Give admission forms',
          'D. Explain fee structure'
        ]
      },
      {
        id: 'q5',
        type: 'mcq',
        text: 'What is the main role of Counselling?',
        options: [
          'A. Promote colleges',
          'B. Provide only course information',
          'C. Help students make informed decisions',
          'D. Convince students to join a specific college'
        ]
      }
    ]
  }
];
