import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import {
  getAiCallPreviewPayload,
  getAiCallReminder,
  patchAiCallReminder,
  scheduleAiCallReminder,
  rejectAiCallReminder,
} from '../../../utils/aiCallsAdminApi';

const STATUS_COLORS = {
  pending_approval: 'bg-amber-100 text-amber-800',
  scheduled: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-700',
};

function fmt(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return String(dateStr);
  }
}

function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const ist = new Date(d.getTime() + (5 * 60 + 30) * 60 * 1000 - d.getTimezoneOffset() * 60 * 1000);
    return ist.toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

export default function ReminderReviewDrawer({ reminderId, onClose, onUpdated }) {
  const [reminder, setReminder] = useState(null);
  const [payload, setPayload] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  async function load() {
    if (!reminderId) return;
    setLoading(true);
    setError('');
    try {
      const [detailRes, payloadRes] = await Promise.all([
        getAiCallReminder(reminderId),
        getAiCallPreviewPayload(reminderId),
      ]);
      if (!detailRes.success) {
        setError(detailRes.message || 'Failed to load.');
        return;
      }
      const r = detailRes.data?.data?.reminder || detailRes.data?.reminder;
      setReminder(r);
      setLogs(detailRes.data?.data?.logs || detailRes.data?.logs || []);
      setEditForm({
        studentName: r?.studentName || '',
        phone: r?.phone || '',
        class: r?.class || '',
        city: r?.city || '',
        biggestConcern: r?.biggestConcern || '',
        callbackTime: toDatetimeLocalValue(r?.callbackTime),
      });
      if (payloadRes.success) {
        setPayload(payloadRes.data?.data?.payload || payloadRes.data?.payload);
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [reminderId]);

  async function handleSaveEdit() {
    setActionLoading(true);
    setError('');
    const body = {
      studentName: editForm.studentName,
      phone: editForm.phone,
      class: editForm.class,
      city: editForm.city,
      biggestConcern: editForm.biggestConcern,
    };
    if (editForm.callbackTime) {
      body.callbackTime = new Date(editForm.callbackTime).toISOString();
    }
    const res = await patchAiCallReminder(reminderId, body);
    setActionLoading(false);
    if (!res.success) {
      setError(res.message || 'Update failed.');
      return;
    }
    setEditMode(false);
    await load();
    onUpdated?.();
  }

  async function handleSchedule() {
    if (!window.confirm('Schedule this reminder to OSVI?')) return;
    setActionLoading(true);
    setError('');
    const res = await scheduleAiCallReminder(reminderId);
    setActionLoading(false);
    if (!res.success) {
      setError(res.message || 'Schedule failed.');
      await load();
      return;
    }
    onUpdated?.();
    onClose?.();
  }

  async function handleReject() {
    if (!window.confirm('Reject this reminder?')) return;
    setActionLoading(true);
    const res = await rejectAiCallReminder(reminderId, { reason: rejectReason || null });
    setActionLoading(false);
    if (!res.success) {
      setError(res.message || 'Reject failed.');
      return;
    }
    onUpdated?.();
    onClose?.();
  }

  if (!reminderId) return null;

  const statusCls = STATUS_COLORS[reminder?.status] || 'bg-gray-100 text-gray-700';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <aside className="relative w-full max-w-lg h-full bg-white shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Review Reminder</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          {reminder && (
            <>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>
                  {reminder.status?.replace(/_/g, ' ')}
                </span>
              </div>

              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Student Details</h3>
                {editMode ? (
                  <div className="space-y-3">
                    {['studentName', 'phone', 'class', 'city', 'biggestConcern'].map((field) => (
                      <label key={field} className="block text-xs text-gray-500">
                        {field}
                        <input
                          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                          value={editForm[field] || ''}
                          onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                        />
                      </label>
                    ))}
                    <label className="block text-xs text-gray-500">
                      Callback Time
                      <input
                        type="datetime-local"
                        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                        value={editForm.callbackTime || ''}
                        onChange={(e) => setEditForm((f) => ({ ...f, callbackTime: e.target.value }))}
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 text-sm bg-primary-navy text-white rounded-lg disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button type="button" onClick={() => setEditMode(false)} className="px-3 py-1.5 text-sm border rounded-lg">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs bg-gray-50 border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
{JSON.stringify({
  studentName: reminder.studentName,
  phone: reminder.phone,
  class: reminder.class,
  city: reminder.city,
  biggestConcern: reminder.biggestConcern,
  selectedSlot: reminder.selectedSlot,
  callbackTime: fmt(reminder.callbackTime),
}, null, 2)}
                  </pre>
                )}
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">OSVI Payload Preview</h3>
                <pre className="text-xs bg-slate-900 text-green-300 rounded-lg p-3 overflow-x-auto">
                  {payload ? JSON.stringify(payload, null, 2) : '—'}
                </pre>
              </section>

              {logs.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Activity Log</h3>
                  <ul className="space-y-2 text-xs text-gray-600">
                    {logs.map((log) => (
                      <li key={log._id} className="border-b pb-1">
                        <span className="font-medium">{log.action}</span>
                        {' · '}
                        {fmt(log.createdAt)}
                        {log.actorName ? ` · ${log.actorName}` : ''}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        {reminder?.status === 'pending_approval' && (
          <div className="border-t p-4 space-y-3 bg-gray-50">
            {!editMode && (
              <button type="button" onClick={() => setEditMode(true)} className="w-full py-2 text-sm border rounded-lg bg-white">
                Edit Details
              </button>
            )}
            <input
              type="text"
              placeholder="Rejection reason (optional)"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSchedule}
                className="flex-1 py-2.5 text-sm font-semibold bg-primary-navy text-white rounded-lg disabled:opacity-50"
              >
                Schedule Reminder
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-4 py-2.5 text-sm border border-red-300 text-red-700 rounded-lg disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
