import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SESSIONS } from '../data/mockWebinarData';
import { normalizeDoubts } from '../utils/doubtHelpers';

const STORAGE_KEYS = {
  progress: 'webinar_progress',
  doubts: 'webinar_doubts',
  resume: 'webinar_resume',
  bookmarks: 'webinar_bookmarks',
  settings: 'webinar_settings',
  profile: 'webinar_profile',
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

export function WebinarProvider({ children }) {
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

  useEffect(() => saveJson(STORAGE_KEYS.progress, completedSessions), [completedSessions]);
  useEffect(() => saveJson(STORAGE_KEYS.doubts, doubts), [doubts]);
  useEffect(() => saveJson(STORAGE_KEYS.resume, playbackPosition), [playbackPosition]);
  useEffect(() => saveJson(STORAGE_KEYS.bookmarks, bookmarkedSessions), [bookmarkedSessions]);
  useEffect(() => saveJson(STORAGE_KEYS.settings, settings), [settings]);
  useEffect(() => {
    saveJson(STORAGE_KEYS.profile, { displayName: profileDisplayName });
  }, [profileDisplayName]);

  const totalSessions = SESSIONS.length;
  const completionPercent = totalSessions
    ? Math.round((completedSessions.length / totalSessions) * 100)
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
    playbackPosition,
    setPlaybackPosition,
    bookmarkedSessions,
    setBookmarkedSessions,
    settings,
    setSettings,
    updateSetting,
  }),
  [
    sidebarOpen,
    sidebarExpanded,
    doubts,
    completedSessions,
    playbackPosition,
    bookmarkedSessions,
    settings,
    profileDisplayName,
    completionPercent,
  ]
  );

  return <WebinarContext.Provider value={value}>{children}</WebinarContext.Provider>;
}

export function useWebinar() {
  const ctx = useContext(WebinarContext);
  if (!ctx) throw new Error('useWebinar must be used within WebinarProvider');
  return ctx;
}
