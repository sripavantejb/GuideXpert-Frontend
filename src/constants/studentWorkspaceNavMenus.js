import { getRankPredictorExams } from '../utils/rankPredictor';

/** Labels and paths match TestsHubPage TEST_CARDS */
export const fitTestNavItems = [
  { label: 'Course Fit Test', to: '/students/course-fit-test' },
  { label: 'College Fit Test', to: '/students/college-fit-test' },
];

export const compareCollegesNavItems = [
  { label: 'College comparison', to: '/students/college-comparison' },
];

/**
 * Rank predictor exam links — same targets as RankPredictorPage exam cards.
 * @returns {{ label: string, to: string }[]}
 */
export function getRankPredictorNavItems() {
  return getRankPredictorExams().map((exam) => ({
    label: exam.name,
    to: `/students/rank-predictor/${exam.id}`,
  }));
}
