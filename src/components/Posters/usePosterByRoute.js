/* eslint-disable react-hooks/set-state-in-effect -- route-driven poster fetch; state mirrors async GET result */
import { useState, useEffect } from 'react';
import { getPosterByRoute } from '../../utils/api';

/** Simple in-memory cache so revisiting the same route does not refetch immediately. */
const cache = new Map();

/** Call after admin creates/updates/deletes a poster so clients pick up changes. */
export function clearPosterRouteCache(route) {
  if (route != null) cache.delete(String(route));
  else cache.clear();
}

/**
 * @param {string} route — pathname, e.g. from `useLocation().pathname`
 * @param {boolean} [enabled]
 */
export function usePosterByRoute(route, enabled = true) {
  const [poster, setPoster] = useState(() => (enabled && route ? (cache.get(route) ?? null) : null));
  const [loading, setLoading] = useState(() => {
    if (!enabled || !route) return false;
    return !cache.has(route);
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !route) {
      setPoster(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (cache.has(route)) {
      setPoster(cache.get(route));
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setPoster(null);
    setLoading(true);
    setError(null);

    (async () => {
      const res = await getPosterByRoute(route);
      if (cancelled) return;
      if (res.success && res.data?.poster) {
        cache.set(route, res.data.poster);
        setPoster(res.data.poster);
        setError(null);
      } else {
        setPoster(null);
        if (!res.success && res.status !== 404) {
          setError(res.message || 'Failed to load poster');
        }
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [route, enabled]);

  return { poster, loading, error };
}
