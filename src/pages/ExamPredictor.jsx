import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import RankPredictorWithLeadGate from '../components/rankPredictor/RankPredictorWithLeadGate';
import { getExamConfig } from '../utils/rankPredictor';

function ExamPredictor() {
  const { examId } = useParams();
  const exam = useMemo(() => getExamConfig(examId), [examId]);

  if (!exam) return <Navigate to="/rank-predictor" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto min-w-0 max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Link
          to="/rank-predictor"
          className="inline-flex min-h-11 items-center text-sm font-medium text-primary-navy hover:underline"
        >
          ← Back to all exams
        </Link>
        <div className="mt-3 sm:mt-4">
          <RankPredictorWithLeadGate exam={exam} variant="public" />
        </div>
      </div>
    </div>
  );
}

export default ExamPredictor;
