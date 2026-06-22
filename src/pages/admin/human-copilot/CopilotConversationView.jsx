import { formatCopilotDate } from './copilotUtils';

function bubbleClass(message) {
  if (message.direction === 'in') {
    return 'ml-0 mr-8 bg-white border border-slate-200 text-slate-900';
  }
  if (message.senderType === 'agent') {
    return 'ml-8 mr-0 bg-emerald-50 border border-emerald-200 text-emerald-950';
  }
  return 'ml-8 mr-0 bg-primary-blue-50 border border-primary-blue-100 text-primary-navy';
}

function senderLabel(message) {
  if (message.direction === 'in') return 'User';
  if (message.senderType === 'agent') return 'Counsellor';
  return 'Assistant';
}

export default function CopilotConversationView({ transcript, loading, handoff }) {
  const messages = transcript?.messages || [];

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/60 ring-1 ring-slate-100">
      <div className="border-b border-slate-200/80 bg-white px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Conversation</h2>
        {handoff ? (
          <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
            {handoff.phone} · {handoff.productLine || '—'} · {handoff.reason || 'handoff'}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-slate-500">Select a handoff from the queue</p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading transcript…</p>
        ) : !handoff ? (
          <p className="text-sm text-slate-500">No conversation selected.</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet.</p>
        ) : (
          messages.map((message, idx) => (
            <div key={`${message.at || idx}-${idx}`} className="flex flex-col">
              <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wide text-slate-400">
                <span>{senderLabel(message)}</span>
                <span>{formatCopilotDate(message.at)}</span>
              </div>
              <div
                className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${bubbleClass(message)}`}
              >
                {message.text || '—'}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
