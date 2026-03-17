/**
 * Counsellor assessment 5 (Session 5): Portal login, referral, NIAT, Rank Predictor.
 * Sourced from Training workflow CSV. Question ids q1–q5 match backend scoring.
 */
export const ASSESSMENT_SECTIONS_5 = [
  {
    title: 'Session - 5: Portal & referral',
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        text: 'How can a counsellor log in to the GuideXpert portal?',
        options: [
          'a) Using mobile number and OTP',
          'b) Using email and password',
          'c) Through social media login',
          'd) Using referral code'
        ]
      },
      {
        id: 'q2',
        type: 'mcq',
        text: 'How can a counsellor refer a student?',
        options: [
          'a) By sending college brochures',
          'b) By sharing NAT exam link through referral portal',
          'c) By asking the student to visit college directly',
          'd) By conducting a counselling session'
        ]
      },
      {
        id: 'q3',
        type: 'mcq',
        text: 'What is the first step in the NIAT admission journey?',
        options: [
          'a) Application Fee',
          'b) Entrance Interview',
          'c) Enrollment',
          'd) Campus Visit'
        ]
      },
      {
        id: 'q4',
        type: 'mcq',
        text: 'What is the purpose of the referral system in the portal?',
        options: [
          'a) Track student attendance',
          'b) Earn rewards by referring students and to track admission process',
          'c) Conduct counselling sessions',
          'd) Manage exams'
        ]
      },
      {
        id: 'q5',
        type: 'mcq',
        text: 'Which tool helps predict a student\'s expected rank based on performance?',
        options: [
          'a) College Predictor',
          'b) Exam Predictor',
          'c) Deadline Manager',
          'd) Rank Predictor'
        ]
      }
    ]
  }
];
