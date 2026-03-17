import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SESSIONS, ALL_MODULES } from '../data/mockWebinarData';
import { normalizeDoubts } from '../utils/doubtHelpers';

const STORAGE_KEYS = {
  progress: 'webinar_progress',
  doubts: 'webinar_doubts',
  resume: 'webinar_resume',
  bookmarks: 'webinar_bookmarks',
  settings: 'webinar_settings',
  profile: 'webinar_profile',
  activeSession: 'webinar_active_session',
};

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

export function WebinarProvider({ children, initialDisplayName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(getStoredSidebarExpanded);
  const [doubts, setDoubts] = useState(() => normalizeDoubts(loadJson(STORAGE_KEYS.doubts, [])));
  const [completedSessions, setCompletedSessions] = useState(() =>
    loadJson(STORAGE_KEYS.progress, [])
  );
  const [playbackPosition, setPlaybackPosition] = useState(() =>
    loadJson(STORAGE_KEYS.resume, {})
  );
  const [bookmarkedSessions, setBookmarkedSessions] = useState(() =>
    loadJson(STORAGE_KEYS.bookmarks, [])
  );
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
    settings,
    setSettings,
    updateSetting,
    activeSessionId,
    setActiveSessionId,
    activeDay,
    setActiveDay,
  }),
  [
    sidebarOpen,
    sidebarExpanded,
    doubts,
    completedSessions,
    completedVideoCount,
    playbackPosition,
    bookmarkedSessions,
    settings,
    profileDisplayName,
    completionPercent,
    activeSessionId,
    activeDay,
  ]
  );

  return <WebinarContext.Provider value={value}>{children}</WebinarContext.Provider>;
}

export function useWebinar() {
  const ctx = useContext(WebinarContext);
  if (!ctx) throw new Error('useWebinar must be used within WebinarProvider');
  return ctx;
}
