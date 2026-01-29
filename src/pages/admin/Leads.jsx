import { useState, useEffect, useRef } from 'react';
import { getAdminLeads, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

function slotLabel(lead) {
  if (!lead.slotBooked) return 'No';
  const slot = lead.selectedSlot === 'SATURDAY_7PM' ? 'Sat 7PM' : lead.selectedSlot === 'SUNDAY_3PM' ? 'Sun 3PM' : lead.selectedSlot || '';
  const date = lead.slotDate ? formatDate(lead.slotDate) : '';
  return date ? `Yes – ${slot}, ${date}` : `Yes – ${slot}`;
}

export default function Leads() {
  const { logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    applicationStatus: '',
    otpVerified: '',
    slotBooked: '',
    q: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const cancelledRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, q: searchInput }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    cancelledRef.current = false;
    const page = pagination.page;
    const params = {
      page,
      limit: 50,
      ...(filters.applicationStatus && { applicationStatus: filters.applicationStatus }),
      ...(filters.otpVerified !== '' && filters.otpVerified !== undefined && { otpVerified: filters.otpVerified }),
      ...(filters.slotBooked !== '' && filters.slotBooked !== undefined && { slotBooked: filters.slotBooked }),
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
  }, [pagination.page, filters.applicationStatus, filters.otpVerified, filters.slotBooked, filters.q, logout]);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Leads</h2>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search name, phone, email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-10 px-3 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none min-w-[200px] box-border"
        />
        <select
          value={filters.applicationStatus}
          onChange={(e) => handleFilterChange('applicationStatus', e.target.value)}
          className="h-10 px-3 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 outline-none box-border"
        >
          <option value="">All statuses</option>
          <option value="in_progress">In progress</option>
          <option value="registered">Registered</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filters.otpVerified}
          onChange={(e) => handleFilterChange('otpVerified', e.target.value)}
          className="h-10 px-3 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 outline-none box-border"
        >
          <option value="">OTP: Any</option>
          <option value="true">OTP verified</option>
          <option value="false">OTP not verified</option>
        </select>
        <select
          value={filters.slotBooked}
          onChange={(e) => handleFilterChange('slotBooked', e.target.value)}
          className="h-10 px-3 py-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 outline-none box-border"
        >
          <option value="">Slot: Any</option>
          <option value="true">Slot booked</option>
          <option value="false">Slot not booked</option>
        </select>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-3" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading leads…</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle">Name</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle">Phone</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle">Occupation</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle text-center">OTP Verified</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle text-center whitespace-nowrap">Slot Booked</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle">Status</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle text-center">Step</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle">Email</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle">Interest</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle whitespace-nowrap">Created</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 align-middle whitespace-nowrap">Updated</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-3 py-6 text-center text-gray-500 align-middle">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 align-middle">{lead.fullName || '—'}</td>
                      <td className="px-3 py-2 align-middle">{lead.phone || '—'}</td>
                      <td className="px-3 py-2 align-middle">{lead.occupation || '—'}</td>
                      <td className="px-3 py-2 align-middle text-center">{lead.otpVerified ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2 align-middle text-center whitespace-nowrap">{slotLabel(lead)}</td>
                      <td className="px-3 py-2 align-middle">{lead.applicationStatus || '—'}</td>
                      <td className="px-3 py-2 align-middle text-center">{lead.currentStep ?? '—'}</td>
                      <td className="px-3 py-2 align-middle">{lead.email || '—'}</td>
                      <td className="px-3 py-2 align-middle">{lead.interestLevel || '—'}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap">{formatDate(lead.updatedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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
