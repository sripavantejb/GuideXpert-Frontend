import { useCallback, useEffect, useRef, useState } from 'react';
import { getHotLeads, normalizeLeadInsightsResponse } from '../services/leadInsightsService';

export function useHotLeads() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');

    const result = normalizeLeadInsightsResponse(await getHotLeads());
    if (requestId !== requestIdRef.current) return;

    if (!result.ok) {
      setItems([]);
      setError(result.message || 'Failed to load hot leads');
      setLoading(false);
      return;
    }

    setItems(Array.isArray(result.data?.items) ? result.data.items : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    loading,
    error,
    retry: load,
  };
}
