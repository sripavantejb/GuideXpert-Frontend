import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DayTabs from './components/DayTabs';
import VideoPlayer from './components/VideoPlayer';
import StatsBar from './components/StatsBar';
import SessionList from './components/SessionList';
import DescriptionCard from './components/DescriptionCard';
import SessionDoubtsCard from './components/SessionDoubtsCard';
import ProgressIndicator from './components/ProgressIndicator';
import NotesPanel from './components/NotesPanel';
import { DAYS, SESSIONS, getSessionById, getModuleById, getSessionsByDay } from './data/mockWebinarData';

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
  const [videoDurationFormatted, setVideoDurationFormatted] = useState(null);
  const [videoSessionType, setVideoSessionType] = useState(null);

  const activeModule = activeSessionId ? getModuleById(activeSessionId) : null;
  const activeSession = activeModule?.type === 'Assessment' ? null : (activeSessionId ? getSessionById(activeSessionId) : null);
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

  // Reset video metadata when session changes
  useEffect(() => {
    setVideoDurationFormatted(null);
    setVideoSessionType(null);
  }, [activeSessionId]);

  // Set first session of the day when day changes and none selected, or when selected module is not in current day
  useEffect(() => {
    if (!sessionsForDay.length) return;
    const activeModuleForDay = activeSessionId ? getModuleById(activeSessionId)?.dayId === activeDay : false;
    if (!activeSessionId || !activeModuleForDay) {
      setActiveSessionId(sessionsForDay[0].id);
    }
  }, [activeDay, activeSessionId, sessionsForDay]);

  // Unlock all days for now (no progression gate)
  const isDayUnlocked = useCallback(() => true, []);

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

  const handleMetadataReady = useCallback(({ formattedDuration }) => {
    setVideoDurationFormatted(formattedDuration ?? null);
    setVideoSessionType('Recorded Webinar');
  }, []);

  const handleNextSession = useCallback(() => {
    const list = getSessionsByDay(activeDay);
    const idx = list.findIndex((s) => s.id === activeSessionId);
    if (idx >= 0 && idx < list.length - 1) {
      setActiveSessionId(list[idx + 1].id);
    }
  }, [activeDay, activeSessionId]);

  const hasNextSession =
    (() => {
      const list = getSessionsByDay(activeDay);
      const idx = list.findIndex((s) => s.id === activeSessionId);
      return idx >= 0 && idx < list.length - 1;
    })();

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
          {/* Left column: one session card (video + stats + description) */}
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card overflow-hidden transition-shadow duration-200 hover:shadow-card-hover flex-shrink-0">
              {activeModule?.type === 'Assessment' ? (
                <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center px-6 py-8 text-center">
                  <p className="text-lg font-semibold text-gray-800">{activeModule.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{activeModule.duration}</p>
                  <p className="text-sm text-gray-600 mt-4 max-w-md">Complete the questions below to check your understanding before moving to the next session.</p>
                </div>
              ) : (
                <>
                  <VideoPlayer
                    session={activeSession}
                    initialPosition={activeSessionId ? playbackPosition[activeSessionId] : 0}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                    onProgress={handleProgressUpdate}
                    onMetadataReady={handleMetadataReady}
                    onNextSession={handleNextSession}
                    hasNextSession={hasNextSession}
                    isBookmarked={activeSessionId ? bookmarkedSessions.includes(activeSessionId) : false}
                    onToggleBookmark={() => activeSessionId && toggleBookmark(activeSessionId)}
                  />
                  {activeSession && (
                    <>
                      <div className="border-t border-gray-100 px-4 sm:px-5 py-4">
                        <StatsBar
                          type={videoSessionType ?? activeSession.type}
                          duration={videoDurationFormatted ?? activeSession.duration}
                          totalDuration={videoDurationFormatted ?? `${getSessionsByDay(activeSession.dayId).reduce((a, s) => a + s.durationMinutes, 0)}m`}
                          status={
                            completedSessions.includes(activeSession.id)
                              ? 'Completed'
                              : sessionProgress[activeSession.id] > 0
                                ? 'In Progress'
                                : 'Not started'
                          }
                        />
                      </div>
                      <div className="border-t border-gray-100 px-4 sm:px-5 py-4">
                        <DescriptionCard session={activeSession} embedded />
                      </div>
                      <div className="border-t border-gray-100 px-4 sm:px-5 py-4">
                        <SessionDoubtsCard
                          sessionId={activeSessionId}
                          doubts={doubts}
                          onDoubtsChange={setDoubts}
                          embedded
                        />
                      </div>
                    </>
                  )}
                  {!activeSession && (
                    <>
                      <div className="border-t border-gray-100 px-4 sm:px-5 py-4">
                        <DescriptionCard session={null} embedded />
                      </div>
                      <div className="border-t border-gray-100 px-4 sm:px-5 py-4">
                        <SessionDoubtsCard
                          sessionId={activeSessionId}
                          doubts={doubts}
                          onDoubtsChange={setDoubts}
                          embedded
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <NotesPanel sessionId={activeSessionId} />
          </div>

          {/* Right column: one panel (sessions + progress + profile) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="rounded-2xl border border-gray-200 shadow-card bg-white overflow-hidden flex flex-col">
              <SessionList
                sessions={sessionsForDay}
                activeSessionId={activeSessionId}
                onSelectSession={setActiveSessionId}
                completedSessions={completedSessions}
                sessionProgress={sessionProgress}
                isDayUnlocked={isDayUnlocked}
                activeDay={activeDay}
                embedded
              />
              <div className="border-t border-gray-100">
                <ProgressIndicator
                  completedPercent={overallPercent}
                  days={DAYS}
                  completedCountForDay={completedCountForDay}
                  totalSessionsForDay={(dayId) => getSessionsByDay(dayId).length}
                  totalCompleted={overallCompleted}
                  totalSessions={totalSessionsCount}
                  embedded
                />
              </div>
            </div>
          </div>
        </div>

        {/* Certificate banner */}
        {overallPercent < 100 && (
          <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 px-4 py-2.5 rounded-xl text-sm font-medium text-center bg-primary-blue-50/80 border border-primary-blue-200/50 text-primary-navy">
            Complete the intro video to unlock your certificate.
          </div>
        )}
        {overallPercent === 100 && (
          <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 px-4 py-2.5 rounded-xl text-sm font-semibold text-center bg-accent-green/10 border border-accent-green/30 text-accent-green">
            All sessions complete — your certificate is ready to download!
          </div>
        )}
      </main>
    </div>
  );
}
