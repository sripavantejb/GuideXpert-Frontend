import { Link } from 'react-router-dom';
import { FiMessageCircle, FiSearch } from 'react-icons/fi';

const CARD_CLASS = 'rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden p-5 transition-all duration-200 hover:shadow-md min-w-0';

export default function DoubtsDashboardCard({ questionsCount = 0 }) {
  return (
    <div className={CARD_CLASS}>
      <header className="flex items-center justify-between gap-3 w-full mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Doubts & clarifications
        </h3>
        <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">
          {questionsCount} question{questionsCount !== 1 ? 's' : ''} asked
        </span>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/webinar/doubts"
          className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 transition-colors w-full shadow-sm"
        >
          <FiMessageCircle className="w-4 h-4 flex-shrink-0" aria-hidden /> Ask a question
        </Link>
        <Link
          to="/webinar/doubts?filter=all"
          className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors w-full"
        >
          <FiSearch className="w-4 h-4 flex-shrink-0" aria-hidden /> Search existing doubts
        </Link>
      </div>
      <p className="text-xs text-gray-500 mt-4 leading-tight">
        View all · Answered · Unanswered · My questions
      </p>
    </div>
  );
}
