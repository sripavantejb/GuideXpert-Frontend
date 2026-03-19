import { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiCheckCircle, FiTrendingUp, FiActivity, FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiLock, FiPlay, FiClipboard, FiRefreshCw, FiAward, FiX, FiCheck, FiAlertTriangle, FiStar, FiEdit3, FiRotateCcw } from 'react-icons/fi';
import KpiCard from '../../components/Admin/KpiCard';
import { getWebinarProgressList, getWebinarProgressStats, getWebinarProgressExport, getWebinarUserAssessments, adminUpdateWebinarProgress } from '../../utils/adminApi';

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

function AssessmentCard({ assessmentId, moduleData, assessmentDetail, isLoading }) {
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

function UserDetailPanel({ user, onUserUpdated }) {
  if (!user) return null;
  const [localUser, setLocalUser] = useState(user);
  const modules = localUser.modules || {};
  const [assessmentData, setAssessmentData] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => { setLocalUser(user); }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
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
  }, [localUser.phone]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

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
                isLoading={assessmentLoading}
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
  const [listError, setListError] = useState(null);
  const [statsError, setStatsError] = useState(null);

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

  const fetchUsers = useCallback(async (pageOverride) => {
    const p = pageOverride !== undefined ? pageOverride : page;
    setLoading(true);
    setListError(null);
    try {
      const res = await getWebinarProgressList({ page: p, limit, search, status: statusFilter, sort: '-lastActivityAt' });
      if (res.success && res.data?.data) {
        setUsers(res.data.data.users || []);
        setTotal(res.data.data.total || 0);
        if (pageOverride !== undefined) setPage(pageOverride);
      } else setListError(res.message || 'Failed to load users.');
    } catch {
      setListError('Failed to load users.');
    }
    setLoading(false);
  }, [page, limit, search, statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // Refetch when admin returns to tab
  useEffect(() => {
    const onFocus = () => {
      fetchStats();
      fetchUsers();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchStats, fetchUsers]);

  const handleRefresh = useCallback(() => {
    setListError(null);
    setStatsError(null);
    fetchStats();
    fetchUsers(1);
  }, [fetchStats, fetchUsers]);

  const handleExport = async () => {
    setExporting(true);
    await getWebinarProgressExport();
    setExporting(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasError = listError || statsError;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
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
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading || statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
      </div>

      {/* Error banner with retry */}
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

      {/* Module Progress & Performance analytics */}
      <ModuleAnalytics stats={stats} />

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
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
      </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[160px]">Overall Progress</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
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
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <FiUsers className="w-12 h-12 text-gray-300 mb-3" aria-hidden />
                      <p className="text-sm font-medium text-gray-600">No users found</p>
                      <p className="text-xs text-gray-400 mt-1">Check back after users complete webinar sessions.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isExpanded = expandedPhone === u.phone;
                  const completedCount = (u.completedModules || []).length;
                  const overallStatus = u.overallPercent >= 100 ? 'completed' : u.overallPercent > 0 ? 'in_progress' : 'not_started';
                  const statusColor = overallStatus === 'completed' ? 'text-green-600' : overallStatus === 'in_progress' ? 'text-amber-600' : 'text-gray-400';

                  return (
                    <tr key={u.phone} className="group">
                      <td colSpan={8} className="p-0">
                        <div className="grid grid-cols-1">
                          <button
                            type="button"
                            onClick={() => setExpandedPhone(isExpanded ? null : u.phone)}
                            className="w-full text-left grid grid-cols-[repeat(8,auto)] hover:bg-gray-50 transition-colors duration-200"
                            style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(160px,1fr) minmax(0,100px) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 80px' }}
                          >
                            <span className="px-4 py-3.5 text-sm font-medium text-gray-800 truncate">{u.fullName || '—'}</span>
                            <span className="px-4 py-3.5 text-sm text-gray-600 tabular-nums">{u.phone}</span>
                            <span className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <ProgressBar percent={u.overallPercent || 0} className="flex-1" />
                                <span className={`text-xs font-semibold tabular-nums ${statusColor}`}>{u.overallPercent || 0}%</span>
                              </div>
                            </span>
                            <span className="px-4 py-3.5 flex items-center">
                              <StatusBadge status={overallStatus} />
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
                          {isExpanded && <UserDetailPanel user={u} onUserUpdated={(updated) => {
                            setUsers((prev) => prev.map((p) => p.phone === updated.phone ? { ...p, ...updated } : p));
                          }} />}
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
