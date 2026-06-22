import { getCopilotStateLabel } from './copilotUtils';

export default function CopilotConversationHeader({ handoff }) {
  return (
    <div className="sticky top-0 z-10 shrink-0 border-b border-slate-200/80 bg-white px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">Conversation</h2>
          {handoff ? (
            <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
              {handoff.phone} · {handoff.productLine || '—'} · {handoff.reason || 'handoff'}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-slate-500">Select a handoff from the queue</p>
          )}
        </div>
        {handoff?.copilotState ? (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
            {getCopilotStateLabel(handoff.copilotState)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
