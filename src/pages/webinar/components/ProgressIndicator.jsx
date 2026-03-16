import { FiCheck, FiCalendar } from 'react-icons/fi';

export default function ProgressIndicator({
  completedPercent,
  days,
  completedCountForDay,
  totalSessionsForDay,
  totalCompleted = 0,
  totalSessions = 0,
  embedded = false,
}) {
  const segmentLength = 100 / 3;
  const wrapperClass = embedded ? '' : 'rounded-2xl overflow-hidden border border-gray-200 shadow-card bg-white transition-all duration-200 hover:shadow-card-hover';

  const segments = days.map((day) => {
    const completed = completedCountForDay(day.id) ?? 0;
    const total = totalSessionsForDay(day.id) ?? 0;
    const pct = total > 0 ? (completed / total) * 100 : 0;
    const filled = (pct / 100) * segmentLength;
    const status = total === 0 ? 'upcoming' : completed === total ? 'completed' : 'pending';
    return { filled, completed, total, status };
  });

  const completedCount = segments.filter((s) => s.status === 'completed').length;
  const pendingCount = segments.filter((s) => s.status === 'pending').length;
  const upcomingCount = segments.filter((s) => s.status === 'upcoming').length;
  const isFullComplete = completedPercent >= 100;

  return (
    <div className={wrapperClass}>
      {/* Header with subtle gradient accent */}
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
        {/* Progress ring with gradient when 100% */}
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
              {segments.map((seg, i) => (
                <path
                  key={days[i].id}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={
                    seg.status === 'completed'
                      ? isFullComplete
                        ? 'url(#progressGradient)'
                        : '#003366'
                      : seg.status === 'pending'
                        ? '#d97706'
                        : '#e5e7eb'
                  }
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${seg.filled} 100`}
                  strokeDashoffset={-(i * segmentLength)}
                  style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
                />
              ))}
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

          {/* Day milestones - pill style */}
          <div className="mt-5 w-full space-y-2">
            {days.map((day, i) => {
              const seg = segments[i];
              const isDone = seg.status === 'completed';
              const isPending = seg.status === 'pending';
              return (
                <div
                  key={day.id}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-colors ${
                    isDone
                      ? 'bg-accent-green/10 border-accent-green/20'
                      : isPending
                        ? 'bg-accent-gold/10 border-accent-gold/20'
                        : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                        isDone ? 'bg-accent-green/20 text-accent-green' : isPending ? 'bg-accent-gold/20 text-accent-gold' : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isDone ? (
                        <FiCheck className="w-4 h-4" aria-hidden />
                      ) : (
                        <FiCalendar className="w-3.5 h-3.5" aria-hidden />
                      )}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">{day.label}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-gray-700 shrink-0">
                    {seg.completed}/{seg.total}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center items-center">
            {completedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-green/10 text-accent-green text-xs font-semibold border border-accent-green/20">
                <FiCheck className="w-3.5 h-3.5" aria-hidden /> Done
              </span>
            )}
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-gold/10 text-accent-gold text-xs font-semibold border border-accent-gold/20">
                In progress
              </span>
            )}
            {upcomingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200">
                Upcoming
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
