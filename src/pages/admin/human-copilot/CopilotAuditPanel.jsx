import { CopilotRailSection, RailEmptyState } from './CopilotRailSection';
import { formatCopilotDate } from './copilotUtils';

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
  const entries = auditTrail || [];

  return (
    <CopilotRailSection title="Activity history">
      {loading ? (
        <p className="text-xs text-slate-500">Loading history…</p>
      ) : !entries.length ? (
        <RailEmptyState>No activity recorded yet.</RailEmptyState>
      ) : (
        <ol className="relative space-y-0 border-l border-slate-200 pl-3">
          {entries.map((entry, idx) => (
            <li key={`${entry.at || idx}-${entry.action}`} className="relative pb-3 last:pb-0">
              <span
                className="absolute -left-[calc(0.75rem+1px)] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-slate-300"
                aria-hidden
              />
              <div className="rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-800">
                    {ACTION_LABELS[entry.action] || entry.action}
                  </span>
                  <time className="shrink-0 text-[10px] text-slate-400">
                    {formatCopilotDate(entry.at)}
                  </time>
                </div>
                {entry.srCounsellor ? (
                  <p className="mt-0.5 text-[11px] text-slate-500">Slot: {entry.srCounsellor}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </CopilotRailSection>
  );
}
