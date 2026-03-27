import { FiCheck, FiClipboard, FiClock, FiPlayCircle, FiUnlock } from 'react-icons/fi';
import {
  formatRelativeActivityTime,
  getActivityTypeLabel,
  getNextActionHint,
} from '../utils/lastActivityHelpers';

function ActivityIcon({ type }) {
  const cls = 'w-4 h-4 shrink-0 text-primary-navy';
  switch (type) {
    case 'video_completed':
      return <FiCheck className={cls} aria-hidden />;
    case 'assessment_completed':
      return <FiClipboard className={cls} aria-hidden />;
    case 'video_progress':
      return <FiPlayCircle className={cls} aria-hidden />;
    case 'module_unlocked':
      return <FiUnlock className={cls} aria-hidden />;
    default:
      return <FiClock className={cls} aria-hidden />;
  }
}

export default function ProgressIndicator({
  completedPercent,
  totalCompleted = 0,
  totalSessions = 0,
  completedSessionCount = 0,
  totalSessionCount = 0,
  completedAssessmentCount = 0,
  totalAssessmentCount = 0,
  lastActivityAt = null,
  lastActivityEvent = null,
  activeSessionId = null,
  activeModuleTitle = '',
  nextModuleTitle = '',
  nextModuleIsAssessment = false,
  resumeSeconds = 0,
  courseComplete = false,
  embedded = false,
}) {
  const wrapperClass = embedded ? '' : 'rounded-2xl overflow-hidden border border-gray-200 shadow-card bg-white transition-all duration-200 hover:shadow-card-hover';
  const ringPercent = Math.max(0, Math.min(100, completedPercent || 0));
  const ringLength = 100;
  const ringFilled = (ringPercent / 100) * ringLength;
  const isFullComplete = completedPercent >= 100;
  const sessionStatus = totalSessionCount > 0 && completedSessionCount >= totalSessionCount ? 'completed' : 'pending';
  const assessmentStatus = totalAssessmentCount > 0 && completedAssessmentCount >= totalAssessmentCount ? 'completed' : 'pending';

  const activityAt = lastActivityEvent?.at || lastActivityAt;
  const { label: relativeLabel } = formatRelativeActivityTime(activityAt);
  const activityType = lastActivityEvent?.type || 'resume_seek';
  const activityHeadline = getActivityTypeLabel(activityType);
  const contextTitle =
    (lastActivityEvent?.moduleTitle && String(lastActivityEvent.moduleTitle).trim()) ||
    (activityAt ? 'Recent activity' : '');

  const nextHint = getNextActionHint({
    lastActivityEvent,
    activeSessionId,
    activeModuleTitle,
    nextModuleTitle,
    nextModuleIsAssessment,
    resumeSeconds,
    courseComplete,
  });

  const hasActivity = Boolean(activityAt);

  return (
    <div className={wrapperClass}>
      <div className={`px-5 pb-1 ${embedded ? 'pt-4' : 'pt-5'}`}>
        <div className="flex items-center justify-between gap-3 w-full">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Course progress overview
          </h3>
          {totalSessions > 0 && (
            <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap font-medium">
              {totalCompleted}/{totalSessions} sessions
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-2">
        <div className="flex flex-col items-center w-full">
          <div className="relative w-[128px] h-[128px] shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#003366" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
              </defs>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isFullComplete ? 'url(#progressGradient)' : '#003366'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${ringFilled} 100`}
                style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
              />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-2xl font-bold tabular-nums leading-none ${
                  isFullComplete ? 'text-transparent bg-clip-text bg-gradient-to-br from-[#003366] to-[#15803d]' : 'text-primary-navy'
                }`}
              >
                {completedPercent}%
              </span>
              <span className="text-xs text-gray-500 mt-1.5 font-medium">Completed</span>
              {totalSessions > 0 && (
                <span className="text-[10px] text-gray-400 mt-0.5 tabular-nums">{totalCompleted}/{totalSessions}</span>
              )}
            </span>
          </div>

          <div className="mt-5 w-full space-y-2">
            <div
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-colors ${
                sessionStatus === 'completed' ? 'bg-accent-green/10 border-accent-green/20' : 'bg-accent-gold/10 border-accent-gold/20'
              }`}
            >
              <span className="text-sm font-medium text-gray-800 truncate">Sessions Completed</span>
              <span className="text-sm font-semibold tabular-nums text-gray-700 shrink-0">
                {completedSessionCount}/{totalSessionCount}
              </span>
            </div>
            <div
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-colors ${
                assessmentStatus === 'completed' ? 'bg-accent-green/10 border-accent-green/20' : 'bg-accent-gold/10 border-accent-gold/20'
              }`}
            >
              <span className="text-sm font-medium text-gray-800 truncate">Assessments Completed</span>
              <span className="text-sm font-semibold tabular-nums text-gray-700 shrink-0">
                {completedAssessmentCount}/{totalAssessmentCount}
              </span>
            </div>

            {/* Smart Last Activity card — fixed min height to limit layout shift */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/90 px-3 py-3 min-h-[7.5rem] flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="mt-0.5 rounded-lg bg-white border border-gray-100 p-1.5 shadow-sm">
                    <ActivityIcon type={activityType} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 leading-snug">{activityHeadline}</p>
                    {hasActivity && contextTitle && (
                      <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2 leading-snug">{contextTitle}</p>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-white/80 border border-gray-100 rounded-full px-2 py-0.5 shrink-0 tabular-nums">
                  {relativeLabel}
                </span>
              </div>
              <div className="pt-1 border-t border-gray-100/80 mt-auto">
                <p className="text-[11px] font-medium text-primary-navy/90 leading-snug line-clamp-2">{nextHint}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 justify-center items-center">
            {sessionStatus === 'completed' && assessmentStatus === 'completed' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-green/10 text-accent-green text-xs font-semibold border border-accent-green/20">
                <FiCheck className="w-3.5 h-3.5" aria-hidden /> Fully completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-gold/10 text-accent-gold text-xs font-semibold border border-accent-gold/20">
                In progress
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
