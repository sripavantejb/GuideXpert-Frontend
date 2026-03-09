import { Link } from 'react-router-dom';
import { FiMessageCircle, FiSearch } from 'react-icons/fi';

const CARD_CLASS = 'rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden p-4 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 min-w-0';

export default function DoubtsDashboardCard({ questionsCount = 0 }) {
  return (
    <div className={CARD_CLASS}>
      <header className="flex items-center justify-between gap-3 w-full mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Doubts & clarifications
        </h3>
        <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">
          {questionsCount} question{questionsCount !== 1 ? 's' : ''} asked
        </span>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/webinar/doubts"
          className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-4 py-2.5 rounded-lg bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 transition-colors w-full"
        >
          <FiMessageCircle className="w-4 h-4 flex-shrink-0" aria-hidden /> Ask a question
        </Link>
        <Link
          to="/webinar/doubts?filter=all"
          className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors w-full"
        >
          <FiSearch className="w-4 h-4 flex-shrink-0" aria-hidden /> Search existing doubts
        </Link>
      </div>
      <p className="text-xs text-gray-500 mt-3 leading-tight">
        View all · Answered · Unanswered · My questions
      </p>
    </div>
  );
}
