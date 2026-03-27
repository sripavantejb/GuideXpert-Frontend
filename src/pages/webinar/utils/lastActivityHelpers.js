import { getModuleById } from '../data/mockWebinarData';

const ACTIVITY_LABELS = {
  video_progress: 'Video in progress',
  video_completed: 'Video watched',
  assessment_completed: 'Assessment completed',
  module_unlocked: 'Module opened',
  resume_seek: 'Activity',
};

/**
 * Normalize server or local event (Date → ISO string for `at`).
 */
export function normalizeLastActivityEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const at = raw.at != null ? new Date(raw.at) : null;
  if (at && Number.isNaN(at.getTime())) return null;
  return {
    type: typeof raw.type === 'string' ? raw.type : 'resume_seek',
    moduleId: raw.moduleId != null ? String(raw.moduleId) : null,
    moduleTitle: typeof raw.moduleTitle === 'string' ? raw.moduleTitle : '',
    watchedSeconds:
      raw.watchedSeconds != null && Number.isFinite(Number(raw.watchedSeconds))
        ? Number(raw.watchedSeconds)
        : null,
    progressPercent:
      raw.progressPercent != null && Number.isFinite(Number(raw.progressPercent))
        ? Number(raw.progressPercent)
        : null,
    at: at ? at.toISOString() : new Date().toISOString(),
  };
}

/**
 * Client-side snapshot when server event is not yet available (matches backend priority loosely).
 */
export function deriveLocalLastActivityEvent({
  completedSessions,
  playbackPosition,
  sessionProgress,
  activeSessionId,
  atIso,
  /** When set (e.g. progress update for a specific session), use this module instead of activeSessionId */
  forModuleId,
}) {
  const at = atIso || new Date().toISOString();
  const moduleId = forModuleId || activeSessionId;
  if (!moduleId) {
    return normalizeLastActivityEvent({
      type: 'resume_seek',
      moduleId: null,
      moduleTitle: 'Training',
      at,
    });
  }
  const mod = getModuleById(moduleId);
  const title = mod?.title || moduleId;
  const isAssessment = mod?.type === 'Assessment';

  if (completedSessions.includes(moduleId)) {
    if (isAssessment) {
      return normalizeLastActivityEvent({
        type: 'assessment_completed',
        moduleId,
        moduleTitle: title,
        progressPercent: 100,
        at,
      });
    }
    return normalizeLastActivityEvent({
      type: 'video_completed',
      moduleId,
      moduleTitle: title,
      at,
    });
  }

  if (!isAssessment) {
    const ws = Math.round(playbackPosition?.[moduleId] || 0);
    const pp = Math.round(sessionProgress?.[moduleId] || 0);
    const type = ws > 0 || pp > 0 ? 'video_progress' : 'module_unlocked';
    return normalizeLastActivityEvent({
      type,
      moduleId,
      moduleTitle: title,
      watchedSeconds: ws,
      progressPercent: pp,
      at,
    });
  }

  return normalizeLastActivityEvent({
    type: 'module_unlocked',
    moduleId,
    moduleTitle: title,
    at,
  });
}

/** @returns {{ bucket: string, label: string }} */
export function formatRelativeActivityTime(iso) {
  if (!iso) return { bucket: 'none', label: 'No activity yet' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { bucket: 'none', label: 'No activity yet' };
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return { bucket: 'justNow', label: 'Just now' };
  if (sec < 3600) {
    const m = Math.max(1, Math.floor(sec / 60));
    return { bucket: 'minutesAgo', label: `${m}m ago` };
  }

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (sameDay) return { bucket: 'today', label: `Today ${time}` };
  if (isYesterday) return { bucket: 'yesterday', label: `Yesterday ${time}` };
  return {
    bucket: 'dateTime',
    label: d.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
  };
}

export function getActivityTypeLabel(eventType) {
  return ACTIVITY_LABELS[eventType] || ACTIVITY_LABELS.resume_seek;
}

function formatClock(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Non-clickable guidance line for the smart card.
 */
export function getNextActionHint({
  lastActivityEvent,
  activeSessionId,
  activeModuleTitle,
  nextModuleTitle,
  nextModuleIsAssessment,
  resumeSeconds,
  courseComplete,
}) {
  if (courseComplete) return 'Course complete — download your certificate when ready.';

  const ev = lastActivityEvent;
  if (ev?.type === 'video_progress' && ev.moduleId && ev.moduleId === activeSessionId) {
    const sec = Number.isFinite(resumeSeconds) ? resumeSeconds : ev.watchedSeconds ?? 0;
    if (sec > 0) return `Resume from ${formatClock(sec)}`;
    return 'Continue watching from where you left off.';
  }

  if (ev?.type === 'assessment_completed' && nextModuleTitle) {
    return nextModuleIsAssessment
      ? `Continue with ${nextModuleTitle}`
      : `Next up: ${nextModuleTitle}`;
  }

  if (nextModuleTitle) {
    if (nextModuleIsAssessment) return `Continue with ${nextModuleTitle}`;
    return `Next: ${nextModuleTitle}`;
  }

  if (activeModuleTitle) return `You’re on ${activeModuleTitle}`;
  return 'Pick up where you left off.';
}
