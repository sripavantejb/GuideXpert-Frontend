export default function ProgressIndicator({
  completedPercent,
  days,
  completedCountForDay,
  totalSessionsForDay,
}) {
  return (
    <div
      className="rounded-[20px] bg-white border border-gray-200 shadow-card overflow-hidden flex-1 min-w-0 transition-shadow duration-300"
    >
      <div className="p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Course progress
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${completedPercent} 100`}
                className="text-primary-navy transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
              {completedPercent}%
            </span>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            {days.map((day) => {
              const completed = completedCountForDay(day.id) ?? 0;
              const total = totalSessionsForDay(day.id) ?? 0;
              const pct = total > 0 ? (completed / total) * 100 : 0;
              return (
                <div key={day.id}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-medium text-gray-700">{day.label}</span>
                    <span className="text-gray-500">{completed}/{total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-navy transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
