import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchHandoffMessages } from '../../../utils/humanCopilotApi';
import {
  isScrollPinnedToBottom,
  mergeTranscriptMessages,
  scrollElementToBottom,
} from './copilotUtils';

const INITIAL_LIMIT = 50;
const POLL_MS = 30000;

export function useCopilotTranscript(handoffId, { pollMs = POLL_MS } = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [pendingNewCount, setPendingNewCount] = useState(0);
  const [error, setError] = useState('');
  const oldestCursorRef = useRef(null);
  const newestCursorRef = useRef(null);
  const scrollRef = useRef(null);
  const pinnedRef = useRef(true);
  const loadOlderLockRef = useRef(false);

  const updatePinned = useCallback(() => {
    pinnedRef.current = isScrollPinnedToBottom(scrollRef.current);
    if (pinnedRef.current) {
      setPendingNewCount(0);
    }
  }, []);

  const scrollToLatest = useCallback(() => {
    scrollElementToBottom(scrollRef.current);
    pinnedRef.current = true;
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

  const loadInitial = useCallback(async (id) => {
    if (!id) {
      setMessages([]);
      setHasMoreOlder(false);
      setPendingNewCount(0);
      oldestCursorRef.current = null;
      newestCursorRef.current = null;
      return;
    }
    setLoading(true);
    setError('');
    const result = await fetchHandoffMessages(id, { limit: INITIAL_LIMIT });
    setLoading(false);
    if (!applyPage(result, { mode: 'replace' })) return;
    pinnedRef.current = true;
    requestAnimationFrame(() => scrollToLatest());
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

  const refreshLatest = useCallback(async () => {
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
    setMessages((prev) => mergeTranscriptMessages(prev, result.messages));

    if (pinnedRef.current) {
      requestAnimationFrame(() => scrollToLatest());
    } else {
      setPendingNewCount((n) => n + newCount);
    }
  }, [applyPage, handoffId, scrollToLatest]);

  useEffect(() => {
    loadInitial(handoffId);
  }, [handoffId, loadInitial]);

  useEffect(() => {
    if (!handoffId) return undefined;
    const timer = setInterval(() => {
      refreshLatest();
    }, pollMs);
    return () => clearInterval(timer);
  }, [handoffId, pollMs, refreshLatest]);

  return {
    messages,
    loading,
    loadingOlder,
    hasMoreOlder,
    pendingNewCount,
    error,
    scrollRef,
    scrollToLatest,
    loadOlder,
    updatePinned,
    refreshLatest,
  };
}
