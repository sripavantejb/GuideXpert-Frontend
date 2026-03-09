import { useState, useEffect, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import StatsBar from './components/StatsBar';
import DescriptionCard from './components/DescriptionCard';
import ProfileCard from './components/ProfileCard';
import ProgressIndicator from './components/ProgressIndicator';
import LearningStatsCard from './components/LearningStatsCard';
import CertificateUnlockCard from './components/CertificateUnlockCard';
import DoubtsDashboardCard from './components/DoubtsDashboardCard';
import NotesPanel from './components/NotesPanel';
import { useWebinar } from './context/WebinarContext';
import {
  DAYS,
  SESSIONS,
  getSessionById,
  getSessionsByDay,
  DASHBOARD_MOCK,
} from './data/mockWebinarData';

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
    activeSessionId,
    setActiveSessionId,
    activeDay,
    setActiveDay,
    doubts,
  } = useWebinar();

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
  }, [activeDay, activeSessionId, sessionsForDay, setActiveSessionId]);

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

  const totalSessionsCount = SESSIONS.length;
  const overallCompleted = completedSessions.length;
  const overallPercent = totalSessionsCount ? Math.round((overallCompleted / totalSessionsCount) * 100) : 0;

  const completedCountForDay = useCallback(
    (dayId) => {
      const ids = getSessionsByDay(dayId).map((s) => s.id);
      return ids.filter((id) => completedSessions.includes(id)).length;
    },
    [completedSessions]
  );

  const watchTimeMinutes = SESSIONS.filter((s) => completedSessions.includes(s.id)).reduce(
    (acc, s) => acc + (s.durationMinutes ?? 0),
    0
  );
  const mock = DASHBOARD_MOCK || {};

  return (
    <>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 p-3 sm:p-4 overflow-auto min-h-0">
        <div className="lg:col-span-8 flex flex-col gap-4">
          {activeSessionId &&
              playbackPosition[activeSessionId] > 0 &&
              !completedSessions.includes(activeSessionId) && (
                <div className="rounded-xl bg-primary-blue-50/80 border border-primary-blue-200/50 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm text-primary-navy font-medium">
                    Continue from {formatResumeTime(playbackPosition[activeSessionId])}
                  </span>
                  <a
                    href="#video"
                    className="text-xs font-medium text-primary-navy hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy rounded min-h-[44px] inline-flex items-center"
                  >
                    Jump to video
                  </a>
                </div>
              )}
            <div
              id="video"
              className="rounded-[20px] bg-white p-0 sm:p-5 shadow-card overflow-hidden ring-1 ring-gray-200/50 border-t border-gray-100 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
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
            </div>
          <DescriptionCard session={activeSession} />
          <NotesPanel sessionId={activeSessionId} />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto min-h-0 xl:grid xl:grid-cols-2 xl:auto-rows-min xl:content-start xl:gap-3 xl:items-start">
          <div className="xl:col-span-2">
          <ProgressIndicator
            completedPercent={overallPercent}
            days={DAYS}
            completedCountForDay={completedCountForDay}
            totalSessionsForDay={(dayId) => getSessionsByDay(dayId).length}
            totalCompleted={overallCompleted}
            totalSessions={totalSessionsCount}
          />
          </div>
          <div className="xl:col-span-2">
          <LearningStatsCard
            totalSessions={totalSessionsCount}
            completed={overallCompleted}
            remaining={totalSessionsCount - overallCompleted}
            watchTimeMinutes={watchTimeMinutes}
            averageAttendancePercent={mock.averageAttendancePercent}
            notesCount={mock.notesCount}
            questionsAsked={doubts?.length ?? 0}
          />
          </div>
          <div className="xl:col-span-2">
          <CertificateUnlockCard
            completedPercent={overallPercent}
            totalSessions={totalSessionsCount}
            completedSessions={overallCompleted}
          />
          </div>
          <div className="xl:col-span-2">
            <DoubtsDashboardCard questionsCount={doubts?.length ?? 0} />
          </div>
          <div className="xl:col-span-2">
          <ProfileCard
            completedPercent={overallPercent}
            totalSessions={totalSessionsCount}
            completedSessions={overallCompleted}
          />
          </div>
        </div>
      </div>

      <div
        className={`mx-3 sm:mx-4 mb-4 px-3 py-2 rounded-md text-xs font-medium text-center transition-colors ${
          overallPercent === 100
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-primary-blue-50/80 border border-primary-blue-200/50 text-primary-navy'
        }`}
      >
        Certificate unlocked after Day 3 completion.
      </div>
    </>
  );
}
