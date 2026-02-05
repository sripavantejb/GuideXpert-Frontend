import { useState, useEffect, useRef } from 'react';
import { getAdminLeads, updateLead, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

function formatSlotIdForDisplay(slotId) {
  if (!slotId || typeof slotId !== 'string') return slotId || '';
  const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM)$/i);
  if (match) {
    const dayNames = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' };
    return `${dayNames[match[1]] || match[1]} ${match[2]}`;
  }
  return slotId;
}

function slotLabel(lead) {
  if (!lead.slotBooked) return 'No';
  const slot = formatSlotIdForDisplay(lead.selectedSlot) || lead.selectedSlot || '';
  const date = lead.slotDate ? formatDate(lead.slotDate) : '';
  return date ? `Yes – ${slot}, ${date}` : `Yes – ${slot}`;
}

const LEAD_STATUS_OPTIONS = [
  { value: '', label: '—' },
  { value: 'Connected', label: 'Connected' },
  { value: 'Not Connected', label: 'Not Connected' },
  { value: 'Call Back Later', label: 'Call Back Later' },
  { value: 'Not Interested', label: 'Not Interested' },
  { value: 'Interested', label: 'Interested' },
];

/** Only pass through YYYY-MM-DD; otherwise return '' so we never send a wrong date. */
function normalizeSlotDateForApi(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : '';
}

export default function LeadStatus() {
  const { logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [slotDate, setSlotDate] = useState('');
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);
  const lastSavedDescriptionRef = useRef({});

  const slotDateNorm = normalizeSlotDateForApi(slotDate);
  const hasDate = Boolean(slotDateNorm);

  useEffect(() => {
    if (!hasDate) return;
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;
    const page = pagination.page;
    const tick = (fn) => { try { queueMicrotask(fn); } catch { setTimeout(fn, 0); } };
    tick(() => { setLoading(true); setError(''); });
    const params = { page, limit: 50, slotDate: slotDateNorm, slotBooked: 'true' };
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
      const data = result.data.data || [];
      setLeads(data);
      data.forEach((l) => {
        lastSavedDescriptionRef.current[l.id] = l.leadDescription ?? '';
      });
      setPagination(result.data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
    });
    return () => {
      cancelledRef.current = true;
    };
  }, [hasDate, pagination.page, slotDateNorm, logout]);

  const handleDateChange = (value) => {
    setSlotDate(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
    if (!normalizeSlotDateForApi(value)) {
      setLeads([]);
      setPagination({ page: 1, limit: 50, total: 0, totalPages: 1 });
    }
  };

  const clearFilters = () => {
    setSlotDate('');
    setLeads([]);
    setPagination({ page: 1, limit: 50, total: 0, totalPages: 1 });
  };

  const handleLeadStatusChange = (leadId, value) => {
    const previousLead = leads.find((l) => l.id === leadId);
    const previousStatus = previousLead?.leadStatus ?? '';
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, leadStatus: value || null } : l))
    );
    setError('');
    setSavingId(leadId);
    updateLead(leadId, { leadStatus: value || undefined }, getStoredToken()).then((res) => {
      setSavingId(null);
      if (res.success) {
        const updated = res.data?.data ?? res.data;
        if (updated) {
          setLeads((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, leadStatus: updated.leadStatus ?? null, leadDescription: updated.leadDescription ?? l.leadDescription } : l))
          );
        }
        setError('');
      } else {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, leadStatus: previousStatus || null } : l))
        );
        setError(res.message || 'Failed to save lead status. Please try again.');
      }
    });
  };

  const handleDescriptionBlur = (leadId, value) => {
    const lead = leads.find((l) => l.id === leadId);
    const lastSaved = lastSavedDescriptionRef.current[leadId] ?? lead?.leadDescription ?? '';
    if (!lead || String(value || '') === String(lastSaved)) return;
    const previousDescription = lead.leadDescription ?? '';
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, leadDescription: value ?? '' } : l))
    );
    setError('');
    setSavingId(leadId);
    updateLead(leadId, { leadDescription: value ?? '' }, getStoredToken()).then((res) => {
      setSavingId(null);
      if (res.success) {
        const updated = res.data?.data ?? res.data;
        if (updated) {
          setLeads((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, leadDescription: updated.leadDescription ?? l.leadDescription } : l))
          );
          lastSavedDescriptionRef.current[leadId] = updated.leadDescription ?? '';
        }
        setError('');
      } else {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, leadDescription: previousDescription } : l))
        );
        setError(res.message || 'Failed to save lead status. Please try again.');
      }
    });
  };

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  return (
    <div className="max-w-[1400px] mx-auto px-1">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 tracking-tight">Lead Status</h2>
      <p className="text-sm text-gray-600 mb-4">
        Update lead status and description for each lead. Changes are saved automatically.
      </p>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Slot date</label>
          <input
            type="date"
            value={slotDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm min-w-[140px]"
            aria-label="Filter by slot date"
          />
          {hasDate && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm mb-4">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Name</th>
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Phone</th>
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Occupation</th>
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center whitespace-nowrap">Slot</th>
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Email</th>
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Lead Status</th>
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!hasDate ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500 text-sm">
                  Select a date to see available slots and leads.
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500 text-sm">
                  Loading leads…
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500 text-sm">
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
                  <td className="px-3 py-2 align-middle text-gray-600 max-w-[160px] truncate text-sm" title={lead.email || ''}>{lead.email || '—'}</td>
                  <td className="px-3 py-2 align-middle">
                    <select
                      value={lead.leadStatus || ''}
                      onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                      disabled={savingId === lead.id}
                      className="w-full min-w-[140px] rounded border border-gray-300 px-2 py-1.5 text-sm bg-white focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy disabled:opacity-60"
                      aria-label={`Lead status for ${lead.fullName || 'lead'}`}
                    >
                      {LEAD_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value || 'empty'} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {savingId === lead.id && (
                      <span className="ml-1 text-xs text-gray-500">Saving…</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle min-w-[180px]">
                    <input
                      type="text"
                      value={lead.leadDescription || ''}
                      onChange={(e) => setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, leadDescription: e.target.value } : l)))}
                      onBlur={(e) => handleDescriptionBlur(lead.id, e.target.value)}
                      placeholder="Add description…"
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
                      aria-label={`Description for ${lead.fullName || 'lead'}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
