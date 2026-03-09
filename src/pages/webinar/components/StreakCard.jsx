const CARD_CLASS = 'rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden p-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5';

export default function StreakCard({ streakDays = 0 }) {
  return (
    <div className={CARD_CLASS}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        Attendance streak
      </h3>
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
        <span className="text-2xl" aria-hidden>🔥</span>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {streakDays} day{streakDays !== 1 ? 's' : ''} in a row
          </p>
          <p className="text-xs text-gray-600">Keep it up to maintain your streak!</p>
        </div>
      </div>
    </div>
  );
}
