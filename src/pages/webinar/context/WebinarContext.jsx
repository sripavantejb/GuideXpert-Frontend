import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SESSIONS, ALL_MODULES } from '../data/mockWebinarData';
import { normalizeDoubts } from '../utils/doubtHelpers';
import { useWebinarAuth } from '../../../contexts/WebinarAuthContext';
import { syncWebinarProgress, getWebinarProgress, syncWebinarProgressBeacon } from '../../../utils/api';
import { isModuleUnlocked } from '../utils/unlockLogic';

const STORAGE_KEYS = {
  progress: 'webinar_progress',
  doubts: 'webinar_doubts',
  resume: 'webinar_resume',
  bookmarks: 'webinar_bookmarks',
  settings: 'webinar_settings',
  profile: 'webinar_profile',
  activeSession: 'webinar_active_session',
  maxWatched: 'webinar_max_watched',
};

// Increment this whenever the unlock/progress system changes fundamentally.
// On mismatch the user's progress, playback positions and maxWatched are reset
// so stale data from before the locking system doesn't break the UI.
const PROGRESS_VERSION = 3;
const PROGRESS_VERSION_KEY = 'webinar_progress_version';

const DEFAULT_SETTINGS = {
  defaultPlaybackSpeed: 1,
  autoplayNext: false,
  notifyDoubtAnswered: false,
  sidebarExpandedByDefault: true,
};

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('webinar persist', e);
  }
}

const WebinarContext = createContext(null);

function getStoredSidebarExpanded() {
  try {
    const fromSettings = loadJson(STORAGE_KEYS.settings, null);
    if (fromSettings && typeof fromSettings.sidebarExpandedByDefault === 'boolean')
      return fromSettings.sidebarExpandedByDefault;
    return localStorage.getItem('webinar_sidebar_expanded') !== 'false';
  } catch {
    return true;
  }
}

const SYNC_DEBOUNCE_MS = 10_000;

function buildSyncPayload(completedSessions, maxWatched, playbackPosition, activeSessionId, sessionProgress) {
  const modules = {};
  for (const m of ALL_MODULES) {
    const isCompleted = completedSessions.includes(m.id);
    const unlocked = isModuleUnlocked(m.id, completedSessions);
    const progress = sessionProgress?.[m.id] ?? 0;
    let status = 'locked';
    if (isCompleted) status = 'completed';
    else if (progress > 0 || (playbackPosition?.[m.id] > 0)) status = 'in_progress';
    else if (unlocked) status = 'unlocked';

    const entry = { status, progressPercent: isCompleted ? 100 : Math.round(progress) };
    if (m.type !== 'Assessment') {
      entry.watchedSeconds = Math.round(playbackPosition?.[m.id] || 0);
      entry.maxWatchedSeconds = Math.round(maxWatched?.[m.id] || 0);
    }
    if (isCompleted) entry.completedAt = new Date().toISOString();
    if (unlocked || isCompleted) entry.unlockedAt = new Date().toISOString();
    modules[m.id] = entry;
  }

  const completedCount = ALL_MODULES.filter((m) => completedSessions.includes(m.id)).length;
  const overallPercent = ALL_MODULES.length > 0 ? Math.round((completedCount / ALL_MODULES.length) * 100) : 0;

  return {
    completedModules: completedSessions,
    modules,
    lastActiveModule: activeSessionId || null,
    overallPercent,
  };
}

export function WebinarProvider({ children, initialDisplayName }) {
  const { token: webinarToken } = useWebinarAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(getStoredSidebarExpanded);
  const [doubts, setDoubts] = useState(() => normalizeDoubts(loadJson(STORAGE_KEYS.doubts, [])));
  const [sessionProgress, setSessionProgress] = useState({});

  // Check progress version -- reset stale data from before the locking system
  const [completedSessions, setCompletedSessions] = useState(() => {
    const storedVersion = Number(localStorage.getItem(PROGRESS_VERSION_KEY)) || 0;
    if (storedVersion < PROGRESS_VERSION) {
      localStorage.setItem(PROGRESS_VERSION_KEY, String(PROGRESS_VERSION));
      saveJson(STORAGE_KEYS.progress, []);
      saveJson(STORAGE_KEYS.maxWatched, {});
      saveJson(STORAGE_KEYS.resume, {});
      return [];
    }
    return loadJson(STORAGE_KEYS.progress, []);
  });
  const [playbackPosition, setPlaybackPosition] = useState(() => {
    const storedVersion = Number(localStorage.getItem(PROGRESS_VERSION_KEY)) || 0;
    return storedVersion >= PROGRESS_VERSION ? loadJson(STORAGE_KEYS.resume, {}) : {};
  });
  const [bookmarkedSessions, setBookmarkedSessions] = useState(() =>
    loadJson(STORAGE_KEYS.bookmarks, [])
  );
  const [maxWatched, setMaxWatched] = useState(() => {
    const storedVersion = Number(localStorage.getItem(PROGRESS_VERSION_KEY)) || 0;
    return storedVersion >= PROGRESS_VERSION ? loadJson(STORAGE_KEYS.maxWatched, {}) : {};
  });
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...loadJson(STORAGE_KEYS.settings, {}),
  }));
  const [profileDisplayName, setProfileDisplayName] = useState(() => {
    const p = loadJson(STORAGE_KEYS.profile, {});
    return (p && typeof p.displayName === 'string') ? p.displayName : '';
  });

  // Seed profile display name from auth (e.g. name entered at login) when stored profile is empty
  useEffect(() => {
    const name = typeof initialDisplayName === 'string' ? initialDisplayName.trim() : '';
    if (name) {
      setProfileDisplayName((prev) => (prev ? prev : name));
    }
  }, [initialDisplayName]);

  const [activeSessionId, setActiveSessionIdState] = useState(() => {
    const stored = loadJson(STORAGE_KEYS.activeSession, null);
    if (stored && typeof stored.sessionId === 'string' && ALL_MODULES.some((m) => m.id === stored.sessionId))
      return stored.sessionId;
    return SESSIONS[0]?.id ?? null;
  });
  const [activeDay, setActiveDayState] = useState(() => {
    const stored = loadJson(STORAGE_KEYS.activeSession, null);
    if (stored && typeof stored.sessionId === 'string') {
      const module = ALL_MODULES.find((m) => m.id === stored.sessionId);
      if (module) return module.dayId;
    }
    if (stored && typeof stored.dayId === 'number' && stored.dayId >= 1 && stored.dayId <= 3)
      return stored.dayId;
    return 1;
  });

  const setActiveSessionId = useCallback((id) => {
    setActiveSessionIdState(id);
    const module = ALL_MODULES.find((m) => m.id === id);
    if (module) setActiveDayState(module.dayId);
  }, []);
  const setActiveDay = useCallback((dayId) => {
    setActiveDayState(dayId);
  }, []);

  useEffect(() => {
    saveJson(STORAGE_KEYS.activeSession, { sessionId: activeSessionId, dayId: activeDay });
  }, [activeSessionId, activeDay]);

  useEffect(() => saveJson(STORAGE_KEYS.progress, completedSessions), [completedSessions]);
  useEffect(() => saveJson(STORAGE_KEYS.doubts, doubts), [doubts]);
  useEffect(() => saveJson(STORAGE_KEYS.resume, playbackPosition), [playbackPosition]);
  useEffect(() => saveJson(STORAGE_KEYS.bookmarks, bookmarkedSessions), [bookmarkedSessions]);
  useEffect(() => saveJson(STORAGE_KEYS.maxWatched, maxWatched), [maxWatched]);
  useEffect(() => saveJson(STORAGE_KEYS.settings, settings), [settings]);
  useEffect(() => {
    saveJson(STORAGE_KEYS.profile, { displayName: profileDisplayName });
  }, [profileDisplayName]);

  const totalSessions = SESSIONS.length;
  const completedVideoCount = completedSessions.filter((id) =>
    SESSIONS.some((s) => s.id === id)
  ).length;
  const completionPercent = totalSessions
    ? Math.min(100, Math.round((completedVideoCount / totalSessions) * 100))
    : 0;

  useEffect(() => {
    try {
      localStorage.setItem('webinar_sidebar_expanded', String(sidebarExpanded));
    } catch (_) {}
  }, [sidebarExpanded]);

  // --- Backend sync ---
  const syncTimerRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const sessionProgressRef = useRef(sessionProgress);
  sessionProgressRef.current = sessionProgress;

  const doSync = useCallback(() => {
    if (!webinarToken) return;
    const payload = buildSyncPayload(completedSessions, maxWatched, playbackPosition, activeSessionId, sessionProgressRef.current);
    syncWebinarProgress(webinarToken, payload).catch((err) => {
      if (import.meta.env.DEV) console.warn('[webinar sync] failed', err);
    });
  }, [webinarToken, completedSessions, maxWatched, playbackPosition, activeSessionId]);

  // Initial sync shortly after mount
  const initialSyncDoneRef = useRef(false);
  useEffect(() => {
    if (!webinarToken || initialSyncDoneRef.current) return;
    initialSyncDoneRef.current = true;
    const t = setTimeout(doSync, 2000);
    return () => clearTimeout(t);
  }, [webinarToken, doSync]);

  // Debounced sync on state changes
  useEffect(() => {
    if (!webinarToken) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(doSync, SYNC_DEBOUNCE_MS);
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [doSync, webinarToken]);

  // Immediate sync on completedSessions change (module completion is important)
  const prevCompletedRef = useRef(completedSessions);
  useEffect(() => {
    if (!webinarToken) return;
    if (prevCompletedRef.current !== completedSessions && completedSessions.length > prevCompletedRef.current.length) {
      doSync();
    }
    prevCompletedRef.current = completedSessions;
  }, [completedSessions, doSync, webinarToken]);

  // Restore from backend on mount
  useEffect(() => {
    if (!webinarToken || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    getWebinarProgress(webinarToken).then((res) => {
      if (!res.success || !res.data) return;
      const remote = res.data;
      if (Array.isArray(remote.completedModules) && remote.completedModules.length > completedSessions.length) {
        setCompletedSessions(remote.completedModules);
      }
      if (remote.modules && typeof remote.modules === 'object') {
        const restoredMaxWatched = {};
        const restoredPlayback = {};
        for (const [moduleId, mod] of Object.entries(remote.modules)) {
          if (mod.maxWatchedSeconds > (maxWatched[moduleId] || 0)) {
            restoredMaxWatched[moduleId] = mod.maxWatchedSeconds;
          }
          if (mod.watchedSeconds > (playbackPosition[moduleId] || 0)) {
            restoredPlayback[moduleId] = mod.watchedSeconds;
          }
        }
        if (Object.keys(restoredMaxWatched).length > 0) {
          setMaxWatched((prev) => ({ ...prev, ...restoredMaxWatched }));
        }
        if (Object.keys(restoredPlayback).length > 0) {
          setPlaybackPosition((prev) => ({ ...prev, ...restoredPlayback }));
        }
      }
    }).catch(() => {});
  }, [webinarToken]);

  // beforeunload: flush progress
  useEffect(() => {
    if (!webinarToken) return;
    const handleUnload = () => {
      const payload = buildSyncPayload(completedSessions, maxWatched, playbackPosition, activeSessionId, sessionProgressRef.current);
      syncWebinarProgressBeacon(webinarToken, payload);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [webinarToken, completedSessions, maxWatched, playbackPosition, activeSessionId]);

  const updateSessionProgress = useCallback((sessionId, percent) => {
    setSessionProgress((prev) => ({ ...prev, [sessionId]: percent }));
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'sidebarExpandedByDefault') setSidebarExpanded(value);
      return next;
    });
  };

  const value = useMemo(
    () => ({
    user: {
      name: profileDisplayName || 'Trainee',
      displayName: profileDisplayName,
      setDisplayName: setProfileDisplayName,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=webinar',
      completionPercent,
    },
    sidebarOpen,
    setSidebarOpen,
    sidebarExpanded,
    setSidebarExpanded,
    doubts,
    setDoubts,
    completedSessions,
    setCompletedSessions,
    completedVideoCount,
    playbackPosition,
    setPlaybackPosition,
    bookmarkedSessions,
    setBookmarkedSessions,
    maxWatched,
    setMaxWatched,
    settings,
    setSettings,
    updateSetting,
    activeSessionId,
    setActiveSessionId,
    activeDay,
    setActiveDay,
    sessionProgress,
    setSessionProgress,
    updateSessionProgress,
  }),
  [
    sidebarOpen,
    sidebarExpanded,
    doubts,
    completedSessions,
    completedVideoCount,
    playbackPosition,
    bookmarkedSessions,
    maxWatched,
    settings,
    profileDisplayName,
    completionPercent,
    activeSessionId,
    activeDay,
    sessionProgress,
    updateSessionProgress,
  ]
  );

  return <WebinarContext.Provider value={value}>{children}</WebinarContext.Provider>;
}

export function useWebinar() {
  const ctx = useContext(WebinarContext);
  if (!ctx) throw new Error('useWebinar must be used within WebinarProvider');
  return ctx;
}
