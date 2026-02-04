import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiEye, FiCopy } from 'react-icons/fi';
import { getAdminLeads, getLead, updateLeadNotes, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

const ALL_SLOT_IDS = [
  'MONDAY_7PM', 'TUESDAY_7PM', 'WEDNESDAY_7PM', 'THURSDAY_7PM',
  'FRIDAY_7PM', 'SATURDAY_7PM', 'SUNDAY_7PM', 'SUNDAY_11AM'
];

function formatSlotIdForDisplay(slotId) {
  if (!slotId || typeof slotId !== 'string') return slotId || '';
  const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM)$/i);
  if (match) {
    const dayNames = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' };
    return `${dayNames[match[1]] || match[1]} ${match[2]}`;
  }
  return slotId;
}

function formatSlotIdForDropdown(slotId) {
  if (!slotId || typeof slotId !== 'string') return slotId || '';
  const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM)$/i);
  if (match) {
    const dayNames = { MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday' };
    const time = match[2].replace(/(\d+)(AM|PM)/i, '$1 $2');
    return `${dayNames[match[1]] || match[1]} ${time}`;
  }
  return slotId;
}

function slotLabel(lead) {
  if (!lead.slotBooked) return 'No';
  const slot = formatSlotIdForDisplay(lead.selectedSlot) || lead.selectedSlot || '';
  const date = lead.slotDate ? formatDate(lead.slotDate) : '';
  return date ? `Yes – ${slot}, ${date}` : `Yes – ${slot}`;
}

export default function Leads() {
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(() => {
    const status = searchParams.get('applicationStatus') || '';
    const slot = searchParams.get('selectedSlot') || '';
    const utm = searchParams.get('utm_content') || '';
    return {
      applicationStatus: ['in_progress', 'registered', 'completed'].includes(status) ? status : '',
      otpVerified: '',
      slotBooked: '',
      selectedSlot: slot,
      utm_content: utm,
      q: '',
    };
  });
  const [searchInput, setSearchInput] = useState('');
  const [detailLead, setDetailLead] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailNotes, setDetailNotes] = useState('');
  const [detailSaving, setDetailSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);

  // Sync filters from URL when landing from quick links (e.g. /admin/leads?applicationStatus=in_progress)
  useEffect(() => {
    const status = searchParams.get('applicationStatus') || '';
    const slot = searchParams.get('selectedSlot') || '';
    const utm = searchParams.get('utm_content') || '';
    setFilters((prev) => ({
      ...prev,
      applicationStatus: ['in_progress', 'registered', 'completed'].includes(status) ? status : prev.applicationStatus,
      selectedSlot: slot || prev.selectedSlot,
      utm_content: utm || prev.utm_content,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchParams]);

  const openLeadDetail = (leadId) => {
    setDetailLead(null);
    setDetailNotes('');
    setDetailLoading(true);
    getLead(leadId, getStoredToken()).then((res) => {
      setDetailLoading(false);
      if (res.success && res.data?.data) {
        setDetailLead(res.data.data);
        setDetailNotes(res.data.data.adminNotes || '');
      }
    });
  };

  const closeLeadDetail = () => {
    setDetailLead(null);
    setDetailNotes('');
  };

  const saveLeadNotes = () => {
    if (!detailLead?.id || detailSaving) return;
    setDetailSaving(true);
    updateLeadNotes(detailLead.id, detailNotes, getStoredToken()).then((res) => {
      setDetailSaving(false);
      if (res.success && res.data?.data) {
        setDetailLead(res.data.data);
        setDetailNotes(res.data.data.adminNotes || '');
        setLeads((prev) =>
          prev.map((l) => (l.id === detailLead.id ? { ...l, adminNotes: res.data.data.adminNotes } : l))
        );
      }
    });
  };

  const copyPhone = (phone) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, q: searchInput }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;
    const page = pagination.page;
    const params = {
      page,
      limit: 50,
      ...(filters.applicationStatus && { applicationStatus: filters.applicationStatus }),
      ...(filters.otpVerified !== '' && filters.otpVerified !== undefined && { otpVerified: filters.otpVerified }),
      ...(filters.slotBooked !== '' && filters.slotBooked !== undefined && { slotBooked: filters.slotBooked }),
      ...(filters.selectedSlot && { selectedSlot: filters.selectedSlot }),
      ...(filters.utm_content && { utm_content: filters.utm_content }),
      ...(filters.q && { q: filters.q }),
    };
    const tick = queueMicrotask || ((fn) => setTimeout(fn, 0));
    tick(() => {
      if (!cancelledRef.current) {
        setLoading(true);
        setError('');
      }
    });
    getAdminLeads(params, getStoredToken()).then((result) => {
      if (cancelledRef.current) return;
      if (thisRequestId !== requestIdRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load leads');
        return;
      }
      setLeads(result.data.data || []);
      setPagination(result.data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
    });
    return () => {
      cancelledRef.current = true;
    };
  }, [pagination.page, filters.applicationStatus, filters.otpVerified, filters.slotBooked, filters.selectedSlot, filters.utm_content, filters.q, logout]);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="max-w-[1400px] mx-auto px-1">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 tracking-tight">Leads</h2>

      {/* Search & filters – stacked */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="space-y-3">
          <input
            type="search"
            placeholder="Search name, phone, email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm"
          />
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filters.applicationStatus}
              onChange={(e) => handleFilterChange('applicationStatus', e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 outline-none text-sm min-w-[120px]"
            >
              <option value="">All statuses</option>
              <option value="in_progress">In progress</option>
              <option value="registered">Registered</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filters.otpVerified}
              onChange={(e) => handleFilterChange('otpVerified', e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 outline-none text-sm min-w-[100px]"
            >
              <option value="">OTP: Any</option>
              <option value="true">OTP verified</option>
              <option value="false">OTP not verified</option>
            </select>
            <fieldset className="border border-gray-200 rounded-lg p-2 inline-flex items-center gap-4">
              <legend className="sr-only">Slot filter</legend>
              <span className="text-sm font-medium text-gray-700 mr-1" aria-hidden="true">Slot</span>
              {['', 'true', 'false'].map((val) => (
                <label key={val || 'any'} className="inline-flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                  <input
                    type="radio"
                    name="slotFilter"
                    value={val}
                    checked={filters.slotBooked === val}
                    onChange={() => handleFilterChange('slotBooked', val)}
                    className="text-primary-blue-500 border-gray-300 focus:ring-primary-blue-500"
                  />
                  {val === '' ? 'Any' : val === 'true' ? 'Booked' : 'Not booked'}
                </label>
              ))}
            </fieldset>
            <select
              value={filters.selectedSlot}
              onChange={(e) => handleFilterChange('selectedSlot', e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 outline-none text-sm min-w-[140px]"
              aria-label="Filter by specific slot"
            >
              <option value="">All slots</option>
              {ALL_SLOT_IDS.map((slotId) => (
                <option key={slotId} value={slotId}>
                  {formatSlotIdForDropdown(slotId)}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Influencer (utm_content)"
              value={filters.utm_content}
              onChange={(e) => handleFilterChange('utm_content', e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 outline-none text-sm min-w-[140px]"
              aria-label="Filter by influencer (utm_content)"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 py-2 px-3 bg-red-50 rounded-lg border border-red-100" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-sm">Loading leads…</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm mb-4">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Phone</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Occupation</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center">OTP</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center whitespace-nowrap">Slot</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center">Step</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Email</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Interest</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Influencer</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Platform</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider whitespace-nowrap">Created</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider whitespace-nowrap">Updated</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-3 py-8 text-center text-gray-500 text-sm">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, i) => (
                    <tr
                      key={lead.id}
                      className={`hover:bg-primary-blue-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
                    >
                      <td className="px-3 py-2 align-middle min-w-[120px] text-sm">{lead.fullName || '—'}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap text-sm">{lead.phone || '—'}</td>
                      <td className="px-3 py-2 align-middle min-w-[100px] text-sm">{lead.occupation || '—'}</td>
                      <td className="px-3 py-2 align-middle text-center text-sm">{lead.otpVerified ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2 align-middle text-center whitespace-nowrap text-gray-600 text-sm">{slotLabel(lead)}</td>
                      <td className="px-3 py-2 align-middle">
                        {lead.applicationStatus ? (
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            lead.applicationStatus === 'completed' ? 'bg-green-100 text-green-800' :
                            lead.applicationStatus === 'registered' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {lead.applicationStatus}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2 align-middle text-center text-gray-600 text-sm">{lead.currentStep ?? '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-600 max-w-[160px] truncate text-sm" title={lead.email || ''}>{lead.email || '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-600 text-sm">{lead.interestLevel || '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-600 text-sm">{lead.utm_content || '—'}</td>
                      <td className="px-3 py-2 align-middle text-gray-600 text-sm">{lead.utm_source || '—'}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap text-gray-600 text-xs">{formatDate(lead.createdAt)}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap text-gray-600 text-xs">{formatDate(lead.updatedAt)}</td>
                      <td className="px-3 py-2 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => openLeadDetail(lead.id)}
                          className="inline-flex items-center gap-1 text-primary-navy hover:underline text-sm font-medium"
                          aria-label={`View details for ${lead.fullName || 'lead'}`}
                        >
                          <FiEye className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Lead detail modal */}
          {(detailLoading || detailLead) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                {detailLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading…</div>
                ) : detailLead ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">Lead details</h3>
                      <button
                        type="button"
                        onClick={closeLeadDetail}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>
                    <div className="p-4 overflow-y-auto space-y-4 flex-1">
                      <dl className="grid grid-cols-1 gap-2 text-sm">
                        <div><dt className="text-gray-500">Name</dt><dd className="font-medium text-gray-900">{detailLead.fullName || '—'}</dd></div>
                        <div className="flex items-center gap-2">
                          <div><dt className="text-gray-500">Phone</dt><dd className="font-medium text-gray-900">{detailLead.phone || '—'}</dd></div>
                          {detailLead.phone && (
                            <button
                              type="button"
                              onClick={() => copyPhone(detailLead.phone)}
                              className="mt-4 inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs"
                            >
                              <FiCopy className="w-3.5 h-3.5" /> {copyFeedback ? 'Copied' : 'Copy'}
                            </button>
                          )}
                        </div>
                        <div><dt className="text-gray-500">Occupation</dt><dd className="text-gray-900">{detailLead.occupation || '—'}</dd></div>
                        <div><dt className="text-gray-500">Email</dt><dd className="text-gray-900">{detailLead.email || '—'}</dd></div>
                        <div><dt className="text-gray-500">Status</dt><dd><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${detailLead.applicationStatus === 'completed' ? 'bg-green-100 text-green-800' : detailLead.applicationStatus === 'registered' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{detailLead.applicationStatus || '—'}</span></dd></div>
                        <div><dt className="text-gray-500">Step</dt><dd className="text-gray-900">{detailLead.currentStep ?? '—'}</dd></div>
                        <div><dt className="text-gray-500">Slot</dt><dd className="text-gray-900">{slotLabel(detailLead)}</dd></div>
                        <div><dt className="text-gray-500">Interest</dt><dd className="text-gray-900">{detailLead.interestLevel ?? '—'}</dd></div>
                        <div><dt className="text-gray-500">Influencer (utm_content)</dt><dd className="text-gray-900">{detailLead.utm_content || '—'}</dd></div>
                        <div><dt className="text-gray-500">UTM Source</dt><dd className="text-gray-900">{detailLead.utm_source || '—'}</dd></div>
                        <div><dt className="text-gray-500">Created</dt><dd className="text-gray-900">{formatDate(detailLead.createdAt)}</dd></div>
                        <div><dt className="text-gray-500">Updated</dt><dd className="text-gray-900">{formatDate(detailLead.updatedAt)}</dd></div>
                      </dl>
                      <div>
                        <label htmlFor="lead-admin-notes" className="block text-sm font-medium text-gray-700 mb-1">Admin notes</label>
                        <textarea
                          id="lead-admin-notes"
                          value={detailNotes}
                          onChange={(e) => setDetailNotes(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm"
                          placeholder="Internal notes (e.g. follow-up, outcome)"
                        />
                        <button
                          type="button"
                          onClick={saveLeadNotes}
                          disabled={detailSaving}
                          className="mt-2 px-4 py-2 rounded-lg bg-primary-navy text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                        >
                          {detailSaving ? 'Saving…' : 'Save notes'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-1">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 min-w-[100px] text-center">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
