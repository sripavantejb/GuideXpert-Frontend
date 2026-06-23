import { useEffect, useMemo, useState } from 'react';
import { getAgentRoleLabel, getCopilotStateLabel } from './copilotUtils';

export default function CopilotConversationHeader({
  handoff,
  agents = [],
  onAssign,
  assigning = false,
  disabled = false,
}) {
  const assignOptions = useMemo(() => {
    if (agents.length) {
      return agents.map((agent) => ({
        value: `agent:${agent.id}`,
        label: `${agent.name} (${getAgentRoleLabel(agent.role)})`,
      }));
    }
    return [
      { value: 'sr1', label: 'SR Counsellor 1' },
      { value: 'sr2', label: 'SR Counsellor 2' },
    ];
  }, [agents]);

  const initialAssign = useMemo(() => {
    if (handoff?.assignedAgentId) return `agent:${handoff.assignedAgentId}`;
    if (handoff?.assignedSrCounsellor) return handoff.assignedSrCounsellor;
    return '';
  }, [handoff?.id, handoff?.assignedAgentId, handoff?.assignedSrCounsellor]);

  const [assignValue, setAssignValue] = useState(initialAssign);

  useEffect(() => {
    setAssignValue(initialAssign);
  }, [initialAssign]);

  const handleAssignClick = () => {
    if (!assignValue || !onAssign) return;
    if (assignValue.startsWith('agent:')) {
      onAssign({ agentId: assignValue.slice(6) });
    } else {
      onAssign(assignValue);
    }
  };

  return (
    <div className="z-10 shrink-0 border-b border-slate-200/80 bg-white px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          {handoff ? (
            <>
              <h2 className="truncate text-sm font-semibold text-slate-900 tabular-nums">
                {handoff.phone}
              </h2>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {handoff.productLine || '—'} · {handoff.reason || 'handoff'}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-slate-900">Conversation</h2>
              <p className="mt-0.5 text-xs text-slate-500">Select a handoff from the queue</p>
            </>
          )}
        </div>

        {handoff ? (
          <div className="flex flex-wrap items-center gap-2">
            {handoff.copilotState ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                {getCopilotStateLabel(handoff.copilotState)}
              </span>
            ) : null}
            <select
              id="copilot-agent-assign"
              value={assignValue}
              onChange={(e) => setAssignValue(e.target.value)}
              disabled={disabled || assigning}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 min-w-[140px] max-w-[180px]"
              aria-label="Assign to counsellor"
            >
              <option value="">Unassigned</option>
              {assignOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!assignValue || assigning || disabled}
              onClick={handleAssignClick}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {assigning ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
