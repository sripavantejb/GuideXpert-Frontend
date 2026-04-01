import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { FiUsers, FiCheckCircle, FiTrendingUp, FiActivity, FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiLock, FiPlay, FiClipboard, FiRefreshCw, FiAward, FiX, FiCheck, FiAlertTriangle, FiStar, FiEdit3, FiRotateCcw, FiCalendar, FiFilter } from 'react-icons/fi';
import KpiCard from '../../components/Admin/KpiCard';
import { getWebinarProgressList, getWebinarProgressStats, getWebinarProgressExport, getWebinarUserAssessments, adminUpdateWebinarProgress, bulkWebinarProgress } from '../../utils/adminApi';

const MODULE_ORDER = ['intro', 's2', 'a1', 's3', 'a2', 's4', 'a3', 's5', 'a4', 's6', 'a5'];
const TIMELINE_IDS = [...MODULE_ORDER, 'certificate'];
const SESSION_IDS = ['intro', 's2', 's3', 's4', 's5', 's6'];
const ASSESSMENT_IDS = ['a1', 'a2', 'a3', 'a4', 'a5'];
const MODULE_LABELS = {
  intro: 'Introduction to GuideXpert Counsellor training program',
  s2: 'Session 1', a1: 'Assessment 1',
  s3: 'Session 2', a2: 'Assessment 2',
  s4: 'Session 3', a3: 'Assessment 3',
  s5: 'Session 4', a4: 'Assessment 4',
  s6: 'Session 5', a5: 'Assessment 5',
  certificate: 'Certificate',
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
    in_progress: 'bg-amber-100 text-amber-700',
    not_started: 'bg-gray-100 text-gray-500',
    unlocked: 'bg-amber-100 text-amber-700',
    locked: 'bg-gray-100 text-gray-500',
  };
  const labels = {
    completed: 'Completed',
    in_progress: 'In Progress',
    not_started: 'Not Started',
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
  if (moduleId === 'certificate') {
    const color = status === 'completed' ? 'text-green-500' : 'text-gray-300';
    return <FiAward className={`w-3.5 h-3.5 ${color}`} />;
  }
  const isAssessment = moduleId.startsWith('a');
  const color = status === 'completed' ? 'text-green-500' : status === 'in_progress' ? 'text-amber-500' : status === 'unlocked' ? 'text-amber-500' : 'text-gray-300';
  if (status === 'locked') return <FiLock className={`w-3.5 h-3.5 ${color}`} />;
  if (isAssessment) return <FiClipboard className={`w-3.5 h-3.5 ${color}`} />;
  return <FiPlay className={`w-3.5 h-3.5 ${color}`} />;
}

function ProgressBar({ percent, className = '' }) {
  const color = percent >= 100 ? 'bg-green-500' : percent > 0 ? 'bg-amber-500' : 'bg-gray-200';
  return (
    <div className={`h-2 rounded-full bg-gray-100 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-200 ${color}`} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}

function ScoreRing({ percent, size = 44 }) {
  const scoreColor = percent >= 80 ? '#22c55e' : percent >= 50 ? '#f59e0b' : '#ef4444';
  const bg = percent >= 80 ? '#dcfce7' : percent >= 50 ? '#fef3c7' : '#fee2e2';
  return (
    <div
      className="relative rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${scoreColor} ${percent * 3.6}deg, ${bg} ${percent * 3.6}deg)`,
      }}
    >
      <div className="absolute rounded-full bg-white flex items-center justify-center" style={{ width: size - 8, height: size - 8 }}>
        <span className="text-[11px] font-bold tabular-nums" style={{ color: scoreColor }}>{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

function QuestionReport({ results }) {
  if (!results || results.length === 0) return <p className="text-xs text-gray-400 py-2">No question data available.</p>;
  const correctCount = results.filter((r) => r.correct).length;
  return (
    <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
      <div className="divide-y divide-gray-50">
        {results.map((r, idx) => (
          <div key={r.questionId || idx} className={`px-3 py-2.5 text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
            <div className="flex items-start gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${r.correct ? 'bg-green-100' : 'bg-red-100'}`}>
                {r.correct ? <FiCheck className="w-3 h-3 text-green-600" /> : <FiX className="w-3 h-3 text-red-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 font-medium leading-snug">{r.text || `Question ${idx + 1}`}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
                  <span className="text-gray-500">Answer: <span className={r.correct ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{r.userAnswer || '—'}</span></span>
                  {!r.correct && <span className="text-gray-500">Correct: <span className="text-green-700 font-medium">{r.correctAnswer || '—'}</span></span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-4 text-[11px] font-medium text-gray-600">
        <span>Total: {results.length}</span>
        <span className="text-green-600">Correct: {correctCount}</span>
        <span>Accuracy: {results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0}%</span>
      </div>
    </div>
  );
}

function AssessmentCard({ assessmentId, moduleData, assessmentDetail }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState(0);

  const modStatus = moduleData?.status || 'locked';
  const isAttempted = assessmentDetail && assessmentDetail.attemptCount > 0;

  if (modStatus === 'locked' && !isAttempted) {
    return (
      <div className="rounded-lg border border-gray-200 border-l-4 border-l-gray-300 bg-white p-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
            <FiLock className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{MODULE_LABELS[assessmentId]}</p>
            <p className="text-[11px] text-gray-400">Locked</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAttempted) {
    return (
      <div className="rounded-lg border border-gray-200 border-l-4 border-l-gray-300 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
            <FiClipboard className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{MODULE_LABELS[assessmentId]}</p>
            <p className="text-[11px] text-gray-400">Not attempted yet</p>
          </div>
        </div>
      </div>
    );
  }

  const { bestScore, bestTotal, accuracy, attemptCount, lastAttemptedAt, attempts } = assessmentDetail;
  const borderColor = accuracy >= 80 ? 'border-l-green-500' : accuracy >= 50 ? 'border-l-amber-500' : 'border-l-red-500';
  const scoreBg = accuracy >= 80 ? 'bg-green-50 text-green-700' : accuracy >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
  const selectedAttempt = attempts[selectedAttemptIdx] || attempts[0];

  return (
    <div className={`rounded-lg border border-gray-200 border-l-4 ${borderColor} bg-white overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <ScoreRing percent={accuracy} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-800">{MODULE_LABELS[assessmentId]}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${scoreBg}`}>
                {bestScore}/{bestTotal}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
              <span>{attemptCount} attempt{attemptCount > 1 ? 's' : ''}</span>
              <span>Best: {accuracy}%</span>
              {lastAttemptedAt && <span>Last: {new Date(lastAttemptedAt).toLocaleDateString()}</span>}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 text-[11px] font-medium text-gray-500 bg-gray-50 border-t border-gray-100 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
      >
        {expanded ? 'Hide' : 'View'} Question Report
        {expanded ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {attempts.length > 1 && (
            <div className="flex items-center gap-2 py-2 overflow-x-auto">
              <span className="text-[11px] text-gray-500 shrink-0">Attempt:</span>
              {attempts.map((a, i) => (
                <button
                  key={a._id || i}
                  type="button"
                  onClick={() => setSelectedAttemptIdx(i)}
                  className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    i === selectedAttemptIdx ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  #{attempts.length - i} ({a.score}/{a.total})
                </button>
              ))}
            </div>
          )}
          {selectedAttempt && <QuestionReport results={selectedAttempt.results} />}
        </div>
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl p-5 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-500 mb-4">{message}</p>
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="button" onClick={onConfirm} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${confirmColor || 'bg-blue-600 hover:bg-blue-700'}`}>{confirmLabel || 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
}

function InlineToast({ message, type }) {
  if (!message) return null;
  const bg = type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700';
  return (
    <div className={`px-3 py-2 rounded-lg border text-xs font-medium ${bg} animate-in fade-in`}>
      {message}
    </div>
  );
}

function ModuleToggle({ moduleId, isCompleted, busy, onToggle }) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onToggle(moduleId, isCompleted ? 'uncomplete' : 'complete')}
      className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors disabled:opacity-50 ${
        isCompleted
          ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
          : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
      }`}
      title={isCompleted ? 'Click to mark incomplete' : 'Click to mark complete'}
    >
      {busy ? '...' : isCompleted ? 'Completed' : 'Mark Done'}
    </button>
  );
}

function formatTotalWatchSeconds(seconds) {
  if (!seconds || seconds < 0) return '0m';
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

function ProgressSummary({ user }) {
  const completed = new Set(user.completedModules || []);
  const doneLabels = MODULE_ORDER.filter((id) => completed.has(id)).map((id) => MODULE_LABELS[id]);
  const pendingLabels = MODULE_ORDER.filter((id) => !completed.has(id)).map((id) => MODULE_LABELS[id]);
  const mods = user.modules || {};
  let totalSec = 0;
  for (const id of SESSION_IDS) {
    const m = mods[id] || {};
    totalSec += Number(m.maxWatchedSeconds || m.watchedSeconds || 0);
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Overview</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-[11px] font-medium text-gray-400 mb-1">Completed modules</p>
          <p className="text-gray-800 leading-snug">{doneLabels.length ? doneLabels.join(' · ') : '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-gray-400 mb-1">Pending</p>
          <p className="text-gray-800 leading-snug">{pendingLabels.length ? pendingLabels.join(' · ') : '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-gray-400 mb-1">Time spent (sessions)</p>
          <p className="text-gray-800 font-semibold tabular-nums">{formatTotalWatchSeconds(totalSec)}</p>
        </div>
      </div>
    </div>
  );
}

function useDebounced(value, ms) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

function UserDetailPanel({ user, onUserUpdated }) {
  const [localUser, setLocalUser] = useState(user);
  const [assessmentData, setAssessmentData] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!localUser?.phone) return;
      setAssessmentLoading(true);
      try {
        const res = await getWebinarUserAssessments(localUser.phone);
        if (!cancelled && res.success && res.data?.data) {
          setAssessmentData(res.data.data);
        }
      } catch { /* ignore */ }
      if (!cancelled) setAssessmentLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [localUser?.phone]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!user || !localUser) return null;

  const modules = localUser.modules || {};
  const assessmentMap = {};
  if (assessmentData?.assessments) {
    for (const a of assessmentData.assessments) {
      assessmentMap[a.assessmentId] = a;
    }
  }

  const completedSet = new Set(localUser.completedModules || []);

  async function handleModuleToggle(moduleId, action) {
    setBusy(true);
    try {
      const res = await adminUpdateWebinarProgress(localUser.phone, { moduleUpdates: { [moduleId]: action } });
      if (res.success && res.data?.data) {
        setLocalUser(res.data.data);
        if (onUserUpdated) onUserUpdated(res.data.data);
        setToast({ message: `${MODULE_LABELS[moduleId]} ${action === 'complete' ? 'marked complete' : 'marked incomplete'}`, type: 'success' });
      } else {
        setToast({ message: res.message || 'Update failed', type: 'error' });
      }
    } catch {
      setToast({ message: 'Network error', type: 'error' });
    }
    setBusy(false);
  }

  async function handleBulkAction(bulkAction) {
    setConfirm(null);
    setBusy(true);
    try {
      const res = await adminUpdateWebinarProgress(localUser.phone, { bulkAction });
      if (res.success && res.data?.data) {
        setLocalUser(res.data.data);
        if (onUserUpdated) onUserUpdated(res.data.data);
        setToast({ message: bulkAction === 'complete_all' ? 'All modules marked complete' : 'Progress reset', type: 'success' });
      } else {
        setToast({ message: res.message || 'Update failed', type: 'error' });
      }
    } catch {
      setToast({ message: 'Network error', type: 'error' });
    }
    setBusy(false);
  }

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-5 space-y-5">
      <ProgressSummary user={localUser} />
      {/* Bulk actions toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FiEdit3 className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Controls</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {toast && <InlineToast message={toast.message} type={toast.type} />}
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirm({ action: 'complete_all', title: 'Complete All Modules', message: `Mark all sessions and assessments as completed for ${localUser.fullName || localUser.phone}?`, confirmLabel: 'Complete All', confirmColor: 'bg-green-600 hover:bg-green-700' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-[11px] font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <FiCheckCircle className="w-3.5 h-3.5" /> Complete All
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirm({ action: 'reset', title: 'Reset Progress', message: `This will clear all progress for ${localUser.fullName || localUser.phone}. This cannot be undone.`, confirmLabel: 'Reset', confirmColor: 'bg-red-600 hover:bg-red-700' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <FiRotateCcw className="w-3.5 h-3.5" /> Reset Progress
          </button>
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmColor={confirm.confirmColor}
          onConfirm={() => handleBulkAction(confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Section A: Session Progress */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FiPlay className="w-4 h-4 text-blue-500" />
          <h4 className="text-sm font-semibold text-gray-700">Session Progress</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SESSION_IDS.map((id) => {
            const mod = modules[id] || modules.get?.(id) || {};
            return (
              <div key={id} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                  <ModuleIcon moduleId={id} status={mod.status || 'locked'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{MODULE_LABELS[id] || id}</p>
                    <ModuleToggle moduleId={id} isCompleted={completedSet.has(id)} busy={busy} onToggle={handleModuleToggle} />
                  </div>
                  <ProgressBar percent={mod.progressPercent || 0} className="mb-1.5" />
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span>{Math.round(mod.progressPercent || 0)}%</span>
                    {mod.maxWatchedSeconds > 0 && (
                      <span>Watched: {Math.floor(mod.maxWatchedSeconds / 60)}m {Math.round(mod.maxWatchedSeconds % 60)}s</span>
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
      </div>

      {/* Section B: Assessment Performance */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FiAward className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-gray-700">Assessment Performance</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          {ASSESSMENT_IDS.map((id) => {
            const mod = modules[id] || modules.get?.(id) || {};
            return (
              <div key={id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <ModuleIcon moduleId={id} status={mod.status || 'locked'} />
                  </div>
                  <p className="text-xs font-medium text-gray-700 truncate">{MODULE_LABELS[id]}</p>
                </div>
                <ModuleToggle moduleId={id} isCompleted={completedSet.has(id)} busy={busy} onToggle={handleModuleToggle} />
              </div>
            );
          })}
        </div>
        {assessmentLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ASSESSMENT_IDS.map((id) => (
              <div key={id} className="rounded-lg border border-gray-200 bg-white p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ASSESSMENT_IDS.map((id) => (
              <AssessmentCard
                key={id}
                assessmentId={id}
                moduleData={modules[id] || modules.get?.(id) || {}}
                assessmentDetail={assessmentMap[id]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section C: Certificate (separate card below assessments) */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Certificate</h4>
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${localUser.certificateDownloadedAt ? 'bg-green-100' : 'bg-gray-100'}`}>
            <FiAward className={`w-6 h-6 ${localUser.certificateDownloadedAt ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800">Certificate download</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {localUser.certificateDownloadedAt
                ? `Downloaded on ${new Date(localUser.certificateDownloadedAt).toLocaleDateString()}`
                : 'Not downloaded yet'}
            </p>
          </div>
          <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${localUser.certificateDownloadedAt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {localUser.certificateDownloadedAt ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Section D: Timeline */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h4>
        <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
          {TIMELINE_IDS.map((id, i) => {
            const isCert = id === 'certificate';
            const completed = isCert ? !!localUser.certificateDownloadedAt : (modules[id] || modules.get?.(id) || {}).status === 'completed';
            const mod = isCert ? {} : (modules[id] || modules.get?.(id) || {});
            const status = isCert ? (completed ? 'completed' : 'locked') : (mod.status || 'locked');
            const bg = completed ? 'bg-green-500' : status === 'in_progress' ? 'bg-amber-500' : status === 'unlocked' ? 'bg-amber-400' : 'bg-gray-200';
            return (
              <div key={id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center`} title={isCert ? (completed ? 'Certificate downloaded' : 'Certificate not downloaded') : `${MODULE_LABELS[id]}: ${status}`}>
                    <ModuleIcon moduleId={id} status={status} />
                  </div>
                  <span className="text-[9px] text-gray-500 mt-0.5 whitespace-nowrap max-w-[48px] truncate text-center">{MODULE_LABELS[id]}</span>
                </div>
                {i < TIMELINE_IDS.length - 1 && (
                  <div className={`w-4 h-0.5 ${completed ? 'bg-green-300' : 'bg-gray-200'} mx-0.5 mt-[-12px]`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DistributionBar({ high, mid, low }) {
  const total = high + mid + low;
  if (total === 0) return <div className="h-2.5 rounded-full bg-gray-100 w-full" />;
  const hPct = (high / total) * 100;
  const mPct = (mid / total) * 100;
  const lPct = (low / total) * 100;
  return (
    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex w-full" title={`High: ${high}, Mid: ${mid}, Low: ${low}`}>
      {hPct > 0 && <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${hPct}%` }} />}
      {mPct > 0 && <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${mPct}%` }} />}
      {lPct > 0 && <div className="h-full bg-red-400 transition-all duration-700" style={{ width: `${lPct}%` }} />}
    </div>
  );
}

function AssessmentMetricCard({ assessmentId, data }) {
  if (!data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm font-medium text-gray-700 mb-2">{MODULE_LABELS[assessmentId]}</p>
        <p className="text-xs text-gray-400">No submissions yet</p>
      </div>
    );
  }
  const { avgScorePct, highestScorePct, totalAttempts, uniqueAttempters, perfectScorers, highScorers, lowScorers } = data;
  const midScorers = uniqueAttempters - highScorers - lowScorers;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-start gap-3 mb-4">
        <ScoreRing percent={avgScorePct} size={48} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{MODULE_LABELS[assessmentId]}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Avg score across {uniqueAttempters} user{uniqueAttempters !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Highest</p>
          <p className="text-sm font-bold text-gray-800 tabular-nums">{highestScorePct}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Attempts</p>
          <p className="text-sm font-bold text-gray-800 tabular-nums">{totalAttempts}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Attempters</p>
          <p className="text-sm font-bold text-gray-800 tabular-nums">{uniqueAttempters}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Perfect</p>
          <p className="text-sm font-bold text-gray-800 tabular-nums">{perfectScorers}</p>
        </div>
      </div>

      <div className="mb-2">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">Score Distribution</p>
        <DistributionBar high={highScorers} mid={midScorers > 0 ? midScorers : 0} low={lowScorers} />
      </div>
      <div className="flex items-center gap-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {highScorers} high</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> {midScorers > 0 ? midScorers : 0} mid</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> {lowScorers} low</span>
      </div>
    </div>
  );
}

function ModuleAnalytics({ stats }) {
  const [activeTab, setActiveTab] = useState('progress');

  if (!stats?.perModuleCompletion) return null;

  const analytics = stats.assessmentAnalytics || {};

  const assessmentsWithData = ASSESSMENT_IDS.filter((id) => analytics[id]);
  let hardest = null;
  let best = null;
  if (assessmentsWithData.length > 0) {
    hardest = assessmentsWithData.reduce((a, b) => (analytics[a].avgScorePct < analytics[b].avgScorePct ? a : b));
    best = assessmentsWithData.reduce((a, b) => (analytics[a].avgScorePct > analytics[b].avgScorePct ? a : b));
    if (hardest === best) hardest = null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-5 pb-3">
        <h3 className="text-sm font-bold text-gray-800">Module Progress & Performance</h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Completion and assessment insights across all modules</p>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 flex gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'progress'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Progress Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'insights'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Assessment Insights
        </button>
      </div>

      {/* Tab content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'progress' ? (
          <div className="space-y-1">
            {MODULE_ORDER.map((id, idx) => {
              const count = stats.perModuleCompletion[id] || 0;
              const pct = stats.totalEnrolled > 0 ? Math.round((count / stats.totalEnrolled) * 100) : 0;
              const isAssessment = id.startsWith('a');
              const highScorers = isAssessment ? (stats.perModuleHighScorers?.[id] || 0) : 0;
              const status = pct >= 100 ? 'completed' : pct > 0 ? 'in_progress' : 'not_started';
              const statusDot = status === 'completed' ? 'bg-green-500' : status === 'in_progress' ? 'bg-amber-400' : 'bg-gray-300';

              return (
                <div
                  key={id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-50 group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                  title={`${count} of ${stats.totalEnrolled} users completed`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200/70 transition-colors">
                    {isAssessment
                      ? <FiClipboard className="w-3.5 h-3.5 text-amber-500" />
                      : <FiPlay className="w-3.5 h-3.5 text-blue-500" />
                    }
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-24 shrink-0 truncate">{MODULE_LABELS[id]}</span>
                  <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isAssessment
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 tabular-nums w-20 text-right">{count} ({pct}%)</span>
                    <span className={`w-2 h-2 rounded-full ${statusDot} shrink-0`} />
                    {isAssessment && highScorers > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-50 text-[10px] font-medium text-green-700" title={`${highScorers} users scored >= 80%`}>
                        <FiAward className="w-3 h-3" />{highScorers}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 pt-2 px-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Completed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> In Progress</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Not Started</span>
              <span className="flex items-center gap-1 ml-auto"><FiAward className="w-3 h-3 text-green-500" /> scored 80%+</span>
            </div>
          </div>
        ) : (
          <div>
            {/* Assessment metric cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {ASSESSMENT_IDS.map((id) => (
                <AssessmentMetricCard key={id} assessmentId={id} data={analytics[id]} />
              ))}
            </div>

            {/* Highlight callouts */}
            {(hardest || best) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hardest && (
                  <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <FiAlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-red-400 font-medium">Hardest Assessment</p>
                      <p className="text-sm font-semibold text-red-700">{MODULE_LABELS[hardest]} <span className="font-normal text-red-500">({analytics[hardest].avgScorePct}% avg)</span></p>
                    </div>
                  </div>
                )}
                {best && (
                  <div className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50/50 p-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <FiStar className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-green-400 font-medium">Best Performing</p>
                      <p className="text-sm font-semibold text-green-700">{MODULE_LABELS[best]} <span className="font-normal text-green-500">({analytics[best].avgScorePct}% avg)</span></p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const INITIAL_FILTERS = {
  sort: '-lastActivityAt',
  statuses: [],
  activeOn: '',
  fromDate: '',
  toDate: '',
  modulesMode: 'none',
  modulesBucket: '',
  modulesMin: '',
  modulesMax: '',
  progressMin: 0,
  progressMax: 100,
  lastActiveModule: '',
  activity: '',
};

function toYMDLocal(d) {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYMDLocal(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const [y, mo, d] = s.split('-').map(Number);
  return new Date(y, mo - 1, d);
}

function buildListParams(f, debouncedSearch, page, limit) {
  const params = { page, limit, sort: f.sort };
  const q = debouncedSearch.trim();
  if (q) params.search = q;
  if (f.statuses.length) params.status = f.statuses;
  if (f.activeOn) params.activeOn = f.activeOn;
  if (f.fromDate) params.from = f.fromDate;
  if (f.toDate) params.to = f.toDate;
  if (f.modulesMode === 'bucket' && f.modulesBucket) params.modulesBucket = f.modulesBucket;
  if (f.modulesMode === 'custom') {
    if (f.modulesMin !== '') params.modulesMin = f.modulesMin;
    if (f.modulesMax !== '') params.modulesMax = f.modulesMax;
  }
  if (f.progressMin > 0 || f.progressMax < 100) {
    params.progressMin = f.progressMin;
    params.progressMax = f.progressMax;
  }
  if (f.lastActiveModule) params.lastActiveModule = f.lastActiveModule;
  if (f.activity) params.activity = f.activity;
  return params;
}

function buildExportParams(f, debouncedSearch) {
  const p = buildListParams(f, debouncedSearch, 1, 25);
  delete p.page;
  delete p.limit;
  return p;
}

function sortCaret(field, currentSort) {
  const neg = currentSort.startsWith('-');
  const curField = neg ? currentSort.slice(1) : currentSort;
  if (curField !== field) return 'text-gray-300';
  return neg ? 'text-primary-navy' : 'text-primary-navy';
}

export default function WebinarProgress() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [f, setF] = useState(() => ({ ...INITIAL_FILTERS }));
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounced(searchInput, 300);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [expandedPhone, setExpandedPhone] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportToast, setExportToast] = useState(null);
  const [listError, setListError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [selectedPhones, setSelectedPhones] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(null);
  const [moduleComboOpen, setModuleComboOpen] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');
  const fetchUsersRef = useRef(async () => {});

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        f,
        search: debouncedSearch,
      }),
    [f, debouncedSearch]
  );
  const prevFilterKeyRef = useRef(filterKey);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await getWebinarProgressStats();
      if (res.success && res.data?.data) setStats(res.data.data);
      else setStatsError(res.message || 'Failed to load stats.');
    } catch {
      setStatsError('Failed to load stats.');
    }
    setStatsLoading(false);
  }, []);

  const fetchUsers = useCallback(
    async (targetPage) => {
      setLoading(true);
      setListError(null);
      try {
        const params = buildListParams(f, debouncedSearch, targetPage, limit);
        const res = await getWebinarProgressList(params);
        if (res.success && res.data?.data) {
          setUsers(res.data.data.users || []);
          setTotal(res.data.data.total || 0);
          setSelectedPhones(new Set());
        } else setListError(res.message || 'Failed to load users.');
      } catch {
        setListError('Failed to load users.');
      }
      setLoading(false);
    },
    [limit, f, debouncedSearch]
  );

  const lastLoadKeyRef = useRef('');

  useEffect(() => {
    fetchUsersRef.current = fetchUsers;
  }, [fetchUsers]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchStats();
    });
  }, [fetchStats]);

  useEffect(() => {
    const filtersChanged = prevFilterKeyRef.current !== filterKey;
    if (filtersChanged) {
      prevFilterKeyRef.current = filterKey;
      queueMicrotask(() => {
        setPage((p) => (p !== 1 ? 1 : p));
      });
    }
    const targetPage = filtersChanged ? 1 : page;
    const loadKey = `${filterKey}|p${targetPage}`;
    if (lastLoadKeyRef.current === loadKey) return;
    lastLoadKeyRef.current = loadKey;
    queueMicrotask(() => {
      fetchUsers(targetPage);
    });
  }, [filterKey, page, fetchUsers]);

  useEffect(() => {
    const onFocus = () => {
      fetchStats();
      fetchUsersRef.current();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchStats]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      fetchStats();
      fetchUsersRef.current();
    }, 45000);
    return () => clearInterval(id);
  }, [fetchStats]);

  useEffect(() => {
    if (!exportToast) return;
    const t = setTimeout(() => setExportToast(null), 4000);
    return () => clearTimeout(t);
  }, [exportToast]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest?.('[data-webinar-picker]')) setPickerOpen(null);
      if (!e.target.closest?.('[data-module-combo]')) setModuleComboOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleRefresh = useCallback(() => {
    setListError(null);
    setStatsError(null);
    lastLoadKeyRef.current = '';
    fetchStats();
    fetchUsers(page);
  }, [fetchStats, fetchUsers, page]);

  const handleExport = async () => {
    setExporting(true);
    setExportToast(null);
    const res = await getWebinarProgressExport(buildExportParams(f, debouncedSearch));
    setExporting(false);
    if (res.success) setExportToast({ type: 'success', message: 'CSV downloaded.' });
    else setExportToast({ type: 'error', message: res.message || 'Export failed.' });
  };

  const clearFilters = () => {
    setF({ ...INITIAL_FILTERS });
    setSearchInput('');
    setPickerOpen(null);
    setModuleSearch('');
  };

  const toggleStatus = (key) => {
    setF((prev) => {
      const s = new Set(prev.statuses);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      return { ...prev, statuses: [...s] };
    });
  };

  const toggleSort = (field) => {
    setF((prev) => {
      const cur = prev.sort;
      const neg = cur.startsWith('-');
      const curField = neg ? cur.slice(1) : cur;
      if (curField !== field) return { ...prev, sort: `-${field}` };
      return { ...prev, sort: neg ? field : `-${field}` };
    });
  };

  const allPageSelected =
    users.length > 0 && users.every((u) => selectedPhones.has(u.phone));
  const somePageSelected = users.some((u) => selectedPhones.has(u.phone));

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      setSelectedPhones(new Set());
      return;
    }
    setSelectedPhones(new Set(users.map((u) => u.phone)));
  };

  const toggleSelectOne = (phone) => {
    setSelectedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  };

  const runBulkTable = async (action) => {
    const phones = [...selectedPhones];
    if (phones.length === 0) return;
    setBulkBusy(true);
    try {
      const res = await bulkWebinarProgress({ phones, action });
      if (res.success) {
        setSelectedPhones(new Set());
        lastLoadKeyRef.current = '';
        await fetchStats();
        await fetchUsers(page);
      } else {
        setListError(res.message || 'Bulk action failed.');
      }
    } catch {
      setListError('Bulk action failed.');
    }
    setBulkBusy(false);
  };

  const moduleOptions = useMemo(() => {
    const q = moduleSearch.trim().toLowerCase();
    return MODULE_ORDER.filter((id) => {
      const label = (MODULE_LABELS[id] || id).toLowerCase();
      return !q || label.includes(q) || id.includes(q);
    });
  }, [moduleSearch]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasError = listError || statsError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Webinar Progress</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track user progress across webinar sessions and assessments.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || statsLoading}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading || statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
          >
            <FiDownload className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {exportToast && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm ${
            exportToast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}
        >
          {exportToast.message}
        </div>
      )}

      {hasError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700">{listError || statsError}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

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
          subtitle={
            stats && stats.totalEnrolled > 0
              ? `${Math.round((stats.fullyCompleted / stats.totalEnrolled) * 100)}% completion rate`
              : undefined
          }
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

      <ModuleAnalytics stats={stats} />

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-slate-50/90 px-4 sm:px-5 py-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <FiFilter className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
            <span className="text-sm font-semibold text-gray-900">Filters</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-1 sm:justify-end min-w-0">
            <div className="relative w-full sm:max-w-xs sm:min-w-[220px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name or phone"
                className="w-full pl-9 pr-3 h-10 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 shadow-sm focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy outline-none"
              />
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="shrink-0 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="relative" data-webinar-picker>
                <span className="block text-xs text-gray-500 mb-1">Filter by date (last active)</span>
                <button
                  type="button"
                  onClick={() => setPickerOpen((o) => (o === 'single' ? null : 'single'))}
                  className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 shadow-sm"
                >
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  {f.activeOn || 'Pick date'}
                </button>
                {pickerOpen === 'single' && (
                  <div className="absolute left-0 top-full z-30 mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    <DayPicker
                      mode="single"
                      selected={parseYMDLocal(f.activeOn)}
                      onSelect={(d) => {
                        setF((p) => ({ ...p, activeOn: d ? toYMDLocal(d) : '' }));
                        setPickerOpen(null);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="relative" data-webinar-picker>
                <span className="block text-xs text-gray-500 mb-1">From</span>
                <button
                  type="button"
                  onClick={() => setPickerOpen((o) => (o === 'from' ? null : 'from'))}
                  className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 shadow-sm"
                >
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  {f.fromDate || '—'}
                </button>
                {pickerOpen === 'from' && (
                  <div className="absolute left-0 top-full z-30 mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    <DayPicker
                      mode="single"
                      selected={parseYMDLocal(f.fromDate)}
                      onSelect={(d) => {
                        setF((p) => ({ ...p, fromDate: d ? toYMDLocal(d) : '' }));
                        setPickerOpen(null);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="relative" data-webinar-picker>
                <span className="block text-xs text-gray-500 mb-1">To</span>
                <button
                  type="button"
                  onClick={() => setPickerOpen((o) => (o === 'to' ? null : 'to'))}
                  className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 shadow-sm"
                >
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  {f.toDate || '—'}
                </button>
                {pickerOpen === 'to' && (
                  <div className="absolute left-0 top-full z-30 mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    <DayPicker
                      mode="single"
                      selected={parseYMDLocal(f.toDate)}
                      onSelect={(d) => {
                        setF((p) => ({ ...p, toDate: d ? toYMDLocal(d) : '' }));
                        setPickerOpen(null);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-gray-400">Date filters use calendar day boundaries (UTC on server).</p>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Progress & modules</p>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-600 w-28">Progress %</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={f.progressMin}
                  onChange={(e) => setF((p) => ({ ...p, progressMin: Number(e.target.value) }))}
                  className="flex-1 min-w-[100px] accent-primary-navy"
                />
                <span className="text-xs tabular-nums w-8">{f.progressMin}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={f.progressMax}
                  onChange={(e) => setF((p) => ({ ...p, progressMax: Number(e.target.value) }))}
                  className="flex-1 min-w-[100px] accent-primary-navy"
                />
                <span className="text-xs tabular-nums w-8">{f.progressMax}</span>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-600">Modules done</span>
                {['0-3', '4-7', '8-10', '11'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() =>
                      setF((p) => {
                        const off = p.modulesBucket === b;
                        return {
                          ...p,
                          modulesMode: off ? 'none' : 'bucket',
                          modulesBucket: off ? '' : b,
                        };
                      })
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      f.modulesMode === 'bucket' && f.modulesBucket === b
                        ? 'bg-primary-navy text-white border-primary-navy'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {b === '11' ? '11/11' : b}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setF((p) => ({ ...p, modulesMode: p.modulesMode === 'custom' ? 'none' : 'custom', modulesBucket: '' }))}
                  className={`text-xs font-medium px-2 py-1 rounded-lg ${
                    f.modulesMode === 'custom' ? 'bg-amber-100 text-amber-900' : 'text-gray-500'
                  }`}
                >
                  Custom min/max
                </button>
              </div>
              {f.modulesMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={11}
                    placeholder="Min"
                    value={f.modulesMin}
                    onChange={(e) => setF((p) => ({ ...p, modulesMin: e.target.value }))}
                    className="w-20 h-9 rounded-lg border border-gray-300 px-2 text-sm"
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    placeholder="Max"
                    value={f.modulesMax}
                    onChange={(e) => setF((p) => ({ ...p, modulesMax: e.target.value }))}
                    className="w-20 h-9 rounded-lg border border-gray-300 px-2 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</p>
            <div className="flex flex-wrap gap-3">
              {[
                ['completed', 'Completed'],
                ['in_progress', 'In Progress'],
                ['not_started', 'Not Started'],
              ].map(([key, label]) => (
                <label key={key} className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f.statuses.includes(key)}
                    onChange={() => toggleStatus(key)}
                    className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="text-[11px] text-gray-400">Leave all unchecked for any status.</p>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Activity</p>
            <div className="flex flex-wrap gap-2">
              {[
                ['', 'Any'],
                ['active_5m', 'Active (5 min)'],
                ['active_today', 'Active today'],
                ['inactive_24h', 'Inactive over 24h'],
              ].map(([val, label]) => (
                <button
                  key={val || 'any'}
                  type="button"
                  onClick={() => setF((p) => ({ ...p, activity: val }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    f.activity === val
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Current module</p>
          <div className="relative max-w-md" data-module-combo>
            <input
              type="text"
              value={moduleSearch}
              onChange={(e) => {
                setModuleSearch(e.target.value);
                setModuleComboOpen(true);
              }}
              onFocus={() => setModuleComboOpen(true)}
              placeholder="Search module…"
              className="w-full h-10 pl-3 pr-3 rounded-lg border border-gray-300 text-sm shadow-sm"
            />
            {f.lastActiveModule && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {MODULE_LABELS[f.lastActiveModule]}{' '}
                <button type="button" className="text-primary-navy font-medium" onClick={() => setF((p) => ({ ...p, lastActiveModule: '' }))}>
                  Clear
                </button>
              </p>
            )}
            {moduleComboOpen && (
              <ul className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <li>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => {
                      setF((p) => ({ ...p, lastActiveModule: '' }));
                      setModuleComboOpen(false);
                    }}
                  >
                    Any module
                  </button>
                </li>
                {moduleOptions.map((id) => (
                  <li key={id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      onClick={() => {
                        setF((p) => ({ ...p, lastActiveModule: id }));
                        setModuleComboOpen(false);
                        setModuleSearch('');
                      }}
                    >
                      {MODULE_LABELS[id] || id}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </div>

      {selectedPhones.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-amber-200/80 bg-amber-50/95 px-4 sm:px-5 py-3">
          <span className="text-sm font-medium text-amber-900">{selectedPhones.size} selected</span>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => runBulkTable('complete_all')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            <FiCheckCircle className="w-3.5 h-3.5" />
            Mark completed
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => runBulkTable('reset')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            <FiRotateCcw className="w-3.5 h-3.5" />
            Reset progress
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-400 cursor-not-allowed"
          >
            Send reminder
          </button>
        </div>
      )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left border-collapse">
            <colgroup>
              <col className="w-10" />
              <col className="min-w-[140px]" />
              <col className="min-w-[108px]" />
              <col className="min-w-[160px]" />
              <col className="min-w-[100px]" />
              <col className="min-w-[180px]" />
              <col className="min-w-[88px]" />
              <col className="min-w-[120px]" />
              <col className="w-14" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th scope="col" className="px-3 py-3.5 text-left align-middle">
                  <input
                    type="checkbox"
                    aria-label="Select all on page"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = somePageSelected && !allPageSelected;
                    }}
                    onChange={toggleSelectAllPage}
                    className="rounded border-gray-300"
                  />
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Phone
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => toggleSort('overallPercent')}
                    className={`inline-flex items-center gap-1.5 -mx-1 px-1 py-0.5 rounded hover:bg-gray-200/60 transition-colors ${sortCaret('overallPercent', f.sort)}`}
                  >
                    Progress
                    <FiChevronDown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        f.sort === 'overallPercent' || f.sort === '-overallPercent' ? 'opacity-100' : 'opacity-30'
                      }`}
                    />
                  </button>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Current module
                </th>
                <th scope="col" className="px-3 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wide text-end">
                  <button
                    type="button"
                    onClick={() => toggleSort('modulesDone')}
                    className={`inline-flex items-center gap-1.5 justify-end w-full -mx-1 px-1 py-0.5 rounded hover:bg-gray-200/60 transition-colors ${sortCaret('modulesDone', f.sort)}`}
                  >
                    Modules
                    <FiChevronDown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        f.sort === 'modulesDone' || f.sort === '-modulesDone' ? 'opacity-100' : 'opacity-30'
                      }`}
                    />
                  </button>
                </th>
                <th scope="col" className="px-3 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wide text-end">
                  <button
                    type="button"
                    onClick={() => toggleSort('lastActivityAt')}
                    className={`inline-flex items-center gap-1.5 justify-end w-full -mx-1 px-1 py-0.5 rounded hover:bg-gray-200/60 transition-colors ${sortCaret('lastActivityAt', f.sort)}`}
                  >
                    Last active
                    <FiChevronDown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        f.sort === 'lastActivityAt' || f.sort === '-lastActivityAt' ? 'opacity-100' : 'opacity-30'
                      }`}
                    />
                  </button>
                </th>
                <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide w-14">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="bg-white">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-3 py-3.5">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-0">
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <FiUsers className="w-12 h-12 text-gray-300 mb-3" aria-hidden />
                      <p className="text-sm font-medium text-gray-600">No users found</p>
                      <p className="text-xs text-gray-400 mt-1">Adjust filters or check back later.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isExpanded = expandedPhone === u.phone;
                  const completedCount = u.modulesDone != null ? u.modulesDone : (u.completedModules || []).length;
                  const overallStatus =
                    u.overallPercent >= 100 ? 'completed' : u.overallPercent > 0 ? 'in_progress' : 'not_started';
                  const statusColor =
                    overallStatus === 'completed'
                      ? 'text-green-600'
                      : overallStatus === 'in_progress'
                        ? 'text-amber-600'
                        : 'text-gray-400';

                  return (
                    <Fragment key={u.phone}>
                      <tr className="group bg-white border-b border-gray-100 hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedPhones.has(u.phone)}
                            onChange={() => toggleSelectOne(u.phone)}
                            className="rounded border-gray-300"
                            aria-label={`Select ${u.fullName || u.phone}`}
                          />
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-900 align-middle">
                          <span className="line-clamp-2 break-words" title={u.fullName || undefined}>{u.fullName || '—'}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 tabular-nums align-middle whitespace-nowrap">{u.phone}</td>
                        <td className="px-3 py-3 align-middle">
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <ProgressBar percent={u.overallPercent || 0} className="flex-1 h-2" />
                            <span className={`text-xs font-semibold tabular-nums w-9 text-right shrink-0 ${statusColor}`}>{u.overallPercent || 0}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-middle">
                          <StatusBadge status={overallStatus} />
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700 align-top">
                          <span className="line-clamp-2 break-words leading-snug" title={MODULE_LABELS[u.lastActiveModule] || u.lastActiveModule || undefined}>
                            {MODULE_LABELS[u.lastActiveModule] || u.lastActiveModule || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-800 tabular-nums align-middle text-end font-medium">
                          {completedCount}/{MODULE_ORDER.length}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600 align-middle text-end tabular-nums whitespace-nowrap">{timeAgo(u.lastActivityAt)}</td>
                        <td className="px-3 py-3 align-middle text-center w-14">
                          <button
                            type="button"
                            onClick={() => setExpandedPhone(isExpanded ? null : u.phone)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={9} className="p-0 border-t border-gray-100">
                            <UserDetailPanel
                              user={u}
                              onUserUpdated={(updated) => {
                                setUsers((prev) => prev.map((p) => (p.phone === updated.phone ? { ...p, ...updated } : p)));
                              }}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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
              <span className="text-sm font-medium text-gray-700 px-2 tabular-nums">
                {page} / {totalPages}
              </span>
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
      </section>
    </div>
  );
}
