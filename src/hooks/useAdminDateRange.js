import { useContext } from 'react';
import { AdminDashboardContext } from '../contexts/AdminDashboardContext';
import { defaultLeadListFilters } from '../utils/adminLeadFiltersShared';

function defaultRange() {
  return { from: '', to: '' };
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
