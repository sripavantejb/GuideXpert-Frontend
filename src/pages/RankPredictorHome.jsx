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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Rank Predictor</h1>
          <p className="mt-2 text-gray-600">Choose your exam to estimate rank from your marks.</p>
        </div>
        <ExamList exams={exams} />
      </div>
    </div>
  );
}

export default RankPredictorHome;
