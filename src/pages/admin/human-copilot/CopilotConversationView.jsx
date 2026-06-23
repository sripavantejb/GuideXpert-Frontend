import { useEffect, useRef } from 'react';
import CopilotDateSeparator from './CopilotDateSeparator';
import CopilotMessageBubble from './CopilotMessageBubble';
import CopilotScrollToBottom from './CopilotScrollToBottom';
import { normalizeMessageKey, shouldShowDateSeparator } from './copilotUtils';

export default function CopilotConversationView({
  handoff,
  messages = [],
  loading = false,
  loadingOlder = false,
  hasMoreOlder = false,
  pendingNewCount = 0,
  isPinnedToBottom = true,
  error = '',
  scrollRef,
  onScroll,
  onLoadOlder,
  onScrollToLatest,
}) {
  const topSentinelRef = useRef(null);

  useEffect(() => {
    const root = scrollRef?.current;
    const sentinel = topSentinelRef.current;
    if (!root || !sentinel || !hasMoreOlder || !onLoadOlder) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !loadingOlder) {
          onLoadOlder();
        }
      },
      { root, rootMargin: '80px', threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollRef, hasMoreOlder, loadingOlder, onLoadOlder, messages.length]);

  const handleScrollToLatest = () => {
    onScrollToLatest?.({ smooth: true });
  };

  return (
    <div className="relative min-h-0 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="absolute inset-0 scroll-smooth overflow-y-auto overscroll-contain bg-[#efeae2] px-3 pt-4 pb-4"
      >
        {loading ? (
          <p className="text-sm text-slate-500">Loading transcript…</p>
        ) : !handoff ? (
          <p className="text-sm text-slate-500">No conversation selected.</p>
        ) : (
          <>
            <div ref={topSentinelRef} className="h-1 w-full shrink-0" aria-hidden />
            {loadingOlder ? (
              <p className="text-center text-xs text-slate-500">Loading older messages…</p>
            ) : hasMoreOlder ? (
              <p className="text-center text-xs text-slate-500/80">Scroll up for older messages</p>
            ) : messages.length > 0 ? (
              <p className="text-center text-xs text-slate-500/80">Beginning of conversation</p>
            ) : null}
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            ) : null}
            {messages.length === 0 && !loading ? (
              <p className="text-sm text-slate-500">No messages yet.</p>
            ) : (
              messages.map((message, idx) => {
                const prevMessage = idx > 0 ? messages[idx - 1] : null;
                const nextMessage = idx < messages.length - 1 ? messages[idx + 1] : null;
                return (
                  <div key={normalizeMessageKey(message, idx)}>
                    {shouldShowDateSeparator(message, prevMessage) ? (
                      <CopilotDateSeparator at={message.at} />
                    ) : null}
                    <CopilotMessageBubble
                      message={message}
                      handoff={handoff}
                      prevMessage={prevMessage}
                      nextMessage={nextMessage}
                    />
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      <CopilotScrollToBottom
        visible={!isPinnedToBottom}
        pendingCount={pendingNewCount}
        onClick={handleScrollToLatest}
      />
    </div>
  );
}
