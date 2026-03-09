import { FiBook, FiClock, FiMessageCircle, FiTrendingUp } from 'react-icons/fi';

const CARD_CLASS = 'rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden p-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5';

export default function LearningStatsCard({
  totalSessions = 0,
  completed = 0,
  remaining = 0,
  watchTimeMinutes = 0,
  averageAttendancePercent = 0,
  notesCount = 0,
  questionsAsked = 0,
}) {
  const watchTimeStr = watchTimeMinutes >= 60
    ? `${Math.floor(watchTimeMinutes / 60)}h ${watchTimeMinutes % 60}m`
    : `${watchTimeMinutes}m`;

  const primaryStats = [
    { label: 'Completed', value: completed, icon: FiTrendingUp },
    { label: 'Watch time', value: watchTimeStr, icon: FiClock },
    { label: 'Avg. attendance', value: `${averageAttendancePercent}%`, icon: FiTrendingUp },
  ];

  const secondaryStats = [
    { label: 'Total sessions', value: totalSessions, icon: FiBook },
    { label: 'Remaining', value: remaining, icon: FiBook },
    { label: 'Notes taken', value: notesCount, icon: FiBook },
    { label: 'Questions asked', value: questionsAsked, icon: FiMessageCircle },
  ];

  return (
    <div className={CARD_CLASS}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        Learning statistics
      </h3>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 rounded-lg bg-primary-navy/5 border border-primary-navy/10 mb-2">
        {primaryStats.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center text-center min-h-[52px] min-w-0"
          >
            <span className="text-lg font-bold text-primary-navy tabular-nums leading-none">{value}</span>
            <span className="text-[10px] text-gray-600 uppercase tracking-wide mt-1 leading-none">{label}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-2">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
          {secondaryStats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 min-w-0 p-2 rounded-lg border border-gray-100 bg-gray-50/50 min-h-[48px]"
            >
              <span className="w-7 h-7 rounded-full bg-primary-navy/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary-navy" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide truncate leading-tight">{label}</p>
                <p className="text-sm font-semibold text-gray-900 tabular-nums truncate leading-tight mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
