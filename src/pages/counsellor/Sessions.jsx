import { useState, useMemo } from 'react';
import { FiCalendar, FiPlus, FiVideo, FiClock, FiUser, FiSearch, FiX } from 'react-icons/fi';

const SESSION_TYPES = ['Career Guidance', 'Admission Review', 'Follow-up', 'Initial Consultation', 'Other'];
const PLATFORMS = ['Google Meet', 'Zoom', 'Other'];

function formatSessionDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [modalOpen, setModalOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    student: '',
    type: SESSION_TYPES[0],
    date: '',
    time: '10:00',
    platform: PLATFORMS[0],
    meetingUrl: '',
  });

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!newSession.student.trim() || !newSession.date) return;
    const [hours, minutes] = (newSession.time || '10:00').split(':').map(Number);
    const dateTime = new Date(newSession.date);
    dateTime.setHours(hours, minutes || 0, 0, 0);
    const session = {
      id: Date.now(),
      student: newSession.student.trim(),
      type: newSession.type,
      date: newSession.date,
      time: newSession.time,
      dateTime: dateTime.getTime(),
      platform: newSession.platform,
      meetingUrl: (newSession.meetingUrl || '').trim() || null,
      status: 'upcoming',
    };
    setSessions((prev) => [...prev, session]);
    setNewSession({
      student: '',
      type: SESSION_TYPES[0],
      date: '',
      time: '10:00',
      platform: PLATFORMS[0],
      meetingUrl: '',
    });
    setModalOpen(false);
  };

  const markCompleted = (id) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'completed' } : s))
    );
  };

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = sessions.filter((s) => {
      const matchSearch = !q || s.student.toLowerCase().includes(q) || (s.type && s.type.toLowerCase().includes(q));
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'upcoming' && s.status === 'upcoming') ||
        (filterStatus === 'completed' && s.status === 'completed');
      return matchSearch && matchStatus;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'student') return (a.student || '').localeCompare(b.student || '');
      return (b.dateTime || 0) - (a.dateTime || 0);
    });
    return list;
  }, [sessions, searchQuery, filterStatus, sortBy]);

  const upcoming = useMemo(() => filteredAndSorted.filter((s) => s.status === 'upcoming'), [filteredAndSorted]);
  const completed = useMemo(() => filteredAndSorted.filter((s) => s.status === 'completed'), [filteredAndSorted]);

  const showUpcomingSection = filterStatus === 'all' || filterStatus === 'upcoming';
  const showCompletedSection = filterStatus === 'all' || filterStatus === 'completed';

  return (
    <div className="max-w-7xl mx-auto">
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
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90 shrink-0"
        >
          <FiPlus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* Search, filter, sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student or session type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            <option value="all">All sessions</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            <option value="date">Sort by date</option>
            <option value="student">Sort by student</option>
          </select>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {showUpcomingSection && (
        <>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Upcoming Sessions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {upcoming.length === 0 ? (
              <div className="col-span-full portal-card rounded-xl bg-white p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {sessions.length === 0 ? 'No sessions yet.' : 'No upcoming sessions match your search or filter.'}
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
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
                      <FiClock className="w-3.5 h-3.5 text-gray-400" /> {s.time || '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiVideo className="w-3.5 h-3.5 text-gray-400" /> {s.platform}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={s.meetingUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary-navy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90"
                    >
                      <FiVideo className="w-3.5 h-3.5" /> Join meeting
                    </a>
                    <button
                      type="button"
                      onClick={() => markCompleted(s.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Mark completed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Completed Sessions */}
      {showCompletedSection && (
        <>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Completed Sessions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {completed.length === 0 ? (
              <div className="col-span-full rounded-xl bg-white border border-gray-100 p-6 text-center">
                <p className="text-sm text-gray-500">
                  {sessions.length === 0 ? 'No completed sessions yet.' : 'No completed sessions match your search or filter.'}
                </p>
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
                      <FiClock className="w-3.5 h-3.5 text-gray-400" /> {s.time || '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiVideo className="w-3.5 h-3.5 text-gray-400" /> {s.platform}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* New Session modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="new-session-title">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 id="new-session-title" className="text-lg font-semibold text-gray-900">New Session</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSession} className="p-6 space-y-4">
              <div>
                <label htmlFor="session-student" className="block text-sm font-medium text-gray-700 mb-1">Student name</label>
                <input
                  id="session-student"
                  type="text"
                  required
                  value={newSession.student}
                  onChange={(e) => setNewSession((p) => ({ ...p, student: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
                  placeholder="e.g. Aarav Sharma"
                />
              </div>
              <div>
                <label htmlFor="session-type" className="block text-sm font-medium text-gray-700 mb-1">Session type</label>
                <select
                  id="session-type"
                  value={newSession.type}
                  onChange={(e) => setNewSession((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy bg-white"
                >
                  {SESSION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="session-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    id="session-date"
                    type="date"
                    required
                    value={newSession.date}
                    onChange={(e) => setNewSession((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
                  />
                </div>
                <div>
                  <label htmlFor="session-time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    id="session-time"
                    type="time"
                    value={newSession.time}
                    onChange={(e) => setNewSession((p) => ({ ...p, time: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="session-platform" className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  id="session-platform"
                  value={newSession.platform}
                  onChange={(e) => setNewSession((p) => ({ ...p, platform: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy bg-white"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="session-url" className="block text-sm font-medium text-gray-700 mb-1">Meeting link (optional)</label>
                <input
                  id="session-url"
                  type="url"
                  value={newSession.meetingUrl}
                  onChange={(e) => setNewSession((p) => ({ ...p, meetingUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary-navy rounded-lg hover:bg-primary-navy/90"
                >
                  Add Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
