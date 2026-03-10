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
    <div className="min-h-screen bg-gray-50 flex">
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
          className="lg:hidden fixed top-4 left-4 z-10 p-2 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Day tabs */}
        <div className="shrink-0 px-4 sm:px-5 pt-4 pb-3 pl-14 lg:pl-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <DayTabs
            days={DAYS}
            activeDay={activeDay}
            onDayChange={setActiveDay}
          />
        </div>

        {/* Main grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 p-4 sm:p-5 overflow-auto min-h-0">
          {/* Left column */}
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
            {/* Video + StatsBar */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden p-0 sm:p-5 transition-shadow duration-200 hover:shadow-md">
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
                <div className="px-4 sm:px-0">
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
                </div>
              )}
            </div>

            <DescriptionCard session={activeSession} />
            <NotesPanel sessionId={activeSessionId} />
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
            <SessionList
              sessions={sessionsForDay}
              activeSessionId={activeSessionId}
              onSelectSession={setActiveSessionId}
              completedSessions={completedSessions}
              sessionProgress={sessionProgress}
              isDayUnlocked={isDayUnlocked}
              activeDay={activeDay}
            />
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
              totalCompleted={overallCompleted}
              totalSessions={totalSessionsCount}
            />
          </div>
        </div>

        {/* Certificate banner */}
        {overallPercent < 100 && (
          <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 px-4 py-2.5 rounded-xl text-sm font-medium text-center bg-primary-blue-50/80 border border-primary-blue-200/50 text-primary-navy">
            Complete all Day 3 sessions to unlock your certificate.
          </div>
        )}
        {overallPercent === 100 && (
          <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 px-4 py-2.5 rounded-xl text-sm font-semibold text-center bg-green-50 border border-green-200 text-green-800">
            All sessions complete — your certificate is ready to download!
          </div>
        )}
      </main>
    </div>
  );
}
