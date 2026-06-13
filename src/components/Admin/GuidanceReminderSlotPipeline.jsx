import { useCallback, useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { getGuidanceReminderStatus, getStoredToken } from '../../utils/adminApi';

const SEND_TONE_CLASS = {
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-rose-700',
  muted: 'text-slate-400',
};

const SENT_STATES = new Set(['sent', 'delivered', 'read']);

function slotSendSummary(slot) {
  const confirmed = slot.bookings?.confirmed || 0;
  const max = slot.bookings?.max || 0;
  const students = slot.students || [];

  if (confirmed === 0) {
    return {
      sendLabel: '—',
      sendSub: 'No bookings',
      tone: 'muted',
    };
  }

  const sentCount = students.filter((s) => SENT_STATES.has(s.reminderState)).length;
  const deliveredCount = students.filter((s) => ['delivered', 'read'].includes(s.reminderState)).length;
  const failedCount = students.filter((s) => s.reminderState === 'failed').length;
  const skippedCount = students.filter((s) => s.reminderState === 'skipped').length;
  const waitingCount = students.filter((s) => ['pending', 'overdue', 'none'].includes(s.reminderState)).length;

  if (deliveredCount === confirmed) {
    return { sendLabel: 'Sent', sendSub: `${deliveredCount}/${confirmed} delivered`, tone: 'success' };
  }
  if (sentCount === confirmed) {
    return { sendLabel: 'Sent', sendSub: `${sentCount}/${confirmed} dispatched`, tone: 'success' };
  }
  if (failedCount > 0) {
    return { sendLabel: 'Failed', sendSub: `${failedCount} of ${confirmed}`, tone: 'danger' };
  }
  if (skippedCount === confirmed) {
    return { sendLabel: 'Skipped', sendSub: 'Not scheduled', tone: 'muted' };
  }
  if (waitingCount > 0) {
    return { sendLabel: 'Not sent', sendSub: `${waitingCount} waiting`, tone: 'warning' };
  }

  return { sendLabel: 'Not sent', sendSub: 'Pending', tone: 'warning' };
}

function shortSlotLabel(slot) {
  const time = String(slot.slotTime || '').trim();
  if (time) return time;
  return String(slot.sessionTitle || 'Slot').slice(0, 48);
}

/**
 * Replaces "Selected template pipeline & reliability" KPI row for guidance_pre30min.
 * Shows every slot with large booked count + reminder sent / not sent.
 */
export default function GuidanceReminderSlotPipeline({ slotDate, className = '' }) {
  const token = getStoredToken();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!slotDate) return;
    setLoading(true);
    setError('');
    const res = await getGuidanceReminderStatus({ slotDate }, token);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Failed to load slot reminder status');
      setSlots([]);
      return;
    }
    setSlots(res.data?.data?.slots || res.data?.slots || []);
  }, [slotDate, token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-slate-500 py-6 text-center">Loading slot status…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</p>;
  }

  if (!slots.length) {
    return <p className="text-sm text-slate-500 py-6 text-center">No active slots on {slotDate}.</p>;
  }

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-600">
          One tile per guidance slot · <span className="font-semibold text-slate-800">{slotDate}</span>
        </p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          <FiRefreshCw size={12} />
          Refresh
        </button>
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(13rem,1fr))]">
        {slots.map((slot) => {
          const confirmed = slot.bookings?.confirmed || 0;
          const max = slot.bookings?.max || 0;
          const send = slotSendSummary(slot);
          return (
            <div
              key={slot.id}
              className="min-w-0 rounded-xl border border-primary-blue-200 bg-gradient-to-b from-white to-primary-blue-50/40 p-4 shadow-sm"
            >
              <p className="text-xs font-semibold text-primary-navy leading-snug line-clamp-2" title={slot.sessionTitle}>
                {shortSlotLabel(slot)}
              </p>
              {slot.counselorName ? (
                <p className="mt-1 text-[10px] text-slate-500 truncate">{slot.counselorName}</p>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Booked</p>
                  <p className="mt-1 text-3xl font-black tabular-nums leading-none text-primary-navy">
                    {confirmed}
                    <span className="text-lg font-bold text-slate-400">/{max}</span>
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">confirmed</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Reminder</p>
                  <p className={`mt-1 text-2xl font-black leading-tight ${SEND_TONE_CLASS[send.tone] || SEND_TONE_CLASS.muted}`}>
                    {send.sendLabel}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">{send.sendSub}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { slotSendSummary };
