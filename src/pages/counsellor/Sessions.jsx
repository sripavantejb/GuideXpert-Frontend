import { FiCalendar, FiPlus, FiVideo, FiClock, FiUser } from 'react-icons/fi';

const demoSessions = [
  { id: 1, student: 'Aarav Sharma', type: 'Career Guidance', time: '10:00 AM', date: '2026-02-08', platform: 'Google Meet', status: 'upcoming' },
  { id: 2, student: 'Priya Patel', type: 'Admission Review', time: '2:30 PM', date: '2026-02-08', platform: 'Zoom', status: 'upcoming' },
  { id: 3, student: 'Rohan Gupta', type: 'Follow-up', time: '11:00 AM', date: '2026-02-09', platform: 'Google Meet', status: 'upcoming' },
  { id: 4, student: 'Ananya Reddy', type: 'Career Guidance', time: '4:00 PM', date: '2026-02-07', platform: 'Zoom', status: 'completed' },
  { id: 5, student: 'Vikram Singh', type: 'Initial Consultation', time: '9:30 AM', date: '2026-02-07', platform: 'Google Meet', status: 'completed' },
];

export default function Sessions() {
  const upcoming = demoSessions.filter((s) => s.status === 'upcoming');
  const completed = demoSessions.filter((s) => s.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
            Session Scheduler
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage meetings, availability, and video calls</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors">
          <FiPlus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* Upcoming */}
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Upcoming Sessions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {upcoming.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.student}</p>
                  <p className="text-xs text-gray-500">{s.type}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                Upcoming
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5" /> {s.date}</span>
              <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {s.time}</span>
              <span className="flex items-center gap-1"><FiVideo className="w-3.5 h-3.5" /> {s.platform}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Completed */}
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Completed Sessions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {completed.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 opacity-75">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700 text-sm">{s.student}</p>
                  <p className="text-xs text-gray-500">{s.type}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                Completed
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5" /> {s.date}</span>
              <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {s.time}</span>
              <span className="flex items-center gap-1"><FiVideo className="w-3.5 h-3.5" /> {s.platform}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
