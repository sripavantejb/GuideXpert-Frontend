/**
 * Counsellor assessment (Training Assessment - 1): sections and questions (MCQ).
 * Question ids q1–q10 match backend scoring.
 */
export const ASSESSMENT_SECTIONS = [
  {
    title: 'SECTION 1: Mission & counselling basics',
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
        text: 'What is the main role of Counselling?',
        options: [
          'A. Promote colleges',
          'B. Provide only course information',
          'C. Help students make informed decisions',
          'D. Convince students to join a specific college'
        ]
      }
    ]
  },
  {
    title: 'SECTION 2: Ethics, process & communication',
    questions: [
      {
        id: 'q5',
        type: 'mcq',
        text: 'Which of the following is a quality of a good counsellor?',
        options: [
          'A. Speaking more than the student',
          'B. Listening and asking questions',
          'C. Guaranteeing admissions',
          'D. Promoting one college only'
        ]
      },
      {
        id: 'q6',
        type: 'mcq',
        text: 'Why should counsellors never guarantee admission?',
        options: [
          'A. Colleges do not allow counsellors',
          'B. It takes too much time',
          'C. Students do not believe it',
          'D. Admissions depend on eligibility, seat availability, and university criteria'
        ]
      },
      {
        id: 'q7',
        type: 'mcq',
        text: 'Why should counsellors never guarantee placement?',
        options: [
          'A. Companies do not provide placements',
          'B. Placements depend on student skills, companies visiting, and past records',
          'C. Colleges do not allow placements',
          'D. Only government colleges provide placements'
        ]
      },
      {
        id: 'q8',
        type: 'mcq',
        text: 'If parents and students have different expectations, what should a counsellor do?',
        options: [
          'A. Support only parents',
          'B. Support only the student',
          'C. Acknowledge both views and suggest balanced options',
          'D. End the discussion'
        ]
      },
      {
        id: 'q9',
        type: 'mcq',
        text: 'What are the correct steps in the 4-step counselling flow?',
        options: [
          'A. Guide → Balance → Validate → Acknowledge',
          'B. Acknowledge → Validate → Balance → Guide',
          'C. Balance → Guide → Acknowledge → Validate',
          'D. Validate → Balance → Guide → Acknowledge'
        ]
      },
      {
        id: 'q10',
        type: 'mcq',
        text: 'Which communication style should counsellors follow?',
        options: [
          'A. Aggressive sales tone',
          'B. Pressure-based language',
          'C. Calm and guiding tone',
          'D. Fast speaking to convince parents'
        ]
      }
    ]
  }
];
