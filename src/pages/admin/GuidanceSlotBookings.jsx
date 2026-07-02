import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCopy, FiPlus, FiRefreshCw, FiSearch, FiToggleLeft, FiToggleRight, FiTrash2, FiX } from 'react-icons/fi';
import CopyToSheetsModal from '../../components/Admin/CopyToSheetsModal';
import { ADMIN_VIEW_ALL_LIMIT } from '../../constants/adminListLimits';
import { fetchAllPaginatedRows } from '../../utils/adminPagedFetch';
import {
  cancelGuidanceBooking,
  createGuidanceSlot,
  deleteGuidanceSlot,
  getGuidanceBookings,
  getGuidanceSlots,
  getOneOnOneCounselors,
  getStoredToken,
  toggleGuidanceSlot,
  updateGuidanceSlot,
} from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import GuidanceReminderSlotStatus from '../../components/Admin/GuidanceReminderSlotStatus';
import GuidanceNatFollowUpsTab from '../../components/Admin/GuidanceNatFollowUpsTab';
import IitainSessionFeedbackTab from '../../components/Admin/IitainSessionFeedbackTab';

const EMPTY_SLOT = {
  sessionTitle: '',
  slotDate: '',
  slotTime: '',
  maxBookings: 10,
  oneOnOneCounselorId: '',
  isActive: true,
};

function BookingBadge({ confirmed, status }) {
  if (confirmed) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        ✓ {status || 'Confirmed'}
      </span>
    );
  }
  if (status === 'Pending') {
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

function todayIsoDate() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

const SLOT_COPY_FIELDS = [
  { key: 'sessionTitle', label: 'Session' },
  { key: 'slotDate', label: 'Date' },
  { key: 'slotTime', label: 'Time' },
  { key: 'counselorName', label: 'Counselor' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'active', label: 'Active' },
];

const BOOKING_COPY_FIELDS = [
  { key: 'studentName', label: 'Student' },
  { key: 'mobileNumber', label: 'Mobile' },
  { key: 'createdAt', label: 'Form submitted' },
  { key: 'bookingStatus', label: 'Booking' },
  { key: 'collegeBudget', label: 'Budget' },
  { key: 'parentOccupation', label: 'Parent occ.' },
  { key: 'preferredColleges', label: 'Preferred colleges' },
  { key: 'slot', label: 'Slot' },
  { key: 'counselorName', label: 'Counselor' },
  { key: 'parentAttendance', label: 'Parent' },
  { key: 'whatsappConsent', label: 'WhatsApp' },
  { key: 'utm_campaign', label: 'UTM Campaign' },
];

function getSlotCellValue(row, key) {
  if (key === 'bookings') return `${row.currentBookings ?? 0}/${row.maxBookings ?? 0}`;
  if (key === 'active') return row.isActive ? 'ON' : 'OFF';
  return row[key] == null ? '' : String(row[key]);
}

function formatFormSubmittedAt(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getBookingCellValue(row, key) {
  if (key === 'preferredColleges') {
    return Array.isArray(row.preferredColleges) && row.preferredColleges.length > 0
      ? row.preferredColleges.join(', ')
      : '';
  }
  if (key === 'slot') {
    if (!row.slot) return '';
    return `${row.slot.sessionTitle} (${row.slot.slotDate}${row.slot.slotTime ? ` · ${row.slot.slotTime}` : ''})`;
  }
  if (key === 'counselorName') return row.counselor?.name || '';
  if (key === 'createdAt') return formatFormSubmittedAt(row.createdAt);
  if (key === 'bookingStatus') {
    if (row.bookingConfirmed) return row.bookingStatus || 'Confirmed';
    return row.bookingStatus || 'Not Booked';
  }
  if (key === 'parentAttendance') return row.parentAttendanceConfirmed ? 'Yes' : 'No';
  if (key === 'whatsappConsent') return row.whatsappConsent ? 'Yes' : 'No';
  const v = row[key];
  return v == null ? '' : String(v);
}

function buildBookingsQueryParams({
  page,
  limit,
  bookingFilter,
  bookingsSlotId,
  bookingsCounselorId,
  bookingsSlotDate,
  debouncedBookingsStudentSearch,
  debouncedBookingsMobileSearch,
}) {
  return {
    page,
    limit,
    bookingFilter: bookingFilter || undefined,
    selectedSlotId: bookingsSlotId || undefined,
    oneOnOneCounselorId: bookingsCounselorId || undefined,
    slotDate: bookingsSlotDate || undefined,
    studentName: debouncedBookingsStudentSearch.trim() || undefined,
    mobile: debouncedBookingsMobileSearch.trim() || undefined,
  };
}

function buildSlotsQueryParams({
  slotsCounselorId,
  slotsDate,
  slotsActive,
  debouncedSlotsSearch,
  slotsAvailability,
}) {
  return {
    counselorId: slotsCounselorId || undefined,
    slotDate: slotsDate || undefined,
    isActive: slotsActive || undefined,
    q: debouncedSlotsSearch.trim() || undefined,
    availability: slotsAvailability || undefined,
  };
}

export default function GuidanceSlotBookings() {
  const { logout } = useAuth();
  const [tab, setTab] = useState('slots');
  const [slots, setSlots] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slotForm, setSlotForm] = useState(EMPTY_SLOT);
  const [editingId, setEditingId] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('');
  const [bookingsCounselorId, setBookingsCounselorId] = useState('');
  const [bookingsSlotDate, setBookingsSlotDate] = useState('');
  const [bookingsSlotId, setBookingsSlotId] = useState('');
  const [bookingsStudentSearch, setBookingsStudentSearch] = useState('');
  const [bookingsMobileSearch, setBookingsMobileSearch] = useState('');
  const debouncedBookingsStudentSearch = useDebouncedValue(bookingsStudentSearch, 350);
  const debouncedBookingsMobileSearch = useDebouncedValue(bookingsMobileSearch, 350);
  const [slotsCounselorId, setSlotsCounselorId] = useState('');
  const [slotsDate, setSlotsDate] = useState('');
  const [slotsActive, setSlotsActive] = useState('');
  const [slotsSearch, setSlotsSearch] = useState('');
  const [slotsAvailability, setSlotsAvailability] = useState('');
  const debouncedSlotsSearch = useDebouncedValue(slotsSearch, 350);
  const [reminderDate, setReminderDate] = useState(todayIsoDate);
  const [bookingsViewAll, setBookingsViewAll] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyRecords, setCopyRecords] = useState([]);
  const [copyMode, setCopyMode] = useState('bookings');
  const [cancellingId, setCancellingId] = useState(null);

  const slotsFilterActive = useMemo(
    () =>
      Boolean(
        slotsCounselorId || slotsDate || slotsActive || slotsSearch.trim() || slotsAvailability
      ),
    [slotsCounselorId, slotsDate, slotsActive, slotsSearch, slotsAvailability]
  );

  const bookingsFilterActive = useMemo(
    () =>
      Boolean(
        bookingFilter ||
          bookingsCounselorId ||
          bookingsSlotDate ||
          bookingsSlotId ||
          bookingsStudentSearch.trim() ||
          bookingsMobileSearch.trim()
      ),
    [
      bookingFilter,
      bookingsCounselorId,
      bookingsSlotDate,
      bookingsSlotId,
      bookingsStudentSearch,
      bookingsMobileSearch,
    ]
  );

  const slotOptions = useMemo(
    () =>
      [...slots]
        .sort((a, b) => `${a.slotDate}${a.slotTime}`.localeCompare(`${b.slotDate}${b.slotTime}`))
        .map((s) => ({
          id: s.id,
          label: `${s.sessionTitle} (${s.slotDate}${s.slotTime ? ` · ${s.slotTime}` : ''})`,
        })),
    [slots]
  );

  const token = getStoredToken();

  const loadCounselors = useCallback(async () => {
    const res = await getOneOnOneCounselors({}, token);
    if (res.success) setCounselors(res.data?.data || res.data || []);
  }, [token]);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    const res = await getGuidanceSlots(buildSlotsQueryParams({
      slotsCounselorId,
      slotsDate,
      slotsActive,
      debouncedSlotsSearch,
      slotsAvailability,
    }), token);
    setLoading(false);
    if (!res.success) {
      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(res.message || 'Failed to load slots');
      return;
    }
    setSlots(res.data?.data || res.data || []);
    setError('');
  }, [token, slotsCounselorId, slotsDate, slotsActive, debouncedSlotsSearch, slotsAvailability, logout]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const res = await getGuidanceBookings(
      buildBookingsQueryParams({
        page: bookingsViewAll ? 1 : pagination.page,
        limit: bookingsViewAll ? ADMIN_VIEW_ALL_LIMIT : pagination.limit,
        bookingFilter,
        bookingsSlotId,
        bookingsCounselorId,
        bookingsSlotDate,
        debouncedBookingsStudentSearch,
        debouncedBookingsMobileSearch,
      }),
      token
    );
    setLoading(false);
    if (!res.success) {
      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(res.message || 'Failed to load bookings');
      return;
    }
    setBookings(res.data?.data || res.data || []);
    setPagination(res.data?.pagination || pagination);
    setError('');
  }, [
    token,
    pagination.page,
    pagination.limit,
    bookingsViewAll,
    bookingFilter,
    bookingsSlotId,
    bookingsCounselorId,
    bookingsSlotDate,
    debouncedBookingsStudentSearch,
    debouncedBookingsMobileSearch,
    logout,
  ]);

  const loadAllSlotsForFilters = useCallback(async () => {
    const res = await getGuidanceSlots({}, token);
    if (res.success) {
      setSlots(res.data?.data || res.data || []);
    }
  }, [token]);

  useEffect(() => {
    loadCounselors();
  }, [loadCounselors]);

  useEffect(() => {
    if (tab === 'slots') loadSlots();
    else if (tab === 'bookings') {
      loadAllSlotsForFilters();
      loadBookings();
    } else if (tab === 'nat') {
      loadAllSlotsForFilters();
    }
  }, [tab, loadSlots, loadBookings, loadAllSlotsForFilters]);

  const saveSlot = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...slotForm, maxBookings: Number(slotForm.maxBookings) };
    const res = editingId
      ? await updateGuidanceSlot(editingId, body, token)
      : await createGuidanceSlot(body, token);
    if (!res.success) {
      setError(res.message || 'Save failed');
      return;
    }
    setSlotForm(EMPTY_SLOT);
    setEditingId(null);
    loadSlots();
  };

  const startEdit = (slot) => {
    setEditingId(slot.id);
    setSlotForm({
      sessionTitle: slot.sessionTitle,
      slotDate: slot.slotDate,
      slotTime: slot.slotTime,
      maxBookings: slot.maxBookings,
      oneOnOneCounselorId: slot.oneOnOneCounselorId,
      isActive: slot.isActive,
    });
  };

  const goToBookingsPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const handleBookingsViewAllChange = (e) => {
    setBookingsViewAll(e.target.checked);
    if (!e.target.checked) setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const prepareCopySlots = async () => {
    setCopyLoading(true);
    setError('');
    const res = await getGuidanceSlots(
      buildSlotsQueryParams({
        slotsCounselorId,
        slotsDate,
        slotsActive,
        debouncedSlotsSearch,
        slotsAvailability,
      }),
      token
    );
    setCopyLoading(false);
    if (!res.success) {
      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(res.message || 'Failed to load slots for copy');
      return;
    }
    setCopyMode('slots');
    setCopyRecords(res.data?.data || res.data || []);
    setCopyModalOpen(true);
  };

  const prepareCopyBookings = async () => {
    setCopyLoading(true);
    setError('');
    const baseParams = buildBookingsQueryParams({
      page: 1,
      limit: ADMIN_VIEW_ALL_LIMIT,
      bookingFilter,
      bookingsSlotId,
      bookingsCounselorId,
      bookingsSlotDate,
      debouncedBookingsStudentSearch,
      debouncedBookingsMobileSearch,
    });
    const result = await fetchAllPaginatedRows((page, limit) =>
      getGuidanceBookings({ ...baseParams, page, limit }, token)
    );
    setCopyLoading(false);
    if (!result.success) {
      const r = result.result;
      if (r?.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(r?.message || 'Failed to load bookings for copy');
      return;
    }
    setCopyMode('bookings');
    setCopyRecords(result.rows || []);
    setCopyModalOpen(true);
  };

  const handleCancelBooking = async (booking) => {
    const slotLabel = booking.slot
      ? `${booking.slot.sessionTitle} (${booking.slot.slotDate}${booking.slot.slotTime ? ` · ${booking.slot.slotTime}` : ''})`
      : 'this slot';
    const confirmed = window.confirm(
      `Cancel guidance booking for ${booking.studentName} (${booking.mobileNumber})?\n\nSlot: ${slotLabel}\n\nThis will free the slot for others to book.`
    );
    if (!confirmed) return;

    setCancellingId(booking.id);
    setError('');
    const res = await cancelGuidanceBooking(booking.id, token);
    setCancellingId(null);
    if (!res.success) {
      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(res.message || 'Failed to cancel booking');
      return;
    }
    await Promise.all([loadBookings(), loadSlots()]);
  };

  const listToolbar = (kind) => {
    const isSlots = kind === 'slots';
    const count = isSlots ? slots.length : bookings.length;
    const total = isSlots ? slots.length : pagination.total;

    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 bg-gray-50/80">
        <p className="text-sm text-gray-600">
          {isSlots ? (
            <>
              Showing <span className="font-semibold text-gray-900">{count}</span> slot
              {count === 1 ? '' : 's'}
            </>
          ) : bookingsViewAll ? (
            <>
              Showing <span className="font-semibold text-gray-900">{count}</span> of{' '}
              <span className="font-semibold text-gray-900">{total}</span> bookings
            </>
          ) : (
            <>
              Page <span className="font-semibold text-gray-900">{pagination.page}</span> of{' '}
              <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
              {' · '}
              <span className="font-semibold text-gray-900">{total}</span> total
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {!isSlots ? (
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={bookingsViewAll}
                onChange={handleBookingsViewAllChange}
                className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                aria-label="View all bookings in one list"
              />
              View all
            </label>
          ) : null}
          <button
            type="button"
            onClick={isSlots ? prepareCopySlots : prepareCopyBookings}
            disabled={copyLoading || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FiCopy className="w-4 h-4" aria-hidden />
            {copyLoading ? 'Preparing…' : 'Copy all'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guidance Slot Bookings</h1>
          <p className="text-sm text-gray-600">Manage session slots and view confirmed bookings</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('slots')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'slots' ? 'bg-primary-navy text-white' : 'bg-gray-100'}`}
          >
            Slots
          </button>
          <button
            type="button"
            onClick={() => setTab('bookings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'bookings' ? 'bg-primary-navy text-white' : 'bg-gray-100'}`}
          >
            Bookings
          </button>
          <button
            type="button"
            onClick={() => setTab('nat')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'nat' ? 'bg-primary-navy text-white' : 'bg-gray-100'}`}
          >
            NAT
          </button>
          <button
            type="button"
            onClick={() => setTab('reminders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'reminders' ? 'bg-primary-navy text-white' : 'bg-gray-100'}`}
          >
            Reminders
          </button>
          <button
            type="button"
            onClick={() => setTab('iitain-feedback')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'iitain-feedback' ? 'bg-primary-navy text-white' : 'bg-gray-100'}`}
          >
            Session feedback (IITain)
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</p> : null}

      {tab === 'slots' ? (
        <>
          <form onSubmit={saveSlot} className="bg-white rounded-xl border p-4 grid gap-3 md:grid-cols-3">
            <input
              placeholder="Session title"
              value={slotForm.sessionTitle}
              onChange={(e) => setSlotForm((f) => ({ ...f, sessionTitle: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              type="date"
              value={slotForm.slotDate}
              onChange={(e) => setSlotForm((f) => ({ ...f, slotDate: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              placeholder="Slot time (e.g. 10:00 AM - 1:00 PM)"
              value={slotForm.slotTime}
              onChange={(e) => setSlotForm((f) => ({ ...f, slotTime: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              min={1}
              value={slotForm.maxBookings}
              onChange={(e) => setSlotForm((f) => ({ ...f, maxBookings: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={slotForm.oneOnOneCounselorId}
              onChange={(e) => setSlotForm((f) => ({ ...f, oneOnOneCounselorId: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="">Assign counselor</option>
              {counselors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-primary-navy text-white rounded-lg px-4 py-2 text-sm font-medium"
            >
              <FiPlus /> {editingId ? 'Update slot' : 'Create slot'}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border p-3">
            <input
              type="search"
              placeholder="Search session title…"
              value={slotsSearch}
              onChange={(e) => setSlotsSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm min-w-[160px] flex-1"
            />
            <input
              type="date"
              value={slotsDate}
              onChange={(e) => setSlotsDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
              aria-label="Filter by slot date"
            />
            <select
              value={slotsCounselorId}
              onChange={(e) => setSlotsCounselorId(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All counselors</option>
              {counselors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={slotsActive}
              onChange={(e) => setSlotsActive(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="true">Active only</option>
              <option value="false">Inactive only</option>
            </select>
            <select
              value={slotsAvailability}
              onChange={(e) => setSlotsAvailability(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All capacity</option>
              <option value="open">Has spots</option>
              <option value="full">Full</option>
            </select>
            <button
              type="button"
              onClick={loadSlots}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Refresh slots"
            >
              <FiRefreshCw />
            </button>
            {slotsFilterActive ? (
              <button
                type="button"
                onClick={() => {
                  setSlotsSearch('');
                  setSlotsDate('');
                  setSlotsCounselorId('');
                  setSlotsActive('');
                  setSlotsAvailability('');
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-4 h-4" />
                Clear
              </button>
            ) : null}
          </div>

          <div className="bg-white rounded-xl border overflow-x-auto">
            {listToolbar('slots')}
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Session</th>
                  <th className="px-3 py-2 text-left">Date / Time</th>
                  <th className="px-3 py-2 text-left">Counselor</th>
                  <th className="px-3 py-2 text-left">Bookings</th>
                  <th className="px-3 py-2 text-left">Active</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : slots.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {slotsFilterActive ? 'No slots match your filters.' : 'No slots yet.'}
                    </td>
                  </tr>
                ) : (
                  slots.map((slot) => (
                    <tr key={slot.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{slot.sessionTitle}</td>
                      <td className="px-3 py-2">
                        {slot.slotDate} · {slot.slotTime}
                      </td>
                      <td className="px-3 py-2">{slot.counselorName}</td>
                      <td className="px-3 py-2">
                        {slot.currentBookings}/{slot.maxBookings}
                        {slot.isFull ? (
                          <span className="ml-1 text-xs text-red-600">Full</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">
                        {slot.isActive ? (
                          <span className="text-emerald-700 text-xs font-medium">ON</span>
                        ) : (
                          <span className="text-gray-500 text-xs">OFF</span>
                        )}
                      </td>
                      <td className="px-3 py-2 flex gap-2">
                        <button type="button" onClick={() => startEdit(slot)} className="text-primary-navy text-xs">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await toggleGuidanceSlot(slot.id, token);
                            loadSlots();
                          }}
                          className="text-gray-600"
                          aria-label="Toggle slot"
                        >
                          {slot.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm('Delete this slot?')) return;
                            await deleteGuidanceSlot(slot.id, token);
                            loadSlots();
                          }}
                          className="text-red-600"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : tab === 'bookings' ? (
        <>
          <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border p-3">
            <div className="relative min-w-[180px] flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
                type="search"
                value={bookingsStudentSearch}
                onChange={(e) => {
                  setBookingsStudentSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                placeholder="Search student name"
                className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                aria-label="Search by student name"
              />
            </div>
            <div className="relative min-w-[160px] flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
                type="search"
                inputMode="numeric"
                value={bookingsMobileSearch}
                onChange={(e) => {
                  setBookingsMobileSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                placeholder="Search mobile number"
                className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                aria-label="Search by mobile number"
              />
            </div>
            <select
              value={bookingFilter}
              onChange={(e) => {
                setBookingFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="notBooked">Not booked</option>
            </select>
            <select
              value={bookingsCounselorId}
              onChange={(e) => {
                setBookingsCounselorId(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All counselors</option>
              {counselors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={bookingsSlotId}
              onChange={(e) => {
                setBookingsSlotId(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="border rounded-lg px-3 py-2 text-sm min-w-[200px]"
            >
              <option value="">All sessions</option>
              {slotOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={bookingsSlotDate}
              onChange={(e) => {
                setBookingsSlotDate(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="border rounded-lg px-3 py-2 text-sm"
              aria-label="Filter by slot date"
            />
            <button
              type="button"
              onClick={loadBookings}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Refresh bookings"
            >
              <FiRefreshCw />
            </button>
            {bookingsFilterActive ? (
              <button
                type="button"
                onClick={() => {
                  setBookingFilter('');
                  setBookingsCounselorId('');
                  setBookingsSlotDate('');
                  setBookingsSlotId('');
                  setBookingsStudentSearch('');
                  setBookingsMobileSearch('');
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-4 h-4" />
                Clear
              </button>
            ) : null}
          </div>
          <div className="bg-white rounded-xl border overflow-x-auto">
            {listToolbar('bookings')}
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2 text-left">Mobile</th>
                  <th className="px-3 py-2 text-left whitespace-nowrap">Form submitted</th>
                  <th className="px-3 py-2 text-left">Booking</th>
                  <th className="px-3 py-2 text-left">Budget</th>
                  <th className="px-3 py-2 text-left">Parent occ.</th>
                  <th className="px-3 py-2 text-left min-w-[140px]">Preferred colleges</th>
                  <th className="px-3 py-2 text-left">Slot</th>
                  <th className="px-3 py-2 text-left">Counselor</th>
                  <th className="px-3 py-2 text-left">Parent</th>
                  <th className="px-3 py-2 text-left">WhatsApp</th>
                  <th className="px-3 py-2 text-left">UTM Campaign</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-gray-500">
                      {bookingsFilterActive ? 'No bookings match your filters.' : 'No bookings yet.'}
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-3 py-2">{b.studentName}</td>
                    <td className="px-3 py-2">{b.mobileNumber}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap text-gray-600">
                      {formatFormSubmittedAt(b.createdAt)}
                    </td>
                    <td className="px-3 py-2">
                      <BookingBadge confirmed={b.bookingConfirmed} status={b.bookingStatus} />
                    </td>
                    <td className="px-3 py-2 text-xs">{b.collegeBudget || '—'}</td>
                    <td className="px-3 py-2 text-xs">{b.parentOccupation || '—'}</td>
                    <td className="px-3 py-2 text-xs max-w-[200px]">
                      {Array.isArray(b.preferredColleges) && b.preferredColleges.length > 0
                        ? b.preferredColleges.join(', ')
                        : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {b.slot
                        ? `${b.slot.sessionTitle} (${b.slot.slotDate}${b.slot.slotTime ? ` · ${b.slot.slotTime}` : ''})`
                        : '—'}
                    </td>
                    <td className="px-3 py-2">{b.counselor?.name || '—'}</td>
                    <td className="px-3 py-2">{b.parentAttendanceConfirmed ? 'Yes' : '—'}</td>
                    <td className="px-3 py-2">{b.whatsappConsent ? 'Yes' : '—'}</td>
                    <td className="px-3 py-2 text-xs max-w-[140px] truncate" title={b.utm_campaign || ''}>
                      {b.utm_campaign || '—'}
                    </td>
                    <td className="px-3 py-2">
                      {b.bookingConfirmed ? (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b)}
                          disabled={cancellingId === b.id || loading}
                          className="inline-flex items-center rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancellingId === b.id ? 'Cancelling…' : 'Cancel slot'}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
            {!loading && !bookingsViewAll && pagination.totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => goToBookingsPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40"
                  >
                    <FiChevronLeft aria-hidden />
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => goToBookingsPage(pagination.page + 1)}
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
        </>
      ) : tab === 'nat' ? (
        <GuidanceNatFollowUpsTab counselors={counselors} slotOptions={slots} />
      ) : tab === 'iitain-feedback' ? (
        <IitainSessionFeedbackTab counselors={counselors} />
      ) : (
        <GuidanceReminderSlotStatus
          slotDate={reminderDate}
          showDatePicker
          onDateChange={setReminderDate}
        />
      )}

      <CopyToSheetsModal
        fields={copyMode === 'slots' ? SLOT_COPY_FIELDS : BOOKING_COPY_FIELDS}
        records={copyRecords}
        getCellValue={copyMode === 'slots' ? getSlotCellValue : getBookingCellValue}
        open={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        recordLabel={copyMode === 'slots' ? 'slots' : 'bookings'}
        dedupeByPhoneKey={copyMode === 'bookings' ? 'mobileNumber' : undefined}
        loading={copyLoading}
        loadingMessage={
          copyMode === 'slots'
            ? 'Preparing all matching slots for copy…'
            : 'Preparing all matching bookings for copy…'
        }
      />
    </div>
  );
}
