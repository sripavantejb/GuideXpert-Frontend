import { useCallback, useEffect, useRef, useState } from 'react';
import { getLeadStats, normalizeLeadInsightsResponse } from '../services/leadInsightsService';

export function useLeadStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');

    const result = normalizeLeadInsightsResponse(await getLeadStats());
    if (requestId !== requestIdRef.current) return;

    if (!result.ok) {
      setStats(null);
      setError(result.message || 'Failed to load lead stats');
      setLoading(false);
      return;
    }

    setStats(result.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    stats,
    loading,
    error,
    retry: load,
  };
}
