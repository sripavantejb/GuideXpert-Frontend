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
      className="rounded-[20px] bg-white border border-gray-200 shadow-card overflow-hidden flex-1 min-w-0 transition-shadow duration-300"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your level</p>
            <p className="text-sm font-semibold text-gray-900">{level}</p>
          </div>
          <span className="text-2xl font-bold text-primary-navy">{completedPercent}%</span>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          {completedSessions}/{totalSessions} sessions completed
        </p>
        {streak != null && (
          <p className="text-xs text-gray-600 mb-3">Streak: {streak} days</p>
        )}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Team members attending
          </p>
          <div className="flex items-center -space-x-2">
            {mockAvatars.map((src, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shrink-0"
                title={`Member ${i + 1}`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <span className="ml-2 text-xs font-medium text-primary-navy bg-primary-blue-100 px-2 py-0.5 rounded-full">
              +5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
