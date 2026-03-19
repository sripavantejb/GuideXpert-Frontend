import { FiCheckCircle, FiClock, FiClipboard, FiLock, FiPlay } from 'react-icons/fi';
import { isModuleUnlocked } from '../utils/unlockLogic';

export function SessionCard({
  session,
  isActive,
  isCompleted,
  progress,
  isLocked,
  onClick,
  darkVariant = false,
}) {
  const activeClass = darkVariant
    ? 'bg-white/[0.14] border-white/[0.10] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(2,6,23,0.35)]'
    : 'bg-primary-navy text-white border-primary-navy shadow-sm';
  const lockedClass = darkVariant
    ? 'bg-white/[0.03] border-white/[0.06] text-slate-500 opacity-55 cursor-not-allowed grayscale-[0.4]'
    : 'bg-gray-50/60 border-gray-200 opacity-50 cursor-not-allowed grayscale-[0.4]';
  const inactiveClass = darkVariant
    ? 'bg-white/[0.06] border-white/[0.08] text-white hover:bg-white/[0.10] hover:border-white/[0.14]'
    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50/60';

  return (
    <button
      type="button"
      onClick={() => !isLocked && onClick(session.id)}
      disabled={isLocked}
      className={`
        relative overflow-hidden w-full text-left flex items-center gap-3 rounded-lg border
        transition-all duration-500 ease-out
        focus:outline-none
        ${darkVariant ? 'p-3.5' : 'p-3'}
        ${isLocked ? lockedClass : isActive ? activeClass : inactiveClass}
      `}
    >
      {/* Thumbnail */}
      <div
        className={`
          w-11 h-11 rounded-md overflow-hidden shrink-0 relative
          transition-all duration-500
          ${
            darkVariant
              ? isActive
                ? 'bg-white/15 ring-1 ring-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                : 'bg-white/8 ring-1 ring-white/8'
              : 'bg-gray-200'
          }
        `}
      >
        {session.thumbnail ? (
          <img src={session.thumbnail} alt="" className={`w-full h-full object-cover transition-all duration-500 ${isLocked ? 'grayscale brightness-75' : ''}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-transparent">
            {isLocked ? (
              <FiLock className={`w-4 h-4 ${darkVariant ? 'text-slate-600' : 'text-gray-400'}`} aria-hidden />
            ) : session.type === 'Assessment' ? (
              <FiClipboard
                className={`w-4 h-4 ${
                  darkVariant ? 'text-primary-blue-300' : isActive ? 'text-white' : 'text-gray-500'
                }`}
                aria-hidden
              />
            ) : (
              <FiPlay className={`w-4 h-4 ${!darkVariant && isActive ? 'text-white/60' : darkVariant ? 'text-white/60' : 'text-gray-400'}`} aria-hidden />
            )}
          </div>
        )}
        {!isLocked && !isCompleted && progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/30 rounded-b-lg overflow-hidden">
            <div className="h-full bg-accent-gold transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`
              text-sm font-medium leading-snug truncate
              ${darkVariant ? (isActive ? 'text-white font-semibold' : isLocked ? 'text-slate-500' : 'text-white') : isActive ? 'text-white' : isLocked ? 'text-gray-400' : 'text-gray-900'}
            `}
          >
            {session.title}
          </p>
          {darkVariant && isActive && !isLocked && (
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-white/12 text-white/90 text-[10px] font-semibold tracking-wide uppercase">
              Current
            </span>
          )}
        </div>
        <p
          className={`
            text-xs mt-0.5 font-medium tabular-nums
            ${darkVariant ? (isActive ? 'text-white/80' : 'text-slate-400') : isActive ? 'text-white/60' : 'text-gray-500'}
          `}
        >
          {session.duration}
        </p>
      </div>

      {/* Status icon */}
      <div className="shrink-0 flex items-center justify-center w-6 h-6">
        {isLocked ? (
          <FiLock className={`w-4 h-4 ${darkVariant ? 'text-slate-600' : 'text-gray-400'}`} aria-label="Locked" />
        ) : isCompleted ? (
          <FiCheckCircle className={`w-5 h-5 ${darkVariant ? 'text-accent-green' : isActive ? 'text-white/90' : 'text-accent-green'}`} aria-label="Completed" />
        ) : progress > 0 ? (
          <span className="relative w-5 h-5 flex items-center justify-center">
            <span className={`absolute inset-0 w-5 h-5 rounded-full border-2 border-t-transparent animate-spin ${darkVariant ? (isActive ? 'border-white/80' : 'border-accent-gold') : isActive ? 'border-white/70' : 'border-accent-gold'}`} />
            <span className={`w-1.5 h-1.5 rounded-full ${darkVariant ? 'bg-accent-gold' : 'bg-accent-gold'}`} />
          </span>
        ) : (
          <span
            className={`w-4 h-4 rounded-full border-2 inline-block ${darkVariant ? (isActive ? 'border-white/75' : 'border-slate-500') : isActive ? 'border-white/50' : 'border-gray-300'}`}
            aria-label="Not started"
          />
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
  completedSessionsForUnlock,
  activeDay,
  embedded = false,
}) {
  const completedCount = sessions.filter((s) => completedSessions.includes(s.id)).length;
  const wrapperClass = embedded ? '' : 'rounded-2xl bg-white border border-gray-200 shadow-card overflow-hidden transition-shadow duration-200 hover:shadow-card-hover';
  const unlockList = completedSessionsForUnlock ?? completedSessions;

  return (
    <div className={wrapperClass}>
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
              isLocked={!isModuleUnlocked(session.id, unlockList)}
              onClick={onSelectSession}
            />
          ))
        )}
      </div>
    </div>
  );
}
