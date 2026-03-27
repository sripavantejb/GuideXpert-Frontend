import { useContext } from 'react';
import { AdminDashboardContext } from '../contexts/AdminDashboardContext';
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

const dateFallback = {
  dateRange: defaultRange(),
  setDateRange: () => {},
  setFrom: () => {},
  setTo: () => {},
  resetRange: () => {},
  applyPreset: () => {},
  leadListFilters: defaultLeadListFilters(),
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
