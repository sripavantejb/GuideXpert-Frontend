import { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiCheckCircle, FiTrendingUp, FiActivity, FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiLock, FiPlay, FiClipboard } from 'react-icons/fi';
import KpiCard from '../../components/Admin/KpiCard';
import { getWebinarProgressList, getWebinarProgressStats, getWebinarProgressExport } from '../../utils/adminApi';

const MODULE_ORDER = ['intro', 's2', 'a1', 's3', 'a2', 's4', 'a3', 's5', 'a4', 's6', 'a5'];
const MODULE_LABELS = {
  intro: 'Intro',
  s2: 'Session 1', a1: 'Assessment 1',
  s3: 'Session 2', a2: 'Assessment 2',
  s4: 'Session 3', a3: 'Assessment 3',
  s5: 'Session 4', a4: 'Assessment 4',
  s6: 'Session 5', a5: 'Assessment 5',
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    unlocked: 'bg-amber-100 text-amber-700',
    locked: 'bg-gray-100 text-gray-500',
  };
  const labels = {
    completed: 'Completed',
    in_progress: 'In Progress',
    unlocked: 'Unlocked',
    locked: 'Locked',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles[status] || styles.locked}`}>
      {labels[status] || status}
    </span>
  );
}

function ModuleIcon({ moduleId, status }) {
  const isAssessment = moduleId.startsWith('a');
  const color = status === 'completed' ? 'text-green-500' : status === 'in_progress' ? 'text-blue-500' : status === 'unlocked' ? 'text-amber-500' : 'text-gray-300';
  if (status === 'locked') return <FiLock className={`w-3.5 h-3.5 ${color}`} />;
  if (isAssessment) return <FiClipboard className={`w-3.5 h-3.5 ${color}`} />;
  return <FiPlay className={`w-3.5 h-3.5 ${color}`} />;
}

function ProgressBar({ percent, className = '' }) {
  const color = percent >= 100 ? 'bg-green-500' : percent > 0 ? 'bg-blue-500' : 'bg-gray-200';
  return (
    <div className={`h-2 rounded-full bg-gray-100 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}

function UserDetailPanel({ user }) {
  if (!user) return null;
  const modules = user.modules || {};

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Module Progress</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULE_ORDER.map((id) => {
          const mod = modules[id] || modules.get?.(id) || {};
          const isAssessment = id.startsWith('a');
          return (
            <div key={id} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                <ModuleIcon moduleId={id} status={mod.status || 'locked'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{MODULE_LABELS[id] || id}</p>
                  <StatusBadge status={mod.status || 'locked'} />
                </div>
                <ProgressBar percent={mod.progressPercent || 0} className="mb-1.5" />
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span>{Math.round(mod.progressPercent || 0)}%</span>
                  {!isAssessment && mod.maxWatchedSeconds > 0 && (
                    <span>Watched: {Math.floor(mod.maxWatchedSeconds / 60)}m {Math.round(mod.maxWatchedSeconds % 60)}s</span>
                  )}
                  {isAssessment && mod.score != null && mod.totalScore != null && (
                    <span>Score: {mod.score}/{mod.totalScore}</span>
                  )}
                  {mod.completedAt && (
                    <span>Done: {new Date(mod.completedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Timeline</h4>
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
        {MODULE_ORDER.map((id, i) => {
          const mod = modules[id] || modules.get?.(id) || {};
          const bg = mod.status === 'completed' ? 'bg-green-500' : mod.status === 'in_progress' ? 'bg-blue-500' : mod.status === 'unlocked' ? 'bg-amber-400' : 'bg-gray-200';
          return (
            <div key={id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center`} title={`${MODULE_LABELS[id]}: ${mod.status || 'locked'}`}>
                  <ModuleIcon moduleId={id} status={mod.status || 'locked'} />
                </div>
                <span className="text-[9px] text-gray-500 mt-0.5 whitespace-nowrap max-w-[48px] truncate text-center">{MODULE_LABELS[id]}</span>
              </div>
              {i < MODULE_ORDER.length - 1 && (
                <div className={`w-4 h-0.5 ${mod.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'} mx-0.5 mt-[-12px]`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WebinarProgress() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [expandedPhone, setExpandedPhone] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await getWebinarProgressStats();
    if (res.success && res.data) setStats(res.data);
    setStatsLoading(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await getWebinarProgressList({ page, limit, search, status: statusFilter, sort: '-lastActivityAt' });
    if (res.success && res.data) {
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    }
    setLoading(false);
  }, [page, limit, search, statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleExport = async () => {
    setExporting(true);
    await getWebinarProgressExport();
    setExporting(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Webinar Progress</h2>
        <p className="text-sm text-gray-500 mt-0.5">Track user progress across webinar sessions and assessments.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Enrolled"
          value={statsLoading ? '—' : stats?.totalEnrolled ?? 0}
          icon={FiUsers}
          accent="hero"
        />
        <KpiCard
          label="Fully Completed"
          value={statsLoading ? '—' : stats?.fullyCompleted ?? 0}
          icon={FiCheckCircle}
          subtitle={stats && stats.totalEnrolled > 0 ? `${Math.round((stats.fullyCompleted / stats.totalEnrolled) * 100)}% completion rate` : undefined}
        />
        <KpiCard
          label="Avg. Progress"
          value={statsLoading ? '—' : `${stats?.averagePercent ?? 0}%`}
          icon={FiTrendingUp}
        />
        <KpiCard
          label="Active (24h)"
          value={statsLoading ? '—' : stats?.activeLast24h ?? 0}
          icon={FiActivity}
        />
      </div>

      {/* Per-module completion bar */}
      {stats?.perModuleCompletion && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Per-Module Completion</h3>
          <div className="space-y-2">
            {MODULE_ORDER.map((id) => {
              const count = stats.perModuleCompletion[id] || 0;
              const pct = stats.totalEnrolled > 0 ? Math.round((count / stats.totalEnrolled) * 100) : 0;
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 w-24 shrink-0 truncate">{MODULE_LABELS[id]}</span>
                  <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${id.startsWith('a') ? 'bg-amber-400' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right tabular-nums">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-9 pr-4 h-10 rounded-lg border border-gray-300 text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="not_started">Not Started</option>
        </select>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[180px]">Overall Progress</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Module</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modules Done</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isExpanded = expandedPhone === u.phone;
                  const completedCount = (u.completedModules || []).length;
                  const overallStatus = u.overallPercent >= 100 ? 'completed' : u.overallPercent > 0 ? 'in_progress' : 'not_started';
                  const statusColor = overallStatus === 'completed' ? 'text-green-600' : overallStatus === 'in_progress' ? 'text-blue-600' : 'text-gray-400';

                  return (
                    <tr key={u.phone} className="group">
                      <td colSpan={7} className="p-0">
                        <div
                          className={`grid grid-cols-[1fr] ${isExpanded ? '' : ''}`}
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedPhone(isExpanded ? null : u.phone)}
                            className="w-full text-left grid grid-cols-[repeat(7,auto)] hover:bg-gray-50 transition-colors"
                            style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(180px,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 80px' }}
                          >
                            <span className="px-4 py-3.5 text-sm font-medium text-gray-800 truncate">{u.fullName || '—'}</span>
                            <span className="px-4 py-3.5 text-sm text-gray-600 tabular-nums">{u.phone}</span>
                            <span className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <ProgressBar percent={u.overallPercent || 0} className="flex-1" />
                                <span className={`text-xs font-semibold tabular-nums ${statusColor}`}>{u.overallPercent || 0}%</span>
                              </div>
                            </span>
                            <span className="px-4 py-3.5 text-sm text-gray-600 truncate">
                              {MODULE_LABELS[u.lastActiveModule] || u.lastActiveModule || '—'}
                            </span>
                            <span className="px-4 py-3.5 text-sm text-gray-600 tabular-nums">{completedCount}/{MODULE_ORDER.length}</span>
                            <span className="px-4 py-3.5 text-xs text-gray-500">{timeAgo(u.lastActivityAt)}</span>
                            <span className="px-4 py-3.5 flex items-center justify-center">
                              {isExpanded ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
                            </span>
                          </button>
                          {isExpanded && <UserDetailPanel user={u} />}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 px-2 tabular-nums">{page} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
