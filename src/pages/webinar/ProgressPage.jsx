 import { useMemo } from 'react';
import { FiCheck, FiLock, FiAward } from 'react-icons/fi';
import { useWebinar } from './context/WebinarContext';
import { DAYS, SESSIONS, getSessionsByDay } from './data/mockWebinarData';

function formatWatchTime(seconds) {
  if (!seconds || seconds < 0) return '0m';
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

export default function ProgressPage() {
  const { completedSessions, playbackPosition } = useWebinar();

  const totalSessions = SESSIONS.length;
  const completedCount = completedSessions.length;
  const completionPercent = totalSessions ? Math.round((completedCount / totalSessions) * 100) : 0;

  const completedCountForDay = (dayId) => {
    const ids = getSessionsByDay(dayId).map((s) => s.id);
    return ids.filter((id) => completedSessions.includes(id)).length;
  };
  const totalSessionsForDay = (dayId) => getSessionsByDay(dayId).length;

  const isDayUnlocked = (dayId) => {
    if (dayId === 1) return true;
    const prevIds = getSessionsByDay(dayId - 1).map((s) => s.id);
    return prevIds.every((id) => completedSessions.includes(id));
  };

  const totalWatchSeconds = useMemo(() => {
    return Object.values(playbackPosition || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  }, [playbackPosition]);

  const day3Complete = useMemo(() => {
    const day3Ids = getSessionsByDay(3).map((s) => s.id);
    return day3Ids.every((id) => completedSessions.includes(id));
  }, [completedSessions]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <div className="px-4 py-4 sm:p-6 max-w-4xl mx-auto min-w-0 overflow-x-hidden space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Progress</h1>

      {/* Overall completion donut */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-6 min-w-0">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
          Overall completion
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-6 min-w-0">
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-primary-navy transition-all duration-500"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
              {completionPercent}%
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-800">{completedCount}</span> of {totalSessions} sessions completed
            </p>
            <p className="mt-2">
              Total time spent: <span className="font-medium text-gray-800">{formatWatchTime(totalWatchSeconds)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Day summary: 3-column grid, no overflow */}
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
          By day
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-6 border-b border-gray-200 pb-3">
          {DAYS.map((day) => {
            const completed = completedCountForDay(day.id);
            const total = totalSessionsForDay(day.id);
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const unlocked = isDayUnlocked(day.id);
            return (
              <div key={day.id} className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-semibold text-sm text-gray-800 truncate">{day.label}</span>
                  {!unlocked && <FiLock className="w-3 h-3 text-gray-400 shrink-0" aria-hidden />}
                </div>
                <p className="text-xs text-gray-500 mb-1.5 truncate">
                  {completed}/{total} · {pct}%
                </p>
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

      {/* Session timeline */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-6 min-w-0">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
          Session timeline
        </h2>
        <ul className="space-y-2">
          {SESSIONS.map((session) => {
            const done = completedSessions.includes(session.id);
            const dayLabel = DAYS.find((d) => d.id === session.dayId)?.label ?? '';
            return (
              <li
                key={session.id}
                className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 min-w-0"
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {done ? <FiCheck className="w-3.5 h-3.5" /> : <span className="text-xs">–</span>}
                </span>
                <span className="text-xs text-gray-500 w-12 shrink-0">{dayLabel}</span>
                <span className="text-sm text-gray-800 truncate">{session.title}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Certificates */}
      <div
        className={`rounded-2xl border p-6 min-w-0 ${
          day3Complete
            ? 'bg-green-50/80 border-green-200'
            : 'bg-primary-blue-50/80 border-primary-blue-200/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <FiAward className={`w-8 h-8 shrink-0 ${day3Complete ? 'text-green-600' : 'text-primary-navy'}`} />
          <div>
            <h2 className="font-semibold text-gray-800">
              {day3Complete ? 'Certificate available' : 'Certificate unlocked after completing the intro video'}
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {day3Complete
                ? 'You have completed all days. Your certificate is available.'
                : 'Complete the intro video to unlock your certificate.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
