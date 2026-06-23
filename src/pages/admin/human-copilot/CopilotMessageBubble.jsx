import {
  formatMessageTime,
  getGroupedBubbleClasses,
  getMessageGroupSpacing,
  getMessageRole,
  getMessageRowAlignment,
  getMessageSenderLabel,
  MESSAGE_ROLES,
  shouldShowMessageMeta,
} from './copilotUtils';

export default function CopilotMessageBubble({
  message,
  handoff,
  prevMessage = null,
  nextMessage = null,
}) {
  const alignment = getMessageRowAlignment(message);
  const isSystem = alignment === 'justify-center';
  const role = getMessageRole(message);
  const showMeta = shouldShowMessageMeta(message, prevMessage);
  const spacing = getMessageGroupSpacing(prevMessage, message);
  const bubbleClasses = getGroupedBubbleClasses(message, prevMessage, nextMessage);
  const timeLabel = formatMessageTime(message.at);
  const isCounsellor = role === MESSAGE_ROLES.counsellor;
  const isFailedDelivery = isCounsellor && message.status === 'failed';

  return (
    <div className={`flex w-full ${alignment} ${spacing}`}>
      <div
        className={`flex max-w-full flex-col ${
          isSystem ? 'items-center' : alignment === 'justify-end' ? 'items-end' : 'items-start'
        }`}
      >
        {showMeta ? (
          <div className="mb-1 px-1 text-[10px] font-medium text-slate-500">
            {getMessageSenderLabel(message, handoff)}
          </div>
        ) : null}
        {isFailedDelivery ? (
          <span className="mb-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
            Not delivered
          </span>
        ) : null}
        <div className={bubbleClasses}>
          <span className="whitespace-pre-wrap break-words">{message.text || '—'}</span>
          {timeLabel ? (
            <span
              className={`float-right ml-3 mt-1 translate-y-0.5 text-[10px] leading-none tabular-nums ${
                isCounsellor ? 'text-emerald-100' : 'text-slate-400'
              }`}
            >
              {timeLabel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
