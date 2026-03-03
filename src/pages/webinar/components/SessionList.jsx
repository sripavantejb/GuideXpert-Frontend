import { FiCheckCircle, FiClock, FiLock, FiPlay } from 'react-icons/fi';

function SessionCard({
  session,
  isActive,
  isCompleted,
  progress,
  isLocked,
  onClick,
}) {
  const statusIcon = isLocked ? (
    <FiLock className="w-4 h-4 text-gray-400 shrink-0" aria-label="Locked" />
  ) : isCompleted ? (
    <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-label="Completed" />
  ) : progress > 0 ? (
    <span className="w-4 h-4 rounded-full border-2 border-primary-navy border-t-transparent animate-spin shrink-0" aria-label="In progress" />
  ) : (
    <FiPlay className="w-4 h-4 text-gray-400 shrink-0" aria-label="Not started" />
  );

  return (
    <button
      type="button"
      onClick={() => !isLocked && onClick(session.id)}
      disabled={isLocked}
      className={`
        w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all duration-200 min-h-[52px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 focus-visible:ring-inset
        ${isActive
          ? 'bg-primary-navy/8 text-primary-navy border border-primary-navy/20'
          : isLocked
            ? 'bg-gray-50/80 text-gray-400 cursor-not-allowed border border-transparent'
            : 'bg-white border border-gray-200/80 text-gray-800 hover:border-gray-300 hover:bg-gray-50/50'
        }
      `}
    >
      <div className="w-20 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
        {session.thumbnail ? (
          <img
            src={session.thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <FiPlay className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary-navy' : 'text-gray-900'}`}>{session.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{session.duration}</p>
      </div>
      {statusIcon}
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
    <div className="flex flex-col rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-sm">
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Sessions
        </h2>
        <span className="text-xs text-gray-400 tabular-nums">
          Day {activeDay ?? 1} · {sessions.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 max-h-[40vh] sm:max-h-[340px] p-3 space-y-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FiClock className="w-9 h-9 text-gray-300 mb-2" aria-hidden />
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
