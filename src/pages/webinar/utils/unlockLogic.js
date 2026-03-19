import { ALL_MODULES } from '../data/mockWebinarData';

/**
 * A session and its paired assessment unlock at the same time.
 * For an assessment, the unlock condition equals its paired session's condition
 * (all modules before the paired session must be completed).
 * The first module is always unlocked.
 */
export function isModuleUnlocked(moduleId, completedSessions) {
  const idx = ALL_MODULES.findIndex((m) => m.id === moduleId);
  if (idx <= 0) return true;

  const module = ALL_MODULES[idx];

  // Assessment unlocks together with its paired session (the session right before it)
  if (module.type === 'Assessment' && idx >= 2) {
    const pairedSessionIdx = idx - 1;
    for (let i = 0; i < pairedSessionIdx; i++) {
      if (!completedSessions.includes(ALL_MODULES[i].id)) return false;
    }
    return true;
  }

  // Session: all previous modules must be completed
  for (let i = 0; i < idx; i++) {
    if (!completedSessions.includes(ALL_MODULES[i].id)) return false;
  }
  return true;
}

/**
 * For an assessment, returns the paired session (the session immediately before
 * it in ALL_MODULES). Returns null for non-assessments or the first module.
 */
export function getSessionForAssessment(moduleId) {
  const idx = ALL_MODULES.findIndex((m) => m.id === moduleId);
  if (idx < 1) return null;
  const module = ALL_MODULES[idx];
  if (module.type !== 'Assessment') return null;
  const prev = ALL_MODULES[idx - 1];
  return prev && prev.type !== 'Assessment' ? prev : null;
}

/**
 * Returns the module immediately before `moduleId` in ALL_MODULES,
 * or null if moduleId is the first module.
 */
export function getPreviousModule(moduleId) {
  const idx = ALL_MODULES.findIndex((m) => m.id === moduleId);
  if (idx <= 0) return null;
  return ALL_MODULES[idx - 1];
}

/**
 * Returns the first module whose prerequisites are not yet completed,
 * i.e. the current "frontier" the user should work on.
 */
export function getFirstLockedModule(completedSessions) {
  for (let i = 0; i < ALL_MODULES.length; i++) {
    if (!completedSessions.includes(ALL_MODULES[i].id)) {
      return ALL_MODULES[i];
    }
  }
  return null;
}

/**
 * Returns overall course progress counting both sessions and assessments.
 */
export function getUnlockProgress(completedSessions) {
  const total = ALL_MODULES.length;
  const completed = ALL_MODULES.filter((m) => completedSessions.includes(m.id)).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}
