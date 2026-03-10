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
      className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden flex-1 min-w-0 p-5 transition-all duration-200 hover:shadow-md"
    >
      <header className="flex items-center justify-between gap-3 w-full mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest leading-tight">
          Your level
        </h3>
        <span className="text-xl font-bold text-primary-navy tabular-nums whitespace-nowrap">{completedPercent}%</span>
      </header>
      <p className="text-base font-semibold text-gray-900 leading-tight mb-1">{level}</p>
      <p className="text-sm text-gray-600 leading-tight mb-3">
        {completedSessions}/{totalSessions} sessions completed
      </p>
      {streak != null && (
        <p className="text-sm text-gray-600 leading-tight mb-3">Streak: {streak} days</p>
      )}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 leading-tight">
          Team members attending
        </p>
        <div className="flex items-center -space-x-2 min-w-0">
          {mockAvatars.map((src, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 overflow-hidden flex-shrink-0 shadow-sm"
              title={`Member ${i + 1}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <span className="ml-2 text-xs font-medium text-primary-navy bg-primary-blue-100 px-2.5 py-1 rounded-full flex-shrink-0">
            +5
          </span>
        </div>
      </div>
    </div>
  );
}
