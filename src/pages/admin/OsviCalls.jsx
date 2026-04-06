import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getOsviSetting, setOsviSetting } from '../../utils/adminApi';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import { getStoredToken } from '../../utils/adminApi';

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
};

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status || '—'}
    </span>
  );
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch {
    return String(dateStr);
  }
}

async function fetchOsviCalls({ page = 1, limit = 50, status = '' } = {}) {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  const res = await fetch(`${base}/admin/osvi-calls?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data;
}

export default function OsviCalls() {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin === true;

  const [osviEnabled, setOsviEnabledState] = useState(true);
  const [osviLoading, setOsviLoading] = useState(true);
  const [osviToggling, setOsviToggling] = useState(false);
  const [osviStatus, setOsviStatus] = useState({ type: null, message: '' });

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState('');

  const LIMIT = 50;

  useEffect(() => {
    let cancelled = false;
    setOsviLoading(true);
    getOsviSetting()
      .then((res) => {
        if (cancelled) return;
        if (res.success) setOsviEnabledState(res.data?.osviEnabled !== false);
      })
      .finally(() => { if (!cancelled) setOsviLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const loadTable = useCallback(async (pg, sf) => {
    setTableLoading(true);
    setTableError('');
    try {
      const data = await fetchOsviCalls({ page: pg, limit: LIMIT, status: sf });
      if (data.success) {
        setRows(data.rows || []);
        setTotal(data.total || 0);
      } else {
        setTableError(data.message || 'Failed to load.');
      }
    } catch (err) {
      setTableError(err.message || 'Network error.');
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTable(page, statusFilter);
  }, [loadTable, page, statusFilter]);

  const handleToggle = async () => {
    if (!isSuperAdmin || osviToggling) return;
    const next = !osviEnabled;
    setOsviToggling(true);
    setOsviStatus({ type: null, message: '' });
    const res = await setOsviSetting(next);
    setOsviToggling(false);
    if (res.success) {
      setOsviEnabledState(res.data?.osviEnabled !== false);
      setOsviStatus({
        type: 'success',
        message: res.data?.osviEnabled ? 'OSVI calls enabled.' : 'OSVI calls disabled.',
      });
    } else {
      setOsviStatus({ type: 'error', message: res.message || 'Failed to update setting.' });
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">OSVI Outbound Calls</h2>

      {/* Toggle card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">OSVI Outbound Calls</p>
            <p className="text-xs text-gray-500 mt-0.5">
              When enabled, an AI voice call is triggered after each slot booking on the counselor Apply form.
              {!isSuperAdmin && <span className="ml-1 text-amber-600">Only super admins can change this.</span>}
            </p>
            {osviStatus.message && (
              <p className={`text-xs mt-1 font-medium ${osviStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`} role="alert">
                {osviStatus.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!osviLoading && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${osviEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {osviEnabled ? 'ON' : 'OFF'}
              </span>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={osviEnabled}
              disabled={!isSuperAdmin || osviLoading || osviToggling}
              onClick={handleToggle}
              title={!isSuperAdmin ? 'Only super admins can change this' : undefined}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-navy focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${osviEnabled ? 'bg-primary-navy' : 'bg-gray-200'}`}
            >
              <span className="sr-only">{osviEnabled ? 'Disable OSVI calls' : 'Enable OSVI calls'}</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${osviEnabled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Call history */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Call History</h3>
            {!tableLoading && <p className="text-xs text-gray-500 mt-0.5">{total} record{total !== 1 ? 's' : ''}</p>}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-navy"
            >
              <option value="">All statuses</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
            </select>
            <button
              type="button"
              onClick={() => loadTable(page, statusFilter)}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {tableError && (
          <div className="px-5 py-4 text-sm text-red-600">{tableError}</div>
        )}

        {tableLoading ? (
          <div className="px-5 py-8 text-sm text-gray-500 text-center">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-gray-600">No OSVI call records yet.</p>
            <p className="text-xs text-gray-400 mt-1">Records appear here after a counselor completes slot booking with OSVI enabled.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold">Slot</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Scheduled</th>
                    <th className="px-4 py-3 text-left font-semibold">Completed</th>
                    <th className="px-4 py-3 text-left font-semibold">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={String(row.id)} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{row.name}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">{row.phone}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.slot}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmt(row.scheduledAt)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmt(row.completedAt)}</td>
                      <td className="px-4 py-3 text-red-500 text-xs max-w-xs truncate" title={row.lastError || undefined}>
                        {row.lastError || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 font-medium"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
