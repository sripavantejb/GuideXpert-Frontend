import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import KpiCard from '../../../components/Admin/KpiCard';
import ChartContainer from '../../../components/Admin/ChartContainer';
import ReminderReviewDrawer from './ReminderReviewDrawer';
import {
  bulkScheduleAiCalls,
  bulkScheduleAllPendingAiCalls,
  cancelAiCallReminder,
  createAiTestCall,
  deleteAiCallReminder,
  getAiCallsAnalytics,
  getAiCallsQueue,
  getAiCallsReminders,
  getAiCallsSettings,
  patchAiCallsSettings,
  previewAiTestCall,
  rejectAiCallReminder,
  retryAiCallReminder,
  scheduleAiCallReminder,
} from '../../../utils/aiCallsAdminApi';

const STATUS_COLORS = {
  pending_approval: 'bg-amber-100 text-amber-800',
  scheduled: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-700',
};

const FILTERS = [
  { id: 'all', label: 'All Calls' },
  { id: 'pending_approval', label: 'Pending Approval' },
  { id: 'today', label: "Today's Calls" },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'completed', label: 'Completed' },
  { id: 'failed', label: 'Failed' },
  { id: 'cancelled', label: 'Cancelled' },
];

function toDatetimeLocalValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultTestCallbackLocal() {
  return toDatetimeLocalValue(new Date(Date.now() + 3 * 60 * 1000));
}

/** Parse datetime-local as local wall-clock (avoids UTC mis-parse). */
function parseDatetimeLocalToDate(value) {
  if (!value || typeof value !== 'string') return null;
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return String(dateStr);
  }
}

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status?.replace(/_/g, ' ') || '—'}
    </span>
  );
}

function ReminderTable({
  rows,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onView,
  onSchedule,
  onReject,
  onDelete,
  onRetry,
  onCancel,
  showSelect = false,
  queueMode = false,
}) {
  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-500">Loading…</div>;
  }
  if (!rows.length) {
    return <div className="py-8 text-center text-sm text-gray-500">No reminders found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            {showSelect && (
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && rows.every((r) => selectedIds.has(r._id))}
                  onChange={(e) => onToggleAll(e.target.checked, rows)}
                />
              </th>
            )}
            <th className="px-3 py-2">Student</th>
            <th className="px-3 py-2">Phone</th>
            <th className="px-3 py-2">Class</th>
            {!queueMode && <th className="px-3 py-2">City</th>}
            <th className="px-3 py-2">Selected Slot</th>
            <th className="px-3 py-2">Reminder Time</th>
            <th className="px-3 py-2">Created</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id} className="border-t hover:bg-gray-50/80">
              {showSelect && (
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row._id)}
                    onChange={() => onToggleSelect(row._id)}
                  />
                </td>
              )}
              <td className="px-3 py-2 font-medium text-gray-900">{row.studentName || '—'}</td>
              <td className="px-3 py-2">{row.phone || '—'}</td>
              <td className="px-3 py-2 max-w-[120px] truncate" title={row.class}>{row.class || '—'}</td>
              {!queueMode && <td className="px-3 py-2">{row.city || '—'}</td>}
              <td className="px-3 py-2 max-w-[160px] truncate" title={row.selectedSlot}>{row.selectedSlot || '—'}</td>
              <td className="px-3 py-2 whitespace-nowrap">{fmt(row.callbackTime)}</td>
              <td className="px-3 py-2 whitespace-nowrap">{fmt(row.createdAt)}</td>
              <td className="px-3 py-2"><StatusBadge status={row.status} /></td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  <button type="button" onClick={() => onView(row._id)} className="text-xs text-primary-navy hover:underline">View</button>
                  {queueMode && (
                    <>
                      <button type="button" onClick={() => onSchedule(row._id)} className="text-xs text-green-700 hover:underline">Schedule</button>
                      <button type="button" onClick={() => onReject(row._id)} className="text-xs text-red-600 hover:underline">Reject</button>
                      <button type="button" onClick={() => onDelete(row._id)} className="text-xs text-gray-600 hover:underline">Delete</button>
                    </>
                  )}
                  {!queueMode && row.status === 'failed' && (
                    <button type="button" onClick={() => onRetry(row._id)} className="text-xs text-blue-700 hover:underline">Retry</button>
                  )}
                  {!queueMode && ['scheduled', 'processing'].includes(row.status) && (
                    <button type="button" onClick={() => onCancel(row._id)} className="text-xs text-gray-600 hover:underline">Cancel</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AiCallsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [schedulingMode, setSchedulingMode] = useState('manual_approval');
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [queueRows, setQueueRows] = useState([]);
  const [queueTotal, setQueueTotal] = useState(0);
  const [queueLoading, setQueueLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const [drawerId, setDrawerId] = useState(null);

  const [testForm, setTestForm] = useState({
    personName: '',
    phone: '',
    callbackTime: defaultTestCallbackLocal(),
    notes: '',
  });
  const [testPayload, setTestPayload] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState('');

  const LIMIT = 25;

  const refreshAnalytics = useCallback(async () => {
    const res = await getAiCallsAnalytics();
    if (res.success) {
      setAnalytics(res.data?.data || res.data);
    }
  }, []);

  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    const res = await getAiCallsQueue({ page: 1, limit: 50 });
    if (res.success) {
      setQueueRows(res.data?.rows || []);
      setQueueTotal(res.data?.total || 0);
    }
    setQueueLoading(false);
  }, []);

  const loadTable = useCallback(async (pg, sf, q) => {
    setTableLoading(true);
    setError('');
    const res = await getAiCallsReminders({ page: pg, limit: LIMIT, filter: sf, q });
    if (res.success) {
      setRows(res.data?.rows || []);
      setTotal(res.data?.total || 0);
    } else {
      setError(res.message || 'Failed to load.');
    }
    setTableLoading(false);
  }, []);

  useEffect(() => {
    getAiCallsSettings().then((res) => {
      if (res.success) {
        setSchedulingMode(res.data?.data?.schedulingMode || res.data?.schedulingMode || 'manual_approval');
      }
    });
    refreshAnalytics();
    loadQueue();
  }, [refreshAnalytics, loadQueue]);

  useEffect(() => {
    loadTable(page, filter, search);
  }, [page, filter, search, loadTable]);

  function refreshAll() {
    refreshAnalytics();
    loadQueue();
    loadTable(page, filter, search);
  }

  function onToggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onToggleAll(checked, tableRows) {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(tableRows.map((r) => r._id)));
  }

  async function handleBulkScheduleSelected() {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (!window.confirm(`Schedule ${ids.length} selected reminder(s) to OSVI?`)) return;
    setBulkLoading(true);
    const res = await bulkScheduleAiCalls(ids);
    setBulkLoading(false);
    if (!res.success) {
      setError(res.message || 'Bulk schedule failed.');
      return;
    }
    const data = res.data?.data || res.data;
    alert(`Scheduled: ${data.scheduled}, Failed: ${data.failed}`);
    setSelectedIds(new Set());
    refreshAll();
  }

  async function handleBulkScheduleAll() {
    if (!window.confirm(`Schedule all ${queueTotal} pending reminder(s) to OSVI?`)) return;
    setBulkLoading(true);
    const res = await bulkScheduleAllPendingAiCalls();
    setBulkLoading(false);
    if (!res.success) {
      setError(res.message || 'Bulk schedule failed.');
      return;
    }
    const data = res.data?.data || res.data;
    alert(`Scheduled: ${data.scheduled}, Failed: ${data.failed}`);
    setSelectedIds(new Set());
    refreshAll();
  }

  async function handleSchedule(id) {
    if (!window.confirm('Schedule this reminder to OSVI?')) return;
    const res = await scheduleAiCallReminder(id);
    if (!res.success) {
      setError(res.message || 'Schedule failed.');
      return;
    }
    refreshAll();
  }

  async function handleReject(id) {
    if (!window.confirm('Reject this reminder?')) return;
    const res = await rejectAiCallReminder(id, {});
    if (!res.success) {
      setError(res.message || 'Reject failed.');
      return;
    }
    refreshAll();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this reminder?')) return;
    const res = await deleteAiCallReminder(id);
    if (!res.success) {
      setError(res.message || 'Delete failed.');
      return;
    }
    refreshAll();
  }

  async function handleRetry(id) {
    const res = await retryAiCallReminder(id);
    if (!res.success) {
      setError(res.message || 'Retry failed.');
      return;
    }
    refreshAll();
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this reminder?')) return;
    const res = await cancelAiCallReminder(id);
    if (!res.success) {
      setError(res.message || 'Cancel failed.');
      return;
    }
    refreshAll();
  }

  async function handleSettingsChange(mode) {
    setSettingsSaving(true);
    const res = await patchAiCallsSettings({ schedulingMode: mode });
    setSettingsSaving(false);
    if (res.success) {
      setSchedulingMode(mode);
    } else {
      setError(res.message || 'Failed to save settings.');
    }
  }

  async function handlePreviewTest() {
    setTestLoading(true);
    setTestPayload(null);
    const parsed = parseDatetimeLocalToDate(testForm.callbackTime);
    const body = {
      personName: testForm.personName,
      phone: testForm.phone,
      callbackTime: parsed ? parsed.toISOString() : null,
      notes: testForm.notes,
    };
    const res = await previewAiTestCall(body);
    setTestLoading(false);
    if (res.success) {
      setTestPayload(res.data?.data?.payload || res.data?.payload);
    } else {
      setError(res.message || 'Preview failed.');
    }
  }

  async function handleSendTest() {
    if (!window.confirm('Schedule this test call with OSVI? The phone will ring at the callback time you set — not immediately.')) return;
    setTestLoading(true);
    setTestSuccess('');
    setError('');
    const parsed = parseDatetimeLocalToDate(testForm.callbackTime);
    if (!parsed) {
      setError('Invalid callback time.');
      setTestLoading(false);
      return;
    }
    const body = {
      personName: testForm.personName,
      phone: testForm.phone,
      callbackTime: parsed.toISOString(),
      notes: testForm.notes,
    };
    const res = await createAiTestCall(body);
    setTestLoading(false);
    if (!res.success) {
      setError(res.message || res.data?.message || 'Test call failed.');
      return;
    }
    const msg = res.data?.message || res.data?.data?.message || 'Test call scheduled with OSVI.';
    setTestSuccess(msg);
    setTestForm({ personName: '', phone: '', callbackTime: defaultTestCallbackLocal(), notes: '' });
    setTestPayload(null);
    refreshAnalytics();
  }

  const summary = analytics?.summary || {};
  const dailySeries = [...(analytics?.dailySeries || [])].reverse();
  const rates = analytics?.rates || {};

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Calls</h1>
        <p className="text-sm text-gray-500 mt-1">
          IIT counselling reminder calls — manual approval queue before OSVI scheduling.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Pending Approval" value={summary.pendingApproval ?? '—'} accent="hero" />
        <KpiCard label="Scheduled" value={summary.scheduled ?? '—'} />
        <KpiCard label="Completed" value={summary.completed ?? '—'} />
        <KpiCard label="Failed" value={summary.failed ?? '—'} />
        <KpiCard label="Cancelled" value={summary.cancelled ?? '—'} />
        <KpiCard label="Test Calls Today" value={summary.testCallsToday ?? '—'} />
      </div>

      {dailySeries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Daily Calls">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailySeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#1e3a5f" name="Total" />
                <Bar dataKey="completed" fill="#16a34a" name="Completed" />
                <Bar dataKey="failed" fill="#dc2626" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <ChartContainer title="Success / Failure Rate">
            <div className="flex items-center justify-center h-[220px] gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{rates.successRate ?? 0}%</p>
                <p className="text-sm text-gray-500">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{rates.failureRate ?? 0}%</p>
                <p className="text-sm text-gray-500">Failure Rate</p>
              </div>
            </div>
          </ChartContainer>
        </div>
      )}

      <section className="bg-white rounded-xl border shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pending Approval Queue</h2>
            <p className="text-xs text-gray-500">{queueTotal} awaiting review</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={bulkLoading || selectedIds.size === 0}
              onClick={handleBulkScheduleSelected}
              className="px-3 py-1.5 text-sm font-medium bg-primary-navy text-white rounded-lg disabled:opacity-50"
            >
              Schedule Selected ({selectedIds.size})
            </button>
            <button
              type="button"
              disabled={bulkLoading || queueTotal === 0}
              onClick={handleBulkScheduleAll}
              className="px-3 py-1.5 text-sm font-medium border border-primary-navy text-primary-navy rounded-lg disabled:opacity-50"
            >
              Schedule All Pending
            </button>
          </div>
        </div>
        <ReminderTable
          rows={queueRows}
          loading={queueLoading}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onToggleAll={onToggleAll}
          onView={setDrawerId}
          onSchedule={handleSchedule}
          onReject={handleReject}
          onDelete={handleDelete}
          showSelect
          queueMode
        />
      </section>

      <section className="bg-white rounded-xl border shadow-sm">
        <div className="px-4 py-3 border-b space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">All Reminders</h2>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => { setFilter(f.id); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filter === f.id ? 'bg-primary-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search name, phone, class…"
            className="w-full max-w-sm border rounded-lg px-3 py-2 text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <ReminderTable
          rows={rows}
          loading={tableLoading}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onToggleAll={onToggleAll}
          onView={setDrawerId}
          onSchedule={handleSchedule}
          onReject={handleReject}
          onDelete={handleDelete}
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
          <span>Page {page} of {Math.max(1, Math.ceil(total / LIMIT))} ({total} total)</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-50">Prev</button>
            <button type="button" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Calls Settings</h2>
        <p className="text-sm text-gray-500 mb-4">Reminder Scheduling Mode</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="schedulingMode"
              checked={schedulingMode === 'manual_approval'}
              disabled={settingsSaving}
              onChange={() => handleSettingsChange('manual_approval')}
            />
            Manual Approval (default)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="schedulingMode"
              checked={schedulingMode === 'automatic'}
              disabled={settingsSaving}
              onChange={() => handleSettingsChange('automatic')}
            />
            Automatic Scheduling
          </label>
        </div>
      </section>

      <section className="bg-white rounded-xl border shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Request Test Call</h2>
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 max-w-2xl">
          OSVI <strong>schedules</strong> the call for the callback time — your phone rings at that time, not right away.
          Use a time at least 1–2 minutes in the future. Notes fill <code className="text-xs">prev_call_summary</code> and <code className="text-xs">additional_data.biggest_concern</code>.
        </p>
        {testSuccess && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800 max-w-2xl">
            {testSuccess}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {['personName', 'phone', 'notes'].map((field) => (
            <label key={field} className="block text-sm text-gray-600">
              {field === 'personName' ? 'Person Name' : field === 'phone' ? 'Phone Number' : 'Notes'}
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={testForm[field]}
                onChange={(e) => setTestForm((f) => ({ ...f, [field]: e.target.value }))}
              />
            </label>
          ))}
          <label className="block text-sm text-gray-600 md:col-span-2">
            Callback Time (when OSVI will ring the phone)
            <div className="mt-1 flex flex-wrap gap-2">
              <input
                type="datetime-local"
                className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 text-sm"
                value={testForm.callbackTime}
                onChange={(e) => setTestForm((f) => ({ ...f, callbackTime: e.target.value }))}
              />
              <button
                type="button"
                className="px-3 py-2 text-sm border rounded-lg whitespace-nowrap"
                onClick={() => setTestForm((f) => ({ ...f, callbackTime: defaultTestCallbackLocal() }))}
              >
                Set ~3 min from now
              </button>
            </div>
          </label>
        </div>
        {testPayload && (
          <pre className="mt-4 text-xs bg-slate-900 text-green-300 rounded-lg p-3 overflow-x-auto max-w-2xl">
            {JSON.stringify(testPayload, null, 2)}
          </pre>
        )}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            disabled={testLoading}
            onClick={handlePreviewTest}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
          >
            Preview Payload
          </button>
          <button
            type="button"
            disabled={testLoading || !testForm.personName || !testForm.phone || !testForm.callbackTime}
            onClick={handleSendTest}
            className="px-4 py-2 text-sm font-medium bg-primary-navy text-white rounded-lg disabled:opacity-50"
          >
            Send Test Call
          </button>
        </div>
      </section>

      {drawerId && (
        <ReminderReviewDrawer
          reminderId={drawerId}
          onClose={() => setDrawerId(null)}
          onUpdated={refreshAll}
        />
      )}
    </div>
  );
}
