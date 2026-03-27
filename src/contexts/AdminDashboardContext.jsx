import { createContext, useContext, useState, useCallback } from 'react';
import { defaultLeadListFilters } from '../utils/adminLeadFiltersShared';

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

function emptyLeadFilters() {
  return defaultLeadListFilters();
}

export function AdminDashboardProvider({ children }) {
  const [dateRange, setDateRange] = useState(defaultRange);
  const [leadListFilters, setLeadListFiltersState] = useState(emptyLeadFilters);

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

  const setLeadListFilters = useCallback((next) => {
    if (typeof next === 'function') {
      setLeadListFiltersState((p) => next(p));
    } else if (next && typeof next === 'object') {
      setLeadListFiltersState(next);
    } else {
      setLeadListFiltersState(emptyLeadFilters());
    }
  }, []);

  const patchLeadListFilters = useCallback((partial) => {
    setLeadListFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetLeadListFilters = useCallback(() => {
    setLeadListFiltersState(emptyLeadFilters());
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
        leadListFilters,
        setLeadListFilters,
        patchLeadListFilters,
        resetLeadListFilters,
      }}
    >
      {children}
    </AdminDashboardContext.Provider>
  );
}

const dateFallback = {
  dateRange: defaultRange(),
  setDateRange: () => {},
  setFrom: () => {},
  setTo: () => {},
  resetRange: () => {},
  applyPreset: () => {},
  leadListFilters: emptyLeadFilters(),
  setLeadListFilters: () => {},
  patchLeadListFilters: () => {},
  resetLeadListFilters: () => {},
};

export function useAdminDateRange() {
  const ctx = useContext(AdminDashboardContext);
  if (!ctx) return dateFallback;
  return ctx;
}

export function useAdminDashboard() {
  return useAdminDateRange();
}
