import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DayTabs from './components/DayTabs';
import VideoPlayer from './components/VideoPlayer';
import StatsBar from './components/StatsBar';
import SessionList from './components/SessionList';
import DescriptionCard from './components/DescriptionCard';
import ProfileCard from './components/ProfileCard';
import ProgressIndicator from './components/ProgressIndicator';
import NotesPanel from './components/NotesPanel';
import { FiMessageCircle } from 'react-icons/fi';
import { useWebinar } from './context/WebinarContext';
import { DAYS, SESSIONS, getSessionById, getSessionsByDay } from './data/mockWebinarData';

function formatResumeTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WebinarDashboard() {
  const {
    completedSessions,
    setCompletedSessions,
    playbackPosition,
    setPlaybackPosition,
    bookmarkedSessions,
    setBookmarkedSessions,
    settings,
  } = useWebinar();

  const [activeDay, setActiveDay] = useState(1);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionProgress, setSessionProgress] = useState({});
  const [autoplayNextSession, setAutoplayNextSession] = useState(false);
  const sessionsForDay = getSessionsByDay(activeDay);
  const activeSession = activeSessionId ? getSessionById(activeSessionId) : null;

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

  const handleTimeUpdate = useCallback((sessionId, currentTime) => {
    setPlaybackPosition((prev) => ({ ...prev, [sessionId]: currentTime }));
  }, [setPlaybackPosition]);

  const handleVideoEnded = useCallback(
    (sessionId) => {
      setCompletedSessions((prev) => (prev.includes(sessionId) ? prev : [...prev, sessionId]));
      setSessionProgress((prev) => ({ ...prev, [sessionId]: 100 }));
      if (settings?.autoplayNext) {
        const daySessions = getSessionsByDay(activeDay);
        const idx = daySessions.findIndex((s) => s.id === sessionId);
        if (idx >= 0 && idx < daySessions.length - 1) {
          setActiveSessionId(daySessions[idx + 1].id);
          setAutoplayNextSession(true);
        }
      }
    },
    [setCompletedSessions, settings?.autoplayNext, activeDay]
  );

  const handleProgressUpdate = useCallback(
    (sessionId, percent) => {
      setSessionProgress((prev) => ({ ...prev, [sessionId]: percent }));
      if (percent >= 100) {
        setCompletedSessions((prev) => (prev.includes(sessionId) ? prev : [...prev, sessionId]));
      }
    },
    [setCompletedSessions]
  );

  const toggleBookmark = useCallback(
    (sessionId) => {
      setBookmarkedSessions((prev) =>
        prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
      );
    },
    [setBookmarkedSessions]
  );

  const completedCountForDay = (dayId) => {
    const ids = getSessionsByDay(dayId).map((s) => s.id);
    return ids.filter((id) => completedSessions.includes(id)).length;
  };

  const totalSessionsCount = SESSIONS.length;
  const overallCompleted = completedSessions.length;
  const overallPercent = totalSessionsCount ? Math.round((overallCompleted / totalSessionsCount) * 100) : 0;

  return (
    <>
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-0 pl-14 lg:pl-6">
        <DayTabs
          days={DAYS}
          activeDay={activeDay}
          onDayChange={setActiveDay}
          completedCountForDay={completedCountForDay}
          totalSessionsForDay={(dayId) => getSessionsByDay(dayId).length}
        />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-4 sm:p-6 overflow-auto min-h-0">
        <div className="lg:col-span-8 flex flex-col gap-5">
          {activeSessionId &&
              playbackPosition[activeSessionId] > 0 &&
              !completedSessions.includes(activeSessionId) && (
                <div className="rounded-xl bg-primary-navy/5 border border-primary-navy/15 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-primary-navy font-medium">
                    Resume from {formatResumeTime(playbackPosition[activeSessionId])}
                  </span>
                  <a
                    href="#video"
                    className="text-sm font-medium text-primary-navy hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy rounded inline-flex items-center"
                  >
                    Jump to video
                  </a>
                </div>
              )}
            <section
              id="video"
              className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-sm"
              aria-label="Video player"
            >
              <VideoPlayer
              session={activeSession}
              initialPosition={activeSessionId ? playbackPosition[activeSessionId] : 0}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onProgress={handleProgressUpdate}
              isBookmarked={activeSessionId ? bookmarkedSessions.includes(activeSessionId) : false}
              onToggleBookmark={() => activeSessionId && toggleBookmark(activeSessionId)}
              autoplayOnLoad={autoplayNextSession}
              onAutoplayDone={() => setAutoplayNextSession(false)}
              />
              {activeSession && (
                <>
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
                </>
              )}
            </section>
          <DescriptionCard session={activeSession} />
          <Link
            to="/webinar/doubts"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
          >
            <FiMessageCircle className="w-4 h-4 text-primary-navy" />
            Ask a question · Doubts & answers
          </Link>
          <NotesPanel sessionId={activeSessionId} />
        </div>

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

      <div
        className={`mx-4 sm:mx-6 mb-6 px-4 py-3 rounded-xl text-sm font-medium text-center transition-colors ${
          overallPercent === 100
            ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-800'
            : 'bg-primary-navy/5 border border-primary-navy/15 text-primary-navy'
        }`}
      >
        Certificate unlocked after Day 3 completion.
      </div>
    </>
  );
}
