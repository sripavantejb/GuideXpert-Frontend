import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

function ExamCard({ exam }) {
  return (
    <Link
      to={`/rank-predictor/${exam.id}`}
      className="group flex min-h-[44px] min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-6"
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-navy/10 text-xl">
        <span>{exam.icon}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900">{exam.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{exam.description}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-navy">
        Predict now <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default ExamCard;
