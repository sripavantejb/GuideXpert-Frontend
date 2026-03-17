import { useState, useEffect, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import StatsBar from './components/StatsBar';
import DescriptionCard from './components/DescriptionCard';
import ProgressIndicator from './components/ProgressIndicator';
import CertificateUnlockCard from './components/CertificateUnlockCard';
import NotesPanel from './components/NotesPanel';
import { useWebinar } from './context/WebinarContext';
import {
  DAYS,
  SESSIONS,
  getSessionById,
  getModuleById,
  getNextModule,
  getSessionsByDay,
  getModulesByDay,
  isAssessmentId,
} from './data/mockWebinarData';
import { Link } from 'react-router-dom';
import WebinarAssessment1 from './components/WebinarAssessment1';
import WebinarAssessment2 from './components/WebinarAssessment2';

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
  const modulesForDay = getModulesByDay(activeDay);
  const sessionsForDay = getSessionsByDay(activeDay);
  const activeModule = activeSessionId ? getModuleById(activeSessionId) : null;
  const activeSession = activeSessionId ? getSessionById(activeSessionId) : null;
  const nextModule = activeSessionId ? getNextModule(activeSessionId) : null;
  const isVideoSession = activeModule && activeModule.type !== 'Assessment';
  const currentModuleComplete = activeSessionId
    ? isVideoSession
      ? completedSessions.includes(activeSessionId) || (sessionProgress[activeSessionId] ?? 0) >= 100
      : completedSessions.includes(activeSessionId)
    : false;
  const showNextButton = nextModule && currentModuleComplete;

  useEffect(() => {
    if (!modulesForDay.length) return;
    const currentInDay = activeSessionId && modulesForDay.some((m) => m.id === activeSessionId);
    if (!activeSessionId || !currentInDay) {
      setActiveSessionId(modulesForDay[0].id);
    }
  }, [activeDay, activeSessionId, modulesForDay, setActiveSessionId]);

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
  const completedVideoIds = completedSessions.filter((id) => SESSIONS.some((s) => s.id === id));
  const overallCompleted = completedVideoIds.length;
  const overallPercent = totalSessionsCount ? Math.min(100, Math.round((overallCompleted / totalSessionsCount) * 100)) : 0;

  const completedCountForDay = useCallback(
    (dayId) => {
      const ids = getSessionsByDay(dayId).map((s) => s.id);
      return ids.filter((id) => completedVideoIds.includes(id)).length;
    },
    [completedVideoIds]
  );

  return (
    <>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 p-4 sm:p-5 overflow-auto min-h-0">
        <div className="lg:col-span-8 flex flex-col gap-5 min-w-0">
          {activeSessionId &&
              activeSession &&
              playbackPosition[activeSessionId] > 0 &&
              !completedSessions.includes(activeSessionId) && (
                <div className="rounded-xl bg-primary-blue-50/80 border border-primary-blue-200/50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-primary-navy font-medium">
                    Continue from {formatResumeTime(playbackPosition[activeSessionId])}
                  </span>
                  <a
                    href="#video"
                    className="text-sm font-medium text-primary-navy hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy rounded min-h-[40px] inline-flex items-center"
                  >
                    Jump to video
                  </a>
                </div>
              )}
            <div
              id="video"
              className="rounded-2xl bg-white p-0 sm:p-5 shadow-sm overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-md min-w-0"
            >
              {activeModule?.type === 'Assessment' ? (
                activeModule.id === 'a1' ? (
                  <div className="flex flex-col min-h-[360px] p-5 sm:p-6">
                    <WebinarAssessment1
                      onComplete={() => setCompletedSessions((prev) => (prev.includes('a1') ? prev : [...prev, 'a1']))}
                      nextLabel={nextModule?.title}
                      onGoNext={nextModule ? () => { setActiveSessionId(nextModule.id); setActiveDay(nextModule.dayId); } : undefined}
                    />
                  </div>
                ) : activeModule.id === 'a2' ? (
                  <div className="flex flex-col min-h-[360px] p-5 sm:p-6">
                    <WebinarAssessment2
                      onComplete={() => setCompletedSessions((prev) => (prev.includes('a2') ? prev : [...prev, 'a2']))}
                      nextLabel={nextModule?.title}
                      onGoNext={nextModule ? () => { setActiveSessionId(nextModule.id); setActiveDay(nextModule.dayId); } : undefined}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center px-6 py-8 text-center">
                    <p className="text-lg font-semibold text-gray-800">{activeModule.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{activeModule.duration}</p>
                    <p className="text-sm text-gray-600 mt-4 max-w-md">Complete the questions below to check your understanding before moving to the next session.</p>
                    {isAssessmentId(activeModule.id) && (
                      <Link
                        to="/assessment-3"
                        className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-white bg-primary-navy hover:bg-primary-navy/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
                      >
                        Start {activeModule.title}
                      </Link>
                    )}
                  </div>
                )
              ) : (
                <>
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
                </>
              )}
              {showNextButton && (
                <div className="border-t border-gray-100 px-4 sm:px-5 py-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSessionId(nextModule.id);
                      setActiveDay(nextModule.dayId);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-primary-navy hover:bg-primary-navy/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 transition-colors"
                  >
                    Next: {nextModule.title}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          <DescriptionCard session={activeSession} />
          <NotesPanel sessionId={activeSessionId} />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto min-h-0 xl:grid xl:grid-cols-2 xl:auto-rows-min xl:content-start xl:gap-4 xl:items-start">
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
          <CertificateUnlockCard
            completedPercent={overallPercent}
            totalSessions={totalSessionsCount}
            completedSessions={overallCompleted}
          />
          </div>
        </div>
      </div>

      {overallPercent < 100 && (
        <div className="mx-4 sm:mx-5 mb-5 px-4 py-2.5 rounded-xl text-sm font-medium text-center bg-primary-blue-50/80 border border-primary-blue-200/50 text-primary-navy">
          Complete all Day 3 sessions to unlock your certificate.
        </div>
      )}
    </>
  );
}
