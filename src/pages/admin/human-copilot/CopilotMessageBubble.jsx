import {
  formatCopilotDate,
  getMessageBubbleClasses,
  getMessageRowAlignment,
  getMessageSenderLabel,
  normalizeMessageKey,
} from './copilotUtils';

export default function CopilotMessageBubble({ message, handoff, index = 0 }) {
  const alignment = getMessageRowAlignment(message);
  const isSystem = alignment === 'justify-center';

  return (
    <div className={`flex w-full ${alignment}`}>
      <div className={`flex max-w-full flex-col ${isSystem ? 'items-center' : alignment === 'justify-end' ? 'items-end' : 'items-start'}`}>
        <div className="mb-1 flex items-center gap-2 px-1 text-[10px] text-slate-400">
          <span className="font-medium uppercase tracking-wide">
            {getMessageSenderLabel(message, handoff)}
          </span>
          <span className="tabular-nums">{formatCopilotDate(message.at)}</span>
        </div>
        <div className={getMessageBubbleClasses(message)}>{message.text || '—'}</div>
      </div>
    </div>
  );
}
