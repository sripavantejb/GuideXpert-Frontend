import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCopy, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import CopyToSheetsModal from './CopyToSheetsModal';
import { ADMIN_VIEW_ALL_LIMIT } from '../../constants/adminListLimits';
import { fetchAllPaginatedRows } from '../../utils/adminPagedFetch';
import { getIitainSessionFeedbackSubmissions, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const headClass =
  'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap align-top';
const cellClass = 'px-3 py-2 align-top text-sm text-gray-800';

const COPY_FIELDS = [
  { key: 'createdAt', label: 'Submitted' },
  { key: 'counselorName', label: 'Counselor' },
  { key: 'studentName', label: 'Student' },
  { key: 'registeredForNat', label: 'NAT registered' },
  { key: 'registeredForNad', label: 'NAD registered' },
  { key: 'sessionSummary', label: 'Session summary' },
  { key: 'sessionRecordingLink', label: 'Recording link' },
];

function formatDateTime(value) {
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
  });
}

function YesNoBadge({ value }) {
  if (value === true) {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        Yes
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
        No
      </span>
    );
  }
  return <span className="text-gray-400">—</span>;
}

function getCellValue(row, key) {
  if (key === 'createdAt') return formatDateTime(row.createdAt);
  if (key === 'registeredForNat' || key === 'registeredForNad') {
    return row[key] === true ? 'Yes' : row[key] === false ? 'No' : '';
  }
  const v = row[key];
  return v == null ? '' : String(v);
}

function buildQueryParams({
  page,
  limit,
  from,
  to,
  q,
  counselorName,
  registeredForNat,
  registeredForNad,
}) {
  const params = { page, limit };
  if (from) params.from = from;
  if (to) params.to = to;
  if (q) params.q = q;
  if (counselorName) params.counselorName = counselorName;
  if (registeredForNat) params.registeredForNat = registeredForNat;
  if (registeredForNad) params.registeredForNad = registeredForNad;
  return params;
}

export default function IitainSessionFeedbackTab({ counselors = [] }) {
  const { logout } = useAuth();
  const token = getStoredToken();

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [viewAll, setViewAll] = useState(false);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [counselorFilter, setCounselorFilter] = useState('');
  const [natFilter, setNatFilter] = useState('');
  const [nadFilter, setNadFilter] = useState('');

  const [copyOpen, setCopyOpen] = useState(false);
  const [copyRows, setCopyRows] = useState([]);
  const [copyLoading, setCopyLoading] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);

  const counselorOptions = useMemo(
    () => [...new Set(counselors.map((c) => c.name).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [counselors]
  );

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = buildQueryParams({
        page: pagination.page,
        limit: viewAll ? ADMIN_VIEW_ALL_LIMIT : pagination.limit,
        from,
        to,
        q: debouncedSearch,
        counselorName: counselorFilter,
        registeredForNat: natFilter,
        registeredForNad: nadFilter,
      });
      const res = await getIitainSessionFeedbackSubmissions(params, token);
      if (!res.success) {
        if (res.status === 401) logout();
        setError(res.message || 'Failed to load submissions');
        return;
      }
      setRows(res.data?.data || []);
      setStats(res.data?.stats || null);
      setPagination(res.data?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
    } catch {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    viewAll,
    from,
    to,
    debouncedSearch,
    counselorFilter,
    natFilter,
    nadFilter,
    token,
    logout,
  ]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const clearFilters = () => {
    setFrom('');
    setTo('');
    setSearch('');
    setCounselorFilter('');
    setNatFilter('');
    setNadFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const prepareCopy = async () => {
    setCopyLoading(true);
    setError('');
    const baseParams = buildQueryParams({
      from,
      to,
      q: debouncedSearch,
      counselorName: counselorFilter,
      registeredForNat: natFilter,
      registeredForNad: nadFilter,
    });
    const result = await fetchAllPaginatedRows((page, limit) =>
      getIitainSessionFeedbackSubmissions({ ...baseParams, page, limit }, token)
    );
    setCopyLoading(false);
    if (!result.success) {
      setError(result.result?.message || 'Failed to prepare copy data');
      return;
    }
    setCopyRows(
      (result.rows || []).map((row) => {
        const out = {};
        COPY_FIELDS.forEach(({ key }) => {
          out[key] = getCellValue(row, key);
        });
        return out;
      })
    );
    setCopyOpen(true);
  };

  return (
    <div className="space-y-4">
      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">NAT — Yes</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.registeredForNatYes ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">NAT — No</p>
            <p className="mt-1 text-2xl font-bold text-gray-700">{stats.registeredForNatNo ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">NAD — Yes</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.registeredForNadYes ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">NAD — No</p>
            <p className="mt-1 text-2xl font-bold text-gray-700">{stats.registeredForNadNo ?? 0}</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Student, counselor, summary…"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Counselor</label>
          <select
            value={counselorFilter}
            onChange={(e) => {
              setCounselorFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm min-w-[160px]"
          >
            <option value="">All</option>
            {counselorOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">NAT</label>
          <select
            value={natFilter}
            onChange={(e) => {
              setNatFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">NAD</label>
          <select
            value={nadFilter}
            onChange={(e) => {
              setNadFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <FiX /> Clear
        </button>
        <button
          type="button"
          onClick={() => void loadRows()}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
        <button
          type="button"
          onClick={() => void prepareCopy()}
          disabled={copyLoading}
          className="inline-flex items-center gap-1 rounded-lg bg-primary-navy px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <FiCopy /> {copyLoading ? 'Preparing…' : 'Copy all'}
        </button>
      </div>

      {error ? <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={headClass}>Submitted</th>
              <th className={headClass}>Counselor</th>
              <th className={headClass}>Student</th>
              <th className={headClass}>NAT</th>
              <th className={headClass}>NAD</th>
              <th className={headClass}>Session summary</th>
              <th className={headClass}>Recording</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                  No submissions yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80">
                  <td className={`${cellClass} whitespace-nowrap text-xs text-gray-600`}>
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className={cellClass}>{row.counselorName || '—'}</td>
                  <td className={cellClass}>{row.studentName || '—'}</td>
                  <td className={cellClass}>
                    <YesNoBadge value={row.registeredForNat} />
                  </td>
                  <td className={cellClass}>
                    <YesNoBadge value={row.registeredForNad} />
                  </td>
                  <td className={`${cellClass} max-w-[280px]`}>
                    <span className="block text-xs leading-5 text-gray-700" title={row.sessionSummary}>
                      {row.sessionSummary || '—'}
                    </span>
                  </td>
                  <td className={cellClass}>
                    {row.sessionRecordingLink ? (
                      <a
                        href={row.sessionRecordingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary-navy hover:underline break-all"
                      >
                        Open link
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && !viewAll && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                <FiChevronLeft aria-hidden />
                Prev
              </button>
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
                <FiChevronRight aria-hidden />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={viewAll}
          onChange={(e) => {
            setViewAll(e.target.checked);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
        />
        View all on one page
      </label>

      <CopyToSheetsModal
        fields={COPY_FIELDS}
        records={copyRows}
        getCellValue={(record, key) => record[key] ?? ''}
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        recordLabel="session feedback submissions"
        loading={copyLoading}
      />
    </div>
  );
}
