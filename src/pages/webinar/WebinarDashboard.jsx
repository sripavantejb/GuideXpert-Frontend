import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { FiLock } from 'react-icons/fi';
import VideoPlayer from './components/VideoPlayer';
import StatsBar from './components/StatsBar';
import DescriptionCard from './components/DescriptionCard';
import SessionDoubtsCard from './components/SessionDoubtsCard';
import ProgressIndicator from './components/ProgressIndicator';
import CertificateUnlockCard from './components/CertificateUnlockCard';
import NotesPanel from './components/NotesPanel';
import CompletionModal from './components/CompletionModal';
import ExternalFormModal from './components/ExternalFormModal';
import { useWebinar } from './context/WebinarContext';
import { useWebinarAuth } from '../../contexts/WebinarAuthContext';
import {
  DAYS,
  SESSIONS,
  ALL_MODULES,
  getSessionById,
  getModuleById,
  getNextModule,
  getSessionsByDay,
  getModulesByDay,
} from './data/mockWebinarData';
import { getUnlockProgress, isModuleUnlocked, getSessionForAssessment } from './utils/unlockLogic';
import WebinarAssessment1 from './components/WebinarAssessment1';
import WebinarAssessment2 from './components/WebinarAssessment2';
import WebinarAssessment3 from './components/WebinarAssessment3';
import WebinarAssessment4 from './components/WebinarAssessment4';
import WebinarAssessment5 from './components/WebinarAssessment5';

const COMPLETION_THRESHOLD = 90;

function formatResumeTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WebinarDashboard() {
  const { token: webinarToken } = useWebinarAuth();
  const {
    completedSessions,
    setCompletedSessions,
    playbackPosition,
    setPlaybackPosition,
    bookmarkedSessions,
    setBookmarkedSessions,
    maxWatched,
    setMaxWatched,
    settings,
    activeSessionId,
    setActiveSessionId,
    activeDay,
    setActiveDay,
    doubts,
    setDoubts,
    sessionProgress,
    setSessionProgress,
  } = useWebinar();
  const [autoplayNextSession, setAutoplayNextSession] = useState(false);
  const [videoDurationFormatted, setVideoDurationFormatted] = useState(null);
  const [videoSessionType, setVideoSessionType] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const hasShownModal = useRef(false);
  const [unlockToast, setUnlockToast] = useState(null);
  const justCompletedRef = useRef(new Set());

  const modulesForDay = getModulesByDay(activeDay);
  const sessionsForDay = getSessionsByDay(activeDay);
  const activeModule = activeSessionId ? getModuleById(activeSessionId) : null;
  const activeSession = activeSessionId ? getSessionById(activeSessionId) : null;
  const nextModule = activeSessionId ? getNextModule(activeSessionId) : null;
  const isVideoSession = activeModule && activeModule.type !== 'Assessment';
  const isActiveModuleLocked = activeModule ? !isModuleUnlocked(activeModule.id, completedSessions) : false;

  // Assessment content lock: sidebar-unlocked but paired session video not yet watched
  const pairedSession = activeModule?.type === 'Assessment' ? getSessionForAssessment(activeModule.id) : null;
  const isAssessmentContentLocked = pairedSession ? !completedSessions.includes(pairedSession.id) : false;

  const isIntro = activeSessionId === 'intro';
  const currentModuleComplete = activeSessionId
    ? isVideoSession
      ? completedSessions.includes(activeSessionId) || (sessionProgress[activeSessionId] ?? 0) >= COMPLETION_THRESHOLD
      : completedSessions.includes(activeSessionId)
    : false;
  const showNextButton = nextModule && currentModuleComplete && !isActiveModuleLocked;

  useEffect(() => {
    setVideoDurationFormatted(null);
    setVideoSessionType(null);
  }, [activeSessionId]);

  useEffect(() => {
    if (!modulesForDay.length) return;
    const currentInDay = activeSessionId && modulesForDay.some((m) => m.id === activeSessionId);
    if (!activeSessionId || !currentInDay) {
      setActiveSessionId(modulesForDay[0].id);
    }
  }, [activeDay, activeSessionId, modulesForDay, setActiveSessionId]);

  // Detect all-modules completion and show the congratulations modal once
  useEffect(() => {
    if (hasShownModal.current) return;
    const { completed, total } = getUnlockProgress(completedSessions);
    if (total > 0 && completed >= total) {
      hasShownModal.current = true;
      setShowCompletionModal(true);
    }
  }, [completedSessions]);

  const handleCompletionContinue = useCallback(() => {
    setShowCompletionModal(false);
    setShowFormModal(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setShowFormModal(false);
  }, []);

  const handleTimeUpdate = useCallback((sessionId, currentTime) => {
    setPlaybackPosition((prev) => ({ ...prev, [sessionId]: currentTime }));
    if (Number.isFinite(currentTime) && currentTime > 0) {
      setMaxWatched((prev) => {
        const prevMax = prev[sessionId] || 0;
        return currentTime > prevMax ? { ...prev, [sessionId]: currentTime } : prev;
      });
    }
  }, [setPlaybackPosition, setMaxWatched]);

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
      if (percent >= COMPLETION_THRESHOLD) {
        setCompletedSessions((prev) => {
          if (prev.includes(sessionId)) return prev;
          if (!justCompletedRef.current.has(sessionId)) {
            justCompletedRef.current.add(sessionId);
            const next = getNextModule(sessionId);
            const label = next ? next.title : 'Course';
            setUnlockToast(`${label} Unlocked!`);
            setTimeout(() => setUnlockToast(null), 3500);
            try {
              confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 } });
            } catch {
              // confetti unavailable
            }
          }
          return [...prev, sessionId];
        });
      }
    },
    [setCompletedSessions]
  );

  const handleMetadataReady = useCallback(({ formattedDuration }) => {
    setVideoDurationFormatted(formattedDuration ?? null);
    setVideoSessionType('Recorded Webinar');
  }, []);

  const handleNextSession = useCallback(() => {
    const next = getNextModule(activeSessionId);
    if (next) {
      setActiveSessionId(next.id);
      setActiveDay(next.dayId);
    }
  }, [activeSessionId, setActiveSessionId]);

  const hasNextSession = !!nextModule;

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
              data-tour="video-player"
              className="rounded-2xl bg-white p-0 sm:p-5 shadow-sm overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-md min-w-0 flex-shrink-0"
            >
              {activeModule?.type === 'Assessment' && (isActiveModuleLocked || isAssessmentContentLocked) ? (
                <div className="aspect-video bg-gradient-to-b from-slate-100 to-slate-50 flex flex-col items-center justify-center px-6 py-8 text-center rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-slate-200/80 flex items-center justify-center mb-5">
                    <FiLock className="w-7 h-7 text-slate-400" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 mb-1.5">Complete the session video to unlock this assessment</h2>
                  <p className="text-sm text-slate-500 max-w-sm">Watch the full session video before attempting the assessment.</p>
                  {pairedSession && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSessionId(pairedSession.id);
                        setActiveDay(pairedSession.dayId);
                      }}
                      className="mt-5 px-5 py-2.5 rounded-xl bg-primary-navy text-white text-sm font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
                    >
                      Go to {pairedSession.title}
                    </button>
                  )}
                </div>
              ) : activeModule?.type === 'Assessment' ? (
                activeModule.id === 'a1' ? (
                  <div className="flex flex-col min-h-[360px] p-5 sm:p-6">
                    <WebinarAssessment1
                      onComplete={() => setCompletedSessions((prev) => (prev.includes('a1') ? prev : [...prev, 'a1']))}
                      nextLabel={nextModule?.title}
                      onGoNext={nextModule ? () => { setActiveSessionId(nextModule.id); setActiveDay(nextModule.dayId); } : undefined}
                      webinarToken={webinarToken}
                    />
                  </div>
                ) : activeModule.id === 'a2' ? (
                  <div className="flex flex-col min-h-[360px] p-5 sm:p-6">
                    <WebinarAssessment2
                      onComplete={() => setCompletedSessions((prev) => (prev.includes('a2') ? prev : [...prev, 'a2']))}
                      nextLabel={nextModule?.title}
                      onGoNext={nextModule ? () => { setActiveSessionId(nextModule.id); setActiveDay(nextModule.dayId); } : undefined}
                      webinarToken={webinarToken}
                    />
                  </div>
                ) : activeModule.id === 'a3' ? (
                  <div className="flex flex-col min-h-[360px] p-5 sm:p-6">
                    <WebinarAssessment3
                      onComplete={() => setCompletedSessions((prev) => (prev.includes('a3') ? prev : [...prev, 'a3']))}
                      nextLabel={nextModule?.title}
                      onGoNext={nextModule ? () => { setActiveSessionId(nextModule.id); setActiveDay(nextModule.dayId); } : undefined}
                      webinarToken={webinarToken}
                    />
                  </div>
                ) : activeModule.id === 'a4' ? (
                  <div className="flex flex-col min-h-[360px] p-5 sm:p-6">
                    <WebinarAssessment4
                      onComplete={() => setCompletedSessions((prev) => (prev.includes('a4') ? prev : [...prev, 'a4']))}
                      nextLabel={nextModule?.title}
                      onGoNext={nextModule ? () => { setActiveSessionId(nextModule.id); setActiveDay(nextModule.dayId); } : undefined}
                      webinarToken={webinarToken}
                    />
                  </div>
                ) : activeModule.id === 'a5' ? (
                  <div className="flex flex-col min-h-[360px] p-5 sm:p-6">
                    <WebinarAssessment5
                      onComplete={() => setCompletedSessions((prev) => (prev.includes('a5') ? prev : [...prev, 'a5']))}
                      nextLabel={nextModule?.title}
                      onGoNext={nextModule ? () => { setActiveSessionId(nextModule.id); setActiveDay(nextModule.dayId); } : undefined}
                      webinarToken={webinarToken}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center px-6 py-8 text-center">
                    <p className="text-lg font-semibold text-gray-800">{activeModule.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{activeModule.duration}</p>
                    <p className="text-sm text-gray-600 mt-4 max-w-md">Complete the questions below to check your understanding before moving to the next session.</p>
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
                    onMetadataReady={handleMetadataReady}
                    onNextSession={handleNextSession}
                    hasNextSession={hasNextSession}
                    isLocked={isActiveModuleLocked}
                    maxWatchedTime={activeSessionId ? (maxWatched[activeSessionId] || 0) : 0}
                    isBookmarked={activeSessionId ? bookmarkedSessions.includes(activeSessionId) : false}
                    onToggleBookmark={() => activeSessionId && toggleBookmark(activeSessionId)}
                    autoplayOnLoad={autoplayNextSession}
                    onAutoplayDone={() => setAutoplayNextSession(false)}
                    isIntro={isIntro}
                  />
                  {activeSession && (
                    <>
                      <div data-tour="stats-bar">
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
                    </>
                  )}
              {showNextButton && isIntro && (
                <div className="border-t border-gray-100 px-4 sm:px-5 py-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPlaybackPosition((prev) => ({ ...prev, intro: 0 }));
                      setMaxWatched((prev) => ({ ...prev, intro: 0 }));
                      setCompletedSessions((prev) => prev.filter((id) => id !== 'intro'));
                      setSessionProgress((prev) => ({ ...prev, intro: 0 }));
                      justCompletedRef.current.delete('intro');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-primary-navy bg-white border border-primary-navy/30 hover:bg-primary-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Watch Again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSessionId(nextModule.id);
                      setActiveDay(nextModule.dayId);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-primary-navy hover:bg-primary-navy/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 transition-colors"
                  >
                    Start Session
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              {showNextButton && !isIntro && (
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
                </>
              )}
            </div>
          {activeSession && (
            <>
              <DescriptionCard session={activeSession} />
              <div data-tour="doubts-card">
                <SessionDoubtsCard
                  sessionId={activeSessionId}
                  doubts={doubts}
                  onDoubtsChange={setDoubts}
                />
              </div>
            </>
          )}
          <div data-tour="notes-panel">
            <NotesPanel sessionId={activeSessionId} />
          </div>
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
            completedSessionIds={completedSessions}
          />
          </div>
        </div>
      </div>

      {overallPercent < 100 && (
        <div className="mx-4 sm:mx-5 mb-5 px-4 py-2.5 rounded-xl text-sm font-medium text-center bg-primary-blue-50/80 border border-primary-blue-200/50 text-primary-navy">
          Complete the intro video to unlock your certificate.
        </div>
      )}

      {showCompletionModal && (
        <CompletionModal onContinue={handleCompletionContinue} />
      )}

      {showFormModal && (
        <ExternalFormModal onClose={handleFormClose} />
      )}

      {unlockToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-primary-navy text-white text-sm font-semibold shadow-lg flex items-center gap-2 animate-[slideUp_0.35s_ease-out]"
          style={{ animation: 'slideUp 0.35s ease-out' }}
        >
          <span className="text-lg" aria-hidden>&#127881;</span>
          {unlockToast}
        </div>
      )}
    </>
  );
}
