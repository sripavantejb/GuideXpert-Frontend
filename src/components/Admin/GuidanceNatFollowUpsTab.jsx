import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCopy, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import CopyToSheetsModal from './CopyToSheetsModal';
import { ADMIN_VIEW_ALL_LIMIT } from '../../constants/adminListLimits';
import { fetchAllPaginatedRows } from '../../utils/adminPagedFetch';
import { getGuidanceNatFollowUps, getStoredToken, patchGuidanceNatFollowUp } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

function BookingBadge({ confirmed, status }) {
  if (confirmed) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        ✓ {status || 'Confirmed'}
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      {status || '—'}
    </span>
  );
}

const NAT_COPY_FIELDS = [
  { key: 'studentName', label: 'Student' },
  { key: 'mobileNumber', label: 'Mobile' },
  { key: 'natFormSubmitted', label: 'NAT form' },
  { key: 'natCollegePreferences', label: 'NAT colleges' },
  { key: 'natInitiated', label: 'NAT initiated' },
  { key: 'natInterested', label: 'Interested' },
  { key: 'natContactLater', label: 'Contact later' },
  { key: 'natNotes', label: 'Notes' },
  { key: 'collegeBudget', label: 'Budget' },
  { key: 'parentOccupation', label: 'Parent occ.' },
  { key: 'preferredColleges', label: 'Preferred colleges' },
  { key: 'slot', label: 'Slot' },
  { key: 'counselorName', label: 'Counselor' },
  { key: 'bookingStatus', label: 'Booking' },
];

function getNatCellValue(row, key) {
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
  if (key === 'natFormSubmitted') return row.natFormSubmitted ? 'Yes' : 'No';
  if (key === 'natInitiated') return row.natInitiated ? 'Yes' : 'No';
  if (key === 'natContactLater') return row.natContactLater ? 'Yes' : 'No';
  if (key === 'natInterested') {
    if (row.natInterested === 'yes') return 'Yes';
    if (row.natInterested === 'no') return 'No';
    if (row.natInterested === 'undecided') return 'Undecided';
    return '';
  }
  if (key === 'bookingStatus') {
    if (row.bookingConfirmed) return row.bookingStatus || 'Confirmed';
    return row.bookingStatus || '';
  }
  const v = row[key];
  return v == null ? '' : String(v);
}

function buildNatQueryParams({
  page,
  limit,
  bookingFilter,
  natFilter,
  natFormFilter,
  bookingsSlotId,
  bookingsCounselorId,
  bookingsSlotDate,
  debouncedStudentSearch,
  debouncedMobileSearch,
}) {
  return {
    page,
    limit,
    bookingFilter: bookingFilter || undefined,
    natFilter: natFilter || undefined,
    natFormFilter: natFormFilter || undefined,
    selectedSlotId: bookingsSlotId || undefined,
    oneOnOneCounselorId: bookingsCounselorId || undefined,
    slotDate: bookingsSlotDate || undefined,
    studentName: debouncedStudentSearch.trim() || undefined,
    mobile: debouncedMobileSearch.trim() || undefined,
  };
}

export default function GuidanceNatFollowUpsTab({ counselors, slotOptions }) {
  const { logout } = useAuth();
  const token = getStoredToken();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [notesDraft, setNotesDraft] = useState({});
  const [bookingFilter, setBookingFilter] = useState('confirmed');
  const [natFilter, setNatFilter] = useState('');
  const [natFormFilter, setNatFormFilter] = useState('');
  const [bookingsCounselorId, setBookingsCounselorId] = useState('');
  const [bookingsSlotDate, setBookingsSlotDate] = useState('');
  const [bookingsSlotId, setBookingsSlotId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const debouncedStudentSearch = useDebouncedValue(studentSearch, 350);
  const debouncedMobileSearch = useDebouncedValue(mobileSearch, 350);
  const [viewAll, setViewAll] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyRecords, setCopyRecords] = useState([]);

  const filtersActive = useMemo(
    () =>
      Boolean(
        bookingFilter ||
          natFilter ||
          natFormFilter ||
          bookingsCounselorId ||
          bookingsSlotDate ||
          bookingsSlotId ||
          studentSearch.trim() ||
          mobileSearch.trim()
      ),
    [
      bookingFilter,
      natFilter,
      natFormFilter,
      bookingsCounselorId,
      bookingsSlotDate,
      bookingsSlotId,
      studentSearch,
      mobileSearch,
    ]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const page = viewAll ? 1 : pagination.page;
    const limit = viewAll ? ADMIN_VIEW_ALL_LIMIT : pagination.limit;
    const res = await getGuidanceNatFollowUps(
      buildNatQueryParams({
        page,
        limit,
        bookingFilter,
        natFilter,
        natFormFilter,
        bookingsSlotId,
        bookingsCounselorId,
        bookingsSlotDate,
        debouncedStudentSearch,
        debouncedMobileSearch,
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
      setError(res.message || 'Failed to load NAT follow-ups');
      return;
    }
    setRows(res.data?.data || []);
    setPagination(res.data?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
  }, [
    viewAll,
    pagination.page,
    pagination.limit,
    bookingFilter,
    natFilter,
    natFormFilter,
    bookingsSlotId,
    bookingsCounselorId,
    bookingsSlotDate,
    debouncedStudentSearch,
    debouncedMobileSearch,
    token,
    logout,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const patchRow = async (id, body) => {
    setSavingId(id);
    setError('');
    const res = await patchGuidanceNatFollowUp(id, body, token);
    setSavingId(null);
    if (!res.success) {
      setError(res.message || 'Could not save changes');
      return;
    }
    const updated = res.data?.data;
    if (updated) {
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...updated } : row)));
    } else {
      load();
    }
  };

  const saveNotes = async (id) => {
    await patchRow(id, { natNotes: notesDraft[id] ?? '' });
    setNotesDraft((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
  };

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const prepareCopy = async () => {
    setCopyLoading(true);
    const baseParams = buildNatQueryParams({
      page: 1,
      limit: 25,
      bookingFilter,
      natFilter,
      natFormFilter,
      bookingsSlotId,
      bookingsCounselorId,
      bookingsSlotDate,
      debouncedStudentSearch,
      debouncedMobileSearch,
    });
    const result = await fetchAllPaginatedRows((page, limit) =>
      getGuidanceNatFollowUps({ ...baseParams, page, limit }, token)
    );
    setCopyLoading(false);
    if (!result.success) {
      setError(result.result?.message || 'Failed to prepare copy');
      return;
    }
    setCopyRecords(result.rows || []);
    setCopyModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border p-3">
        <div className="relative min-w-[140px] flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            placeholder="Search student name"
            value={studentSearch}
            onChange={(e) => {
              setStudentSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <input
          type="search"
          placeholder="Search mobile number"
          value={mobileSearch}
          onChange={(e) => {
            setMobileSearch(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="border rounded-lg px-3 py-2 text-sm min-w-[140px]"
        />
        <select
          value={bookingFilter}
          onChange={(e) => {
            setBookingFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="confirmed">Confirmed bookings</option>
          <option value="">All bookings</option>
          <option value="pending">Pending</option>
          <option value="notBooked">Not booked</option>
        </select>
        <select
          value={natFormFilter}
          onChange={(e) => {
            setNatFormFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">NAT form: all</option>
          <option value="submitted">NAT form submitted</option>
          <option value="notSubmitted">NAT form not submitted</option>
        </select>
        <select
          value={natFilter}
          onChange={(e) => {
            setNatFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">NAT status: all</option>
          <option value="initiated">NAT initiated</option>
          <option value="notInitiated">NAT not initiated</option>
          <option value="interestedYes">Interested: yes</option>
          <option value="interestedNo">Interested: no</option>
          <option value="contactLater">Contact later</option>
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
          className="border rounded-lg px-3 py-2 text-sm min-w-[160px]"
        >
          <option value="">All sessions</option>
          {slotOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.sessionTitle} ({s.slotDate})
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
        />
        <button type="button" onClick={load} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Refresh">
          <FiRefreshCw />
        </button>
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setBookingFilter('confirmed');
              setNatFilter('');
              setNatFormFilter('');
              setBookingsCounselorId('');
              setBookingsSlotDate('');
              setBookingsSlotId('');
              setStudentSearch('');
              setMobileSearch('');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <FiX className="w-4 h-4" />
            Clear
          </button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</p> : null}

      <div className="bg-white rounded-xl border overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </p>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={viewAll}
                onChange={(e) => {
                  setViewAll(e.target.checked);
                  if (!e.target.checked) setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="rounded border-gray-300"
              />
              View all
            </label>
            <button
              type="button"
              onClick={prepareCopy}
              disabled={copyLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <FiCopy className="w-4 h-4" />
              {copyLoading ? 'Preparing…' : 'Copy all'}
            </button>
          </div>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Student</th>
              <th className="px-3 py-2 text-left">Mobile</th>
              <th className="px-3 py-2 text-left">Booking</th>
              <th className="px-3 py-2 text-left">Slot</th>
              <th className="px-3 py-2 text-left">Counselor</th>
              <th className="px-3 py-2 text-left">NAT form</th>
              <th className="px-3 py-2 text-left min-w-[140px]">NAT colleges</th>
              <th className="px-3 py-2 text-left">NAT initiated</th>
              <th className="px-3 py-2 text-left">Interested</th>
              <th className="px-3 py-2 text-left">Contact later</th>
              <th className="px-3 py-2 text-left min-w-[180px]">Notes</th>
              <th className="px-3 py-2 text-left">Budget</th>
              <th className="px-3 py-2 text-left">Parent occ.</th>
              <th className="px-3 py-2 text-left min-w-[140px]">Preferred colleges</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={14} className="p-8 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={14} className="p-8 text-center text-gray-500">
                  No records match your filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="px-3 py-2 font-medium">{row.studentName}</td>
                  <td className="px-3 py-2">{row.mobileNumber}</td>
                  <td className="px-3 py-2">
                    <BookingBadge confirmed={row.bookingConfirmed} status={row.bookingStatus} />
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {row.slot
                      ? `${row.slot.sessionTitle} (${row.slot.slotDate}${row.slot.slotTime ? ` · ${row.slot.slotTime}` : ''})`
                      : '—'}
                  </td>
                  <td className="px-3 py-2">{row.counselor?.name || '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.natFormSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {row.natFormSubmitted ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs max-w-[200px]">{row.natCollegePreferences || '—'}</td>
                  <td className="px-3 py-2">
                    <select
                      value={row.natInitiated ? 'yes' : 'no'}
                      disabled={savingId === row.id}
                      onChange={(e) => patchRow(row.id, { natInitiated: e.target.value === 'yes' })}
                      className="border rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.natInterested || ''}
                      disabled={savingId === row.id}
                      onChange={(e) => patchRow(row.id, { natInterested: e.target.value })}
                      className="border rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="">—</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="undecided">Undecided</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!row.natContactLater}
                      disabled={savingId === row.id}
                      onChange={(e) => patchRow(row.id, { natContactLater: e.target.checked })}
                      className="rounded border-gray-300"
                      aria-label="Contact later"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      rows={2}
                      className="w-full min-w-[160px] border rounded-lg px-2 py-1 text-xs"
                      value={notesDraft[row.id] ?? row.natNotes ?? ''}
                      onChange={(e) => setNotesDraft((d) => ({ ...d, [row.id]: e.target.value }))}
                      onBlur={() => {
                        const draft = notesDraft[row.id];
                        if (draft !== undefined && draft !== (row.natNotes || '')) {
                          saveNotes(row.id);
                        }
                      }}
                      placeholder="Add notes…"
                    />
                    {notesDraft[row.id] !== undefined && notesDraft[row.id] !== (row.natNotes || '') ? (
                      <button
                        type="button"
                        onClick={() => saveNotes(row.id)}
                        disabled={savingId === row.id}
                        className="mt-1 text-xs text-primary-navy font-medium"
                      >
                        Save notes
                      </button>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs">{row.collegeBudget || '—'}</td>
                  <td className="px-3 py-2 text-xs">{row.parentOccupation || '—'}</td>
                  <td className="px-3 py-2 text-xs max-w-[200px]">
                    {Array.isArray(row.preferredColleges) && row.preferredColleges.length > 0
                      ? row.preferredColleges.join(', ')
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
        fields={NAT_COPY_FIELDS}
        records={copyRecords}
        getCellValue={getNatCellValue}
        open={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        recordLabel="NAT follow-ups"
        dedupeByPhoneKey="mobileNumber"
        loading={copyLoading}
      />
    </>
  );
}
