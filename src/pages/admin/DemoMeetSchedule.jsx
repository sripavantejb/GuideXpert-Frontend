import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { getDemoMeetSchedule, putDemoMeetSchedule, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';

const DOW_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

function emptyWindow() {
  return { dayOfWeek: 1, startHHmm: '19:00', endHHmm: '20:00' };
}

export default function DemoMeetSchedule() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [okMessage, setOkMessage] = useState('');
  const [recurringWindows, setRecurringWindows] = useState([]);
  const [joinEarlyMinutes, setJoinEarlyMinutes] = useState(5);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getDemoMeetSchedule(getStoredToken()).then((res) => {
      setLoading(false);
      if (!res.success) {
        if (res.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(res.message || 'Failed to load schedule');
        return;
      }
      const sch = res.data?.schedule;
      if (sch && Array.isArray(sch.recurringWindows)) {
        setRecurringWindows(sch.recurringWindows.map((w) => ({ ...w })));
        setJoinEarlyMinutes(
          typeof sch.joinEarlyMinutes === 'number' ? sch.joinEarlyMinutes : 5
        );
      } else {
        setRecurringWindows([emptyWindow()]);
      }
    });
  }, [logout]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRow = (index, patch) => {
    setRecurringWindows((rows) => {
      const next = [...rows];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addRow = () => {
    setRecurringWindows((rows) => [...rows, emptyWindow()]);
  };

  const removeRow = (index) => {
    setRecurringWindows((rows) => rows.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setOkMessage('');
    const res = await putDemoMeetSchedule(
      { recurringWindows, joinEarlyMinutes: Number(joinEarlyMinutes) || 0 },
      getStoredToken()
    );
    setSaving(false);
    if (!res.success) {
      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(res.message || res.data?.message || 'Save failed');
      return;
    }
    setOkMessage('Schedule saved.');
    const sch = res.data?.schedule;
    if (sch && Array.isArray(sch.recurringWindows)) {
      setRecurringWindows(sch.recurringWindows.map((w) => ({ ...w })));
      setJoinEarlyMinutes(typeof sch.joinEarlyMinutes === 'number' ? sch.joinEarlyMinutes : 5);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-16 text-center">
          <p className="text-gray-500">Loading demo meet schedule…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Demo meet live windows</h1>
        <p className="mt-1 text-sm text-gray-500">
          Anyone who has completed demo registration can join <code className="text-xs bg-gray-100 px-1 rounded">/meet</code> during
          these recurring windows (India time). Their originally booked slot is not used for the join gate.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}
      {okMessage ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          {okMessage}
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-end gap-4">
          <label className="block shrink-0">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Join opens early (minutes)</span>
            <input
              type="number"
              min={0}
              max={120}
              className="mt-1 block w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={joinEarlyMinutes}
              onChange={(e) => setJoinEarlyMinutes(Number(e.target.value))}
            />
          </label>
          <p className="text-xs text-gray-500 flex-1">
            Users may enter the meet this many minutes before each window&apos;s start time.
          </p>
        </div>

        <ul className="divide-y divide-gray-100">
          {recurringWindows.map((row, index) => (
            <li key={index} className="px-4 py-3 flex flex-wrap items-center gap-3">
              <select
                className="rounded-lg border border-gray-300 px-2 py-2 text-sm min-w-[9rem]"
                value={row.dayOfWeek}
                onChange={(e) => updateRow(index, { dayOfWeek: Number(e.target.value) })}
              >
                {DOW_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Start</span>
                <input
                  type="text"
                  className="w-24 rounded-lg border border-gray-300 px-2 py-2 font-mono text-sm"
                  value={row.startHHmm}
                  onChange={(e) => updateRow(index, { startHHmm: e.target.value })}
                  placeholder="19:00"
                  aria-label="Start HH:mm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">End</span>
                <input
                  type="text"
                  className="w-24 rounded-lg border border-gray-300 px-2 py-2 font-mono text-sm"
                  value={row.endHHmm}
                  onChange={(e) => updateRow(index, { endHHmm: e.target.value })}
                  placeholder="20:00"
                  aria-label="End HH:mm"
                />
              </label>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="ml-auto p-2 rounded-lg text-red-600 hover:bg-red-50"
                aria-label="Remove window"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <div className="px-4 py-4 border-t border-gray-100 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiPlus className="h-4 w-4" />
            Add window
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
          >
            <FiSave className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save schedule'}
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Times are 24-hour clock in Asia/Kolkata. End must be after start on the same day (no overnight ranges).
      </p>
    </div>
  );
}
