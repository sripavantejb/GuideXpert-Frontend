import { FiCalendar, FiPlus, FiVideo, FiClock, FiUser } from 'react-icons/fi';

const demoSessions = [
  { id: 1, student: 'Aarav Sharma', type: 'Career Guidance', time: '10:00 AM', date: '2026-02-08', platform: 'Google Meet', status: 'upcoming' },
  { id: 2, student: 'Priya Patel', type: 'Admission Review', time: '2:30 PM', date: '2026-02-08', platform: 'Zoom', status: 'upcoming' },
  { id: 3, student: 'Rohan Gupta', type: 'Follow-up', time: '11:00 AM', date: '2026-02-09', platform: 'Google Meet', status: 'upcoming' },
  { id: 4, student: 'Ananya Reddy', type: 'Career Guidance', time: '4:00 PM', date: '2026-02-07', platform: 'Zoom', status: 'completed' },
  { id: 5, student: 'Vikram Singh', type: 'Initial Consultation', time: '9:30 AM', date: '2026-02-07', platform: 'Google Meet', status: 'completed' },
];

function formatSessionDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function Sessions() {
  const upcoming = demoSessions.filter((s) => s.status === 'upcoming');
  const completed = demoSessions.filter((s) => s.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header — Session Scheduler with accent bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="mb-6 sm:mb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 rounded-full bg-primary-navy" />
            <h2 className="text-xl font-bold text-gray-900">Session Scheduler</h2>
          </div>
          <p className="text-sm text-gray-500 ml-4">Manage meetings, availability, and video calls.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90 shrink-0"
        >
          <FiPlus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* Upcoming Sessions */}
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Upcoming Sessions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {upcoming.length === 0 ? (
          <div className="col-span-full portal-card rounded-xl bg-white p-8 text-center">
            <p className="text-gray-500 mb-4">No upcoming sessions.</p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90"
            >
              <FiPlus className="w-4 h-4" /> Schedule a session
            </button>
          </div>
        ) : (
          upcoming.map((s) => (
            <div
              key={s.id}
              className="portal-card portal-card-hover rounded-xl bg-white p-6 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-navy/10 flex items-center justify-center shrink-0">
                    <FiUser className="w-5 h-5 text-primary-navy" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{s.student}</p>
                    <p className="text-xs text-gray-500">{s.type}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-navy/10 text-primary-navy shrink-0">
                  Upcoming
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-gray-400" /> {formatSessionDate(s.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiClock className="w-3.5 h-3.5 text-gray-400" /> {s.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiVideo className="w-3.5 h-3.5 text-gray-400" /> {s.platform}
                </span>
              </div>
              <div className="mt-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-navy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90"
                >
                  <FiVideo className="w-3.5 h-3.5" /> Join meeting
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Sessions */}
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Completed Sessions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {completed.length === 0 ? (
          <div className="col-span-full rounded-xl bg-white border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-500">No completed sessions yet.</p>
          </div>
        ) : (
          completed.map((s) => (
            <div
              key={s.id}
              className="portal-card rounded-xl bg-white p-6 transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <FiUser className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-700 text-sm">{s.student}</p>
                    <p className="text-xs text-gray-500">{s.type}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 shrink-0">
                  Completed
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-gray-400" /> {formatSessionDate(s.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiClock className="w-3.5 h-3.5 text-gray-400" /> {s.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiVideo className="w-3.5 h-3.5 text-gray-400" /> {s.platform}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
