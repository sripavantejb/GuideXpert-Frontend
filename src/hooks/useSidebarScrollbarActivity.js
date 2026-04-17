import { useCallback, useEffect, useRef, useState } from 'react';

const HIDE_DELAY_MS = 900;

/**
 * Briefly marks the sidebar as "scrolling" so scrollbar thumb can match iOS-style
 * show-while-scrolling behavior (paired with .sidebar-nav-scroll--active in CSS).
 */
export function useSidebarScrollbarActivity() {
  const [active, setActive] = useState(false);
  const hideTimerRef = useRef(null);

  const onScroll = useCallback(() => {
    setActive(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setActive(false);
      hideTimerRef.current = null;
    }, HIDE_DELAY_MS);
  }, []);

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    []
  );

  return { onScroll, active };
}
