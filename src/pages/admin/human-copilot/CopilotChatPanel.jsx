import CopilotConversationHeader from './CopilotConversationHeader';
import CopilotConversationView from './CopilotConversationView';
import CopilotReplyEditor from './CopilotReplyEditor';

export default function CopilotChatPanel({
  handoff,
  agents,
  messages,
  loading,
  loadingOlder,
  hasMoreOlder,
  pendingNewCount,
  isPinnedToBottom,
  error,
  scrollRef,
  onScroll,
  onLoadOlder,
  onScrollToLatest,
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
}) {
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-100">
      <CopilotConversationHeader
        handoff={handoff}
        agents={agents}
        onAssign={onAssign}
        assigning={assigning}
        disabled={disabled}
      />
      <CopilotConversationView
        handoff={handoff}
        messages={messages}
        loading={loading}
        loadingOlder={loadingOlder}
        hasMoreOlder={hasMoreOlder}
        pendingNewCount={pendingNewCount}
        isPinnedToBottom={isPinnedToBottom}
        error={error}
        scrollRef={scrollRef}
        onScroll={onScroll}
        onLoadOlder={onLoadOlder}
        onScrollToLatest={onScrollToLatest}
      />
      <CopilotReplyEditor
        handoff={handoff}
        replyText={replyText}
        onReplyTextChange={onReplyTextChange}
        onSuggest={onSuggest}
        onSend={onSend}
        onResolve={onResolve}
        onRetry={onRetry}
        suggesting={suggesting}
        sending={sending}
        resolving={resolving}
        retrying={retrying}
        disabled={disabled}
        deliveryStatus={deliveryStatus}
        suggestNotice={suggestNotice}
        embedded
      />
    </div>
  );
}
