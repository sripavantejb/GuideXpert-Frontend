import { ALL_MODULES } from '../data/mockWebinarData';

/**
 * Returns true if every module preceding `moduleId` in ALL_MODULES
 * is present in `completedSessions`. The first module is always unlocked.
 */
export function isModuleUnlocked(moduleId, completedSessions) {
  const idx = ALL_MODULES.findIndex((m) => m.id === moduleId);
  if (idx <= 0) return true;
  for (let i = 0; i < idx; i++) {
    if (!completedSessions.includes(ALL_MODULES[i].id)) return false;
  }
  return true;
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
