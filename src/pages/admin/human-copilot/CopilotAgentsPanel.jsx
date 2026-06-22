import { useCallback, useEffect, useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import {
  fetchCopilotAgents,
  updateCopilotAgentSettings,
  updateCopilotAgentStatus,
} from '../../../utils/humanCopilotApi';
import {
  getAgentRoleLabel,
  getAvailabilityLabel,
  getAvailabilityTone,
  PANEL_CLASS,
  ROUTING_MODE_LABELS,
  ROUTING_MODE_OPTIONS,
} from './copilotUtils';

function WorkloadBar({ percent }) {
  const value = Math.min(100, Math.max(0, Number(percent) || 0));
  const tone =
    value >= 100 ? 'bg-red-500' : value >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] tabular-nums text-slate-500 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function CopilotAgentsPanel() {
  const [agents, setAgents] = useState([]);
  const [routing, setRouting] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingMode, setSavingMode] = useState(false);
  const [actingId, setActingId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchCopilotAgents();
    if (!result.success) {
      setError(result.message || 'Failed to load agents');
      setAgents([]);
    } else {
      setError('');
      setAgents(result.agents || []);
      setRouting(result.routing || {});
      setAnalytics(result.analytics || {});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoutingModeChange = async (routingMode) => {
    setSavingMode(true);
    const result = await updateCopilotAgentSettings({ routingMode });
    setSavingMode(false);
    if (result.success) {
      if (result.routing) setRouting(result.routing);
      await load();
    }
  };

  const handleStatusChange = async (adminId, availability) => {
    setActingId(adminId);
    await updateCopilotAgentStatus(adminId, availability);
    setActingId('');
    await load();
  };

  const assignmentCounts = analytics.assignmentCounts || {};
  const routingReasons = analytics.routingReasons || {};

  return (
    <div className="space-y-4">
      <section className={`${PANEL_CLASS} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary-blue-600">
              <FiUsers className="h-4 w-4" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Routing</p>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              {ROUTING_MODE_LABELS[routing.mode] || routing.modeLabel || 'Manual assignment'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Fallback: {getAgentRoleLabel(routing.fallbackRole || 'general_counsellor')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ROUTING_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={savingMode}
                onClick={() => handleRoutingModeChange(opt.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  routing.mode === opt.value
                    ? 'border-primary-blue-300 bg-primary-blue-50 text-primary-blue-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section className={`${PANEL_CLASS} overflow-hidden`}>
        <div className="border-b border-slate-200/80 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Agent pool</h2>
          <p className="mt-1 text-xs text-slate-500">
            Workload, capacity, and availability for Human Copilot agents.
          </p>
        </div>
        {loading ? (
          <p className="p-4 text-sm text-slate-500">Loading agents…</p>
        ) : agents.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            No copilot agents configured. Enable agents in admin profiles with legacy sr1/sr2 slots
            for backward compatibility.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2 font-semibold">Agent</th>
                  <th className="px-4 py-2 font-semibold">Role</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold">Active</th>
                  <th className="px-4 py-2 font-semibold">Capacity</th>
                  <th className="px-4 py-2 font-semibold">Workload</th>
                  <th className="px-4 py-2 font-semibold">Specialties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.username}</p>
                      {agent.legacySlot ? (
                        <p className="text-[10px] text-slate-400">Legacy: {agent.legacySlot}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{getAgentRoleLabel(agent.role)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={agent.availability}
                        disabled={actingId === agent.id}
                        onChange={(e) => handleStatusChange(agent.id, e.target.value)}
                        className={`rounded-full border px-2 py-1 text-[11px] font-medium ${getAvailabilityTone(agent.availability)}`}
                      >
                        {['active', 'away', 'offline'].map((status) => (
                          <option key={status} value={status}>
                            {getAvailabilityLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      {agent.activeConversations}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      {agent.capacity}
                    </td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <WorkloadBar percent={agent.workloadPercent} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {(agent.specialties || []).join(', ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {(Object.keys(assignmentCounts).length > 0 || Object.keys(routingReasons).length > 0) && (
        <section className={`${PANEL_CLASS} p-4 sm:p-5`}>
          <h2 className="text-sm font-semibold text-slate-900">Routing analytics</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Assignments by mode
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {Object.entries(assignmentCounts).map(([key, count]) => (
                  <li key={key}>
                    {ROUTING_MODE_LABELS[key] || key}: {count}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Routing reasons
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {Object.entries(routingReasons).map(([key, count]) => (
                  <li key={key}>
                    {key}: {count}
                  </li>
                ))}
              </ul>
              {analytics.overloadEvents > 0 ? (
                <p className="mt-2 text-xs text-amber-800">
                  Overload events: {analytics.overloadEvents}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
