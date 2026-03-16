import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'counsellor_training_progress';

export const TRAINING_MODULES = [
  { id: 1, label: 'Introduction', type: 'video' },
  { id: 2, label: 'Session 1', type: 'video' },
  { id: 3, label: 'Assessment 1', type: 'assessment' },
  { id: 4, label: 'Session 2', type: 'video' },
  { id: 5, label: 'Assessment 2', type: 'assessment' },
  { id: 6, label: 'Session 3', type: 'video' },
  { id: 7, label: 'Assessment 3', type: 'assessment' },
  { id: 8, label: 'Session 4', type: 'video' },
  { id: 9, label: 'Assessment 4', type: 'assessment' },
  { id: 10, label: 'Session 5', type: 'video' },
  { id: 11, label: 'Assessment 5', type: 'assessment' },
  { id: 12, label: 'Session 6', type: 'video' },
  { id: 13, label: 'Assessment 6', type: 'assessment' },
  { id: 14, label: 'Certificate', type: 'certificate' },
];

export const TOTAL_MODULES = TRAINING_MODULES.length;

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedModules: [], currentModule: 1 };
    const parsed = JSON.parse(raw);
    return {
      completedModules: Array.isArray(parsed.completedModules) ? parsed.completedModules : [],
      currentModule: typeof parsed.currentModule === 'number' ? Math.min(Math.max(1, parsed.currentModule), TOTAL_MODULES) : 1,
    };
  } catch {
    return { completedModules: [], currentModule: 1 };
  }
}

function saveProgress(completedModules, currentModule) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedModules, currentModule }));
  } catch (e) {
    console.warn('CounsellorTraining: failed to persist progress', e);
  }
}

const CounsellorTrainingContext = createContext(null);

export function CounsellorTrainingProvider({ children }) {
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    saveProgress(progress.completedModules, progress.currentModule);
  }, [progress.completedModules, progress.currentModule]);

  const setCurrentModule = useCallback((moduleId) => {
    const id = Math.min(Math.max(1, Number(moduleId) || 1), TOTAL_MODULES);
    setProgress((prev) => ({ ...prev, currentModule: id }));
  }, []);

  const markCompleted = useCallback((moduleId) => {
    const id = Number(moduleId);
    if (!Number.isInteger(id) || id < 1 || id > TOTAL_MODULES) return;
    setProgress((prev) => {
      const set = new Set(prev.completedModules);
      set.add(id);
      return { ...prev, completedModules: [...set].sort((a, b) => a - b) };
    });
  }, []);

  const value = {
    modules: TRAINING_MODULES,
    totalModules: TOTAL_MODULES,
    completedModules: progress.completedModules,
    currentModule: progress.currentModule,
    setCurrentModule,
    markCompleted,
  };

  return (
    <CounsellorTrainingContext.Provider value={value}>
      {children}
    </CounsellorTrainingContext.Provider>
  );
}

export function useCounsellorTraining() {
  const ctx = useContext(CounsellorTrainingContext);
  if (!ctx) throw new Error('useCounsellorTraining must be used within CounsellorTrainingProvider');
  return ctx;
}

export function getModuleState(moduleId, completedModules) {
  const id = Number(moduleId);
  if (id <= 0) return 'locked';
  if (completedModules.includes(id)) return 'completed';
  if (id === 1) return 'unlocked';
  if (completedModules.includes(id - 1)) return 'unlocked';
  return 'locked';
}
