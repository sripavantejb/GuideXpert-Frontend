import { FiCheckCircle, FiClock, FiLock } from 'react-icons/fi';

export function SessionCard({
  session,
  isActive,
  isCompleted,
  progress,
  isLocked,
  onClick,
}) {
  const statusIcon = isLocked ? (
    <FiLock className="w-5 h-5 text-gray-400" aria-label="Locked" />
  ) : isCompleted ? (
    <FiCheckCircle className="w-5 h-5 text-green-600" aria-label="Completed" />
  ) : progress > 0 ? (
    <span className="w-5 h-5 rounded-full border-2 border-primary-navy border-t-transparent animate-spin" aria-label="In progress" />
  ) : (
    <span className="w-5 h-5 rounded-full border-2 border-gray-300" aria-label="Not started" />
  );

  return (
    <button
      type="button"
      onClick={() => !isLocked && onClick(session.id)}
      disabled={isLocked}
      className={`
        w-full text-left flex items-center gap-2 sm:gap-3 p-3 rounded-xl border transition-all duration-200 min-h-[44px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2
        ${isActive
          ? 'bg-primary-blue-50 border-gray-200 border-l-4 border-l-primary-navy shadow-card'
          : isLocked
            ? 'bg-gray-50 border-gray-200 opacity-75 cursor-not-allowed'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-card-hover hover:-translate-y-0.5'
        }
      `}
      style={{ borderRadius: '14px' }}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
        {session.thumbnail ? (
          <img
            src={session.thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No thumb
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 text-sm truncate">{session.title}</p>
        <p className="text-xs text-gray-500">• {session.duration}</p>
      </div>
      <div className="shrink-0">{statusIcon}</div>
    </button>
  );
}

export default function SessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  completedSessions,
  sessionProgress,
  isDayUnlocked,
  activeDay,
}) {
  return (
    <div
      className="rounded-[20px] bg-white border border-gray-200 overflow-hidden shadow-card flex flex-col transition-shadow duration-300"
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Sessions
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          Day {activeDay ?? 1} · {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 max-h-[40vh] sm:max-h-[320px] p-3 space-y-3">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FiClock className="w-10 h-10 text-gray-300 mb-2" aria-hidden />
            <p className="text-sm text-gray-500">No sessions for this day.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isActive={activeSessionId === session.id}
              isCompleted={completedSessions.includes(session.id)}
              progress={sessionProgress[session.id] ?? 0}
              isLocked={!isDayUnlocked(session.dayId)}
              onClick={onSelectSession}
            />
          ))
        )}
      </div>
    </div>
  );
}
