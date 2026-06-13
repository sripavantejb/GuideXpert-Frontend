import { useCallback, useEffect, useState } from 'react';
import { FiPlus, FiRefreshCw, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import {
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
import GuidanceReminderSlotStatus from '../../components/Admin/GuidanceReminderSlotStatus';

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
  const [filterSlotId, setFilterSlotId] = useState('');
  const [filterCounselorId, setFilterCounselorId] = useState('');
  const [filterSlotDate, setFilterSlotDate] = useState('');
  const [reminderDate, setReminderDate] = useState(todayIsoDate);

  const token = getStoredToken();

  const loadCounselors = useCallback(async () => {
    const res = await getOneOnOneCounselors({}, token);
    if (res.success) setCounselors(res.data?.data || res.data || []);
  }, [token]);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    const res = await getGuidanceSlots(
      filterCounselorId ? { counselorId: filterCounselorId } : {},
      token
    );
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
  }, [token, filterCounselorId, logout]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const res = await getGuidanceBookings(
      {
        page: pagination.page,
        limit: pagination.limit,
        bookingFilter: bookingFilter || undefined,
        selectedSlotId: filterSlotId || undefined,
        oneOnOneCounselorId: filterCounselorId || undefined,
        slotDate: filterSlotDate || undefined,
      },
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
  }, [token, pagination.page, pagination.limit, bookingFilter, filterSlotId, filterCounselorId, filterSlotDate, logout]);

  useEffect(() => {
    loadCounselors();
  }, [loadCounselors]);

  useEffect(() => {
    if (tab === 'slots') loadSlots();
    else if (tab === 'bookings') loadBookings();
  }, [tab, loadSlots, loadBookings]);

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
            onClick={() => setTab('reminders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'reminders' ? 'bg-primary-navy text-white' : 'bg-gray-100'}`}
          >
            Reminders
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

          <div className="bg-white rounded-xl border overflow-x-auto">
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
          <div className="flex flex-wrap gap-2">
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
              value={filterCounselorId}
              onChange={(e) => {
                setFilterCounselorId(e.target.value);
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
            <input
              type="date"
              value={filterSlotDate}
              onChange={(e) => {
                setFilterSlotDate(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <button type="button" onClick={loadBookings} className="p-2 text-gray-600">
              <FiRefreshCw />
            </button>
          </div>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2 text-left">Mobile</th>
                  <th className="px-3 py-2 text-left">Booking</th>
                  <th className="px-3 py-2 text-left">Budget</th>
                  <th className="px-3 py-2 text-left">Parent occ.</th>
                  <th className="px-3 py-2 text-left min-w-[140px]">Preferred colleges</th>
                  <th className="px-3 py-2 text-left">Slot</th>
                  <th className="px-3 py-2 text-left">Counselor</th>
                  <th className="px-3 py-2 text-left">Parent</th>
                  <th className="px-3 py-2 text-left">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-3 py-2">{b.studentName}</td>
                    <td className="px-3 py-2">{b.mobileNumber}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <GuidanceReminderSlotStatus
          slotDate={reminderDate}
          showDatePicker
          onDateChange={setReminderDate}
        />
      )}
    </div>
  );
}
