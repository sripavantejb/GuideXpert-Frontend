import { useNavigate } from 'react-router-dom';
import { ExamGrid } from '../../components/Counsellor/CollegePredictor';

export default function CollegePredictorExams() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      <header className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          College Predictor
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
          Select your exam and predict colleges instantly
        </p>
      </header>

      <ExamGrid
        selectedExam={null}
        onSelect={(exam) => navigate(`/counsellor/tools/college-predictor/${exam}`)}
      />
    </div>
  );
}
