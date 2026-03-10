import { FiBook, FiClock, FiMessageCircle, FiCheckCircle, FiTrendingUp, FiFileText } from 'react-icons/fi';

const CARD_CLASS =
  'rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white transition-all duration-200 hover:shadow-md';

export default function LearningStatsCard({
  totalSessions = 0,
  completed = 0,
  remaining = 0,
  watchTimeMinutes = 0,
  averageAttendancePercent = 0,
  notesCount = 0,
  questionsAsked = 0,
}) {
  const watchTimeStr =
    watchTimeMinutes >= 60
      ? `${Math.floor(watchTimeMinutes / 60)}h ${watchTimeMinutes % 60}m`
      : `${watchTimeMinutes}m`;

  const primaryStats = [
    {
      label: 'Completed',
      value: completed,
      icon: FiCheckCircle,
      accent: 'bg-primary-navy/10 text-primary-navy border-primary-navy/20',
      valueClass: 'text-primary-navy',
    },
    {
      label: 'Watch time',
      value: watchTimeStr,
      icon: FiClock,
      accent: 'bg-slate-100 text-slate-700 border-slate-200/60',
      valueClass: 'text-slate-800',
    },
    {
      label: 'Avg. attendance',
      value: `${averageAttendancePercent}%`,
      icon: FiTrendingUp,
      accent: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      valueClass: 'text-emerald-800',
    },
  ];

  const secondaryStats = [
    { label: 'Total sessions', value: totalSessions, icon: FiBook, tile: 'navy' },
    { label: 'Remaining', value: remaining, icon: FiBook, tile: 'slate' },
    { label: 'Notes taken', value: notesCount, icon: FiFileText, tile: 'amber' },
    { label: 'Questions asked', value: questionsAsked, icon: FiMessageCircle, tile: 'violet' },
  ];

  const tileStyles = {
    navy: 'bg-primary-navy/5 border-primary-navy/10 [&_.stat-icon]:bg-primary-navy/10 [&_.stat-icon]:text-primary-navy',
    slate: 'bg-slate-50 border-slate-100 [&_.stat-icon]:bg-slate-200/60 [&_.stat-icon]:text-slate-700',
    amber: 'bg-amber-50/80 border-amber-100 [&_.stat-icon]:bg-amber-200/60 [&_.stat-icon]:text-amber-800',
    violet: 'bg-violet-50/80 border-violet-100 [&_.stat-icon]:bg-violet-200/60 [&_.stat-icon]:text-violet-700',
  };

  return (
    <div className={CARD_CLASS}>
      <div className="px-5 pt-5 pb-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Learning statistics
        </h3>
      </div>

      <div className="px-5 pb-5 pt-4">
        {/* Primary metrics — no truncation; centered content */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
          {primaryStats.map(({ label, value, icon: Icon, accent, valueClass }) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center text-center min-h-[80px] px-2 py-3 rounded-xl border ${accent}`}
            >
              <span className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 shrink-0 bg-white/80 shadow-sm">
                <Icon className="w-4 h-4" aria-hidden />
              </span>
              <span className={`text-lg font-bold tabular-nums leading-tight ${valueClass}`}>{value}</span>
              <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mt-1 leading-tight break-words">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Secondary stats — 2x2 grid so labels have room; no truncate, wrap allowed */}
        <div className="grid grid-cols-2 gap-3">
          {secondaryStats.map(({ label, value, icon: Icon, tile }) => (
            <div
              key={label}
              className={`flex items-center gap-3 p-3 rounded-xl border min-h-[64px] ${tileStyles[tile]}`}
            >
              <span className="stat-icon w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" aria-hidden />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-600 uppercase tracking-wide leading-snug font-semibold break-words">
                  {label}
                </p>
                <p className="text-base font-bold text-gray-900 tabular-nums leading-tight mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
