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
import CopyToSheetsModal from '../../components/Admin/CopyToSheetsModal';
import OneOnOneCounselingFunnelDashboard from '../../components/Admin/OneOnOneCounselingFunnelDashboard';
import { ADMIN_VIEW_ALL_LIMIT } from '../../constants/adminListLimits';
import {
  getGuidanceSlots,
  getOneOnOneCounselingLeads,
  getOneOnOneCounselors,
  getStoredToken,
  patchOneOnOneCounselingLeadStatus,
} from '../../utils/adminApi';
import { fetchAllPaginatedRows } from '../../utils/adminPagedFetch';
import { useAuth } from '../../hooks/useAuth';
import {
  BIGGEST_CONCERN_OPTIONS,
  COLLEGE_BUDGET_OPTIONS,
  CURRENT_CLASS_OPTIONS,
  INTERESTED_BRANCH_OPTIONS,
  LEAD_RELEVANCE_FILTER_OPTIONS,
  LEAD_STATUS_OPTIONS,
  PREFERRED_LANGUAGE_OPTIONS,
  SESSION_ATTENDEE_OPTIONS,
} from '../../constants/oneOnOneCounselingForm';
import { isRelevantOneOnOneCurrentClass } from '../../utils/oneOnOneCounselingClassRelevance';

function BookingStatusBadge({ row }) {
  if (row.bookingConfirmed) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        ✓ {row.bookingStatus || 'Confirmed'}
      </span>
    );
  }
  if (row.bookingStatus === 'Pending') {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        Pending
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      Not Booked
    </span>
  );
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return (
    date.toLocaleDateString('en-IN', { dateStyle: 'short' }) +
    ' ' +
    date.toLocaleTimeString('en-IN', { timeStyle: 'short' })
  );
}

const COPY_FIELDS = [
  { key: 'createdAt', label: 'Submitted' },
  { key: 'studentName', label: 'Student' },
  { key: 'mobileNumber', label: 'Mobile' },
  { key: 'parentName', label: 'Parent' },
  { key: 'parentMobileNumber', label: 'Parent mobile' },
  { key: 'sessionAttendee', label: 'Attendee' },
  { key: 'currentClass', label: 'Class' },
  { key: 'city', label: 'City' },
  { key: 'entranceExamRank', label: 'Rank' },
  { key: 'interestedBranch', label: 'Branch' },
  { key: 'collegeBudget', label: 'Budget' },
  { key: 'parentOccupation', label: 'Parent occ.' },
  { key: 'preferredColleges', label: 'Preferred colleges' },
  { key: 'biggestConcern', label: 'Concern' },
  { key: 'preferredLanguage', label: 'Language' },
  { key: 'preferredTimeSlot', label: 'Session slot' },
  { key: 'additionalQuestions', label: 'Additional Qs' },
  { key: 'bookingStatus', label: 'Slot booking' },
  { key: 'bookedSlot', label: 'Booked slot' },
  { key: 'leadStatus', label: 'Status' },
  { key: 'utm_source', label: 'UTM Src' },
  { key: 'utm_medium', label: 'UTM Med' },
  { key: 'utm_campaign', label: 'UTM Camp' },
  { key: 'utm_content', label: 'UTM Content' },
];

function getLeadCellValue(row, key) {
  if (key === 'createdAt') return row.createdAt ? formatDate(row.createdAt) : '';
  if (key === 'preferredColleges') {
    return Array.isArray(row.preferredColleges) && row.preferredColleges.length > 0
      ? row.preferredColleges.join(', ')
      : '';
  }
  if (key === 'bookedSlot') {
    if (!row.slotSessionTitle) return '';
    const slot = `${row.slotSessionTitle} (${row.slotDate || ''} ${row.slotTime || ''})`.trim();
    return row.counselorName ? `${slot} · ${row.counselorName}` : slot;
  }
  if (key === 'bookingStatus') {
    if (row.bookingConfirmed) return row.bookingStatus || 'Confirmed';
    return row.bookingStatus || 'Not Booked';
  }
  const v = row[key];
  if (v == null || v === '') return '';
  return String(v);
}

function buildLeadListParams(filters) {
  return {
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
    bookingFilter: filters.bookingFilter || undefined,
    slotDate: filters.slotDate || undefined,
    selectedSlotId: filters.selectedSlotId || undefined,
    oneOnOneCounselorId: filters.oneOnOneCounselorId || undefined,
    parentAttendanceConfirmed:
      filters.parentAttendanceConfirmed === 'true' ? true : undefined,
    whatsappConsent: filters.whatsappConsent === 'true' ? true : undefined,
    leadRelevance: filters.leadRelevance || undefined,
  };
}

function FilterField({ label, className = '', children }) {
  return (
    <div className={className}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      {children}
    </div>
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
  bookingFilter: '',
  slotDate: '',
  selectedSlotId: '',
  oneOnOneCounselorId: '',
  parentAttendanceConfirmed: '',
  whatsappConsent: '',
  leadRelevance: '',
};

export default function OneOnOneCounselingLeads() {
  const { logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [counselors, setCounselors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [viewAll, setViewAll] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyRecords, setCopyRecords] = useState([]);
  const [grandTotal, setGrandTotal] = useState(null);
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  useEffect(() => {
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;
    const filtersActive = Object.values(filters).some(Boolean);

    const params = {
      ...buildLeadListParams(filters),
      page: viewAll ? 1 : pagination.page,
      limit: viewAll ? ADMIN_VIEW_ALL_LIMIT : pagination.limit,
    };

    queueMicrotask(() => {
      if (cancelledRef.current) return;
      setLoading(true);
      setError('');
      if (filtersActive) setGrandTotal(null);
    });

    const token = getStoredToken();
    const listPromise = getOneOnOneCounselingLeads(params, token);
    const grandTotalPromise = filtersActive
      ? getOneOnOneCounselingLeads({ page: 1, limit: 1 }, token)
      : Promise.resolve(null);

    Promise.all([listPromise, grandTotalPromise]).then(([result, grandResult]) => {
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
      if (filtersActive) {
        setGrandTotal(
          grandResult?.success ? (grandResult.data?.pagination?.total ?? null) : null
        );
      } else {
        setGrandTotal(null);
      }
    });

    return () => {
      cancelledRef.current = true;
    };
  }, [viewAll, pagination.page, pagination.limit, filters, logout]);

  useEffect(() => {
    const token = getStoredToken();
    getOneOnOneCounselors({}, token).then((res) => {
      if (res.success) setCounselors(res.data?.data || []);
    });
    getGuidanceSlots({}, token).then((res) => {
      if (res.success) setSlots(res.data?.data || []);
    });
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const handleViewAllChange = (e) => {
    setViewAll(e.target.checked);
    if (!e.target.checked) setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const prepareCopyLeads = async () => {
    setCopyLoading(true);
    setError('');
    const baseParams = buildLeadListParams(filters);
    const result = await fetchAllPaginatedRows((page, limit) =>
      getOneOnOneCounselingLeads({ ...baseParams, page, limit }, getStoredToken())
    );
    setCopyLoading(false);
    if (!result.success) {
      const r = result.result;
      if (r?.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(r?.message || 'Failed to load leads for copy');
      return;
    }
    setCopyRecords(result.rows || []);
    setCopyModalOpen(true);
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
            to="/admin/guidance-slot-bookings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-primary-navy text-primary-navy hover:bg-primary-navy/5"
          >
            Guidance slots
          </Link>
          <a
            href="/guidance-booking-confirmation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Public booking form
          </a>
          <Link
            to="/admin/iit-counselling-utm?linkTarget=oneOnOneSession#iit-utm-generator"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-navy hover:bg-primary-navy/90"
          >
            <FiLink className="w-4 h-4" aria-hidden />
            Generate UTM links
          </Link>
          <div className="rounded-lg bg-primary-navy/5 border border-primary-navy/10 px-4 py-2 text-sm">
            {hasActiveFilters ? (
              <>
                {grandTotal != null ? (
                  <>
                    <span className="font-semibold text-primary-navy">{grandTotal}</span>
                    <span className="text-gray-600"> total</span>
                    <span className="mx-1.5 text-gray-300" aria-hidden>
                      ·
                    </span>
                  </>
                ) : null}
                <span className="font-semibold text-emerald-700">{pagination.total}</span>
                <span className="text-gray-600"> matching</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-primary-navy">{pagination.total}</span>
                <span className="text-gray-600"> total leads</span>
              </>
            )}
          </div>
        </div>
      </div>

      <OneOnOneCounselingFunnelDashboard />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FiSliders aria-hidden />
            Search & filters
          </div>
          <p className="text-sm text-gray-600">
            {loading ? (
              'Updating…'
            ) : hasActiveFilters ? (
              <>
                <span className="font-semibold text-emerald-700">{pagination.total}</span> matching
                {grandTotal != null ? (
                  <>
                    {' '}
                    of <span className="font-semibold text-gray-900">{grandTotal}</span> total
                  </>
                ) : null}
              </>
            ) : (
              <>
                <span className="font-semibold text-gray-900">{pagination.total}</span> leads
              </>
            )}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField label="Keywords" className="lg:col-span-2">
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search name, city, rank, mobile…"
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none"
              />
            </div>
          </FilterField>
          <FilterField label="From">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="From date"
            />
          </FilterField>
          <FilterField label="To">
            <input
              type="date"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="To date"
            />
          </FilterField>
          <FilterField label="Status">
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
          </FilterField>
          <FilterField label="Class">
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
          </FilterField>
          <FilterField label="Relevance">
            <select
              value={filters.leadRelevance}
              onChange={(e) => handleFilterChange('leadRelevance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="Lead relevance filter"
            >
              {LEAD_RELEVANCE_FILTER_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Branch">
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
          </FilterField>
          <FilterField label="Language">
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
          </FilterField>
          <FilterField label="Session">
            <input
              type="date"
              value={filters.preferredTimeSlotDate}
              onChange={(e) => handleFilterChange('preferredTimeSlotDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="Session slot date filter"
            />
          </FilterField>
          <FilterField label="Attendee">
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
          </FilterField>
          <FilterField label="Budget">
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
          </FilterField>
          <FilterField label="Concern" className="lg:col-span-2">
            <select
              value={filters.biggestConcern}
              onChange={(e) => handleFilterChange('biggestConcern', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All concerns</option>
              {BIGGEST_CONCERN_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Source">
            <input
              type="text"
              placeholder="UTM source"
              value={filters.utm_source}
              onChange={(e) => handleFilterChange('utm_source', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="UTM source filter"
            />
          </FilterField>
          <FilterField label="Medium">
            <input
              type="text"
              placeholder="UTM medium"
              value={filters.utm_medium}
              onChange={(e) => handleFilterChange('utm_medium', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="UTM medium filter"
            />
          </FilterField>
          <FilterField label="Campaign">
            <input
              type="text"
              placeholder="UTM campaign"
              value={filters.utm_campaign}
              onChange={(e) => handleFilterChange('utm_campaign', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="UTM campaign filter"
            />
          </FilterField>
          <FilterField label="Content" className="lg:col-span-2">
            <input
              type="text"
              placeholder="UTM content (influencer)"
              value={filters.utm_content}
              onChange={(e) => handleFilterChange('utm_content', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="UTM content filter"
            />
          </FilterField>
          <FilterField label="Booking">
            <select
              value={filters.bookingFilter}
              onChange={(e) => handleFilterChange('bookingFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="Booking filter"
            >
              <option value="">All booking states</option>
              <option value="confirmed">Confirmed bookings</option>
              <option value="pending">Pending bookings</option>
              <option value="notBooked">Not booked leads</option>
            </select>
          </FilterField>
          <FilterField label="Counselor">
            <select
              value={filters.oneOnOneCounselorId}
              onChange={(e) => handleFilterChange('oneOnOneCounselorId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All counselors</option>
              {counselors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Slot">
            <select
              value={filters.selectedSlotId}
              onChange={(e) => handleFilterChange('selectedSlotId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All slots</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sessionTitle} ({s.slotDate})
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Booked">
            <input
              type="date"
              value={filters.slotDate}
              onChange={(e) => handleFilterChange('slotDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="Booked slot date"
            />
          </FilterField>
          <FilterField label="Parent">
            <select
              value={filters.parentAttendanceConfirmed}
              onChange={(e) => handleFilterChange('parentAttendanceConfirmed', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Parent attendance (all)</option>
              <option value="true">Parent confirmed</option>
            </select>
          </FilterField>
          <FilterField label="Consent">
            <select
              value={filters.whatsappConsent}
              onChange={(e) => handleFilterChange('whatsappConsent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">WhatsApp consent (all)</option>
              <option value="true">Consent accepted</option>
            </select>
          </FilterField>
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 bg-gray-50/80">
          <p className="text-sm text-gray-600">
            {viewAll ? (
              <>
                Showing <span className="font-semibold text-gray-900">{records.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{pagination.total}</span> leads
              </>
            ) : (
              <>
                Page <span className="font-semibold text-gray-900">{pagination.page}</span> of{' '}
                <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={viewAll}
                onChange={handleViewAllChange}
                className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                aria-label="View all leads in one list"
              />
              View all
            </label>
            <button
              type="button"
              onClick={prepareCopyLeads}
              disabled={copyLoading || loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {copyLoading ? 'Preparing…' : 'Copy all'}
            </button>
          </div>
        </div>
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
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Parent occ.</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 min-w-[140px]">
                    Preferred colleges
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Concern</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Language</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
                    Session slot
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
                    Additional Qs
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Slot booking</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Booked slot</th>
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
                {records.map((row) => {
                  const rowIsIrrelevant =
                    !filters.leadRelevance && !isRelevantOneOnOneCurrentClass(row.currentClass);
                  return (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50/80 align-top${rowIsIrrelevant ? ' opacity-70' : ''}`}
                  >
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
                    <td className={`px-3 py-3${rowIsIrrelevant ? ' text-gray-500' : ' text-gray-700'}`}>
                      {row.currentClass}
                    </td>
                    <td className="px-3 py-3 text-gray-700">{row.city || '—'}</td>
                    <td className="px-3 py-3 text-gray-700 max-w-[120px]">{row.entranceExamRank}</td>
                    <td className="px-3 py-3 text-gray-700">{row.interestedBranch}</td>
                    <td className="px-3 py-3 text-gray-700 max-w-[140px]">{row.collegeBudget}</td>
                    <td className="px-3 py-3 text-gray-700 max-w-[120px]">{row.parentOccupation || '—'}</td>
                    <td className="px-3 py-3 text-gray-700 text-xs max-w-[180px]">
                      {Array.isArray(row.preferredColleges) && row.preferredColleges.length > 0
                        ? row.preferredColleges.join(', ')
                        : '—'}
                    </td>
                    <td className="px-3 py-3 text-gray-700 max-w-[140px]">{row.biggestConcern}</td>
                    <td className="px-3 py-3 text-gray-700">{row.preferredLanguage}</td>
                    <td className="px-3 py-3 text-gray-700">{row.preferredTimeSlot}</td>
                    <td className="px-3 py-3 text-gray-600 max-w-[220px] text-xs leading-relaxed">
                      {row.additionalQuestions || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <BookingStatusBadge row={row} />
                    </td>
                    <td className="px-3 py-3 text-gray-700 text-xs">
                      {row.slotSessionTitle
                        ? `${row.slotSessionTitle} (${row.slotDate || ''} ${row.slotTime || ''})`
                        : '—'}
                      {row.counselorName ? (
                        <span className="block text-gray-500">{row.counselorName}</span>
                      ) : null}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !viewAll && pagination.totalPages > 1 ? (
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

      <CopyToSheetsModal
        fields={COPY_FIELDS}
        records={copyRecords}
        getCellValue={getLeadCellValue}
        open={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        recordLabel="leads"
        dedupeByPhoneKey="mobileNumber"
        loading={copyLoading}
        loadingMessage="Preparing all matching leads for copy…"
      />
    </div>
  );
}
