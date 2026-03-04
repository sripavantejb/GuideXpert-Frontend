import { createContext, useContext, useState, useCallback } from 'react';

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

const AdminDashboardContext = createContext(null);

export function AdminDashboardProvider({ children }) {
  const [dateRange, setDateRange] = useState(defaultRange);

  const setFrom = useCallback((from) => {
    setDateRange((prev) => ({ ...prev, from: from || '' }));
  }, []);
  const setTo = useCallback((to) => {
    setDateRange((prev) => ({ ...prev, to: to || '' }));
  }, []);
  const resetRange = useCallback(() => setDateRange(defaultRange()), []);

  const applyPreset = useCallback((preset) => {
    const to = new Date();
    const from = new Date();
    if (preset === '7d') from.setDate(from.getDate() - 7);
    else if (preset === '30d') from.setDate(from.getDate() - 30);
    else if (preset === 'month') {
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
    }
    setDateRange({
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    });
  }, []);

  return (
    <AdminDashboardContext.Provider
      value={{
        dateRange,
        setDateRange,
        setFrom,
        setTo,
        resetRange,
        applyPreset,
      }}
    >
      {children}
    </AdminDashboardContext.Provider>
  );
}

export function useAdminDateRange() {
  const ctx = useContext(AdminDashboardContext);
  if (!ctx) return { dateRange: defaultRange(), setDateRange: () => {}, setFrom: () => {}, setTo: () => {}, resetRange: () => {}, applyPreset: () => {} };
  return ctx;
}
