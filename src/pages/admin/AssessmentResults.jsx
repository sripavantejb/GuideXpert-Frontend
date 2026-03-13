import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getAssessmentSubmissions,
  getAssessmentSubmissionById,
  getAssessment2Submissions,
  getAssessment2SubmissionById,
  getAssessment3Submissions,
  getAssessment3SubmissionById,
  getMissingLeads,
  getStoredToken,
} from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';
import { ASSESSMENT_SECTIONS } from '../../data/assessmentQuestions';
import { ASSESSMENT_SECTIONS_2 } from '../../data/assessmentQuestions2';
import { ASSESSMENT_SECTIONS_3 } from '../../data/assessmentQuestions3';
import TableSkeleton from '../../components/UI/TableSkeleton';
import { ContentSkeleton } from '../../components/UI/Skeleton';

const ASSESSMENT_TYPES = [
  {
    id: 1,
    label: 'Assessment 1',
    getSubmissions: getAssessmentSubmissions,
    getSubmissionById: getAssessmentSubmissionById,
    sections: ASSESSMENT_SECTIONS,
  },
  {
    id: 2,
    label: 'Assessment 2',
    getSubmissions: getAssessment2Submissions,
    getSubmissionById: getAssessment2SubmissionById,
    sections: ASSESSMENT_SECTIONS_2,
  },
  {
    id: 3,
    label: 'Assessment 3',
    getSubmissions: getAssessment3Submissions,
    getSubmissionById: getAssessment3SubmissionById,
    sections: ASSESSMENT_SECTIONS_3,
  },
  {
    id: 4,
    label: 'Missing Leads',
    getSubmissions: getMissingLeads,
    getSubmissionById: getAssessment3SubmissionById,
    sections: ASSESSMENT_SECTIONS_3,
  },
];

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

const DEFAULT_FILTERS = () => ({
  mode: 'single',
  selectedDate: '',
  rangeFrom: '',
  rangeTo: '',
  query: '',
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(),
});

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

function parseType(searchParams) {
  const t = searchParams.get('type');
  const n = t ? parseInt(t, 10) : 1;
  return n >= 1 && n <= 4 ? n : 1;
}

function getEmptyMessage(hasFilter, typeId) {
  if (typeId === 4) {
    return hasFilter ? 'No missing leads for the selected filters' : 'No missing leads';
  }
  return hasFilter ? 'No submissions for the selected filters' : 'No submissions yet';
}

export default function AssessmentResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeId = parseType(searchParams);
  const activeConfig = useMemo(() => ASSESSMENT_TYPES.find((c) => c.id === typeId) ?? ASSESSMENT_TYPES[0], [typeId]);

  const { logout } = useAuth();
  const [filtersByType, setFiltersByType] = useState(() => ({
    1: DEFAULT_FILTERS(),
    2: DEFAULT_FILTERS(),
    3: DEFAULT_FILTERS(),
    4: DEFAULT_FILTERS(),
  }));
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [activationFormCount, setActivationFormCount] = useState(0);
  const [assessment3Total, setAssessment3Total] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cancelledRef = useRef(false);
  const filtersRef = useRef('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSubmission, setDetailSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const filters = filtersByType[typeId] ?? DEFAULT_FILTERS();
  const { mode, selectedDate, rangeFrom, rangeTo, query, viewYear, viewMonth } = filters;

  const setFiltersForType = useCallback((type, updater) => {
    setFiltersByType((prev) => ({
      ...prev,
      [type]: typeof updater === 'function' ? updater(prev[type] ?? DEFAULT_FILTERS()) : updater,
    }));
  }, []);

  const updateCurrentFilters = useCallback(
    (updater) => {
      setFiltersForType(typeId, updater);
      setPage(1);
    },
    [typeId, setFiltersForType]
  );

  const questionTextMap = useMemo(() => {
    const map = {};
    activeConfig.sections.forEach((s) => {
      s.questions.forEach((q) => {
        map[q.id] = q.text;
      });
    });
    return map;
  }, [activeConfig.sections]);

  const setType = (n) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('type', String(n));
      return next;
    });
    setPage(1);
    setError('');
    setDetailOpen(false);
    setDetailSubmission(null);
    setDetailError('');
  };

  const from = useMemo(() => {
    if (mode === 'single' && selectedDate) return selectedDate;
    if (mode === 'range' && rangeFrom) return rangeFrom;
    return undefined;
  }, [mode, selectedDate, rangeFrom]);

  const to = useMemo(() => {
    if (mode === 'single' && selectedDate) return selectedDate;
    if (mode === 'range' && rangeTo) return rangeTo;
    return undefined;
  }, [mode, selectedDate, rangeTo]);

  useEffect(() => {
    cancelledRef.current = false;
    const filtersKey = `${typeId}|${page}|${mode}|${selectedDate}|${rangeFrom}|${rangeTo}|${query}`;
    const filtersChanged = filtersRef.current !== filtersKey;
    if (filtersChanged) filtersRef.current = filtersKey;

    setLoading(true);
    setError('');
    const options = { from, to, q: query.trim() || undefined };
    activeConfig.getSubmissions(page, limit, options, getStoredToken()).then((result) => {
      if (cancelledRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || (typeId === 4 ? 'Failed to load missing leads' : `Failed to load ${activeConfig.label.toLowerCase()} submissions`));
        return;
      }
      setSubmissions(result.data?.submissions ?? []);
      setTotal(result.data?.total ?? 0);
      if (typeId === 4) {
        setDuplicateCount(result.data?.duplicateCount ?? 0);
        setActivationFormCount(result.data?.activationFormCount ?? 0);
        setAssessment3Total(result.data?.assessment3Total ?? 0);
      } else {
        setDuplicateCount(0);
        setActivationFormCount(0);
        setAssessment3Total(0);
      }
    });
    return () => {
      cancelledRef.current = true;
    };
  }, [typeId, page, activeConfig, from, to, query, mode, selectedDate, rangeFrom, rangeTo, logout]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasFilter = Boolean(query.trim()) || (mode === 'single' && selectedDate) || (mode === 'range' && (rangeFrom || rangeTo));
  const emptyMessage = getEmptyMessage(hasFilter, typeId);
  const todayStr = getTodayInputValue();
  const monthGrid = buildMonthGrid(viewYear, viewMonth);
  const statsLabel =
    mode === 'range' ? (rangeFrom && rangeTo ? `${rangeFrom} → ${rangeTo}` : 'Selected range') : selectedDate || 'All dates';

  const handleDateClick = useCallback(
    (dateStr) => {
      if (mode === 'single') {
        updateCurrentFilters((f) => ({ ...f, selectedDate: dateStr }));
        return;
      }
      setFiltersForType(typeId, (f) => {
        const prev = f ?? DEFAULT_FILTERS();
        if (!prev.rangeFrom || (prev.rangeFrom && prev.rangeTo)) {
          return { ...prev, rangeFrom: dateStr, rangeTo: '' };
        }
        if (dateStr < prev.rangeFrom) {
          return { ...prev, rangeTo: prev.rangeFrom, rangeFrom: dateStr };
        }
        return { ...prev, rangeTo: dateStr };
      });
      setPage(1);
    },
    [mode, typeId, updateCurrentFilters, setFiltersForType]
  );

  const openDetail = (row) => {
    if (!row._id) return;
    setDetailOpen(true);
    setDetailSubmission(null);
    setDetailError('');
    setDetailLoading(true);
    activeConfig.getSubmissionById(row._id, getStoredToken()).then((result) => {
      setDetailLoading(false);
      if (!result.success) {
        setDetailError(result.message || 'Failed to load submission details');
        return;
      }
      setDetailSubmission(result.data?.submission ?? null);
    });
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailSubmission(null);
    setDetailError('');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ color: '#003366' }}>
          Custom Reports
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Counsellor assessment submissions with scores. Select an assessment and use the calendar and search to filter.
        </p>
        <div className="mt-4 flex gap-1 p-1 rounded-lg border border-gray-200 bg-gray-100/80 w-fit" role="tablist" aria-label="Assessment type">
          {ASSESSMENT_TYPES.map((config) => (
            <button
              key={config.id}
              type="button"
              role="tab"
              aria-selected={typeId === config.id}
              aria-controls="assessment-results-panel"
              id={`assessment-tab-${config.id}`}
              tabIndex={typeId === config.id ? 0 : -1}
              onClick={() => setType(config.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setType(config.id);
                }
              }}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${typeId === config.id ? 'bg-white text-[#003366] shadow-sm border border-gray-200' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}
              `}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div id="assessment-results-panel" role="tabpanel" aria-labelledby={`assessment-tab-${typeId}`}>
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] items-start mb-8">
          {/* Calendar Card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg shadow-sm">
                  <button
                    type="button"
                    onClick={() => updateCurrentFilters((f) => ({ ...f, mode: 'single' }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      mode === 'single' ? 'bg-primary-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCurrentFilters((f) => ({ ...f, mode: 'range' }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      mode === 'range' ? 'bg-primary-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Range
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFiltersForType(typeId, (f) => {
                        const prev = f ?? DEFAULT_FILTERS();
                        const next = { ...prev };
                        if (prev.viewMonth === 0) {
                          next.viewMonth = 11;
                          next.viewYear = (prev.viewYear ?? new Date().getFullYear()) - 1;
                        } else {
                          next.viewMonth = (prev.viewMonth ?? new Date().getMonth()) - 1;
                        }
                        return next;
                      });
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
                      setFiltersForType(typeId, (f) => {
                        const prev = f ?? DEFAULT_FILTERS();
                        const next = { ...prev };
                        if (prev.viewMonth === 11) {
                          next.viewMonth = 0;
                          next.viewYear = (prev.viewYear ?? new Date().getFullYear()) + 1;
                        } else {
                          next.viewMonth = (prev.viewMonth ?? new Date().getMonth()) + 1;
                        }
                        return next;
                      });
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
              <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                {mode === 'range' && (rangeFrom || rangeTo) ? (
                  <button
                    type="button"
                    onClick={() => updateCurrentFilters((f) => ({ ...f, rangeFrom: '', rangeTo: '' }))}
                    className="text-xs font-medium text-primary-blue-600 hover:underline"
                  >
                    Clear range
                  </button>
                ) : mode === 'single' && selectedDate ? (
                  <button
                    type="button"
                    onClick={() => updateCurrentFilters((f) => ({ ...f, selectedDate: '' }))}
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

          {/* Right column: Search + Overview */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-primary-blue-100">
                  <svg className="w-5 h-5 text-primary-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900">Search submissions</h3>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setFiltersForType(typeId, (f) => ({ ...f, query: e.target.value }));
                    setPage(1);
                  }}
                  placeholder="Search by name or mobile..."
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue-200 focus:border-primary-blue-400 transition-all"
                  aria-label="Search by name or mobile"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary-blue-500 via-primary-blue-600 to-indigo-600 shadow-lg p-5 text-white">
              {typeId === 4 ? (
                <>
                  <h3 className="text-base font-bold text-white mb-0.5">Missing leads</h3>
                  <p className="text-sm text-white/90 mb-4">{statsLabel} · Not in activation form</p>
                  <div className="flex items-baseline justify-between gap-4 mb-4">
                    <span className="text-4xl font-bold text-white tabular-nums">{total}</span>
                    <span className="text-xs font-medium text-white bg-white/25 px-2.5 py-1 rounded-md shrink-0">
                      Not in activation form
                    </span>
                  </div>
                  <div className="rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 p-3 space-y-2.5">
                    <p className="flex justify-between items-center text-sm">
                      <span className="text-white font-medium">Activation form</span>
                      <span className="text-white font-bold tabular-nums">{activationFormCount}</span>
                    </p>
                    <p className="flex justify-between items-center text-sm">
                      <span className="text-white font-medium">Assessment 3 submissions</span>
                      <span className="text-white font-bold tabular-nums">{assessment3Total}</span>
                    </p>
                    <p className="flex justify-between items-center text-sm" title="Same phone collapsed to one">
                      <span className="text-white font-medium">Duplicates removed</span>
                      <span className="text-white font-bold tabular-nums">{duplicateCount}</span>
                    </p>
                    <p className="text-xs text-white/80 pt-1 border-t border-white/20 mt-2">
                      All counts for selected period above
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-white/20">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white/90">Total submissions</h3>
                      <p className="text-xs text-white/70">{statsLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-5xl font-bold tracking-tight">{total}</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/20 text-xs font-medium">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden mb-6">
            <TableSkeleton rows={8} cols={5} />
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden mb-6">
            <div className="px-5 py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">{emptyMessage}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th scope="col" className="px-5 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-5 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                        Phone
                      </th>
                      <th scope="col" className="px-5 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center">
                        Score
                      </th>
                      <th scope="col" className="px-5 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                        Submitted at
                      </th>
                      <th scope="col" className="px-5 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {submissions.map((row) => (
                      <tr
                        key={row._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openDetail(row)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openDetail(row);
                          }
                        }}
                        className="hover:bg-primary-blue-50/50 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-4 text-gray-900 whitespace-nowrap">{row.fullName || '—'}</td>
                        <td className="px-5 py-4 text-gray-700 whitespace-nowrap">{row.phone || '—'}</td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span className="font-medium text-[#003366]">
                            {row.score ?? 0} / {row.maxScore ?? 10}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{formatDate(row.submittedAt)}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(row);
                            }}
                            className="text-sm font-medium text-[#003366] hover:underline"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded border border-[#003366] text-sm font-medium text-white bg-[#003366] hover:bg-[#004080] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeDetail}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-modal-title"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 id="detail-modal-title" className="text-lg font-semibold" style={{ color: '#003366' }}>
                Submission details
              </h2>
              <button
                type="button"
                onClick={closeDetail}
                className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {detailLoading && (
                <div className="p-6">
                  <ContentSkeleton lines={5} />
                </div>
              )}
              {detailError && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{detailError}</div>
              )}
              {!detailLoading && !detailError && detailSubmission && (
                <>
                  <section className="mb-5">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">User details</h3>
                    <dl className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-gray-500">Name</dt>
                        <dd className="font-medium text-gray-900 text-right">{detailSubmission.fullName || '—'}</dd>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-gray-500">Phone</dt>
                        <dd className="font-medium text-gray-900 text-right font-mono">{detailSubmission.phone || '—'}</dd>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-gray-500">Submitted at</dt>
                        <dd className="font-medium text-gray-900 text-right">{formatDate(detailSubmission.submittedAt)}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="mb-5">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Score / Rating</h3>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-primary-blue-50 border border-primary-blue-100">
                      <div className="text-3xl font-bold text-[#003366]">
                        {detailSubmission.score ?? 0} <span className="text-lg font-normal text-gray-500">/ {detailSubmission.maxScore ?? 10}</span>
                      </div>
                      {typeof detailSubmission.maxScore === 'number' && detailSubmission.maxScore > 0 && (
                        <span className="text-sm text-gray-600">
                          ({Math.round(((detailSubmission.score ?? 0) / detailSubmission.maxScore) * 100)}%)
                        </span>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3" style={{ color: '#003366' }}>
                      Incorrect answers
                    </h3>
                    {(!detailSubmission.questionResults || detailSubmission.questionResults.length === 0) ? (
                      <p className="text-sm text-gray-600">No question breakdown available.</p>
                    ) : (() => {
                      const incorrect = detailSubmission.questionResults.filter((r) => !r.correct);
                      if (incorrect.length === 0) {
                        return (
                          <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            All answers correct
                          </p>
                        );
                      }
                      return (
                        <ul className="space-y-3">
                          {incorrect.map((r) => (
                            <li key={r.questionId} className="p-3 rounded-lg border border-gray-200 text-left bg-gray-50/50">
                              <p className="text-sm font-medium text-gray-800 mb-2">
                                {questionTextMap[r.questionId] ?? r.questionId}
                              </p>
                              <p className="text-xs text-red-600">
                                <span className="font-medium">User answer:</span> {r.userAnswer || '—'}
                              </p>
                              <p className="text-xs text-green-700 mt-0.5">
                                <span className="font-medium">Correct answer:</span> {r.correctAnswer}
                              </p>
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
