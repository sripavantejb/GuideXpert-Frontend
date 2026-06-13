import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { getGuidanceReminderStatus, getStoredToken } from '../../utils/adminApi';
import { slotSendSummary } from './GuidanceReminderSlotPipeline';

const REMINDER_CHIP_STYLES = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  overdue: 'bg-orange-100 text-orange-900 border-orange-400',
  sent: 'bg-sky-100 text-sky-900 border-sky-300',
  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  read: 'bg-emerald-200 text-emerald-950 border-emerald-400',
  failed: 'bg-red-100 text-red-900 border-red-300',
  skipped: 'bg-slate-100 text-slate-700 border-slate-300',
  none: 'bg-gray-100 text-gray-600 border-gray-300',
};

const SEND_TONE_CLASS = {
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-rose-700',
  muted: 'text-slate-400',
};

export function ReminderChip({ label, count, tone = 'pending' }) {
  if (!count) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${REMINDER_CHIP_STYLES[tone] || REMINDER_CHIP_STYLES.pending}`}
    >
      {label}: {count}
    </span>
  );
}

export function StudentReminderBadge({ state }) {
  const tone = REMINDER_CHIP_STYLES[state] || REMINDER_CHIP_STYLES.none;
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${tone}`}>
      {state}
    </span>
  );
}

function renderSessionTitle(sessionTitle) {
  const title = String(sessionTitle || '').trim();
  if (!title) return null;

  const sep = ' - ';
  const idx = title.indexOf(sep);
  if (idx === -1) return title;

  const main = title.slice(0, idx);
  const subtitle = title.slice(idx + sep.length);
  return (
    <>
      {main}
      {' - '}
      <span className="italic">{subtitle}</span>
    </>
  );
}

/**
 * Slot-grouped 30-min guidance reminder status (one card per GuidanceSlot on slotDate).
 */
export default function GuidanceReminderSlotStatus({
  slotDate,
  showDatePicker = false,
  onDateChange,
  compact = false,
  className = '',
}) {
  const token = getStoredToken();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSlotIds, setExpandedSlotIds] = useState(() => new Set());

  const load = useCallback(async () => {
    if (!slotDate) return;
    setLoading(true);
    setError('');
    const res = await getGuidanceReminderStatus({ slotDate }, token);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Failed to load reminder status');
      setSlots([]);
      return;
    }
    setSlots(res.data?.data?.slots || res.data?.slots || []);
  }, [slotDate, token]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(
    () =>
      slots.reduce(
        (acc, slot) => {
          acc.bookings += slot.bookings?.confirmed || 0;
          acc.pending += slot.reminders?.pending || 0;
          acc.delivered += slot.reminders?.delivered || 0;
          acc.failed += slot.reminders?.failed || 0;
          acc.skipped += slot.reminders?.skipped || 0;
          acc.overdue += slot.reminders?.overdue || 0;
          return acc;
        },
        { bookings: 0, pending: 0, delivered: 0, failed: 0, skipped: 0, overdue: 0 }
      ),
    [slots]
  );

  const toggleExpand = (slotId) => {
    setExpandedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) next.delete(slotId);
      else next.add(slotId);
      return next;
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {showDatePicker ? (
          <input
            type="date"
            value={slotDate}
            onChange={(e) => onDateChange?.(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        ) : (
          <p className="text-xs text-slate-600">
            All active guidance slots on <span className="font-semibold text-slate-900">{slotDate}</span>
          </p>
        )}
        <button
          type="button"
          onClick={load}
          className="p-2 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50"
          aria-label="Refresh slot reminder status"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
        <div className="flex flex-wrap gap-2 ml-auto">
          <ReminderChip label="Bookings" count={summary.bookings} tone="none" />
          <ReminderChip label="Pending" count={summary.pending} tone="pending" />
          <ReminderChip label="Overdue" count={summary.overdue} tone="overdue" />
          <ReminderChip label="Delivered" count={summary.delivered} tone="delivered" />
          <ReminderChip label="Failed" count={summary.failed} tone="failed" />
          <ReminderChip label="Skipped" count={summary.skipped} tone="skipped" />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">Loading slot reminder status…</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center rounded-xl border bg-white">
          No active slots for {slotDate}.
        </p>
      ) : (
        <div className={`grid gap-3 ${compact ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {slots.map((slot) => {
            const expanded = expandedSlotIds.has(slot.id);
            const r = slot.reminders || {};
            const confirmed = slot.bookings?.confirmed || 0;
            const max = slot.bookings?.max || 0;
            const send = slotSendSummary(slot);
            return (
              <div
                key={slot.id}
                className="rounded-[10px] border-2 border-[#0F172A] bg-white p-4 text-[#0F172A]"
              >
                <span className="block text-sm font-black leading-snug">
                  {renderSessionTitle(slot.sessionTitle)}
                </span>
                <span className="mt-2 block text-xs font-bold uppercase tracking-wide text-[#0F172A]/80">
                  {slot.slotDate} · {slot.slotTime}
                </span>
                {slot.counselorName ? (
                  <span className="mt-1 block text-[10px] font-semibold text-[#0F172A]/70">
                    {slot.counselorName}
                  </span>
                ) : null}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#0F172A]/60">Booked</p>
                    <p className="mt-1 text-3xl font-black tabular-nums leading-none">
                      {confirmed}
                      <span className="text-lg font-bold text-[#0F172A]/40">/{max}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#0F172A]/60">Reminder</p>
                    <p className={`mt-1 text-2xl font-black leading-tight ${SEND_TONE_CLASS[send.tone] || SEND_TONE_CLASS.muted}`}>
                      {send.sendLabel}
                    </p>
                    <p className="text-[10px] text-[#0F172A]/60">{send.sendSub}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <ReminderChip label="Scheduled" count={r.scheduled} tone="none" />
                  <ReminderChip label="Pending" count={r.pending} tone="pending" />
                  <ReminderChip label="Overdue" count={r.overdue} tone="overdue" />
                  <ReminderChip label="Delivered" count={r.delivered} tone="delivered" />
                  <ReminderChip label="Read" count={r.read} tone="read" />
                  <ReminderChip label="Failed" count={r.failed} tone="failed" />
                  <ReminderChip label="Skipped" count={r.skipped} tone="skipped" />
                </div>
                {(slot.students || []).length > 0 ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(slot.id)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-navy"
                  >
                    {expanded ? <FiChevronUp /> : <FiChevronDown />}
                    {expanded ? 'Hide students' : 'Show students'}
                  </button>
                ) : null}
                {expanded && (slot.students || []).length > 0 ? (
                  <ul className="mt-2 space-y-2 border-t pt-2">
                    {slot.students.map((student) => (
                      <li
                        key={`${slot.id}-${student.mobile}`}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <span>
                          <span className="font-semibold">{student.name}</span>
                          <span className="text-gray-500"> · {student.mobile}</span>
                        </span>
                        <StudentReminderBadge state={student.reminderState} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
