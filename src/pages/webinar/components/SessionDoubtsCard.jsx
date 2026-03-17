import { useMemo } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import DoubtForm from './DoubtForm';
import { normalizeDoubt } from '../utils/doubtHelpers';

const STATUS_BADGE = {
  answered: 'bg-accent-green/10 text-accent-green border-accent-green/20 text-xs font-medium px-2 py-0.5 rounded-full',
  under_review: 'bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium px-2 py-0.5 rounded-full',
  pending: 'bg-red-100 text-red-800 border border-red-200 text-xs font-medium px-2 py-0.5 rounded-full',
};

export default function SessionDoubtsCard({ sessionId, doubts = [], onDoubtsChange, embedded = false }) {
  const sessionDoubts = useMemo(() => {
    const list = Array.isArray(doubts) ? doubts.map(normalizeDoubt).filter(Boolean) : [];
    return sessionId ? list.filter((d) => d.sessionId === sessionId) : list;
  }, [doubts, sessionId]);

  const handleSubmit = (payload) => {
    const newDoubt = normalizeDoubt({
      ...payload,
      id: `d-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sessionId: sessionId || null,
      status: 'pending',
      createdAt: Date.now(),
      answer: null,
      answeredAt: null,
    });
    onDoubtsChange([...doubts, newDoubt]);
  };

  const cardWrapper = embedded ? '' : 'rounded-2xl bg-white border border-gray-200 shadow-card overflow-hidden transition-shadow duration-200 hover:shadow-card-hover';

  if (sessionId == null) {
    return (
      <div className={cardWrapper}>
        <div className={`flex items-center gap-2.5 ${embedded ? 'pt-0' : 'px-5 py-3.5 border-b border-gray-100'}`}>
          <FiMessageCircle className="w-4 h-4 text-primary-navy" aria-hidden />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Doubts</h2>
        </div>
        <div className="p-5 text-center py-10">
          <p className="text-sm text-gray-500">Select a session to view or add doubts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cardWrapper}>
      <div className={`flex items-center gap-2.5 ${embedded ? 'pt-0 pb-2' : 'px-5 py-3.5 border-b border-gray-100'}`}>
        <FiMessageCircle className="w-4 h-4 text-primary-navy" aria-hidden />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Doubts</h2>
      </div>
      <div className={embedded ? 'space-y-4' : 'p-5 space-y-4'}>
        <DoubtForm onSubmit={handleSubmit} sessionId={sessionId} compact />
        <div className="overflow-y-auto max-h-[220px] sm:max-h-[260px] space-y-2">
          {sessionDoubts.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No doubts yet for this session.</p>
          ) : (
            sessionDoubts
              .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
              .map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border border-gray-200 bg-gray-50/60 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 leading-tight flex-1 min-w-0">
                      {d.title || 'Untitled'}
                    </p>
                    <span className={STATUS_BADGE[d.status] || STATUS_BADGE.pending}>
                      {d.status === 'answered' ? 'Answered' : d.status === 'under_review' ? 'Under review' : 'Pending'}
                    </span>
                  </div>
                  {d.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{d.description}</p>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
