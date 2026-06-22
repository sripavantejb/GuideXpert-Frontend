import { useEffect, useRef } from 'react';
import CopilotConversationHeader from './CopilotConversationHeader';
import CopilotMessageBubble from './CopilotMessageBubble';
import CopilotNewMessagesPill from './CopilotNewMessagesPill';
import { normalizeMessageKey } from './copilotUtils';

export default function CopilotConversationView({
  handoff,
  messages = [],
  loading = false,
  loadingOlder = false,
  hasMoreOlder = false,
  pendingNewCount = 0,
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

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#e5ddd5]/40">
      <CopilotConversationHeader handoff={handoff} />

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="h-full overflow-y-auto overscroll-contain px-3 py-4 space-y-3"
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
                <p className="text-center text-xs text-slate-400">Scroll up for older messages</p>
              ) : messages.length > 0 ? (
                <p className="text-center text-xs text-slate-400">Beginning of conversation</p>
              ) : null}
              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              ) : null}
              {messages.length === 0 && !loading ? (
                <p className="text-sm text-slate-500">No messages yet.</p>
              ) : (
                messages.map((message, idx) => (
                  <CopilotMessageBubble
                    key={normalizeMessageKey(message, idx)}
                    message={message}
                    handoff={handoff}
                    index={idx}
                  />
                ))
              )}
            </>
          )}
        </div>

        <CopilotNewMessagesPill count={pendingNewCount} onClick={onScrollToLatest} />
      </div>
    </section>
  );
}
