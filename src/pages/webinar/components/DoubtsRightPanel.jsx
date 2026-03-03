import { useMemo } from 'react';
import { FiBarChart2, FiHelpCircle, FiMessageSquare } from 'react-icons/fi';
import DoubtForm from './DoubtForm';
import { normalizeDoubt } from '../utils/doubtHelpers';

export default function DoubtsRightPanel({ doubts, onAskSubmit, onOpenForm }) {
  const normalized = useMemo(() => doubts.map(normalizeDoubt).filter(Boolean), [doubts]);

  const stats = useMemo(() => {
    const total = normalized.length;
    const answered = normalized.filter((d) => d.status === 'answered').length;
    const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
    return { total, answered, pct };
  }, [normalized]);

  return (
    <div className="flex flex-col gap-6 sticky top-6">
      {/* Quick stats */}
      <section className="rounded-[20px] bg-white border border-gray-200 shadow-card p-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <FiBarChart2 className="w-4 h-4 text-primary-navy" />
          Quick stats
        </h2>
        <ul className="space-y-3">
          <li className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total questions</span>
            <span className="font-semibold text-gray-900">{stats.total}</span>
          </li>
          <li className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Answered</span>
            <span className="font-semibold text-green-600">{stats.pct}%</span>
          </li>
          <li className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Your questions</span>
            <span className="font-semibold text-gray-900">{stats.total}</span>
          </li>
        </ul>
      </section>

      {/* Quick ask */}
      <section className="rounded-[20px] bg-white border border-gray-200 shadow-card p-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <FiMessageSquare className="w-4 h-4 text-primary-navy" />
          Ask quick question
        </h2>
        <DoubtForm onSubmit={onAskSubmit} compact sessionId={null} />
        <button
          type="button"
          onClick={onOpenForm}
          className="mt-3 w-full text-xs text-primary-navy font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 rounded"
        >
          Or open full form
        </button>
      </section>

      {/* Help box */}
      <section className="rounded-[20px] bg-primary-blue-50/50 border border-primary-blue-100 p-5">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-3">
          <FiHelpCircle className="w-4 h-4 text-primary-navy" />
          Before asking
        </h2>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary-navy mt-0.5">•</span>
            <span>Check session notes and description</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-navy mt-0.5">•</span>
            <span>Search existing doubts for similar questions</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
