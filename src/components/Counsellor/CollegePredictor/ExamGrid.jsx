import { ENTRANCE_EXAMS } from '../../../constants/collegePredictorOptions';
import ExamCard from './ExamCard';

export default function ExamGrid({ selectedExam, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {ENTRANCE_EXAMS.map((exam) => (
        <ExamCard
          key={exam.value}
          value={exam.value}
          label={exam.label}
          description={exam.description}
          accent={exam.accent}
          selected={selectedExam === exam.value}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
