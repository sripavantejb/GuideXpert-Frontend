import { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiPlus, FiVideo, FiClock, FiUser, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { getSessions, createSession, updateSession, deleteSession, getStudents } from '../../utils/counsellorApi';

const PURPOSE_OPTIONS = ['Career Guidance', 'Admission Review', 'Follow-up', 'Initial Consultation', 'Other'];
const PLATFORM_OPTIONS = ['Google Meet', 'Zoom', 'Other'];

function formatSessionDate(scheduledAt) {
  if (!scheduledAt) return '—';
  const d = new Date(scheduledAt);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
function formatSessionTime(scheduledAt) {
  if (!scheduledAt) return '—';
  const d = new Date(scheduledAt);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    studentId: '',
    studentName: '',
    purpose: '',
    scheduledAt: '',
    platform: 'Google Meet',
    meetingLink: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await getSessions();
    if (result.success && Array.isArray(result.data)) {
      setSessions(result.data);
    } else {
      setError(result.message || 'Failed to load sessions');
      setSessions([]);
    }
    setLoading(false);
  }, []);

  const loadStudents = useCallback(async () => {
    const result = await getStudents({ limit: 500 });
    if (result.success && result.data) {
      const list = result.data.data ?? result.data.students ?? (Array.isArray(result.data) ? result.data : []);
      setStudents(Array.isArray(list) ? list : []);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    loadStudents();
  }, [loadSessions, loadStudents]);

  const upcoming = sessions.filter((s) => s.status === 'upcoming');
  const completed = sessions.filter((s) => s.status === 'completed');

  const openNewModal = () => {
    setEditingId(null);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setForm({
      studentId: '',
      studentName: '',
      purpose: '',
      scheduledAt: now.toISOString().slice(0, 16),
      platform: 'Google Meet',
      meetingLink: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingId(s._id);
    const d = s.scheduledAt ? new Date(s.scheduledAt) : new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setForm({
      studentId: s.studentId || '',
      studentName: s.studentName || '',
      purpose: s.purpose || '',
      scheduledAt: d.toISOString().slice(0, 16),
      platform: s.platform || 'Google Meet',
      meetingLink: s.meetingLink || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    const payload = {
      purpose: form.purpose.trim() || 'Session',
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      platform: form.platform,
      meetingLink: form.meetingLink.trim(),
    };
    if (form.studentId) payload.studentId = form.studentId;
    if (form.studentName.trim()) payload.studentName = form.studentName.trim();

    const result = editingId
      ? await updateSession(editingId, payload)
      : await createSession(payload);
    setSubmitLoading(false);
    if (result.success) {
      setModalOpen(false);
      loadSessions();
    } else {
      setError(result.message || 'Failed to save session');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this session?')) return;
    const result = await deleteSession(id);
    if (result.success) loadSessions();
    else setError(result.message || 'Failed to delete');
  };

  const markCompleted = async (id) => {
    const result = await updateSession(id, { status: 'completed' });
    if (result.success) loadSessions();
    else setError(result.message || 'Failed to update');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-16 text-gray-500">
        Loading sessions…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
            Session Scheduler
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage meetings, availability, and video calls</p>
        </div>
        <button
          type="button"
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors"
        >
          <FiPlus className="w-4 h-4" /> New Session
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Upcoming */}
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Upcoming Sessions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {upcoming.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-full">No upcoming sessions</p>
        ) : (
          upcoming.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{s.studentName || 'Student'}</p>
                    <p className="text-xs text-gray-500">{s.purpose}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  Upcoming
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5" /> {formatSessionDate(s.scheduledAt)}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="w-3.5 h-3.5" /> {formatSessionTime(s.scheduledAt)}
                </span>
                <span className="flex items-center gap-1">
                  <FiVideo className="w-3.5 h-3.5" /> {s.platform}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(s)}
                  className="inline-flex items-center gap-1 text-xs text-[#003366] hover:underline"
                >
                  <FiEdit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => markCompleted(s._id)}
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                >
                  Mark completed
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s._id)}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                >
                  <FiTrash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed */}
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Completed Sessions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {completed.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-full">No completed sessions</p>
        ) : (
          completed.map((s) => (
            <div key={s._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 opacity-90">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">{s.studentName || 'Student'}</p>
                    <p className="text-xs text-gray-500">{s.purpose}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                  Completed
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5" /> {formatSessionDate(s.scheduledAt)}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="w-3.5 h-3.5" /> {formatSessionTime(s.scheduledAt)}
                </span>
                <span className="flex items-center gap-1">
                  <FiVideo className="w-3.5 h-3.5" /> {s.platform}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New / Edit Session Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ color: '#003366' }}>
              {editingId ? 'Edit Session' : 'New Session'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={form.studentId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const st = students.find((s) => s._id === id);
                    setForm((f) => ({
                      ...f,
                      studentId: id,
                      studentName: st ? st.fullName : f.studentName,
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none"
                >
                  <option value="">— Free text below —</option>
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.fullName}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={form.studentName}
                  onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
                  placeholder="Or enter student name"
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <select
                  value={form.purpose}
                  onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none"
                >
                  <option value="">Select…</option>
                  {PURPOSE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & time</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none"
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting link (optional)</label>
                <input
                  type="url"
                  value={form.meetingLink}
                  onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
                  placeholder="https://…"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2.5 px-4 rounded-lg font-medium text-white hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#003366' }}
                >
                  {submitLoading ? 'Saving…' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
