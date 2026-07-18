import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import {
  listRecoveryStudents,
  getRecoveryStudentDetail,
  getRecoveryStudentTimeline,
  resendRecovery,
  pauseRecovery,
  resumeRecovery,
  stopRecovery,
  assignHumanRecovery,
  bulkRecoveryAction,
  previewRecoveryMessage,
} from '../../../utils/conversationRecoveryAdminApi';

function confirmAction(message) {
  return window.confirm(message);
}

export default function ConversationRecoveryStudents() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [preview, setPreview] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listRecoveryStudents({
      recoveryStatus: statusFilter || undefined,
      limit: 50,
    });
    const payload = res.data?.data ?? res.data;
    setStudents(payload?.students || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function openDetail(id) {
    setSelected(id);
    setDetail(null);
    setTimeline(null);
    setPreview(null);
    const [d, t, p] = await Promise.all([
      getRecoveryStudentDetail(id),
      getRecoveryStudentTimeline(id),
      previewRecoveryMessage({ caseId: id }),
    ]);
    setDetail(d.data?.data ?? d.data);
    setTimeline(t.data?.data ?? t.data);
    setPreview(p.data?.data ?? p.data);
  }

  async function runAction(label, fn) {
    if (!confirmAction(`${label}? This will be audited.`)) return;
    setActionMsg(null);
    const res = await fn();
    setActionMsg(res.success ? `${label} OK` : res.message || 'Action failed');
    if (res.success) {
      await load();
      if (selected) await openDetail(selected);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function runBulk(action) {
    if (!confirmAction(`Bulk ${action} on ${selectedIds.length || 'failed'} cases?`)) return;
    const body =
      action === 'retry_failed'
        ? { action: 'retry_failed' }
        : { action, caseIds: selectedIds };
    const res = await bulkRecoveryAction(body);
    setActionMsg(
      res.success
        ? `Bulk ${action}: ${res.data?.data?.succeeded ?? 0}/${res.data?.data?.processed ?? 0}`
        : res.message || 'Bulk failed'
    );
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-600">
          Status{' '}
          <select
            className="ml-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="eligible">Eligible</option>
            <option value="scheduled">Scheduled</option>
            <option value="awaiting_reply">Awaiting reply</option>
            <option value="recovered">Recovered</option>
            <option value="paused">Paused</option>
            <option value="stopped">Stopped</option>
            <option value="exhausted">Exhausted</option>
            <option value="opted_out">Opted out</option>
          </select>
        </label>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium">
          <FiRefreshCw className="h-4 w-4" /> Refresh
        </button>
        <button type="button" className="rounded border border-slate-200 px-2 py-1 text-xs" onClick={() => runBulk('retry_failed')}>
          Bulk retry failed
        </button>
        <button type="button" className="rounded border border-slate-200 px-2 py-1 text-xs" disabled={!selectedIds.length} onClick={() => runBulk('retry_selected')}>
          Retry selected
        </button>
        <button type="button" className="rounded border border-slate-200 px-2 py-1 text-xs" disabled={!selectedIds.length} onClick={() => runBulk('pause_selected')}>
          Pause selected
        </button>
        <button type="button" className="rounded border border-slate-200 px-2 py-1 text-xs" disabled={!selectedIds.length} onClick={() => runBulk('resume_selected')}>
          Resume selected
        </button>
        <button type="button" className="rounded border border-red-200 px-2 py-1 text-xs text-red-700" disabled={!selectedIds.length} onClick={() => runBulk('stop_selected')}>
          Stop selected
        </button>
        {actionMsg ? <span className="text-sm text-slate-600">{actionMsg}</span> : null}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-600">
          <FiLoader className="h-5 w-5 animate-spin" /> Loading students…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2" />
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Phase</th>
                <th className="px-3 py-2">Attempt</th>
                <th className="px-3 py-2">Delivery</th>
                <th className="px-3 py-2">Recovery</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggleSelect(s.id)}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-800">{s.student || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{s.phone}</td>
                  <td className="px-3 py-2">{s.lastPhase ?? '—'}</td>
                  <td className="px-3 py-2">{s.recoveryAttempt ?? '—'}</td>
                  <td className="px-3 py-2">{s.deliveryStatus || '—'}</td>
                  <td className="px-3 py-2">{s.recoveryStatus}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button type="button" className="rounded border border-slate-200 px-2 py-0.5 text-xs" onClick={() => openDetail(s.id)}>
                        Timeline
                      </button>
                      <Link
                        to={`/admin/whatsapp-chat?conversationId=${encodeURIComponent(s.conversationId)}`}
                        className="rounded border border-slate-200 px-2 py-0.5 text-xs"
                      >
                        Chat
                      </Link>
                      <button type="button" className="rounded border border-slate-200 px-2 py-0.5 text-xs" onClick={() => runAction('Retry recovery', () => resendRecovery(s.id, { reason: 'admin_retry' }))}>
                        Retry
                      </button>
                      <button type="button" className="rounded border border-slate-200 px-2 py-0.5 text-xs" onClick={() => runAction('Pause recovery', () => pauseRecovery(s.id, { reason: 'admin_pause' }))}>
                        Pause
                      </button>
                      <button type="button" className="rounded border border-slate-200 px-2 py-0.5 text-xs" onClick={() => runAction('Resume recovery', () => resumeRecovery(s.id, { reason: 'admin_resume' }))}>
                        Resume
                      </button>
                      <button type="button" className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-700" onClick={() => runAction('Stop recovery', () => stopRecovery(s.id, { reason: 'admin_stop' }))}>
                        Stop
                      </button>
                      <button type="button" className="rounded border border-emerald-200 px-2 py-0.5 text-xs text-emerald-800" onClick={() => runAction('Assign human', () => assignHumanRecovery(s.id))}>
                        Assign human
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                    No recovery cases found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {selected && (detail || timeline) ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Delivery timeline</h3>
              <button type="button" className="text-xs text-slate-500 underline" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <ol className="space-y-2">
              {(timeline?.steps || []).map((step) => (
                <li key={step.key} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${step.completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <div>
                    <div className="font-medium text-slate-800">{step.label}</div>
                    <div className="text-xs text-slate-500">
                      {step.at ? new Date(step.at).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Message preview</h3>
            <pre className="whitespace-pre-wrap rounded-lg bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200">
              {preview?.message || '—'}
            </pre>
            <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200">
              {JSON.stringify(
                {
                  variables: preview?.variables,
                  journey: {
                    lastStage: detail?.snapshot?.lastStage,
                    lastStep: detail?.snapshot?.lastStep,
                    journeyCompleted: detail?.snapshot?.journeyCompleted,
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
