import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchHandoffMessages } from '../../../utils/humanCopilotApi';
import {
  isScrollPinnedToBottom,
  mergeTranscriptMessages,
  normalizeMessageKey,
  scrollElementToBottom,
} from './copilotUtils';

const INITIAL_LIMIT = 50;
const POLL_MS = 30000;

export function useCopilotTranscript(handoffId, { pollMs = POLL_MS } = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [pendingNewCount, setPendingNewCount] = useState(0);
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);
  const [error, setError] = useState('');
  const oldestCursorRef = useRef(null);
  const newestCursorRef = useRef(null);
  const scrollRef = useRef(null);
  const pinnedRef = useRef(true);
  const loadOlderLockRef = useRef(false);
  const initialLoadDoneRef = useRef('');

  const updatePinned = useCallback(() => {
    const pinned = isScrollPinnedToBottom(scrollRef.current);
    pinnedRef.current = pinned;
    setIsPinnedToBottom(pinned);
    if (pinned) {
      setPendingNewCount(0);
    }
  }, []);

  const scrollToLatest = useCallback(({ smooth = false } = {}) => {
    scrollElementToBottom(scrollRef.current, { smooth });
    pinnedRef.current = true;
    setIsPinnedToBottom(true);
    setPendingNewCount(0);
  }, []);

  const applyPage = useCallback((result, { mode = 'replace' } = {}) => {
    if (!result.success) {
      setError(result.message || 'Failed to load messages');
      return false;
    }
    setError('');
    oldestCursorRef.current = result.oldestCursor;
    newestCursorRef.current = result.newestCursor;
    setHasMoreOlder(Boolean(result.hasMoreOlder));

    if (mode === 'prepend') {
      setMessages((prev) => mergeTranscriptMessages(result.messages, prev));
      return true;
    }
    if (mode === 'append') {
      setMessages((prev) => mergeTranscriptMessages(prev, result.messages));
      return true;
    }
    setMessages(result.messages || []);
    return true;
  }, []);

  const loadInitial = useCallback(async (id, { silent = false } = {}) => {
    if (!id) {
      setMessages([]);
      setHasMoreOlder(false);
      setPendingNewCount(0);
      setIsPinnedToBottom(true);
      setIsInitialLoad(false);
      initialLoadDoneRef.current = '';
      oldestCursorRef.current = null;
      newestCursorRef.current = null;
      return;
    }

    const showLoading = !silent && initialLoadDoneRef.current !== id;
    if (showLoading) {
      setIsInitialLoad(true);
      setLoading(true);
    }
    setError('');
    const result = await fetchHandoffMessages(id, { limit: INITIAL_LIMIT });
    if (showLoading) {
      setLoading(false);
      setIsInitialLoad(false);
    }
    initialLoadDoneRef.current = id;
    if (!applyPage(result, { mode: 'replace' })) return;
    pinnedRef.current = true;
    if (!silent) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToLatest());
      });
    }
  }, [applyPage, scrollToLatest]);

  const loadOlder = useCallback(async () => {
    const id = handoffId;
    const cursor = oldestCursorRef.current;
    if (!id || !cursor || !hasMoreOlder || loadOlderLockRef.current) return;

    loadOlderLockRef.current = true;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight || 0;

    const result = await fetchHandoffMessages(id, {
      limit: INITIAL_LIMIT,
      before: cursor.at,
      beforeId: cursor.id,
    });
    setLoadingOlder(false);
    loadOlderLockRef.current = false;

    if (!result.success) {
      setError(result.message || 'Failed to load older messages');
      return;
    }

    applyPage(result, { mode: 'prepend' });
    oldestCursorRef.current = result.oldestCursor;
    newestCursorRef.current = newestCursorRef.current || result.newestCursor;
    setHasMoreOlder(Boolean(result.hasMoreOlder));

    requestAnimationFrame(() => {
      if (!el) return;
      el.scrollTop = el.scrollHeight - prevHeight;
    });
  }, [applyPage, handoffId, hasMoreOlder]);

  const refreshLatest = useCallback(async ({ silent = true } = {}) => {
    const id = handoffId;
    const cursor = newestCursorRef.current;
    if (!id) return;

    const result = cursor
      ? await fetchHandoffMessages(id, {
          limit: INITIAL_LIMIT,
          after: cursor.at,
          afterId: cursor.id,
        })
      : await fetchHandoffMessages(id, { limit: INITIAL_LIMIT });

    if (!result.success) return;

    if (!cursor) {
      applyPage(result, { mode: 'replace' });
      if (pinnedRef.current) requestAnimationFrame(() => scrollToLatest());
      return;
    }

    const newCount = (result.messages || []).length;
    if (!newCount) return;

    newestCursorRef.current = result.newestCursor || newestCursorRef.current;
    setMessages((prev) => {
      const withoutOptimistic = prev.filter((m) => !m.optimistic);
      return mergeTranscriptMessages(withoutOptimistic, result.messages);
    });

    if (pinnedRef.current) {
      requestAnimationFrame(() => scrollToLatest());
    } else if (!silent) {
      setPendingNewCount((n) => n + newCount);
    } else {
      setPendingNewCount((n) => n + newCount);
    }
  }, [applyPage, handoffId, scrollToLatest]);

  const addOptimisticMessage = useCallback((text, { senderName = 'You' } = {}) => {
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      optimistic: true,
      at: new Date().toISOString(),
      text,
      direction: 'out',
      senderType: 'agent',
      senderName,
    };
    setMessages((prev) => mergeTranscriptMessages(prev, [optimistic]));
    requestAnimationFrame(() => scrollToLatest({ smooth: true }));
    return optimistic.id;
  }, [scrollToLatest]);

  const removeOptimisticMessage = useCallback((id) => {
    if (!id) return;
    setMessages((prev) => prev.filter((m) => normalizeMessageKey(m) !== String(id)));
  }, []);

  useEffect(() => {
    loadInitial(handoffId);
  }, [handoffId, loadInitial]);

  useEffect(() => {
    if (!handoffId) return undefined;
    const timer = setInterval(() => {
      refreshLatest({ silent: true });
    }, pollMs);
    return () => clearInterval(timer);
  }, [handoffId, pollMs, refreshLatest]);

  return {
    messages,
    loading,
    isInitialLoad,
    loadingOlder,
    hasMoreOlder,
    pendingNewCount,
    isPinnedToBottom,
    error,
    scrollRef,
    scrollToLatest,
    loadOlder,
    updatePinned,
    refreshLatest,
    addOptimisticMessage,
    removeOptimisticMessage,
  };
}
