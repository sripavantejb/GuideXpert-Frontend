import { formatCopilotDate, PANEL_CLASS } from './copilotUtils';

const ACTION_LABELS = {
  assigned: 'Assigned',
  replied: 'Reply sent',
  reply_failed: 'Reply failed',
  reply_retried: 'Reply retried',
  resolved: 'Resolved',
  reopened: 'Reopened',
  note_added: 'Note added',
};

export default function CopilotAuditPanel({ auditTrail, loading }) {
  return (
    <section className={`${PANEL_CLASS} flex max-h-48 min-h-0 flex-col overflow-hidden`}>
      <div className="border-b border-slate-200/80 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Activity history</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-xs text-slate-500">Loading history…</p>
        ) : !(auditTrail || []).length ? (
          <p className="text-xs text-slate-500">No activity recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {auditTrail.map((entry, idx) => (
              <li
                key={`${entry.at || idx}-${entry.action}`}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800">
                    {ACTION_LABELS[entry.action] || entry.action}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatCopilotDate(entry.at)}</span>
                </div>
                {entry.srCounsellor ? (
                  <p className="mt-0.5 text-slate-600">Slot: {entry.srCounsellor}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
