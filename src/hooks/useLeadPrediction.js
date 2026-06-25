import { useCallback, useEffect, useRef, useState } from 'react';
import { getLeadPrediction, getStoredToken } from '../utils/adminApi';

export function useLeadPrediction(phone, { enabled = true } = {}) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (force = false) => {
      const phone10 = String(phone || '').trim();
      if (!enabled || !/^\d{10}$/.test(phone10)) {
        setPrediction(null);
        setLoading(false);
        setError('');
        return;
      }

      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError('');

      const token = getStoredToken();
      const res = await getLeadPrediction(phone10, { force }, token);
      if (requestId !== requestIdRef.current) return;

      if (!res.success) {
        setPrediction(null);
        setError(res.message || 'Failed to load prediction');
        setLoading(false);
        return;
      }

      const data = res.data?.data || res.data;
      setPrediction(data?.prediction || data);
      setLoading(false);
    },
    [phone, enabled]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  return {
    prediction,
    loading,
    error,
    retry: () => load(false),
    refresh: () => load(true),
  };
}
