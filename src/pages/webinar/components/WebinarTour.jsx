import { useState, useEffect, useCallback, useRef } from 'react';

const TOUR_SEEN_KEY = 'webinar_tour_seen';

const STEPS = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to the Webinar Panel',
    description:
      "Let's take a quick tour so you can get the most out of your learning. You'll see where to watch sessions, track progress, take notes, and more.",
  },
  {
    id: 'sidebar',
    target: 'sidebar',
    title: 'Sidebar',
    description:
      'Use the sidebar to switch between days and sessions. Pick any session to watch the video or complete an assessment.',
  },
  {
    id: 'video-player',
    target: 'video-player',
    title: 'Video Player',
    description:
      'Watch session videos here. You can control playback speed, resume where you left off, and move to the next session when done.',
  },
  {
    id: 'stats-bar',
    target: 'stats-bar',
    title: 'Stats Bar',
    description:
      'Track your progress for the current session: status, duration, and overall completion.',
  },
  {
    id: 'notes-panel',
    target: 'notes-panel',
    title: 'Notes',
    description:
      'Take notes while you watch. Your notes are saved per session so you can review them later.',
  },
  {
    id: 'doubts-card',
    target: 'doubts-card',
    title: 'Doubts',
    description:
      'Have a question? Submit doubts here and get answers. You can also see previously asked questions.',
  },
  {
    id: 'certificate',
    target: null,
    title: 'Earn Your Certificate',
    description:
      'Complete all sessions and assessments to unlock your certificate. Your progress is tracked automatically—finish each module to receive your certificate and showcase your achievement.',
  },
  {
    id: 'top-nav',
    target: 'top-nav',
    title: 'Top Navigation',
    description:
      'Access your profile, settings, progress, certificates, and other pages from here.',
  },
];

function getTargetRect(targetId) {
  if (!targetId) return null;
  const el = document.querySelector(`[data-tour="${targetId}"]`);
  if (!el) return null;
  return el.getBoundingClientRect();
}

const STEP_TRANSITION_MS = 220;

export default function WebinarTour({ onDone, storageKey = TOUR_SEEN_KEY }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const stepTimeoutRef = useRef(null);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  useEffect(() => {
    const id = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    return () => {
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, []);

  const updateSpotlight = useCallback(() => {
    if (step.target) {
      const rect = getTargetRect(step.target);
      setSpotlightRect(rect);
    } else {
      setSpotlightRect(null);
    }
  }, [step?.target]);

  useEffect(() => {
    updateSpotlight();
    const onResize = () => updateSpotlight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateSpotlight]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => updateSpotlight());
    return () => cancelAnimationFrame(timer);
  }, [stepIndex, updateSpotlight]);

  const finishTour = useCallback(() => {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (_) {}
    onDone?.();
  }, [onDone, storageKey]);

  const handleSkip = useCallback(() => {
    finishTour();
  }, [finishTour]);

  const handleNext = useCallback(() => {
    if (stepIndex === STEPS.length - 1) {
      finishTour();
    } else {
      setIsTransitioning(true);
      stepTimeoutRef.current = setTimeout(() => {
        stepTimeoutRef.current = null;
        setStepIndex((i) => i + 1);
        setIsTransitioning(false);
      }, STEP_TRANSITION_MS);
    }
  }, [stepIndex, finishTour]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center pointer-events-none"
      aria-modal="true"
      role="dialog"
      aria-label="Product tour"
    >
      {/* Full overlay only for welcome step; other steps use spotlight box-shadow for dark area */}
      {!step.target && (
        <div
          className="absolute inset-0 bg-black/60 pointer-events-auto transition-opacity duration-350 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none"
          aria-hidden="true"
        />
      )}

      {/* Spotlight: transparent box with huge box-shadow to create cutout (other steps) */}
      {spotlightRect && (
        <div
          className="absolute pointer-events-none transition-[left,top,width,height] duration-350 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none"
          style={{
            left: spotlightRect.left,
            top: spotlightRect.top,
            width: spotlightRect.width,
            height: spotlightRect.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Tooltip card - fixed bottom-center so it stays visible for every step */}
      <div
        className="relative z-10 w-full max-w-md mx-4 pointer-events-auto transition-[opacity,transform] duration-350 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: '40px',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          className={`rounded-2xl bg-white shadow-xl border border-gray-200 p-5 sm:p-6 transition-[opacity,transform] duration-350 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none motion-reduce:transform-none ${
            !hasEntered
              ? 'opacity-0 translate-y-2 scale-[0.98]'
              : isTransitioning
                ? 'opacity-0 translate-y-1.5 scale-100'
                : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          <p className="text-sm font-medium text-primary-navy/70">
            Step {stepIndex + 1} of {STEPS.length}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">{step.title}</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.description}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:ring-offset-2 rounded-lg px-3 py-2 transition-colors duration-200 ease-out motion-reduce:transition-none"
            >
              Skip tour
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-primary-navy hover:bg-primary-navy/90 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 transition-[color,transform] duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none"
            >
              {isLast ? 'Done' : 'Next'}
              {!isLast && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { TOUR_SEEN_KEY };
