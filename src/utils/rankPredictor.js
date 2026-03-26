const EXAM_CONFIG = {
  apeamcet: {
    id: 'apeamcet',
    name: 'AP EAMCET',
    description: 'Predict AP EAMCET rank range from marks.',
    scoreLabel: 'Marks',
    minScore: 0,
    maxScore: 100,
  },
  jeeadvanced: {
    id: 'jeeadvanced',
    name: 'JEE Advanced',
    description: 'Estimate JEE Advanced rank from total marks.',
    scoreLabel: 'Marks',
    minScore: 0,
    maxScore: 360,
  },
  jeemainpercentile: {
    id: 'jeemainpercentile',
    name: 'JEE Main Percentile',
    title: 'JEE Main Percentile Predictor',
    description: 'Predict JEE Main percentile based on marks.',
    scoreLabel: 'Marks',
    minScore: -40,
    maxScore: 300,
  },
  jeemainmarks: {
    id: 'jeemainmarks',
    name: 'JEE Main Rank',
    description: 'Predict JEE Main rank based on score table.',
    scoreLabel: 'Score',
    minScore: 0,
    maxScore: 100,
    step: 0.01,
  },
  kcet: {
    id: 'kcet',
    name: 'KCET',
    description: 'Get expected KCET rank range from marks.',
    scoreLabel: 'Marks',
    minScore: 0,
    maxScore: 100,
  },
  keam: {
    id: 'keam',
    name: 'KEAM',
    description: 'Estimate KEAM rank based on marks.',
    scoreLabel: 'Marks',
    minScore: 0,
    maxScore: 600,
  },
  mhcet: {
    id: 'mhcet',
    name: 'MHT CET',
    description: 'Predict percentile by marks and difficulty.',
    scoreLabel: 'Marks',
    minScore: 0,
    maxScore: 200,
    requiresDifficulty: true,
    difficultyOptions: ['Easy', 'Moderate', 'Difficult'],
  },
  tnea: {
    id: 'tnea',
    name: 'TNEA',
    description: 'Predict TNEA rank range from aggregate score.',
    scoreLabel: 'Marks',
    minScore: 0,
    maxScore: 200,
  },
  tseamcet: {
    id: 'tseamcet',
    name: 'TS EAMCET',
    description: 'Predict TS EAMCET rank from marks.',
    scoreLabel: 'Marks',
    minScore: 0,
    maxScore: 160,
  },
  wbjee: {
    id: 'wbjee',
    name: 'WBJEE',
    description: 'Predict WBJEE rank range from score.',
    scoreLabel: 'Marks',
    minScore: 0,
    maxScore: 200,
  },
};

export function getRankPredictorExams() {
  return Object.values(EXAM_CONFIG);
}

export function getExamConfig(examId) {
  return EXAM_CONFIG[examId] || null;
}
