import ExamCard from './ExamCard';

function ExamList({ exams, linkBase = '/rank-predictor' }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {exams.map((exam) => (
        <ExamCard key={exam.id} exam={exam} linkBase={linkBase} />
      ))}
    </div>
  );
}

export default ExamList;
