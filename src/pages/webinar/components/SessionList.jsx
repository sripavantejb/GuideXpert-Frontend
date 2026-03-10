import { FiCheckCircle, FiClock, FiLock, FiPlay } from 'react-icons/fi';

export function SessionCard({
  session,
  isActive,
  isCompleted,
  progress,
  isLocked,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={() => !isLocked && onClick(session.id)}
      disabled={isLocked}
      className={`
        w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2
        ${isActive
          ? 'bg-primary-navy text-white border-primary-navy shadow-sm'
          : isLocked
            ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50/60'
        }
      `}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0 relative">
        {session.thumbnail ? (
          <img src={session.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-gray-100'}`}>
            <FiPlay className={`w-4 h-4 ${isActive ? 'text-white/60' : 'text-gray-400'}`} aria-hidden />
          </div>
        )}
        {/* Progress bar overlay */}
        {!isLocked && !isCompleted && progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div className="h-full bg-amber-400" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-tight truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
          {session.title}
        </p>
        <p className={`text-xs mt-0.5 ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
          {session.duration}
        </p>
      </div>

      {/* Status icon */}
      <div className="shrink-0">
        {isLocked ? (
          <FiLock className="w-4 h-4 text-gray-400" aria-label="Locked" />
        ) : isCompleted ? (
          <FiCheckCircle className={`w-5 h-5 ${isActive ? 'text-white/80' : 'text-green-600'}`} aria-label="Completed" />
        ) : progress > 0 ? (
          <span className={`w-5 h-5 rounded-full border-2 ${isActive ? 'border-white/60 border-t-transparent' : 'border-amber-500 border-t-transparent'} animate-spin inline-block`} aria-label="In progress" />
        ) : (
          <span className={`w-4 h-4 rounded-full border-2 inline-block ${isActive ? 'border-white/40' : 'border-gray-300'}`} aria-label="Not started" />
        )}
      </div>
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
  const completedCount = sessions.filter((s) => completedSessions.includes(s.id)).length;

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Sessions</h2>
          <span className="text-xs text-gray-400 font-medium">Day {activeDay ?? 1}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-navy/8 text-primary-navy text-xs font-semibold">
          {completedCount}/{sessions.length} done
        </span>
      </div>

      {/* Progress bar */}
      {sessions.length > 0 && (
        <div className="h-0.5 bg-gray-100 w-full">
          <div
            className="h-full bg-primary-navy transition-all duration-500"
            style={{ width: `${sessions.length ? (completedCount / sessions.length) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* List */}
      <div className="overflow-y-auto max-h-[40vh] sm:max-h-[320px] p-3 space-y-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FiClock className="w-9 h-9 text-gray-200 mb-2" aria-hidden />
            <p className="text-sm text-gray-400">No sessions for this day.</p>
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
