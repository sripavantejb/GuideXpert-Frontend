import { useState, useEffect, useCallback } from 'react';

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

export default function WebinarTour({ onDone, storageKey = TOUR_SEEN_KEY }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  const finishTour = useCallback(() => {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (_) {}
    onDone?.();
  }, [onDone, storageKey]);

  const handleNext = useCallback(() => {
    if (stepIndex === STEPS.length - 1) {
      finishTour();
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex, finishTour]);

  const handleSkip = useCallback(() => {
    finishTour();
  }, [finishTour]);

  const tooltipPlacement = spotlightRect
    ? spotlightRect.bottom + 16 + 220 <= window.innerHeight
      ? 'below'
      : 'above'
    : 'center';

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
          className="absolute inset-0 bg-black/60 transition-opacity duration-300 pointer-events-auto"
          aria-hidden="true"
        />
      )}

      {/* Spotlight: transparent box with huge box-shadow to create cutout (other steps) */}
      {spotlightRect && (
        <div
          className="absolute pointer-events-none transition-all duration-300"
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

      {/* Tooltip card - pointer-events auto so buttons work */}
      <div
        className="relative z-10 w-full max-w-md mx-4 pointer-events-auto transition-all duration-300"
        style={
          tooltipPlacement === 'center'
            ? {}
            : spotlightRect
              ? tooltipPlacement === 'below'
                ? {
                    position: 'fixed',
                    left: spotlightRect.left + spotlightRect.width / 2,
                    top: spotlightRect.bottom + 16,
                    transform: 'translateX(-50%)',
                  }
                : {
                    position: 'fixed',
                    left: spotlightRect.left + spotlightRect.width / 2,
                    top: spotlightRect.top - 16,
                    transform: 'translate(-50%, -100%)',
                  }
              : {}
        }
      >
        <div className="rounded-2xl bg-white shadow-xl border border-gray-200 p-5 sm:p-6">
          <p className="text-sm font-medium text-primary-navy/70">
            Step {stepIndex + 1} of {STEPS.length}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">{step.title}</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.description}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:ring-offset-2 rounded-lg px-3 py-2"
            >
              Skip tour
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-primary-navy hover:bg-primary-navy/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 transition-colors"
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
