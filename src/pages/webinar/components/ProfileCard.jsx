export default function ProfileCard({
  completedPercent,
  totalSessions,
  completedSessions,
  userName = 'Trainee',
  level = 'Beginner',
  streak,
}) {
  const mockAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=A',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=B',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=C',
  ];

  return (
    <div
      className="rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden flex-1 min-w-0 p-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      <header className="flex items-center justify-between gap-3 w-full mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">
          Your level
        </h3>
        <span className="text-xl font-bold text-primary-navy tabular-nums whitespace-nowrap">{completedPercent}%</span>
      </header>
      <p className="text-sm font-semibold text-gray-900 leading-tight mb-1">{level}</p>
      <p className="text-xs text-gray-600 leading-tight mb-2">
        {completedSessions}/{totalSessions} sessions completed
      </p>
      {streak != null && (
        <p className="text-xs text-gray-600 leading-tight mb-2">Streak: {streak} days</p>
      )}
      <div className="pt-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 leading-tight">
          Team members attending
        </p>
        <div className="flex items-center -space-x-2 min-w-0">
          {mockAvatars.map((src, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden flex-shrink-0"
              title={`Member ${i + 1}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <span className="ml-2 text-xs font-medium text-primary-navy bg-primary-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">
            +5
          </span>
        </div>
      </div>
    </div>
  );
}
