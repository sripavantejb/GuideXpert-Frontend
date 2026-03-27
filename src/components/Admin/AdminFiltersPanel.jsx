import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { FiX, FiSliders, FiExternalLink } from 'react-icons/fi';
import { useAdminDateRange } from '../../contexts/AdminDashboardContext';
import {
  ALL_SLOT_IDS,
  ALLOWED_APPLICATION_STATUSES,
  leadListFiltersToSearchParams,
} from '../../utils/adminLeadFiltersShared';

const STATUS_LABELS = { in_progress: 'In progress', registered: 'Registered', completed: 'Completed' };

function formatSlotIdForDropdown(slotId) {
  if (!slotId || typeof slotId !== 'string') return slotId || '';
  const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM|6PM)$/i);
  if (match) {
    const dayNames = { MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday' };
    const time = match[2].replace(/(\d+)(AM|PM)/i, '$1 $2');
    return `${dayNames[match[1]] || match[1]} ${time}`;
  }
  return slotId;
}

function formatRangeSummary(from, to) {
  if (!from && !to) return 'No range';
  try {
    const a = from ? new Date(from + 'T12:00:00') : null;
    const b = to ? new Date(to + 'T12:00:00') : null;
    const f = (d) => (d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '…');
    return `${f(a)} – ${f(b)}`;
  } catch {
    return `${from || '…'} – ${to || '…'}`;
  }
}

export default function AdminFiltersPanel({ open, onClose }) {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const {
    dateRange,
    setFrom,
    setTo,
    resetRange,
    applyPreset,
    leadListFilters,
    setLeadListFilters,
  } = useAdminDateRange();

  const [searchDraft, setSearchDraft] = useState(leadListFilters.q || '');

  useEffect(() => {
    setSearchDraft(leadListFilters.q || '');
  }, [leadListFilters.q]);

  const commitLeadFilters = (next) => {
    setLeadListFilters(next);
    if (location.pathname === '/admin/leads') {
      setSearchParams(leadListFiltersToSearchParams(next), { replace: true });
    }
  };

  const patchLead = (partial) => {
    const next = { ...leadListFilters, ...partial };
    commitLeadFilters(next);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setLeadListFilters((prev) => {
        if ((prev.q || '') === searchDraft) return prev;
        const next = { ...prev, q: searchDraft };
        if (location.pathname === '/admin/leads') {
          setSearchParams(leadListFiltersToSearchParams(next), { replace: true });
        }
        return next;
      });
    }, 350);
    return () => clearTimeout(t);
  }, [searchDraft, location.pathname, setLeadListFilters, setSearchParams]);

  const exportQuery = () => {
    const sp = new URLSearchParams();
    if (dateRange.from) sp.set('from', dateRange.from);
    if (dateRange.to) sp.set('to', dateRange.to);
    if (leadListFilters.selectedSlot) sp.set('slot', leadListFilters.selectedSlot);
    if (leadListFilters.utm_content) sp.set('utm', leadListFilters.utm_content);
    const q = sp.toString();
    return q ? `?${q}` : '';
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/20 lg:bg-transparent"
        aria-label="Close filters"
        onClick={onClose}
      />
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-md shadow-xl border-l border-gray-200 bg-white flex flex-col"
        aria-label="Filters"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date range</h3>
            <p className="text-sm text-gray-600">{formatRangeSummary(dateRange.from, dateRange.to)}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="panel-date-from" className="block text-xs font-medium text-gray-500 mb-1">From</label>
                <input
                  id="panel-date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-gray-300 text-sm"
                />
              </div>
              <div>
                <label htmlFor="panel-date-to" className="block text-xs font-medium text-gray-500 mb-1">To</label>
                <input
                  id="panel-date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-gray-300 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => applyPreset('7d')} className="h-8 px-2.5 rounded-lg border border-gray-300 text-xs font-medium hover:bg-gray-50">7d</button>
              <button type="button" onClick={() => applyPreset('30d')} className="h-8 px-2.5 rounded-lg border border-gray-300 text-xs font-medium hover:bg-gray-50">30d</button>
              <button type="button" onClick={() => applyPreset('month')} className="h-8 px-2.5 rounded-lg border border-gray-300 text-xs font-medium hover:bg-gray-50">Month</button>
              <button type="button" onClick={() => resetRange()} className="h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">Reset range</button>
            </div>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead list</h3>
            <p className="text-xs text-gray-500">Applies to the Lead Funnel table and export. Dashboard stats use the date range above.</p>
            <div>
              <label htmlFor="panel-lead-search" className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <input
                id="panel-lead-search"
                type="search"
                placeholder="Name, phone, email…"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="panel-status" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                id="panel-status"
                value={leadListFilters.applicationStatus}
                onChange={(e) => patchLead({ applicationStatus: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">All statuses</option>
                {ALLOWED_APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="panel-otp" className="block text-xs font-medium text-gray-500 mb-1">OTP</label>
              <select
                id="panel-otp"
                value={leadListFilters.otpVerified}
                onChange={(e) => patchLead({ otpVerified: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">Any</option>
                <option value="true">Verified</option>
                <option value="false">Not verified</option>
              </select>
            </div>
            <fieldset className="border border-gray-200 rounded-lg p-3 space-y-2">
              <legend className="text-xs font-medium text-gray-600 px-1">Slot booked</legend>
              <div className="flex flex-wrap gap-3">
                {['', 'true', 'false'].map((val) => (
                  <label key={val || 'any'} className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="panel-slot-booked"
                      checked={leadListFilters.slotBooked === val}
                      onChange={() => patchLead({ slotBooked: val })}
                    />
                    {val === '' ? 'Any' : val === 'true' ? 'Booked' : 'Not booked'}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="panel-slot-id" className="block text-xs font-medium text-gray-500 mb-1">Slot (optional)</label>
              <select
                id="panel-slot-id"
                value={leadListFilters.selectedSlot}
                onChange={(e) => patchLead({ selectedSlot: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">All slots</option>
                {ALL_SLOT_IDS.map((id) => (
                  <option key={id} value={id}>{formatSlotIdForDropdown(id)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="panel-slot-date" className="block text-xs font-medium text-gray-500 mb-1">Slot date</label>
              <input
                id="panel-slot-date"
                type="date"
                value={leadListFilters.slotDate}
                onChange={(e) => patchLead({ slotDate: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="panel-utm" className="block text-xs font-medium text-gray-500 mb-1">Influencer (utm_content)</label>
              <input
                id="panel-utm"
                type="text"
                value={leadListFilters.utm_content}
                onChange={(e) => patchLead({ utm_content: e.target.value })}
                placeholder="utm_content"
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const cleared = { applicationStatus: '', otpVerified: '', slotBooked: '', selectedSlot: '', slotDate: '', utm_content: '', q: '' };
                setSearchDraft('');
                commitLeadFilters({ ...leadListFilters, ...cleared, q: '' });
              }}
              className="text-sm text-primary-navy font-medium hover:underline"
            >
              Clear lead filters
            </button>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick actions</h3>
            <Link
              to={`/admin/export${exportQuery()}`}
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-navy hover:underline"
            >
              <FiExternalLink className="w-4 h-4" /> Export with current dates &amp; slot/UTM
            </Link>
            <Link
              to={`/admin/leads?${leadListFiltersToSearchParams(leadListFilters)}`}
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm text-gray-700 hover:underline"
            >
              Open Lead Funnel with these filters
            </Link>
          </section>
        </div>
      </aside>
    </>
  );
}

export function AdminFiltersTriggerButton({ onClick, activeCount }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <FiSliders className="w-4 h-4" aria-hidden />
      <span className="hidden sm:inline">Filters</span>
      {activeCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-primary-navy text-white text-[0.625rem] font-bold flex items-center justify-center">
          {activeCount > 99 ? '99+' : activeCount}
        </span>
      )}
    </button>
  );
}
