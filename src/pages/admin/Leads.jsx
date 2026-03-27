import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiEye, FiCopy } from 'react-icons/fi';
import { getAdminLeads, getLead, updateLeadNotes, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminDateRange } from '../../contexts/AdminDashboardContext';
import TableSkeleton from '../../components/UI/TableSkeleton';
import { ContentSkeleton } from '../../components/UI/Skeleton';
import { dedupeByPhone } from '../../components/Admin/CopyToSheetsModal';
import {
  ALL_SLOT_IDS,
  leadListFiltersFromSearchParams,
  leadListFiltersToSearchParams,
  leadListFiltersToApiParams,
} from '../../utils/adminLeadFiltersShared';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

function formatSlotIdForDisplay(slotId) {
  if (!slotId || typeof slotId !== 'string') return slotId || '';
  const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM|6PM)$/i);
  if (match) {
    const dayNames = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' };
    return `${dayNames[match[1]] || match[1]} ${match[2]}`;
  }
  return slotId;
}

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

function slotLabel(lead) {
  if (!lead.slotBooked) return 'No';
  const slot = formatSlotIdForDisplay(lead.selectedSlot) || lead.selectedSlot || '';
  const date = lead.slotDate ? formatDate(lead.slotDate) : '';
  return date ? `Yes – ${slot}, ${date}` : `Yes – ${slot}`;
}

const COPY_FIELDS = [
  { key: 'fullName', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'otpVerified', label: 'OTP Verified' },
  { key: 'slotBooked', label: 'Slot Booked' },
  { key: 'selectedSlot', label: 'Selected Slot' },
  { key: 'slotDate', label: 'Slot Date' },
  { key: 'applicationStatus', label: 'Status' },
  { key: 'currentStep', label: 'Step' },
  { key: 'email', label: 'Email' },
  { key: 'interestLevel', label: 'Interest' },
  { key: 'utm_content', label: 'Influencer' },
  { key: 'utm_source', label: 'Platform' },
  { key: 'utm_medium', label: 'UTM Medium' },
  { key: 'utm_campaign', label: 'UTM Campaign' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' },
  { key: 'adminNotes', label: 'Admin Notes' },
  { key: 'leadStatus', label: 'Lead Status' },
  { key: 'leadDescription', label: 'Lead Description' },
];

function escapeTsvCell(val) {
  if (val == null) return '';
  const s = String(val);
  if (/[\t\n"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function getLeadCellValue(lead, key) {
  const v = lead[key];
  if (key === 'otpVerified') return v ? 'Yes' : 'No';
  if (key === 'slotBooked') return v ? 'Yes' : 'No';
  if (key === 'selectedSlot') return v ? formatSlotIdForDisplay(v) : '';
  if (key === 'slotDate') return v ? formatDate(v) : '';
  if (key === 'createdAt' || key === 'updatedAt') return v ? formatDate(v) : '';
  if (v == null || v === '') return '';
  return String(v);
}

function buildTsv(leads, selectedKeys) {
  const keys = selectedKeys.filter((k) => COPY_FIELDS.some((f) => f.key === k));
  const labels = keys.map((k) => COPY_FIELDS.find((f) => f.key === k).label);
  const header = labels.join('\t');
  const rows = leads.map((lead) => keys.map((k) => escapeTsvCell(getLeadCellValue(lead, k))).join('\t'));
  return [header, ...rows].join('\n');
}

export default function Leads() {
  const { logout } = useAuth();
  const { dateRange, leadListFilters, setLeadListFilters } = useAdminDateRange();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchDraft, setSearchDraft] = useState(() => leadListFilters.q || '');
  const [detailLead, setDetailLead] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailNotes, setDetailNotes] = useState('');
  const [detailSaving, setDetailSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copySelectedFields, setCopySelectedFields] = useState(() => COPY_FIELDS.map((f) => f.key));
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);

  const [viewAll, setViewAll] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- apply /admin/leads query string to context + UI */
  useEffect(() => {
    const raw = searchParams.toString();
    if (!raw) return;
    const parsed = leadListFiltersFromSearchParams(searchParams);
    setLeadListFilters(parsed);
    setSearchDraft(parsed.q || '');
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchParams, setLeadListFilters]);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  /* eslint-disable react-hooks/set-state-in-effect -- mirror panel search q into local draft when field not focused */
  useEffect(() => {
    const el = searchInputRef.current;
    if (el && document.activeElement === el) return;
    setSearchDraft(leadListFilters.q || '');
  }, [leadListFilters.q]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const t = setTimeout(() => {
      setLeadListFilters((prev) => {
        if ((prev.q || '') === searchDraft) return prev;
        const next = { ...prev, q: searchDraft };
        setSearchParams(leadListFiltersToSearchParams(next), { replace: true });
        setPagination((p) => ({ ...p, page: 1 }));
        return next;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchDraft, setLeadListFilters, setSearchParams]);

  useEffect(() => {
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;
    const page = viewAll ? 1 : pagination.page;
    const limit = viewAll ? 5000 : 50;
    const params = {
      page,
      limit,
      ...(dateRange.from && { from: dateRange.from }),
      ...(dateRange.to && { to: dateRange.to }),
      ...leadListFiltersToApiParams(leadListFilters),
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
  }, [viewAll, pagination.page, dateRange.from, dateRange.to, leadListFilters, logout]);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  return (
    <div className="max-w-[1400px] mx-auto px-1">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 tracking-tight">Leads</h2>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
        <p className="text-sm text-gray-600 mb-3">
          Date range and lead filters (status, OTP, slot, influencer, etc.) are in <strong className="font-medium text-gray-800">Filters</strong> in the header. Search below updates the same query as the panel.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search name, phone, email…"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            className="flex-1 min-w-[200px] h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm"
          />
          <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={viewAll}
              onChange={(e) => {
                setViewAll(e.target.checked);
                if (!e.target.checked) setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="rounded border-gray-300 text-primary-blue-500 focus:ring-primary-blue-500"
              aria-label="View all leads in one list"
            />
            View all
          </label>
          <button
            type="button"
            onClick={() => {
              setCopyModalOpen(true);
              setCopySelectedFields(COPY_FIELDS.map((f) => f.key));
              setCopyFeedback(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Copy to sheets"
          >
            <FiCopy className="w-4 h-4" /> Copy
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 py-2 px-3 bg-red-50 rounded-lg border border-red-100" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <TableSkeleton rows={8} cols={14} />
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
                  <div className="p-6"><ContentSkeleton lines={5} /></div>
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

          {/* Copy to sheets modal */}
          {copyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog" aria-labelledby="copy-modal-title">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 id="copy-modal-title" className="font-semibold text-gray-800">Copy to sheets</h3>
                  <button
                    type="button"
                    onClick={() => setCopyModalOpen(false)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  {(() => {
                    const leadsToCopy = dedupeByPhone(leads, 'phone');
                    const duplicateRemoved = leads.length !== leadsToCopy.length;
                    return (
                  <p className="text-sm text-gray-600 mb-4">
                    {leadsToCopy.length === 0
                      ? 'No data to copy. Load leads with the current filters first.'
                      : duplicateRemoved
                        ? `Choose columns to include. Data will be copied for ${leadsToCopy.length} unique lead${leadsToCopy.length === 1 ? '' : 's'} (duplicates by phone removed).`
                        : `Choose columns to include. Data will be copied for the ${leadsToCopy.length} lead${leadsToCopy.length === 1 ? '' : 's'} currently shown.`}
                  </p>
                    );
                  })()}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={copySelectedFields.length === COPY_FIELDS.length}
                        ref={(el) => {
                          if (el) el.indeterminate = copySelectedFields.length > 0 && copySelectedFields.length < COPY_FIELDS.length;
                        }}
                        onChange={(e) => {
                          setCopySelectedFields(e.target.checked ? COPY_FIELDS.map((f) => f.key) : []);
                        }}
                        className="rounded border-gray-300 text-primary-blue-500 focus:ring-primary-blue-500"
                        aria-label="Select all columns"
                      />
                      Select all
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1">
                      {COPY_FIELDS.map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={copySelectedFields.includes(key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCopySelectedFields((prev) => [...prev, key]);
                              } else {
                                setCopySelectedFields((prev) => prev.filter((k) => k !== key));
                              }
                            }}
                            className="rounded border-gray-300 text-primary-blue-500 focus:ring-primary-blue-500"
                            aria-label={`Include ${label}`}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {copySelectedFields.length === 0 && dedupeByPhone(leads, 'phone').length > 0 && (
                    <p className="text-sm text-amber-600 mt-2">Select at least one column to copy.</p>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCopyModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const leadsToCopy = dedupeByPhone(leads, 'phone');
                      const tsv = buildTsv(leadsToCopy, copySelectedFields);
                      navigator.clipboard.writeText(tsv).then(() => {
                        setCopyFeedback(true);
                        setTimeout(() => {
                          setCopyModalOpen(false);
                          setCopyFeedback(false);
                        }, 1500);
                      });
                    }}
                    disabled={dedupeByPhone(leads, 'phone').length === 0 || copySelectedFields.length === 0}
                    className="px-4 py-2 rounded-lg bg-primary-navy text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {copyFeedback ? 'Copied!' : 'Copy to clipboard'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-1">
            {viewAll ? (
              <>
                <p className="text-sm text-gray-500">
                  {pagination.total > 5000
                    ? `Showing first 5000 of ${pagination.total} leads`
                    : `Showing all ${pagination.total} leads`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setViewAll(false);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Show paginated
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </>
      )}

    </div>
  );
}
