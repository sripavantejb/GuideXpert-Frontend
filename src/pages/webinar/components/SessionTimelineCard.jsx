import { FiCheck, FiClock, FiLock, FiPlay, FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { isModuleUnlocked } from '../utils/unlockLogic';

const CARD_CLASS = 'rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden p-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5';

export default function SessionTimelineCard({
  sessions = [],
  completedSessionIds = [],
  activeSessionId,
  onSelectSession,
}) {
  const getStatus = (session) => {
    if (completedSessionIds.includes(session.id)) return 'completed';
    if (!isModuleUnlocked(session.id, completedSessionIds)) return 'locked';
    if (activeSessionId === session.id) return 'current';
    return 'upcoming';
  };

  return (
    <div className={CARD_CLASS}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        Session timeline
      </h3>
      <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
        {sessions.map((session) => {
          const status = getStatus(session);
          const isLocked = status === 'locked';
          return (
            <div
              key={session.id}
              className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors min-w-0 ${
                status === 'current'
                  ? 'border-primary-navy bg-primary-blue-50/50'
                  : isLocked
                    ? 'border-gray-100 bg-gray-50 opacity-75'
                    : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full">
                {status === 'completed' && <FiCheck className="w-3.5 h-3.5 text-green-600" aria-label="Completed" />}
                {status === 'locked' && <FiLock className="w-3.5 h-3.5 text-gray-400" aria-label="Locked" />}
                {(status === 'upcoming' || status === 'current') && (
                  <FiClock className="w-3.5 h-3.5 text-primary-navy" aria-label="Upcoming" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 truncate">
                  Day {session.dayId} · {session.title}
                </p>
                <p className="text-[10px] text-gray-500">{session.duration}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className="p-1 rounded-md text-primary-navy hover:bg-primary-navy/10 transition-colors"
                    title="Watch replay"
                    aria-label={`Play ${session.title}`}
                  >
                    <FiPlay className="w-3.5 h-3.5" />
                  </button>
                )}
                <Link
                  to="/webinar/doubts"
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                  title="Ask question"
                  aria-label="Ask question"
                >
                  <FiMessageCircle className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
