import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
  FiLink,
  FiSearch,
  FiSliders,
  FiUsers,
} from 'react-icons/fi';
import {
  getOneOnOneCounselingLeads,
  getStoredToken,
  patchOneOnOneCounselingLeadStatus,
} from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import {
  BIGGEST_CONCERN_OPTIONS,
  COLLEGE_BUDGET_OPTIONS,
  CURRENT_CLASS_OPTIONS,
  INTERESTED_BRANCH_OPTIONS,
  LEAD_STATUS_OPTIONS,
  PREFERRED_LANGUAGE_OPTIONS,
  SESSION_ATTENDEE_OPTIONS,
} from '../../constants/oneOnOneCounselingForm';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return (
    date.toLocaleDateString('en-IN', { dateStyle: 'short' }) +
    ' ' +
    date.toLocaleTimeString('en-IN', { timeStyle: 'short' })
  );
}

const EMPTY_FILTERS = {
  q: '',
  from: '',
  to: '',
  leadStatus: '',
  currentClass: '',
  interestedBranch: '',
  collegeBudget: '',
  biggestConcern: '',
  preferredLanguage: '',
  preferredTimeSlotDate: '',
  sessionAttendee: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_content: '',
};

export default function OneOnOneCounselingLeads() {
  const { logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [statusUpdating, setStatusUpdating] = useState({});
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;

    const params = {
      page: pagination.page,
      limit: pagination.limit,
      q: filters.q.trim() || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      leadStatus: filters.leadStatus || undefined,
      currentClass: filters.currentClass || undefined,
      interestedBranch: filters.interestedBranch || undefined,
      collegeBudget: filters.collegeBudget || undefined,
      biggestConcern: filters.biggestConcern || undefined,
      preferredLanguage: filters.preferredLanguage || undefined,
      preferredTimeSlotDate: filters.preferredTimeSlotDate || undefined,
      sessionAttendee: filters.sessionAttendee || undefined,
      utm_source: filters.utm_source.trim() || undefined,
      utm_medium: filters.utm_medium.trim() || undefined,
      utm_campaign: filters.utm_campaign.trim() || undefined,
      utm_content: filters.utm_content.trim() || undefined,
    };

    queueMicrotask(() => {
      if (cancelledRef.current) return;
      setLoading(true);
      setError('');
    });

    getOneOnOneCounselingLeads(params, getStoredToken()).then((result) => {
      if (cancelledRef.current || thisRequestId !== requestIdRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load counseling leads');
        return;
      }
      setRecords(result.data?.data || []);
      setPagination(
        result.data?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 }
      );
    });

    return () => {
      cancelledRef.current = true;
    };
  }, [pagination.page, pagination.limit, filters, logout]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const handleStatusChange = async (leadId, leadStatus) => {
    setStatusUpdating((prev) => ({ ...prev, [leadId]: true }));
    const result = await patchOneOnOneCounselingLeadStatus(leadId, leadStatus, getStoredToken());
    setStatusUpdating((prev) => ({ ...prev, [leadId]: false }));

    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(result.message || 'Failed to update status');
      return;
    }

    const updated = result.data?.data;
    if (updated) {
      setRecords((prev) =>
        prev.map((row) => (row.id === leadId || row.id === updated.id ? updated : row))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiUsers className="text-primary-navy" aria-hidden />
            1-on-1 Counseling Leads
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Submissions from the /one-on-one-session booking form
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/influencer-create?linkTarget=oneOnOneSession"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-navy hover:bg-primary-navy/90"
          >
            <FiLink className="w-4 h-4" aria-hidden />
            Generate UTM links
          </Link>
          <div className="rounded-lg bg-primary-navy/5 border border-primary-navy/10 px-4 py-2 text-sm">
            <span className="font-semibold text-primary-navy">{pagination.total}</span>
            <span className="text-gray-600"> total leads</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FiSliders aria-hidden />
          Search & filters
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              type="search"
              placeholder="Search name, city, rank, mobile…"
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none"
            />
          </div>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => handleFilterChange('from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="From date"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => handleFilterChange('to', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="To date"
          />
          <select
            value={filters.leadStatus}
            onChange={(e) => handleFilterChange('leadStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="Lead status filter"
          >
            <option value="">All statuses</option>
            {LEAD_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filters.currentClass}
            onChange={(e) => handleFilterChange('currentClass', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All classes</option>
            {CURRENT_CLASS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <select
            value={filters.interestedBranch}
            onChange={(e) => handleFilterChange('interestedBranch', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All branches</option>
            {INTERESTED_BRANCH_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <select
            value={filters.preferredLanguage}
            onChange={(e) => handleFilterChange('preferredLanguage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All languages</option>
            {PREFERRED_LANGUAGE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.preferredTimeSlotDate}
            onChange={(e) => handleFilterChange('preferredTimeSlotDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="Session slot date filter"
          />
          <select
            value={filters.sessionAttendee}
            onChange={(e) => handleFilterChange('sessionAttendee', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="Session attendee filter"
          >
            <option value="">Who attends (all)</option>
            {SESSION_ATTENDEE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <select
            value={filters.collegeBudget}
            onChange={(e) => handleFilterChange('collegeBudget', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All budgets</option>
            {COLLEGE_BUDGET_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <select
            value={filters.biggestConcern}
            onChange={(e) => handleFilterChange('biggestConcern', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm lg:col-span-2"
          >
            <option value="">All concerns</option>
            {BIGGEST_CONCERN_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="UTM source"
            value={filters.utm_source}
            onChange={(e) => handleFilterChange('utm_source', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="UTM source filter"
          />
          <input
            type="text"
            placeholder="UTM medium"
            value={filters.utm_medium}
            onChange={(e) => handleFilterChange('utm_medium', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="UTM medium filter"
          />
          <input
            type="text"
            placeholder="UTM campaign"
            value={filters.utm_campaign}
            onChange={(e) => handleFilterChange('utm_campaign', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="UTM campaign filter"
          />
          <input
            type="text"
            placeholder="UTM content (influencer)"
            value={filters.utm_content}
            onChange={(e) => handleFilterChange('utm_content', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm lg:col-span-2"
            aria-label="UTM content filter"
          />
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-primary-navy hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle aria-hidden />
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading leads…</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiInbox className="mx-auto h-10 w-10 text-gray-300 mb-3" aria-hidden />
            No leads found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                    Submitted
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Student</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Mobile</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Parent</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Parent mobile</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Attendee</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Class</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">City</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Rank</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Branch</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Budget</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Concern</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Language</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
                    Session slot
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
                    Additional Qs
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 min-w-[160px]">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">UTM Src</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">UTM Med</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">UTM Camp</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">UTM Content</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 align-top">
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-900">{row.studentName}</td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{row.mobileNumber}</td>
                    <td className="px-3 py-3 text-gray-700">{row.parentName}</td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                      {row.parentMobileNumber}
                    </td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                      {row.sessionAttendee || '—'}
                    </td>
                    <td className="px-3 py-3 text-gray-700">{row.currentClass}</td>
                    <td className="px-3 py-3 text-gray-700">{row.city || '—'}</td>
                    <td className="px-3 py-3 text-gray-700 max-w-[120px]">{row.entranceExamRank}</td>
                    <td className="px-3 py-3 text-gray-700">{row.interestedBranch}</td>
                    <td className="px-3 py-3 text-gray-700 max-w-[140px]">{row.collegeBudget}</td>
                    <td className="px-3 py-3 text-gray-700 max-w-[140px]">{row.biggestConcern}</td>
                    <td className="px-3 py-3 text-gray-700">{row.preferredLanguage}</td>
                    <td className="px-3 py-3 text-gray-700">{row.preferredTimeSlot}</td>
                    <td className="px-3 py-3 text-gray-600 max-w-[220px] text-xs leading-relaxed">
                      {row.additionalQuestions || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={row.leadStatus || 'New Lead'}
                        disabled={statusUpdating[row.id]}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        className="w-full min-w-[140px] px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none disabled:opacity-50"
                        aria-label={`Status for ${row.studentName}`}
                      >
                        {LEAD_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[100px] truncate" title={row.utm_source || ''}>
                      {row.utm_source || '—'}
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[100px] truncate" title={row.utm_medium || ''}>
                      {row.utm_medium || '—'}
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[120px] truncate" title={row.utm_campaign || ''}>
                      {row.utm_campaign || '—'}
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[140px] truncate" title={row.utm_content || ''}>
                      {row.utm_content || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40"
              >
                <FiChevronLeft aria-hidden />
                Prev
              </button>
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40"
              >
                Next
                <FiChevronRight aria-hidden />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
