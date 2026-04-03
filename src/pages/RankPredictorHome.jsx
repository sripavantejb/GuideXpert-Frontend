import { getRankPredictorExams } from '../utils/rankPredictor';
import ExamList from '../components/rankPredictor/ExamList';

const EXAM_ICONS = {
  apeamcet: '📘',
  jeeadvanced: '🚀',
  jeemainpercentile: '📊',
  jeemainmarks: '🎯',
  kcet: '🧠',
  keam: '🏛️',
  mhcet: '⚡',
  tnea: '📐',
  tseamcet: '🧮',
  wbjee: '🌉',
};

function RankPredictorHome() {
  const exams = getRankPredictorExams().map((exam) => ({
    ...exam,
    icon: EXAM_ICONS[exam.id] || '📝',
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">Rank Predictor</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
            Choose your exam to estimate rank from your marks.
          </p>
        </div>
        <ExamList exams={exams} />
      </div>
    </div>
  );
}

export default RankPredictorHome;
