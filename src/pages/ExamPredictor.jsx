import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import RankForm from '../components/rankPredictor/RankForm';
import ResultCard from '../components/rankPredictor/ResultCard';
import { getExamConfig } from '../utils/rankPredictor';
import { predictRankPublic } from '../utils/api';

function ExamPredictor() {
  const { examId } = useParams();
  const exam = useMemo(() => getExamConfig(examId), [examId]);
  const [score, setScore] = useState('');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!exam) return <Navigate to="/rank-predictor" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');

    if (score === '') {
      setError('Please enter marks to continue.');
      return;
    }

    const numericScore = Number(score);
    if (Number.isNaN(numericScore)) {
      setError('Only numeric values are allowed.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        examId: exam.id,
        score: numericScore,
      };
      if (exam.requiresDifficulty) {
        payload.options = { difficulty };
      }
      const response = await predictRankPublic(payload);
      if (!response.success) {
        setError(response.message || 'Could not generate prediction. Please try again.');
        return;
      }
      const predicted = response.data || {};
      setResult({
        predictedRank: predicted.predictedValue,
        range: predicted.range,
        message: predicted.message,
        metricLabel: predicted.metricLabel,
      });
    } catch (err) {
      setError(err.message || 'Could not generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/rank-predictor" className="text-sm font-medium text-primary-navy hover:underline">
          ← Back to all exams
        </Link>
        <div className="mt-4">
          <RankForm
            exam={exam}
            score={score}
            difficulty={difficulty}
            onScoreChange={setScore}
            onDifficultyChange={setDifficulty}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
          <ResultCard result={result} />
        </div>
      </div>
    </div>
  );
}

export default ExamPredictor;
