export default function ProgressIndicator({
  completedPercent,
  days,
  completedCountForDay,
  totalSessionsForDay,
  totalCompleted = 0,
  totalSessions = 0,
}) {
  const segmentLength = 100 / 3; // one third of circle

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

  const segmentStroke = (status) => {
    if (status === 'completed') return 'text-primary-navy';
    if (status === 'pending') return 'text-amber-500';
    return 'text-gray-200';
  };

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden p-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
      <header className="flex items-center justify-between gap-3 w-full mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Course progress overview
        </h3>
        {totalSessions > 0 && (
          <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">
            {totalCompleted}/{totalSessions} sessions
          </span>
        )}
      </header>

      <div className="flex flex-col items-center w-full">
        <div className="relative w-[100px] h-[100px] shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-gray-200"
            />
            {segments.map((seg, i) => (
              <path
                key={days[i].id}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${seg.filled} 100`}
                strokeDashoffset={-(i * segmentLength)}
                className={segmentStroke(seg.status)}
                style={{ transition: 'stroke-dasharray 0.5s' }}
              />
            ))}
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-primary-navy leading-none">{completedPercent}%</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Completed</span>
            {totalSessions > 0 && (
              <span className="text-[9px] text-gray-400 mt-0.5 tabular-nums">{totalCompleted}/{totalSessions}</span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-center gap-x-2 gap-y-1 mt-2 pt-2 border-t border-gray-100 w-full flex-wrap">
          {days.map((day, i) => {
            const seg = segments[i];
            const dotClass =
              seg.status === 'completed'
                ? 'bg-primary-navy'
                : seg.status === 'pending'
                  ? 'bg-amber-500'
                  : 'bg-gray-200';
            return (
              <span key={day.id} className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} aria-hidden />
                <span className="text-[10px] text-gray-600 tabular-nums">
                  {day.label} {seg.completed}/{seg.total}
                </span>
                {i < days.length - 1 && <span className="text-gray-300 text-[8px] px-0.5" aria-hidden>·</span>}
              </span>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2 justify-center items-center">
          {completedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-medium">
              <span aria-hidden>✔</span> Done
            </span>
          )}
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">
              <span aria-hidden>⏳</span> In progress
            </span>
          )}
          {upcomingCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium">
              <span aria-hidden>🔒</span> Upcoming
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
