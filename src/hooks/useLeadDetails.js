import { useCallback, useEffect, useRef, useState } from 'react';
import { getLeadDetails, normalizeLeadInsightsResponse } from '../services/leadInsightsService';

export function useLeadDetails(phone) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const clear = useCallback(() => {
    requestIdRef.current += 1;
    setDetails(null);
    setLoading(false);
    setError('');
  }, []);

  const load = useCallback(async () => {
    const phone10 = String(phone || '').trim();
    if (!/^\d{10}$/.test(phone10)) {
      setDetails(null);
      setLoading(false);
      setError('');
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');

    const result = normalizeLeadInsightsResponse(await getLeadDetails(phone10));
    if (requestId !== requestIdRef.current) return;

    if (!result.ok) {
      setDetails(null);
      setError(result.message || 'Failed to load lead details');
      setLoading(false);
      return;
    }

    setDetails(result.data);
    setLoading(false);
  }, [phone]);

  useEffect(() => {
    if (!phone) {
      clear();
      return;
    }
    load();
  }, [phone, load, clear]);

  return {
    details,
    loading,
    error,
    retry: load,
    clear,
  };
}
