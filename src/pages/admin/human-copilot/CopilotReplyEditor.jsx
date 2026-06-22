import { useEffect, useMemo, useState } from 'react';
import { FiRefreshCw, FiSend, FiZap, FiCheckCircle } from 'react-icons/fi';
import {
  formatSrSlot,
  getAgentRoleLabel,
  getCopilotStateLabel,
  getDeliveryStatusLabel,
  getDeliveryStatusTone,
  PANEL_CLASS,
} from './copilotUtils';

export default function CopilotReplyEditor({
  handoff,
  agents = [],
  replyText,
  onReplyTextChange,
  onSuggest,
  onSend,
  onResolve,
  onAssign,
  onRetry,
  suggesting,
  sending,
  resolving,
  assigning,
  retrying,
  disabled,
  deliveryStatus,
  suggestNotice,
  embedded = false,
}) {
  const assignOptions = useMemo(() => {
    if (agents.length) {
      return agents.map((agent) => ({
        value: `agent:${agent.id}`,
        label: `${agent.name} (${getAgentRoleLabel(agent.role)})`,
        agentId: agent.id,
      }));
    }
    return [
      { value: 'sr1', label: 'SR Counsellor 1', agentId: null },
      { value: 'sr2', label: 'SR Counsellor 2', agentId: null },
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

  const shellClass = embedded
    ? 'shrink-0 border-t border-slate-200/80 bg-white p-4 space-y-3'
    : `${PANEL_CLASS} p-4 space-y-3`;

  if (!handoff) {
    return (
      <section className={embedded ? 'shrink-0 border-t border-slate-200/80 bg-white p-4 text-sm text-slate-500' : `${PANEL_CLASS} p-4 text-sm text-slate-500`}>
        Select a conversation to reply.
      </section>
    );
  }

  const failedReply = handoff.failedReply;
  const showRetry = failedReply && deliveryStatus === 'failed';

  const handleAssignClick = () => {
    if (!assignValue) return;
    if (assignValue.startsWith('agent:')) {
      onAssign({ agentId: assignValue.slice(6) });
    } else {
      onAssign(assignValue);
    }
  };

  return (
    <section className={shellClass}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          {getCopilotStateLabel(handoff.copilotState)}
        </span>
        {(handoff.assignedAgentName || handoff.assignedSrCounsellor) && (
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">
            {formatSrSlot(handoff.assignedSrCounsellor, handoff.assignedAgentName)}
          </span>
        )}
        {deliveryStatus ? (
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getDeliveryStatusTone(deliveryStatus)}`}
          >
            {getDeliveryStatusLabel(deliveryStatus)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="agent-assign" className="text-xs font-medium text-slate-600">
          Assign to
        </label>
        <select
          id="agent-assign"
          value={assignValue}
          onChange={(e) => setAssignValue(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 min-w-[180px]"
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

      {suggestNotice ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {suggestNotice}
        </p>
      ) : null}

      {showRetry ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 flex flex-wrap items-center justify-between gap-2">
          <span>
            Send failed{failedReply.errorMessage ? `: ${failedReply.errorMessage}` : ''}. Draft
            preserved.
          </span>
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying || disabled}
            className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-2 py-1 font-medium hover:bg-red-100 disabled:opacity-50"
          >
            <FiRefreshCw className="h-3 w-3" />
            {retrying ? 'Retrying…' : 'Retry send'}
          </button>
        </div>
      ) : null}

      <textarea
        value={replyText}
        onChange={(e) => onReplyTextChange(e.target.value)}
        rows={4}
        placeholder="Type a WhatsApp reply…"
        disabled={disabled || sending}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-blue-300 focus:outline-none focus:ring-2 focus:ring-primary-blue-100 disabled:bg-slate-50"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSuggest}
          disabled={suggesting || disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-900 hover:bg-violet-100 disabled:opacity-50"
        >
          <FiZap className="h-3.5 w-3.5" />
          {suggesting ? 'Suggesting…' : 'Suggest reply'}
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={sending || !replyText.trim() || disabled}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-primary-blue-700 disabled:opacity-50"
        >
          <FiSend className="h-3.5 w-3.5" />
          {sending ? 'Sending…' : 'Send'}
        </button>
        <button
          type="button"
          onClick={onResolve}
          disabled={resolving || disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
        >
          <FiCheckCircle className="h-3.5 w-3.5" />
          {resolving ? 'Resolving…' : 'Resolve'}
        </button>
      </div>
    </section>
  );
}
