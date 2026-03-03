import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DayTabs from './components/DayTabs';
import VideoPlayer from './components/VideoPlayer';
import StatsBar from './components/StatsBar';
import SessionList from './components/SessionList';
import DescriptionCard from './components/DescriptionCard';
import ProfileCard from './components/ProfileCard';
import ProgressIndicator from './components/ProgressIndicator';
import NotesPanel from './components/NotesPanel';
import { DAYS, SESSIONS, getSessionById, getSessionsByDay } from './data/mockWebinarData';

const STORAGE_KEYS = {
  progress: 'webinar_progress',
  doubts: 'webinar_doubts',
  resume: 'webinar_resume',
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

export default function WebinarPage() {
  const [activeDay, setActiveDay] = useState(1);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [completedSessions, setCompletedSessions] = useState(() =>
    loadJson(STORAGE_KEYS.progress, [])
  );
  const [sessionProgress, setSessionProgress] = useState({});
  const [playbackPosition, setPlaybackPosition] = useState(() =>
    loadJson(STORAGE_KEYS.resume, {})
  );
  const [doubts, setDoubts] = useState(() => loadJson(STORAGE_KEYS.doubts, []));
  const [bookmarkedSessions, setBookmarkedSessions] = useState(() =>
    loadJson('webinar_bookmarks', [])
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSession = activeSessionId ? getSessionById(activeSessionId) : null;
  const sessionsForDay = getSessionsByDay(activeDay);

  // Persist progress (completed session ids)
  useEffect(() => {
    saveJson(STORAGE_KEYS.progress, completedSessions);
  }, [completedSessions]);

  // Persist resume positions
  useEffect(() => {
    saveJson(STORAGE_KEYS.resume, playbackPosition);
  }, [playbackPosition]);

  useEffect(() => {
    saveJson(STORAGE_KEYS.doubts, doubts);
  }, [doubts]);

  useEffect(() => {
    saveJson('webinar_bookmarks', bookmarkedSessions);
  }, [bookmarkedSessions]);

  // Set first session of the day when day changes and none selected, or ensure selected is in current day
  useEffect(() => {
    if (!sessionsForDay.length) return;
    const currentInDay = activeSessionId && sessionsForDay.some((s) => s.id === activeSessionId);
    if (!activeSessionId || !currentInDay) {
      setActiveSessionId(sessionsForDay[0].id);
    }
  }, [activeDay, activeSessionId, sessionsForDay]);

  const isDayUnlocked = useCallback(
    (dayId) => {
      if (dayId === 1) return true;
      const prevDaySessions = getSessionsByDay(dayId - 1);
      const prevDayIds = prevDaySessions.map((s) => s.id);
      return prevDayIds.every((id) => completedSessions.includes(id));
    },
    [completedSessions]
  );

  const handleTimeUpdate = useCallback(
    (sessionId, currentTime) => {
      setPlaybackPosition((prev) => ({ ...prev, [sessionId]: currentTime }));
    },
    []
  );

  const handleVideoEnded = useCallback(
    (sessionId) => {
      setCompletedSessions((prev) => (prev.includes(sessionId) ? prev : [...prev, sessionId]));
      setSessionProgress((prev) => ({ ...prev, [sessionId]: 100 }));
    },
    []
  );

  const handleProgressUpdate = useCallback((sessionId, percent) => {
    setSessionProgress((prev) => ({ ...prev, [sessionId]: percent }));
    if (percent >= 100) {
      setCompletedSessions((prev) => (prev.includes(sessionId) ? prev : [...prev, sessionId]));
    }
  }, []);

  const toggleBookmark = useCallback((sessionId) => {
    setBookmarkedSessions((prev) =>
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
    );
  }, []);

  const completedCountForDay = (dayId) => {
    const ids = getSessionsByDay(dayId).map((s) => s.id);
    return ids.filter((id) => completedSessions.includes(id)).length;
  };

  const totalSessionsCount = SESSIONS.length;
  const overallCompleted = completedSessions.length;
  const overallPercent = totalSessionsCount ? Math.round((overallCompleted / totalSessionsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar
        activeId="webinar"
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        doubtsCount={doubts.length}
      />

      <main className="flex-1 flex flex-col min-w-0 lg:ml-[72px] relative">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-10 p-2 rounded-xl bg-white border border-gray-200 shadow-card text-gray-600 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Top: Day tabs */}
        <div className="shrink-0 px-4 pt-4 pb-2 pl-14 lg:pl-4">
          <DayTabs
            days={DAYS}
            activeDay={activeDay}
            onDayChange={setActiveDay}
          />
        </div>

        {/* Main grid: video + sessions | description + doubts + profile */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-auto min-h-0">
          {/* Left column: video + stats + description */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Video + Stats */}
            <div
              className="rounded-2xl bg-white p-4 shadow-card overflow-hidden ring-1 ring-gray-200/50"
              style={{ borderRadius: '16px' }}
            >
              <VideoPlayer
                session={activeSession}
                initialPosition={activeSessionId ? playbackPosition[activeSessionId] : 0}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onProgress={handleProgressUpdate}
                isBookmarked={activeSessionId ? bookmarkedSessions.includes(activeSessionId) : false}
                onToggleBookmark={() => activeSessionId && toggleBookmark(activeSessionId)}
              />
              {activeSession && (
                <StatsBar
                  type={activeSession.type}
                  duration={activeSession.duration}
                  totalDuration={`${getSessionsByDay(activeSession.dayId).reduce((a, s) => a + s.durationMinutes, 0)}m`}
                  status={
                    completedSessions.includes(activeSession.id)
                      ? 'Completed'
                      : sessionProgress[activeSession.id] > 0
                        ? 'In Progress'
                        : 'Not started'
                  }
                />
              )}
            </div>

            {/* Description */}
            <DescriptionCard session={activeSession} />

            {/* Notes (collapsible) */}
            <NotesPanel sessionId={activeSessionId} />
          </div>

          {/* Right column: sessions list + doubts + profile */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <SessionList
              sessions={sessionsForDay}
              activeSessionId={activeSessionId}
              onSelectSession={setActiveSessionId}
              completedSessions={completedSessions}
              sessionProgress={sessionProgress}
              isDayUnlocked={isDayUnlocked}
              activeDay={activeDay}
            />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
              <ProfileCard
                completedPercent={overallPercent}
                totalSessions={totalSessionsCount}
                completedSessions={overallCompleted}
              />
              <ProgressIndicator
                completedPercent={overallPercent}
                days={DAYS}
                completedCountForDay={completedCountForDay}
                totalSessionsForDay={(dayId) => getSessionsByDay(dayId).length}
              />
            </div>
          </div>
        </div>

        {/* Certification banner: slim bar */}
        <div
          className={`mx-4 mb-4 px-4 py-2 rounded-lg text-xs font-medium text-center transition-colors ${
            overallPercent === 100
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-primary-blue-50/80 border border-primary-blue-200/50 text-primary-navy'
          }`}
          style={{ borderRadius: '10px' }}
        >
          Certificate unlocked after Day 3 completion.
        </div>
      </main>
    </div>
  );
}
