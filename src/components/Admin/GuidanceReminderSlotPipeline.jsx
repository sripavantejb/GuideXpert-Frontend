import { useCallback, useEffect, useState } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { getGuidanceReminderStatus, getStoredToken } from '../../utils/adminApi';

const SEND_TONE_CLASS = {
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-rose-700',
  muted: 'text-slate-400',
};

const SENT_STATES = new Set(['sent', 'delivered', 'read']);

const SUPPRESSION_LABELS = {
  no_reminder_job: 'No reminder job at booking',
  missed_no_scheduler_at_booking: 'Missed — scheduler was not deployed',
  template_env_missing: 'Template not configured',
  booking_too_late: 'Booked inside 30-min window',
  slot_passed: 'Session already started',
  expired: 'Send window expired',
  invalid_schedule: 'Invalid slot time',
};

function suppressionLabel(reason) {
  if (!reason) return '';
  return SUPPRESSION_LABELS[reason] || reason.replace(/_/g, ' ');
}

function slotSendSummary(slot) {
  const confirmed = slot.bookings?.confirmed || 0;
  const max = slot.bookings?.max || 0;
  const students = slot.students || [];

  if (confirmed === 0) {
    return {
      sendLabel: '—',
      sendSub: 'No bookings',
      tone: 'muted',
      detail: '',
    };
  }

  const sentCount = students.filter((s) => SENT_STATES.has(s.reminderState)).length;
  const deliveredCount = students.filter((s) => ['delivered', 'read'].includes(s.reminderState)).length;
  const failedCount = students.filter((s) => s.reminderState === 'failed').length;
  const skippedCount = students.filter((s) => s.reminderState === 'skipped').length;
  const noneNoJobCount = students.filter((s) => s.suppressionReason === 'no_reminder_job').length;
  const waitingCount = students.filter((s) => ['pending', 'overdue'].includes(s.reminderState)).length;
  const noneOther = students.filter(
    (s) => s.reminderState === 'none' && s.suppressionReason !== 'no_reminder_job'
  ).length;

  if (deliveredCount === confirmed) {
    return { sendLabel: 'Sent', sendSub: `${deliveredCount}/${confirmed} delivered`, tone: 'success', detail: '' };
  }
  if (sentCount === confirmed) {
    return { sendLabel: 'Sent', sendSub: `${sentCount}/${confirmed} dispatched`, tone: 'success', detail: '' };
  }
  if (failedCount > 0) {
    const err = students.find((s) => s.reminderState === 'failed');
    return {
      sendLabel: 'Failed',
      sendSub: `${failedCount} of ${confirmed}`,
      tone: 'danger',
      detail: err?.lastError || suppressionLabel(err?.suppressionReason),
    };
  }
  if (skippedCount === confirmed || noneNoJobCount === confirmed) {
    const reason = students[0]?.suppressionReason;
    return {
      sendLabel: 'Skipped',
      sendSub: suppressionLabel(reason) || 'Not scheduled',
      tone: 'muted',
      detail: suppressionLabel(reason),
    };
  }
  if (waitingCount > 0) {
    const overdue = students.filter((s) => s.reminderState === 'overdue').length;
    return {
      sendLabel: overdue > 0 ? 'Overdue' : 'Not sent',
      sendSub: overdue > 0 ? `${overdue} overdue` : `${waitingCount} waiting`,
      tone: 'warning',
      detail: '',
    };
  }
  if (noneOther > 0) {
    return { sendLabel: 'Not sent', sendSub: 'No job record', tone: 'warning', detail: '' };
  }

  return { sendLabel: 'Not sent', sendSub: 'Pending', tone: 'warning', detail: '' };
}

function shortSlotLabel(slot) {
  const time = String(slot.slotTime || '').trim();
  if (time) return time;
  return String(slot.sessionTitle || 'Slot').slice(0, 48);
}

function formatCronAge(ageMs) {
  if (ageMs == null) return 'never';
  const mins = Math.round(ageMs / 60000);
  if (mins < 1) return 'just now';
  return `${mins}m ago`;
}

/**
 * Replaces "Selected template pipeline & reliability" KPI row for guidance_pre30min.
 * Shows every slot with large booked count + reminder sent / not sent.
 */
export default function GuidanceReminderSlotPipeline({ slotDate, className = '' }) {
  const token = getStoredToken();
  const [slots, setSlots] = useState([]);
  const [cronHealth, setCronHealth] = useState(null);
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
      setCronHealth(null);
      return;
    }
    const payload = res.data?.data || res.data || {};
    setSlots(payload.slots || []);
    setCronHealth(payload.cronHealth || null);
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

  const cronStale = cronHealth?.stale === true;

  return (
    <div className={className}>
      {cronStale ? (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <FiAlertTriangle className="mt-0.5 shrink-0" size={14} />
          <div>
            <p className="font-semibold">Guidance reminder cron may be down</p>
            <p className="mt-0.5 text-amber-800">
              Last success: {formatCronAge(cronHealth?.ageMs)}.
              Check Vercel cron <code className="text-[10px]">/api/cron/send-guidance-reminders</code> and{' '}
              <code className="text-[10px]">CRON_SECRET</code> on Production.
            </p>
          </div>
        </div>
      ) : cronHealth?.lastSuccessAt ? (
        <p className="mb-3 text-[10px] text-emerald-700">
          Guidance cron healthy · last run {formatCronAge(cronHealth.ageMs)}
        </p>
      ) : null}
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
              title={send.detail || undefined}
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
                  <p className="mt-1 text-[10px] text-slate-500 line-clamp-2">{send.sendSub}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { slotSendSummary, suppressionLabel };
