import { useState, useEffect, useRef } from 'react';
import { getMeetingAttendance, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

const WEEKDAY_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getTodayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toYYYYMMDD(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startBlank = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startBlank; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const total = 42;
  while (cells.length < total) cells.push(null);
  const rows = [];
  for (let r = 0; r < 6; r++) rows.push(cells.slice(r * 7, (r + 1) * 7));
  return rows;
}

function getEmptyMessage({ mode, selectedDate, rangeFrom, rangeTo, query }) {
  const hasFilter = Boolean(query)
    || (mode === 'single' && selectedDate)
    || (mode === 'range' && (rangeFrom || rangeTo));
  return hasFilter ? 'No attendance found for the selected filters' : 'No attendance records yet';
}

export default function MeetingAttendance() {
  const { logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalRecords: 0, uniqueAttendees: 0, duplicateCount: 0 });
  const [mode, setMode] = useState('single');
  const [selectedDate, setSelectedDate] = useState('');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [query, setQuery] = useState('');
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);
  const filtersRef = useRef('');

  const fetchAttendance = () => {
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;
    const page = pagination.page;
    const params = {
      page,
      limit: pagination.limit,
      q: query.trim() || undefined,
      uniqueByMobile: true,
      dedupeMode: 'latest'
    };
    if (mode === 'single' && selectedDate) {
      params.from = selectedDate;
      params.to = selectedDate;
    }
    if (mode === 'range') {
      if (rangeFrom) params.from = rangeFrom;
      if (rangeTo) params.to = rangeTo;
    }
    setLoading(true);
    setError('');
    getMeetingAttendance(params, getStoredToken()).then((result) => {
      if (cancelledRef.current) return;
      if (thisRequestId !== requestIdRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load meeting attendance');
        return;
      }
      const dataList = result.data.data || [];
      const paginationData = result.data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 };
      const responseStats = result.data.stats || {};
      const filterStart = mode === 'range' && rangeFrom ? rangeFrom : selectedDate;
      const filterEnd = mode === 'range' ? (rangeTo || rangeFrom) : selectedDate;
      const filteredList = dataList.filter((row) => {
        if (!filterStart && !filterEnd) return true;
        const rowDate = toYYYYMMDD(row.timestamp || row.createdAt || row.updatedAt || Date.now());
        if (filterStart && filterEnd) return rowDate >= filterStart && rowDate <= filterEnd;
        if (filterStart) return rowDate === filterStart;
        if (filterEnd) return rowDate === filterEnd;
        return true;
      });
      filteredList.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
      const dedupedList = [];
      const seenMobile = new Set();
      filteredList.forEach((row) => {
        const mobileRaw = row?.mobileNumber || '';
        const mobile = String(mobileRaw).replace(/\D/g, '').trim();
        if (!mobile) return;
        if (seenMobile.has(mobile)) return;
        seenMobile.add(mobile);
        dedupedList.push(row);
      });

      const fallbackTotal = typeof responseStats.totalRecords === 'number'
        ? responseStats.totalRecords
        : filteredList.length;
      const fallbackUnique = typeof responseStats.uniqueAttendees === 'number'
        ? responseStats.uniqueAttendees
        : dedupedList.length;
      const duplicateCount = Math.max(0, fallbackTotal - fallbackUnique);

      setRecords(dedupedList);
      setPagination({
        ...paginationData,
        page: 1,
        total: dedupedList.length,
        totalPages: Math.max(1, Math.ceil(dedupedList.length / paginationData.limit))
      });
      setStats({ totalRecords: fallbackTotal, uniqueAttendees: fallbackUnique, duplicateCount });
    });
  };

  useEffect(() => {
    const filtersKey = `${mode}|${selectedDate}|${rangeFrom}|${rangeTo}|${query}`;
    const filtersChanged = filtersRef.current !== filtersKey;
    if (filtersChanged) {
      filtersRef.current = filtersKey;
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
        return () => {
          cancelledRef.current = true;
        };
      }
    }
    fetchAttendance();
    return () => {
      cancelledRef.current = true;
    };
  }, [pagination.page, mode, selectedDate, rangeFrom, rangeTo, query]);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const emptyMessage = getEmptyMessage({ mode, selectedDate, rangeFrom, rangeTo, query });
  const shownFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const shownTo = pagination.total === 0 ? 0 : Math.min(pagination.page * pagination.limit, pagination.total);
  const todayStr = getTodayInputValue();
  const monthGrid = buildMonthGrid(viewYear, viewMonth);
  const statsLabel = mode === 'range'
    ? (rangeFrom && rangeTo ? `${rangeFrom} → ${rangeTo}` : 'Selected range')
    : (selectedDate || 'All dates');

  const handleDateClick = (dateStr) => {
    if (mode === 'single') {
      setSelectedDate(dateStr);
      return;
    }
    if (!rangeFrom || (rangeFrom && rangeTo)) {
      setRangeFrom(dateStr);
      setRangeTo('');
      return;
    }
    if (dateStr < rangeFrom) {
      setRangeTo(rangeFrom);
      setRangeFrom(dateStr);
      return;
    }
    setRangeTo(dateStr);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-1">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Meeting Attendance</h2>
          <p className="text-sm text-gray-500">Track attendance by day or date range, with mobile-level deduplication.</p>
        </div>
        <button
          type="button"
          onClick={() => fetchAttendance()}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 mb-6 lg:grid-cols-[1.15fr_0.85fr] items-start">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                  mode === 'single' ? 'border-primary-blue-500 text-primary-blue-700 bg-primary-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Single day
              </button>
              <button
                type="button"
                onClick={() => setMode('range')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                  mode === 'range' ? 'border-primary-blue-500 text-primary-blue-700 bg-primary-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Date range
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {mode === 'single'
                ? `Selected: ${selectedDate || 'All dates'}`
                : `Range: ${rangeFrom || '—'} → ${rangeTo || '—'}`}
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 0) {
                  setViewMonth(11);
                  setViewYear((y) => y - 1);
                } else {
                  setViewMonth((m) => m - 1);
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Previous month"
            >
              <span className="text-lg font-medium">←</span>
            </button>
            <span className="text-base font-semibold text-gray-900">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 11) {
                  setViewMonth(0);
                  setViewYear((y) => y + 1);
                } else {
                  setViewMonth((m) => m + 1);
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Next month"
            >
              <span className="text-lg font-medium">→</span>
            </button>
          </div>

          <div className="p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {WEEKDAY_HEADER.map((day) => (
                    <th key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthGrid.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((dayNum, ci) => {
                      if (dayNum === null) {
                        return <td key={`${ri}-${ci}`} className="p-1" />;
                      }
                      const dateStr = toYYYYMMDD(new Date(viewYear, viewMonth, dayNum));
                      const isToday = dateStr === todayStr;
                      const isSelected = mode === 'single' && selectedDate === dateStr;
                      const isRangeStart = mode === 'range' && rangeFrom === dateStr;
                      const isRangeEnd = mode === 'range' && rangeTo === dateStr;
                      const isInRange = mode === 'range' && rangeFrom && rangeTo && dateStr >= rangeFrom && dateStr <= rangeTo;
                      const activeClass = isSelected || isRangeStart || isRangeEnd
                        ? 'bg-primary-blue-600 text-white'
                        : isInRange
                          ? 'bg-primary-blue-50 text-primary-blue-700'
                          : 'hover:bg-gray-100 text-gray-700';
                      return (
                        <td key={`${ri}-${ci}`} className="p-1">
                          <button
                            type="button"
                            onClick={() => handleDateClick(dateStr)}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${activeClass} ${
                              isToday ? 'ring-1 ring-primary-blue-200' : ''
                            }`}
                          >
                            {dayNum}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-xs text-gray-500">
              <span>{mode === 'range' ? 'Select start and end dates on the calendar.' : 'Pick a date to filter attendance.'}</span>
              {mode === 'range' && (rangeFrom || rangeTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setRangeFrom('');
                    setRangeTo('');
                  }}
                  className="text-primary-blue-600 hover:text-primary-blue-700"
                >
                  Clear range
                </button>
              )}
              {mode === 'single' && selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="text-primary-blue-600 hover:text-primary-blue-700"
                >
                  All dates
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3">
            <div>
              <label className="text-xs text-gray-500">Search by name or mobile</label>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. Priya or 98765"
                className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue-200"
              />
            </div>
            <p className="text-xs text-gray-500">Duplicates removed by mobile number (latest join time kept).</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 mb-6 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Attendees count</p>
          <p className="text-xs text-gray-400 mt-1">{statsLabel}</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalRecords}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Duplicate attendees</p>
          <p className="text-xs text-gray-400 mt-1">{statsLabel}</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.duplicateCount}</p>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 py-2 px-3 bg-red-50 rounded-lg border border-red-100" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-sm">Loading attendance…</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm mb-4">
            <table className="min-w-[500px] w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Mobile Number</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider whitespace-nowrap">Time of Join</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-gray-500 text-sm">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  records.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-primary-blue-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
                    >
                      <td className="px-3 py-2 align-middle min-w-[120px] text-sm">{row.name || '—'}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap text-sm">{row.mobileNumber || '—'}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap text-gray-600 text-sm">{formatDate(row.timestamp)}</td>
                      <td className="px-3 py-2 align-middle">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {row.attendanceStatus || 'joined'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-1">
            <p className="text-sm text-gray-500">
              Showing {shownFrom}–{shownTo} of {pagination.total}
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
