import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCopy, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import CopyToSheetsModal from './CopyToSheetsModal';
import { ADMIN_VIEW_ALL_LIMIT } from '../../constants/adminListLimits';
import { fetchAllPaginatedRows } from '../../utils/adminPagedFetch';
import { getGuidanceNatFollowUps, getStoredToken, patchGuidanceNatFollowUp } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  NAT_CAMPAIGN_OPTIONS,
  NAT_CBA_NAME_OPTIONS,
  NAT_CHANNEL_OPTIONS,
  NAT_COUNSELLOR_BY_OPTIONS,
  NAT_LANGUAGE_OPTIONS,
  NAT_SESSION_STAGE_OPTIONS,
} from '../../constants/natFollowUp';

const fieldClass =
  'box-border max-h-8 min-h-8 border border-gray-200 rounded-md bg-white px-2 py-0.5 text-xs text-gray-900 leading-none overflow-hidden focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy/20 disabled:cursor-not-allowed disabled:opacity-60';

const cellClass = 'px-3 py-1.5 align-top';
const headClass =
  'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap align-top';

function formatPreferredColleges(row) {
  if (!Array.isArray(row.preferredColleges) || row.preferredColleges.length === 0) return '';
  return row.preferredColleges.join(', ');
}

function formatSlotLabel(row) {
  if (!row.slot) return '';
  return `${row.slot.sessionTitle} (${row.slot.slotDate}${row.slot.slotTime ? ` · ${row.slot.slotTime}` : ''})`;
}

function ClampedText({ text, maxWidth = 'max-w-[200px]', className = '' }) {
  if (!text) {
    return <span className="text-gray-400">—</span>;
  }
  return (
    <span className={`block truncate text-xs leading-5 text-gray-700 ${maxWidth} ${className}`.trim()} title={text}>
      {text}
    </span>
  );
}

function NatSelect({ value, options, disabled, onChange, minWidth = 'min-w-[110px]', className = '' }) {
  return (
    <select
      value={value || ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldClass} ${minWidth} ${className}`.trim()}
    >
      <option value="">—</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function BookingBadge({ confirmed, status }) {
  if (confirmed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        ✓ {status || 'Confirmed'}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
      {status || '—'}
    </span>
  );
}

const NAT_COPY_FIELDS = [
  { key: 'studentName', label: 'Student' },
  { key: 'mobileNumber', label: 'Mobile' },
  { key: 'natFollowUpDate', label: 'Date' },
  { key: 'natChannel', label: 'Channel' },
  { key: 'natCampaign', label: 'Campaign' },
  { key: 'natLanguage', label: 'Language' },
  { key: 'natCounsellorBy', label: 'Counsellor by' },
  { key: 'natCounsellorName', label: 'Counsellor name' },
  { key: 'natCbaName', label: 'CBA name' },
  { key: 'natBeforeSessionStage', label: 'Before session stage' },
  { key: 'natPresentStage', label: 'Present stage' },
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

  const counsellorNameOptions = useMemo(
    () =>
      [...new Set(counselors.map((c) => c.name).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [counselors]
  );

  const filtersActive = useMemo(
    () =>
      Boolean(
        bookingFilter ||
          bookingsCounselorId ||
          bookingsSlotDate ||
          bookingsSlotId ||
          studentSearch.trim() ||
          mobileSearch.trim()
      ),
    [
      bookingFilter,
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
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
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-primary-navy focus:outline-none focus:ring-2 focus:ring-primary-navy/15"
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
          className="min-w-[160px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-navy focus:outline-none focus:ring-2 focus:ring-primary-navy/15"
        />
        <select
          value={bookingFilter}
          onChange={(e) => {
            setBookingFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-navy focus:outline-none focus:ring-2 focus:ring-primary-navy/15"
        >
          <option value="confirmed">Confirmed bookings</option>
          <option value="">All bookings</option>
          <option value="pending">Pending</option>
          <option value="notBooked">Not booked</option>
        </select>
        <select
          value={bookingsCounselorId}
          onChange={(e) => {
            setBookingsCounselorId(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-navy focus:outline-none focus:ring-2 focus:ring-primary-navy/15"
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
          className="min-w-[180px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-navy focus:outline-none focus:ring-2 focus:ring-primary-navy/15"
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
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-navy focus:outline-none focus:ring-2 focus:ring-primary-navy/15"
        />
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-gray-200 p-2.5 text-gray-600 shadow-sm transition hover:bg-gray-50"
          aria-label="Refresh"
        >
          <FiRefreshCw />
        </button>
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setBookingFilter('confirmed');
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

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-slate-50/80 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">NAT follow-ups</p>
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
            </p>
          </div>
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
        <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm [&_td]:align-top [&_th]:align-top">
          <thead className="border-b border-gray-200 bg-slate-50">
            <tr>
              <th className={`sticky left-0 z-10 bg-slate-50 ${headClass}`}>Student</th>
              <th className={headClass}>Mobile</th>
              <th className={headClass}>Date</th>
              <th className={headClass}>Channel</th>
              <th className={`${headClass} min-w-[180px]`}>Campaign</th>
              <th className={headClass}>Language</th>
              <th className={headClass}>Counsellor by</th>
              <th className={`${headClass} min-w-[140px]`}>Counsellor name</th>
              <th className={headClass}>CBA name</th>
              <th className={`${headClass} min-w-[150px]`}>Before session</th>
              <th className={`${headClass} min-w-[130px]`}>Present stage</th>
              <th className={headClass}>Booking</th>
              <th className={`${headClass} min-w-[200px]`}>Slot</th>
              <th className={`${headClass} min-w-[140px]`}>Notes</th>
              <th className={headClass}>Budget</th>
              <th className={headClass}>Parent occ.</th>
              <th className={`${headClass} min-w-[150px]`}>Preferred colleges</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={17} className="p-8 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={17} className="p-8 text-center text-gray-500">
                  No records match your filters.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-t border-gray-100 hover:bg-slate-50/80 ${
                    index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  <td className={`sticky left-0 z-10 ${cellClass} whitespace-nowrap font-medium text-gray-900 shadow-[4px_0_6px_-4px_rgba(0,0,0,0.08)] ${
                      index % 2 === 1 ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    {row.studentName}
                  </td>
                  <td className={`${cellClass} whitespace-nowrap text-gray-700`}>{row.mobileNumber}</td>
                  <td className={cellClass}>
                    <input
                      type="date"
                      value={row.natFollowUpDate || ''}
                      disabled={savingId === row.id}
                      onChange={(e) => patchRow(row.id, { natFollowUpDate: e.target.value })}
                      className={`${fieldClass} min-w-[132px]`}
                    />
                  </td>
                  <td className={cellClass}>
                    <NatSelect
                      value={row.natChannel}
                      options={NAT_CHANNEL_OPTIONS}
                      disabled={savingId === row.id}
                      onChange={(value) => patchRow(row.id, { natChannel: value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <NatSelect
                      value={row.natCampaign}
                      options={NAT_CAMPAIGN_OPTIONS}
                      disabled={savingId === row.id}
                      minWidth="min-w-[180px]"
                      onChange={(value) => patchRow(row.id, { natCampaign: value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <NatSelect
                      value={row.natLanguage}
                      options={NAT_LANGUAGE_OPTIONS}
                      disabled={savingId === row.id}
                      onChange={(value) => patchRow(row.id, { natLanguage: value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <NatSelect
                      value={row.natCounsellorBy}
                      options={NAT_COUNSELLOR_BY_OPTIONS}
                      disabled={savingId === row.id}
                      onChange={(value) => patchRow(row.id, { natCounsellorBy: value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <NatSelect
                      value={row.natCounsellorName || row.counselor?.name || ''}
                      options={
                        row.natCounsellorName && !counsellorNameOptions.includes(row.natCounsellorName)
                          ? [...counsellorNameOptions, row.natCounsellorName]
                          : counsellorNameOptions
                      }
                      disabled={savingId === row.id}
                      minWidth="min-w-[140px]"
                      onChange={(value) => patchRow(row.id, { natCounsellorName: value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <NatSelect
                      value={row.natCbaName}
                      options={NAT_CBA_NAME_OPTIONS}
                      disabled={savingId === row.id}
                      onChange={(value) => patchRow(row.id, { natCbaName: value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <NatSelect
                      value={row.natBeforeSessionStage}
                      options={NAT_SESSION_STAGE_OPTIONS}
                      disabled={savingId === row.id}
                      minWidth="min-w-[150px]"
                      onChange={(value) => patchRow(row.id, { natBeforeSessionStage: value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <NatSelect
                      value={row.natPresentStage}
                      options={NAT_SESSION_STAGE_OPTIONS}
                      disabled={savingId === row.id}
                      minWidth="min-w-[140px]"
                      onChange={(value) => patchRow(row.id, { natPresentStage: value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <BookingBadge confirmed={row.bookingConfirmed} status={row.bookingStatus} />
                  </td>
                  <td className={`${cellClass} max-w-[200px]`}>
                    <ClampedText text={formatSlotLabel(row)} maxWidth="max-w-[200px]" className="text-gray-600" />
                  </td>
                  <td className={cellClass}>
                    <input
                      type="text"
                      className={`${fieldClass} block min-w-[140px] max-w-[200px]`}
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
                  </td>
                  <td className={`${cellClass} max-w-[120px]`}>
                    <ClampedText text={row.collegeBudget} maxWidth="max-w-[120px]" />
                  </td>
                  <td className={`${cellClass} max-w-[120px]`}>
                    <ClampedText text={row.parentOccupation} maxWidth="max-w-[120px]" />
                  </td>
                  <td className={`${cellClass} max-w-[180px]`}>
                    <ClampedText text={formatPreferredColleges(row)} maxWidth="max-w-[180px]" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        {!loading && !viewAll && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-gray-200 bg-slate-50/50 px-4 py-3">
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
    </div>
  );
}
