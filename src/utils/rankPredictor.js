const EXAM_DEFINITIONS = [
  {
    id: 'apeamcet',
    name: 'AP EAMCET',
    description: 'Predict AP EAMCET rank range from marks.',
    scoreLabel: 'Marks',
    min: 0,
    max: 160,
    type: 'marks',
  },
  {
    id: 'tseamcet',
    name: 'TS EAMCET',
    description: 'Predict TS EAMCET rank from marks.',
    scoreLabel: 'Marks',
    min: 0,
    max: 160,
    type: 'marks',
  },
  {
    id: 'jeeadvanced',
    name: 'JEE Advanced',
    description: 'Estimate JEE Advanced rank from total marks.',
    scoreLabel: 'Marks',
    min: 0,
    max: 360,
    type: 'marks',
  },
  {
    id: 'jeemainmarks',
    name: 'JEE Main Marks',
    description: 'Predict JEE Main rank from total marks.',
    scoreLabel: 'Marks',
    min: 0,
    max: 100,
    type: 'marks',
  },
  {
    id: 'jeemainpercentile',
    name: 'JEE Main Percentile',
    title: 'JEE Main Percentile Predictor',
    description: 'Predict JEE Main rank from your NTA percentile.',
    scoreLabel: 'Percentile',
    min: 0,
    max: 100,
    type: 'percentile',
  },
  {
    id: 'kcet',
    name: 'KCET',
    description: 'Get expected KCET rank range from marks.',
    scoreLabel: 'Marks',
    min: 0,
    max: 180,
    type: 'marks',
  },
  {
    id: 'mhcet',
    name: 'MHT CET',
    description: 'Predict rank by marks and difficulty.',
    scoreLabel: 'Marks',
    min: 0,
    max: 200,
    type: 'marks',
    requiresDifficulty: true,
    difficultyOptions: ['Easy', 'Moderate', 'Difficult'],
  },
  {
    id: 'tnea',
    name: 'TNEA',
    description: 'Predict TNEA rank range from normalized aggregate score.',
    scoreLabel: 'Normalized score',
    min: 0,
    max: 200,
    type: 'normalized',
  },
  {
    id: 'keam',
    name: 'KEAM',
    description: 'Estimate KEAM rank from normalized score.',
    scoreLabel: 'Normalized score',
    min: 0,
    max: 600,
    type: 'normalized',
  },
  {
    id: 'wbjee',
    name: 'WBJEE',
    description: 'Predict WBJEE rank range from score.',
    scoreLabel: 'Marks',
    min: 0,
    max: 200,
    type: 'marks',
  },
];

/** @type {Record<string, { min: number, max: number, type: 'marks' | 'percentile' | 'normalized' }>} */
export const examConfig = Object.fromEntries(
  EXAM_DEFINITIONS.map((d) => [d.name, { min: d.min, max: d.max, type: d.type }]),
);

export function getRankPredictorInputPlaceholder(exam) {
  const { min, max, type } = exam;
  if (type === 'percentile') {
    return `Enter percentile (${min} - ${max})`;
  }
  if (type === 'normalized') {
    return `Enter normalized score (${min} - ${max})`;
  }
  return `Enter marks (${min} - ${max})`;
}

export function getRankPredictorInputStep(exam) {
  return exam.type === 'percentile' ? '0.01' : '1';
}

const EXAM_CONFIG = Object.fromEntries(EXAM_DEFINITIONS.map((d) => [d.id, d]));

/**
 * @param {string} raw
 * @param {typeof EXAM_DEFINITIONS[number]} exam
 * @returns {{ ok: true, value: number } | { ok: false, error: string }}
 */
export function validateRankPredictorScore(raw, exam) {
  const trimmed = typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();
  if (trimmed === '') {
    return { ok: false, error: 'Please enter a value to continue.' };
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return { ok: false, error: 'Only numeric values are allowed.' };
  }

  const { min, max, type } = exam;

  if (type === 'marks' || type === 'normalized') {
    if (Math.floor(value) !== value) {
      return { ok: false, error: 'Please enter a whole number (no decimals).' };
    }
  }

  if (value < min || value > max) {
    if (type === 'percentile') {
      return { ok: false, error: `Enter percentile between ${min} and ${max}` };
    }
    if (type === 'normalized') {
      return { ok: false, error: `Enter score between ${min} and ${max}` };
    }
    return { ok: false, error: `Enter marks between ${min} and ${max}` };
  }

  return { ok: true, value };
}

export function getRankPredictorExams() {
  return Object.values(EXAM_CONFIG);
}

export function getExamConfig(examId) {
  return EXAM_CONFIG[examId] || null;
}
