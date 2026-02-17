import { useState, useEffect, useRef } from 'react';
import { getMeetingAttendance, getTrainingAttendance, getStoredToken } from '../../utils/adminApi';
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

function getEmptyMessage({ mode, selectedDate, rangeFrom, rangeTo, query, attendanceType }) {
  const hasFilter = Boolean(query)
    || (mode === 'single' && selectedDate)
    || (mode === 'range' && (rangeFrom || rangeTo));
  if (attendanceType === 'training') {
    return hasFilter ? 'No training attendance found for the selected filters' : 'Training attendance data will appear here once configured.';
  }
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
  const [attendanceType, setAttendanceType] = useState('demo');
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

    const apiCall = attendanceType === 'training'
      ? getTrainingAttendance(params, getStoredToken())
      : getMeetingAttendance(params, getStoredToken());

    apiCall.then((result) => {
      if (cancelledRef.current) return;
      if (thisRequestId !== requestIdRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || (attendanceType === 'training' ? 'Failed to load training attendance' : 'Failed to load meeting attendance'));
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
        page: paginationData.page,
        total: paginationData.total,
        totalPages: Math.max(1, paginationData.totalPages || 1)
      });
      setStats({ totalRecords: fallbackUnique, uniqueAttendees: fallbackUnique, duplicateCount });
    });
  };

  useEffect(() => {
    const filtersKey = `${attendanceType}|${mode}|${selectedDate}|${rangeFrom}|${rangeTo}|${query}`;
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
  }, [attendanceType, pagination.page, mode, selectedDate, rangeFrom, rangeTo, query]);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const emptyMessage = getEmptyMessage({ mode, selectedDate, rangeFrom, rangeTo, query, attendanceType });
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
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Meeting Attendance</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and analyze {attendanceType === 'demo' ? 'demo' : 'training'} meeting attendance with smart deduplication
            </p>
            <div className="mt-3 flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg shadow-sm w-fit">
              <button
                type="button"
                onClick={() => setAttendanceType('demo')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  attendanceType === 'demo'
                    ? 'bg-primary-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Demo
              </button>
              <button
                type="button"
                onClick={() => setAttendanceType('training')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  attendanceType === 'training'
                    ? 'bg-primary-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Training
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchAttendance()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-blue-600 text-white text-sm font-semibold shadow-md hover:bg-primary-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {attendanceType === 'training' && !loading && records.length === 0 && !query && !(mode === 'single' && selectedDate) && !(mode === 'range' && (rangeFrom || rangeTo)) && (
        <div className="mb-6 p-4 rounded-xl bg-primary-blue-50 border border-primary-blue-200 flex items-center gap-3">
          <svg className="w-5 h-5 text-primary-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-primary-blue-800">Training attendance data will appear here once users register via the training page.</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] items-start mb-8">
        {/* Calendar Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Combined Header: Mode Toggle + Month Navigation */}
          <div className="bg-gradient-to-r from-primary-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    mode === 'single'
                      ? 'bg-primary-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Day
                </button>
                <button
                  type="button"
                  onClick={() => setMode('range')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    mode === 'range'
                      ? 'bg-primary-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Range
                </button>
              </div>
              <div className="flex items-center gap-2">
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
                  className="p-1.5 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600"
                  aria-label="Previous month"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-gray-900 min-w-[100px] text-center">
                  {MONTH_NAMES[viewMonth].slice(0, 3)} {viewYear}
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
                  className="p-1.5 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600"
                  aria-label="Next month"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {WEEKDAY_HEADER.map((day) => (
                    <th key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase py-2">
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
                      
                      let cellClass = 'text-gray-700 hover:bg-gray-100';
                      if (isSelected || isRangeStart || isRangeEnd) {
                        cellClass = 'bg-gradient-to-br from-primary-blue-500 to-primary-blue-600 text-white shadow-sm';
                      } else if (isInRange) {
                        cellClass = 'bg-primary-blue-100 text-primary-blue-700';
                      }
                      
                      return (
                        <td key={`${ri}-${ci}`} className="p-1">
                          <button
                            type="button"
                            onClick={() => handleDateClick(dateStr)}
                            className={`w-full py-2.5 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${cellClass} ${
                              isToday ? 'ring-2 ring-primary-blue-300' : ''
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
            
            {/* Calendar Footer */}
            <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
              {mode === 'range' && (rangeFrom || rangeTo) ? (
                <button
                  type="button"
                  onClick={() => { setRangeFrom(''); setRangeTo(''); }}
                  className="text-xs font-medium text-primary-blue-600 hover:underline"
                >
                  Clear range
                </button>
              ) : mode === 'single' && selectedDate ? (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="text-xs font-medium text-primary-blue-600 hover:underline"
                >
                  All dates
                </button>
              ) : (
                <span className="text-xs text-gray-400">Select a date to filter</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Search & Stats */}
        <div className="space-y-5">
          {/* Search Card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary-blue-100">
                <svg className="w-5 h-5 text-primary-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">Search Attendees</h3>
            </div>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or mobile..."
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue-200 focus:border-primary-blue-400 transition-all"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Duplicates auto-removed (latest entry kept)
            </p>
          </div>

          {/* Stats Card */}
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary-blue-500 via-primary-blue-600 to-indigo-600 shadow-lg p-5 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Unique Attendees</h3>
                <p className="text-xs text-white/70">{statsLabel}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-5xl font-bold tracking-tight">{stats.totalRecords}</span>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/20 text-xs font-medium">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-blue-100 mb-4">
            <svg className="w-6 h-6 text-primary-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Loading attendance data...</p>
        </div>
      ) : (
        <>
          {/* Data Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-5 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile Number</th>
                    <th className="px-5 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Join Time</th>
                    <th className="px-5 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">{emptyMessage}</p>
                      </td>
                    </tr>
                  ) : (
                    records.map((row, i) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-primary-blue-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="px-5 py-4">
                          <span className="font-medium text-gray-900">{row.name || '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-sm text-gray-600">{row.mobileNumber || '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">{formatDate(row.timestamp)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {row.attendanceStatus || 'Joined'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-2">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{shownFrom}</span> to <span className="font-semibold text-gray-900">{shownTo}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-600">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
