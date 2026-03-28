import { useRef, useState, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize, FiRotateCcw, FiRotateCw, FiLock } from 'react-icons/fi';
import { HiHeart } from 'react-icons/hi';
import { useWebinar } from '../context/WebinarContext';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function isYoutubeSession(session) {
  if (!session?.videoUrl) return false;
  if (session.isYoutube === true) return true;
  const url = session.videoUrl;
  return url.includes('youtube.com/embed') || url.includes('youtube.com/watch') || url.includes('youtu.be/');
}

function getYouTubeVideoId(videoUrl) {
  if (!videoUrl || typeof videoUrl !== 'string') return null;
  const embedMatch = videoUrl.match(/embed\/([^/?&]+)/);
  if (embedMatch) return embedMatch[1];
  const vMatch = videoUrl.match(/[?&]v=([^&]+)/);
  if (vMatch) return vMatch[1];
  const shortMatch = videoUrl.match(/youtu\.be\/([^/?&]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

const YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';

function useYouTubeIFrameAPI() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const applyReady = () => setReady(true);
    if (window.YT?.Player) {
      setReady(true);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      applyReady();
    };
    const existing = document.querySelector(`script[src="${YOUTUBE_IFRAME_API_URL}"]`);
    if (!existing) {
      const script = document.createElement('script');
      script.src = YOUTUBE_IFRAME_API_URL;
      script.async = true;
      document.head.appendChild(script);
    }
    const t = setInterval(() => {
      if (window.YT?.Player) {
        clearInterval(t);
        applyReady();
      }
    }, 100);
    return () => {
      clearInterval(t);
      window.onYouTubeIframeAPIReady = prev;
    };
  }, []);

  return ready;
}

/** Mobile-only UX: narrow viewport + touch (avoids desktop narrow windows). */
function useIsMobilePlayer() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const narrow = window.matchMedia('(max-width: 768px)');
    const coarse = window.matchMedia('(pointer: coarse)');
    const compute = () => {
      const touch = (navigator.maxTouchPoints ?? 0) > 0;
      setIsMobile(narrow.matches && (coarse.matches || touch));
    };
    compute();
    narrow.addEventListener('change', compute);
    coarse.addEventListener('change', compute);
    return () => {
      narrow.removeEventListener('change', compute);
      coarse.removeEventListener('change', compute);
    };
  }, []);
  return isMobile;
}

function getFullscreenElement() {
  return (
    document.fullscreenElement
    || document.webkitFullscreenElement
    || document.mozFullScreenElement
    || document.msFullscreenElement
    || null
  );
}

function requestFullscreenElement(el) {
  if (!el) return Promise.reject(new Error('no element'));
  const req =
    el.requestFullscreen
    || el.webkitRequestFullscreen
    || el.webkitEnterFullScreen
    || el.mozRequestFullScreen
    || el.msRequestFullscreen;
  if (!req) return Promise.reject(new Error('no fullscreen API'));
  return Promise.resolve(req.call(el));
}

function exitFullscreenCompat() {
  const doc = document;
  if (doc.exitFullscreen) return doc.exitFullscreen();
  if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
  if (doc.webkitCancelFullScreen) return doc.webkitCancelFullScreen();
  if (doc.mozCancelFullScreen) return doc.mozCancelFullScreen();
  if (doc.msExitFullscreen) return doc.msExitFullscreen();
  return Promise.resolve();
}

async function lockLandscapeIfSupported() {
  if (typeof screen === 'undefined') return;
  const orientation = screen.orientation;
  if (!orientation?.lock) return;
  try {
    await orientation.lock('landscape');
  } catch {
    // Some mobile browsers (especially iOS Safari) block programmatic lock.
  }
}

function unlockOrientationIfSupported() {
  if (typeof screen === 'undefined') return;
  const orientation = screen.orientation;
  if (!orientation?.unlock) return;
  try {
    orientation.unlock();
  } catch {
    // Ignore unsupported unlock path.
  }
}

const YT_PLAYER_STATE_ENDED = 0;

function CompletionOverlay({ visible, onNextSession, onWatchAgain, hasNextSession, isIntro }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (visible) {
      const t = requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
      return () => cancelAnimationFrame(t);
    }
    setMounted(false);
  }, [visible]);
  if (!visible) return null;

  const heading = isIntro ? 'Intro Completed' : 'Session Completed';
  const subtitle = isIntro
    ? 'Great job! You can now start the first session.'
    : 'You have successfully completed this webinar.';
  const nextLabel = isIntro ? 'Start Session' : 'Assessment';
  const replayLabel = isIntro ? 'Rewatch Intro' : 'Watch Again';

  return (
    <div
      className="absolute inset-0 z-[20] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[20px] transition-opacity duration-300"
      role="status"
      aria-live="polite"
      aria-label={heading}
    >
      <div
        className={`max-w-sm w-full p-4 sm:p-6 rounded-[20px] border border-white/20 transition-all duration-300 ease-out ${
          mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        }}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">{heading}</h2>
        <p className="text-white/90 text-sm mb-5">{subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {typeof onNextSession === 'function' && hasNextSession !== false && (
            <button
              type="button"
              onClick={onNextSession}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary-navy text-white font-medium hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 transition-opacity flex items-center justify-center gap-1.5"
              aria-label={nextLabel}
            >
              {nextLabel}
              <span aria-hidden>→</span>
            </button>
          )}
          {typeof onWatchAgain === 'function' && (
            <button
              type="button"
              onClick={onWatchAgain}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/20 text-white font-medium hover:bg-white/30 border border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 transition-colors"
              aria-label={replayLabel}
            >
              {replayLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function YouTubePlayerWithControls({
  session,
  initialPosition = 0,
  maxWatchedTime = 0,
  onTimeUpdate,
  onEnded,
  onProgress,
  onMetadataReady,
  onNextSession,
  hasNextSession,
  isIntro = false,
  allowFullSeek = false,
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const lastLeftTapRef = useRef(0);
  const ytTapTimerRef = useRef(null);
  const ytTouchToggleAtRef = useRef(0);
  const metadataSentRef = useRef(false);
  const endedRef = useRef(false);
  const ytMaxWatchedRef = useRef(maxWatchedTime);
  const resumedRef = useRef(false);
  const apiReady = useYouTubeIFrameAPI();
  const videoId = getYouTubeVideoId(session?.videoUrl);

  const [ytPlaying, setYtPlaying] = useState(false);
  const [ytProgress, setYtProgress] = useState(0);
  const [ytCurrentTime, setYtCurrentTime] = useState(0);
  const [ytDuration, setYtDuration] = useState(0);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [containerHasSize, setContainerHasSize] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [ytFullscreen, setYtFullscreen] = useState(false);
  const [ytPlaybackRate, setYtPlaybackRate] = useState(1);
  const [ytSpeedOpen, setYtSpeedOpen] = useState(false);
  const [ytEmbedError, setYtEmbedError] = useState(null);
  const [ytCoverScale, setYtCoverScale] = useState(1);

  const isMobilePlayer = useIsMobilePlayer();

  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);
  const onMetadataReadyRef = useRef(onMetadataReady);
  onTimeUpdateRef.current = onTimeUpdate;
  onProgressRef.current = onProgress;
  onEndedRef.current = onEnded;
  onMetadataReadyRef.current = onMetadataReady;

  const playerContainerId = `yt-player-${session?.id ?? 'default'}`;

  // Wait for 16:9 container to have real dimensions before creating YT iframe (avoids cropped video)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width >= 100 && rect.height >= 56) setContainerHasSize(true);
    };
    check();
    const ro = new ResizeObserver(() => check());
    ro.observe(el);
    return () => ro.disconnect();
  }, [session?.id]);

  useEffect(() => {
    if (!apiReady || !videoId || !containerHasSize || typeof window === 'undefined' || !window.YT?.Player) return;
    endedRef.current = false;
    metadataSentRef.current = false;
    setYtEmbedError(null);
    const id = playerContainerId;
    const timeoutId = setTimeout(() => {
      if (!document.getElementById(id)) return;
      try {
        const player = new window.YT.Player(id, {
          videoId,
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          playerVars: {
            controls: 0,
            rel: 0,
            modestbranding: 1,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1,
            enablejsapi: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : undefined,
            autoplay: 0,
          },
          events: {
            onReady(event) {
              const iframeEl = event.target.getIframe?.();
              if (iframeEl) {
                iframeEl.setAttribute('tabindex', '-1');
                iframeEl.setAttribute('aria-hidden', 'true');
                iframeEl.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                iframeEl.setAttribute('allowfullscreen', 'true');
              }
              setPlayerReady(true);
              const d = event.target.getDuration?.();
              if (Number.isFinite(d) && d > 0) {
                setYtDuration(d);
                if (!metadataSentRef.current && onMetadataReadyRef.current) {
                  metadataSentRef.current = true;
                  onMetadataReadyRef.current({ durationSeconds: d, formattedDuration: formatTime(d) });
                }
              }
            },
            onError(event) {
              const code = event?.data;
              let msg = 'Playback error';
              if (code === 2) msg = 'Invalid video';
              else if (code === 5) msg = 'HTML5 playback error';
              else if (code === 100) msg = 'Video unavailable';
              else if (code === 101 || code === 150) msg = 'Embedding blocked for this video';
              setYtEmbedError(msg);
            },
            onStateChange(event) {
              if (event.data === YT_PLAYER_STATE_ENDED) {
                event.target.pauseVideo();
                setYtPlaying(false);
                endedRef.current = true;
                const d = typeof event.target.getDuration === 'function' ? event.target.getDuration() : 0;
                if (Number.isFinite(d)) {
                  setYtDuration(d);
                  setYtCurrentTime(d);
                }
                setYtProgress(100);
                setShowCompletionOverlay(true);
                onEndedRef.current?.(session?.id);
              }
            },
          },
        });
        playerRef.current = player;
      } catch (err) {
        console.error('YouTube player init error:', err);
        setYtEmbedError('Could not start the player');
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch (_) {}
        playerRef.current = null;
      }
      setPlayerReady(false);
    };
  }, [apiReady, videoId, containerHasSize, session?.id, playerContainerId]);

  useEffect(() => {
    if (!playerRef.current?.getCurrentTime) return;
    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;
      const state = typeof player.getPlayerState === 'function' ? player.getPlayerState() : null;
      if (state === YT_PLAYER_STATE_ENDED) {
        endedRef.current = true;
        return;
      }
      const currentTime = player.getCurrentTime();
      const duration = typeof player.getDuration === 'function' ? player.getDuration() : ytDuration;
      if (Number.isFinite(duration) && duration > 0) {
        setYtDuration(duration);
        if (!metadataSentRef.current && onMetadataReadyRef.current) {
          metadataSentRef.current = true;
          onMetadataReadyRef.current({ durationSeconds: duration, formattedDuration: formatTime(duration) });
        }
      }
      if (state === 1) setYtPlaying(true);
      else if (state === 2) setYtPlaying(false);
      if (Number.isFinite(currentTime)) {
        if (currentTime > ytMaxWatchedRef.current) ytMaxWatchedRef.current = currentTime;
        setYtCurrentTime(currentTime);
        if (Number.isFinite(duration) && duration > 0) {
          const pct = Math.min(100, (currentTime / duration) * 100);
          setYtProgress(pct);
          onTimeUpdateRef.current?.(session?.id, currentTime);
          onProgressRef.current?.(session?.id, pct);
        }
      }
    }, 500);
    progressIntervalRef.current = interval;
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [session?.id, ytDuration]);

  useEffect(() => {
    setShowCompletionOverlay(false);
    setContainerHasSize(false);
    setHasStarted(false);
    endedRef.current = false;
    metadataSentRef.current = false;
    resumedRef.current = false;
    ytMaxWatchedRef.current = maxWatchedTime;
  }, [session?.id]);

  useEffect(() => {
    if (!playerReady || resumedRef.current) return;
    const pos = initialPosition;
    if (pos > 0 && playerRef.current?.seekTo) {
      resumedRef.current = true;
      playerRef.current.seekTo(pos, true);
      setYtCurrentTime(pos);
      const d = typeof playerRef.current.getDuration === 'function' ? playerRef.current.getDuration() : ytDuration;
      if (Number.isFinite(d) && d > 0) setYtProgress((pos / d) * 100);
    }
  }, [playerReady, initialPosition, ytDuration]);

  const handleWatchAgain = useCallback(() => {
    const player = playerRef.current;
    if (!player?.seekTo || !player?.playVideo) return;
    endedRef.current = false;
    player.seekTo(0, true);
    player.playVideo();
    const d = typeof player.getDuration === 'function' ? player.getDuration() : ytDuration;
    setYtCurrentTime(0);
    setYtProgress(0);
    setHasStarted(true);
    setShowCompletionOverlay(false);
    setYtPlaying(true);
    if (Number.isFinite(d) && d > 0) {
      setYtDuration(d);
    }
    window.setTimeout(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      const t = p.getCurrentTime();
      const dur = typeof p.getDuration === 'function' ? p.getDuration() : d;
      if (Number.isFinite(t)) setYtCurrentTime(t);
      if (Number.isFinite(dur) && dur > 0) {
        setYtProgress(Math.min(100, (t / dur) * 100));
      }
    }, 150);
  }, [ytDuration]);

  const toggleYtPlay = useCallback(() => {
    const player = playerRef.current;
    if (!player?.playVideo || !player?.pauseVideo) return;
    if (ytPlaying) {
      player.pauseVideo();
      setYtPlaying(false);
    } else {
      setHasStarted(true);
      player.playVideo();
      setYtPlaying(true);
    }
  }, [ytPlaying]);

  const syncYtFullscreenState = useCallback(() => {
    setYtFullscreen(!!getFullscreenElement());
  }, []);

  const toggleYtFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const fsNow = getFullscreenElement();
    if (!fsNow) {
      requestFullscreenElement(container)
        .catch(() => {
          // Secondary fallback only if container API fails.
          const iframe = playerRef.current?.getIframe?.();
          if (!iframe) throw new Error('No fullscreen target');
          return requestFullscreenElement(iframe);
        })
        .then(() => setYtFullscreen(true))
        .catch(() => {
          setYtFullscreen(false);
        });
      return;
    }
    exitFullscreenCompat()
      .then(() => setYtFullscreen(false))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onFs = () => syncYtFullscreenState();
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    document.addEventListener('mozfullscreenchange', onFs);
    document.addEventListener('MSFullscreenChange', onFs);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
      document.removeEventListener('mozfullscreenchange', onFs);
      document.removeEventListener('MSFullscreenChange', onFs);
    };
  }, [syncYtFullscreenState]);

  useEffect(() => {
    if (!isMobilePlayer) return;
    if (ytFullscreen) {
      lockLandscapeIfSupported();
      return;
    }
    setYtCoverScale(1);
    unlockOrientationIfSupported();
  }, [isMobilePlayer, ytFullscreen]);

  useEffect(() => {
    if (!isMobilePlayer || !ytFullscreen) return;
    const updateCoverScale = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const viewportAspect = rect.width / rect.height;
      const videoAspect = 16 / 9;
      const scale = Math.max(viewportAspect / videoAspect, videoAspect / viewportAspect);
      setYtCoverScale(Number.isFinite(scale) && scale > 1 ? scale : 1);
    };
    updateCoverScale();
    window.addEventListener('resize', updateCoverScale);
    return () => window.removeEventListener('resize', updateCoverScale);
  }, [isMobilePlayer, ytFullscreen]);

  const handleYtSeek = useCallback(
    (e) => {
      const player = playerRef.current;
      if (!player?.seekTo || !Number.isFinite(ytDuration) || ytDuration <= 0) return;
      const pct = parseFloat(e.target.value);
      let time = (pct / 100) * ytDuration;
      if (!allowFullSeek) {
        const maxAllowed = ytMaxWatchedRef.current + 2;
        if (time > maxAllowed) time = maxAllowed;
      }
      const clampedPct = (time / ytDuration) * 100;
      player.seekTo(time, true);
      setYtCurrentTime(time);
      setYtProgress(clampedPct);
    },
    [ytDuration, allowFullSeek]
  );

  const changeYtSpeed = useCallback((rate) => {
    setYtPlaybackRate(rate);
    setYtSpeedOpen(false);
    const player = playerRef.current;
    if (player?.setPlaybackRate) player.setPlaybackRate(rate);
  }, []);

  const handleYtBack10 = useCallback(() => {
    const player = playerRef.current;
    if (!player?.seekTo) return;
    const now = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : ytCurrentTime;
    const newTime = Math.max(0, (Number(now) || 0) - 10);
    player.seekTo(newTime, true);
    setYtCurrentTime(newTime);
    const pct = ytDuration > 0 ? (newTime / ytDuration) * 100 : 0;
    setYtProgress(pct);
    onTimeUpdate?.(session?.id, newTime);
    onProgress?.(session?.id, pct);
  }, [ytCurrentTime, ytDuration, onTimeUpdate, onProgress, session?.id]);

  const handleYtForward10 = useCallback(() => {
    const player = playerRef.current;
    if (!player?.seekTo || !Number.isFinite(ytDuration) || ytDuration <= 0) return;
    const now = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : ytCurrentTime;
    const newTime = Math.min(ytDuration, (Number(now) || 0) + 10);
    player.seekTo(newTime, true);
    setYtCurrentTime(newTime);
    const pct = (newTime / ytDuration) * 100;
    setYtProgress(pct);
    onTimeUpdate?.(session?.id, newTime);
    onProgress?.(session?.id, pct);
  }, [ytCurrentTime, ytDuration, onTimeUpdate, onProgress, session?.id]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onKeyDown = (e) => {
      const target = e.target;
      const isTypingTarget = target instanceof HTMLElement
        && (target.closest('input,textarea,select,[contenteditable="true"]') != null);
      if (isTypingTarget || showCompletionOverlay) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleYtPlay();
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const player = playerRef.current;
        if (!player?.seekTo) return;
        const now = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : ytCurrentTime;
        const newTime = Math.max(0, (Number(now) || 0) - 10);
        player.seekTo(newTime, true);
        setYtCurrentTime(newTime);
        const pct = ytDuration > 0 ? (newTime / ytDuration) * 100 : 0;
        setYtProgress(pct);
        onTimeUpdate?.(session?.id, newTime);
        onProgress?.(session?.id, pct);
      }
      if (allowFullSeek && e.code === 'ArrowRight') {
        e.preventDefault();
        handleYtForward10();
      }
    };
    const onContextMenu = (e) => e.preventDefault();
    window.addEventListener('keydown', onKeyDown);
    container.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('contextmenu', onContextMenu);
    };
  }, [showCompletionOverlay, toggleYtPlay, onTimeUpdate, onProgress, session?.id, ytCurrentTime, ytDuration, allowFullSeek, handleYtForward10]);

  const handleYtVideoTouchEnd = useCallback((e) => {
    if (showCompletionOverlay) return;
    const container = containerRef.current;
    if (!container) return;
    const touch = e.changedTouches?.[0];
    if (!touch) return;
    const rect = container.getBoundingClientRect();
    const isLeftHalf = touch.clientX <= rect.left + (rect.width / 2);

    if (isMobilePlayer) {
      const now = Date.now();
      const prev = lastLeftTapRef.current;
      const delta = now - prev;
      lastLeftTapRef.current = now;

      if (isLeftHalf) {
        if (delta <= 320 && prev !== 0) {
          if (ytTapTimerRef.current) {
            clearTimeout(ytTapTimerRef.current);
            ytTapTimerRef.current = null;
          }
          e.preventDefault();
          handleYtBack10();
          return;
        }
        if (ytTapTimerRef.current) clearTimeout(ytTapTimerRef.current);
        ytTapTimerRef.current = window.setTimeout(() => {
          ytTapTimerRef.current = null;
          ytTouchToggleAtRef.current = Date.now();
          toggleYtPlay();
        }, 320);
        return;
      }
      if (ytTapTimerRef.current) {
        clearTimeout(ytTapTimerRef.current);
        ytTapTimerRef.current = null;
      }
      lastLeftTapRef.current = 0;
      ytTouchToggleAtRef.current = Date.now();
      toggleYtPlay();
      return;
    }

    if (!isLeftHalf) return;
    const now = Date.now();
    const delta = now - lastLeftTapRef.current;
    lastLeftTapRef.current = now;
    if (delta <= 320) {
      e.preventDefault();
      handleYtBack10();
    }
  }, [showCompletionOverlay, handleYtBack10, isMobilePlayer, toggleYtPlay]);

  const handleYtOverlayClickCapture = useCallback(
    (e) => {
      if (!isMobilePlayer) return;
      if (showCompletionOverlay) return;
      if (Date.now() - ytTouchToggleAtRef.current < 450) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [isMobilePlayer, showCompletionOverlay]
  );

  useEffect(() => () => {
    if (ytTapTimerRef.current) clearTimeout(ytTapTimerRef.current);
  }, []);

  const handleYtVideoDoubleClick = useCallback((e) => {
    const container = containerRef.current;
    if (!container || showCompletionOverlay) return;
    const rect = container.getBoundingClientRect();
    const isLeftHalf = e.clientX <= rect.left + (rect.width / 2);
    if (!isLeftHalf) return;
    e.preventDefault();
    handleYtBack10();
  }, [showCompletionOverlay, handleYtBack10]);

  if (!session) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-shrink-0 rounded-none sm:rounded-xl overflow-hidden bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 [&:fullscreen]:!fixed [&:fullscreen]:!inset-0 [&:fullscreen]:!w-screen [&:fullscreen]:!h-[100dvh] [&:fullscreen]:!max-h-[100dvh] [&:fullscreen]:!min-h-0 [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:rounded-none [&:-webkit-full-screen]:!fixed [&:-webkit-full-screen]:!inset-0 [&:-webkit-full-screen]:!w-screen [&:-webkit-full-screen]:!h-[100dvh] [&:-webkit-full-screen]:!max-h-[100dvh] [&:-webkit-full-screen]:flex [&:-webkit-full-screen]:flex-col [&:-webkit-full-screen]:rounded-none"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        paddingTop: ytFullscreen && isMobilePlayer ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: ytFullscreen && isMobilePlayer ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: ytFullscreen && isMobilePlayer ? 'env(safe-area-inset-left)' : undefined,
        paddingRight: ytFullscreen && isMobilePlayer ? 'env(safe-area-inset-right)' : undefined,
      }}
    >
      {/* Clean 16:9 video area with no top gradients/overlays */}
      <div
        key={`yt-wrap-${session?.id}`}
        className={`relative w-full bg-black overflow-hidden ${ytFullscreen ? 'flex-1 min-h-0 flex items-center justify-center' : ''}`}
        style={
          ytFullscreen
            ? { width: '100%', flex: '1 1 auto', minHeight: 0, maxHeight: '100dvh' }
            : { aspectRatio: '16 / 9' }
        }
      >
        <div
          className={`absolute inset-0 w-full h-full ${ytFullscreen ? 'max-h-[100dvh] max-w-[100vw]' : ''}`}
        >
          {/* Thumbnail / loading until player is ready - player stays visible after completion */}
          {!playerReady && session?.thumbnail && (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-300 z-0"
              style={{ backgroundImage: `url(${session.thumbnail})` }}
              aria-hidden
            />
          )}
          {!playerReady && !ytEmbedError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-0" aria-hidden>
              <div className="h-10 w-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
          )}
          {ytEmbedError && videoId && (
            <div className="absolute inset-0 z-[6] flex flex-col items-center justify-center gap-3 bg-gray-900/95 px-4 text-center text-white">
              <p className="text-sm font-medium">{ytEmbedError}</p>
              <p className="text-xs text-white/75 max-w-sm">If the embed is blocked, open the video on YouTube.</p>
              <a
                href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Open in YouTube
              </a>
            </div>
          )}
          {/* Player mount: always visible so no white screen when video ends */}
          <div
            id={playerContainerId}
            className="absolute inset-0 w-full h-full z-[1] yt-player-mount"
            style={
              isMobilePlayer && ytFullscreen
                ? { transform: `scale(${ytCoverScale})`, transformOrigin: 'center center' }
                : undefined
            }
          />
          {/* Block iframe hover/click so YouTube hover chrome never appears */}
          <div
            className="absolute inset-0 z-[3]"
            aria-hidden
            onTouchEnd={handleYtVideoTouchEnd}
            onDoubleClick={handleYtVideoDoubleClick}
            onClickCapture={handleYtOverlayClickCapture}
          />
          {/* Opaque paused/start cover fully hides native YouTube title/watch-later/share overlays */}
          {!ytPlaying && !showCompletionOverlay && !ytEmbedError && (
            <button
              type="button"
              onClick={toggleYtPlay}
              className="absolute inset-0 z-[4] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 bg-black"
              style={session?.thumbnail ? { backgroundImage: `url(${session.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              aria-label={hasStarted ? 'Resume webinar' : 'Play webinar'}
            >
              <span className="absolute inset-0 bg-black/20" aria-hidden />
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/90 text-black shadow-lg">
                <FiPlay className="w-7 h-7 ml-0.5" />
              </span>
            </button>
          )}
          {/* End-card blocker: only show after completion to hide YouTube recommendations */}
          {showCompletionOverlay && (
            <div
              className="absolute bottom-0 left-0 w-full h-[40%] bg-black pointer-events-none z-[2]"
              aria-hidden
            />
          )}
          <CompletionOverlay
            visible={showCompletionOverlay}
            onNextSession={onNextSession}
            onWatchAgain={handleWatchAgain}
            hasNextSession={hasNextSession}
            isIntro={isIntro}
          />
        </div>
      </div>
      {/* Controls overlay: transparent dark blue (theme) for visibility */}
      <div className="absolute bottom-0 left-0 right-0 z-[5] flex flex-col backdrop-blur-md bg-primary-navy/80 border-t border-primary-navy/60">
        <div className="w-full px-2 sm:px-3 pt-1 pb-1.5 sm:pb-2 flex items-center gap-2 relative">
          <div className="flex-1 min-w-0 h-1.5 sm:h-2 rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full bg-white/85 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, ytProgress))}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={ytProgress}
            onChange={handleYtSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ left: '0.5rem', right: '0.5rem' }}
            aria-label="Seek"
          />
        </div>
        <div className="h-8 sm:h-10 px-2 sm:px-3 pt-1 pb-1 flex items-center gap-2">
          <button
            type="button"
            onClick={handleYtBack10}
            className="flex items-center justify-center gap-1 px-1.5 w-auto h-6 sm:h-8 rounded-full bg-white/20 border border-white/40 text-white flex-shrink-0 transition-all duration-200 hover:bg-white/30 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Back 10 seconds"
            title="Back 10 seconds"
          >
            <FiRotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          {allowFullSeek && (
            <button
              type="button"
              onClick={handleYtForward10}
              className="flex items-center justify-center gap-1 px-1.5 w-auto h-6 sm:h-8 rounded-full bg-white/20 border border-white/40 text-white flex-shrink-0 transition-all duration-200 hover:bg-white/30 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Forward 10 seconds"
              title="Forward 10 seconds"
            >
              <FiRotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleYtPlay}
            className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/15 border border-white/30 text-white flex-shrink-0 transition-all duration-200 hover:bg-white/25 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label={ytPlaying ? 'Pause' : 'Play'}
          >
            {ytPlaying ? (
              <FiPause className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <FiPlay className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />
            )}
          </button>
          <span
            className="text-white/90 text-[10px] sm:text-xs tabular-nums flex-shrink-0 min-w-[3rem] sm:min-w-[4.5rem]"
            aria-live="polite"
          >
            {formatTime(ytCurrentTime)} / {formatTime(ytDuration)}
          </span>
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setYtSpeedOpen((o) => !o)}
              className="flex-shrink-0 px-1 py-1 rounded text-white/90 text-[10px] sm:text-xs font-medium hover:bg-white/15 min-h-[24px] min-w-[24px] sm:min-h-0 sm:min-w-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Playback speed"
              aria-expanded={ytSpeedOpen}
            >
              {ytPlaybackRate}x
            </button>
            {ytSpeedOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setYtSpeedOpen(false)} />
                <div className="absolute bottom-full left-0 mb-1 py-1 bg-primary-navy rounded-lg shadow-lg z-20 min-w-[5rem]">
                  {SPEED_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => changeYtSpeed(s)}
                      className={`block w-full text-left px-3 py-1.5 text-sm text-white hover:bg-white/10 ${ytPlaybackRate === s ? 'bg-white/15 font-medium' : ''}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={toggleYtFullscreen}
            className="ml-auto flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/15 border border-white/30 text-white flex-shrink-0 transition-all duration-200 hover:bg-white/25 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label={ytFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {ytFullscreen ? (
              <FiMinimize className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <FiMaximize className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VideoPlayer({
  session,
  isLocked = false,
  initialPosition = 0,
  maxWatchedTime = 0,
  onTimeUpdate,
  onEnded,
  onProgress,
  onMetadataReady,
  onNextSession,
  hasNextSession,
  isBookmarked,
  onToggleBookmark,
  autoplayOnLoad = false,
  onAutoplayDone,
  isIntro = false,
  allowFullSeek = false,
}) {
  const { settings } = useWebinar();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const lastLeftTapRef = useRef(0);
  const nativeTapTimerRef = useRef(null);
  const mobileVideoTapHandledRef = useRef(false);
  const lastRewindGestureAtRef = useRef(0);
  const nativeMaxWatchedRef = useRef(maxWatchedTime);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const defaultSpeed = settings?.defaultPlaybackSpeed ?? 1;
  const [playbackRate, setPlaybackRate] = useState(defaultSpeed);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [hasCaptions, setHasCaptions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nativeOnTimeUpdateRef = useRef(onTimeUpdate);
  const nativeOnEndedRef = useRef(onEnded);
  const nativeOnProgressRef = useRef(onProgress);
  nativeOnTimeUpdateRef.current = onTimeUpdate;
  nativeOnEndedRef.current = onEnded;
  nativeOnProgressRef.current = onProgress;

  const resumeSeekAppliedRef = useRef(false);

  const isMobilePlayer = useIsMobilePlayer();

  useEffect(() => {
    nativeMaxWatchedRef.current = maxWatchedTime;
  }, [maxWatchedTime, session?.id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !session) return;
    setError(null);
    setLoading(true);
    v.src = session.videoUrl ?? '';
    v.load();
    setProgress(0);
    setCurrentTime(0);
    setPlaying(false);
    setDuration(0);
    resumeSeekAppliedRef.current = false;
  }, [session?.id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoadedMetadata = () => {
      setLoading(false);
      setError(null);
      const d = v.duration;
      setDuration(d);
      const tracks = v.textTracks;
      setHasCaptions(tracks && tracks.length > 0);
    };
    const onError = () => {
      setLoading(false);
      setError(true);
    };
    const onCanPlay = () => setLoading(false);
    const onTimeUpdateHandler = () => {
      const t = v.currentTime;
      if (t > nativeMaxWatchedRef.current) nativeMaxWatchedRef.current = t;
      setCurrentTime(t);
      setProgress(v.duration ? (t / v.duration) * 100 : 0);
      nativeOnTimeUpdateRef.current?.(session?.id, t);
      nativeOnProgressRef.current?.(session?.id, v.duration ? (t / v.duration) * 100 : 0);
    };
    const onEndedHandler = () => {
      setPlaying(false);
      nativeOnEndedRef.current?.(session?.id);
    };
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('timeupdate', onTimeUpdateHandler);
    v.addEventListener('ended', onEndedHandler);
    v.addEventListener('error', onError);
    v.addEventListener('canplay', onCanPlay);
    return () => {
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('timeupdate', onTimeUpdateHandler);
      v.removeEventListener('ended', onEndedHandler);
      v.removeEventListener('error', onError);
      v.removeEventListener('canplay', onCanPlay);
    };
  }, [session?.id]);

  useEffect(() => {
    if (resumeSeekAppliedRef.current) return;
    const v = videoRef.current;
    if (!v || !session) return;
    const pos = initialPosition;
    if (pos <= 0) return;

    const applySeek = () => {
      if (resumeSeekAppliedRef.current) return;
      const d = v.duration;
      if (!d || !Number.isFinite(d)) return;
      resumeSeekAppliedRef.current = true;
      v.currentTime = Math.min(pos, d - 0.5);
      setCurrentTime(v.currentTime);
      setProgress(d ? (v.currentTime / d) * 100 : 0);
    };

    if (v.readyState >= 1) {
      applySeek();
    } else {
      v.addEventListener('loadedmetadata', applySeek, { once: true });
    }
    return () => {
      v.removeEventListener('loadedmetadata', applySeek);
    };
  }, [session?.id, initialPosition]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    setPlaybackRate(defaultSpeed);
  }, [defaultSpeed]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !session || !autoplayOnLoad) return;
    const onCanPlayStart = () => {
      v.play().catch(() => {});
      setPlaying(true);
      onAutoplayDone?.();
    };
    v.addEventListener('canplay', onCanPlayStart, { once: true });
    return () => v.removeEventListener('canplay', onCanPlayStart);
  }, [session?.id, autoplayOnLoad, onAutoplayDone]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !hasCaptions) return;
    for (let i = 0; i < v.textTracks.length; i++) {
      v.textTracks[i].mode = captionsOn ? 'showing' : 'hidden';
    }
  }, [captionsOn, hasCaptions]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const pct = parseFloat(e.target.value);
    let time = (pct / 100) * duration;
    if (!allowFullSeek) {
      const maxAllowed = nativeMaxWatchedRef.current + 2;
      if (time > maxAllowed) time = maxAllowed;
    }
    const clampedPct = (time / duration) * 100;
    v.currentTime = time;
    setCurrentTime(time);
    setProgress(clampedPct);
  };

  const handleBack10 = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const now = v.currentTime;
    const dur = v.duration;
    const newTime = Math.max(0, (Number(now) || 0) - 10);
    v.currentTime = newTime;
    setCurrentTime(newTime);
    const pct = Number.isFinite(dur) && dur > 0 ? (newTime / dur) * 100 : 0;
    setProgress(pct);
    onTimeUpdate?.(session?.id, newTime);
    onProgress?.(session?.id, pct);
  }, [onTimeUpdate, onProgress, session?.id]);

  const handleForward10 = useCallback(() => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(duration) || duration <= 0) return;
    const now = v.currentTime;
    const newTime = Math.min(duration, (Number(now) || 0) + 10);
    v.currentTime = newTime;
    setCurrentTime(newTime);
    const pct = (newTime / duration) * 100;
    setProgress(pct);
    onTimeUpdate?.(session?.id, newTime);
    onProgress?.(session?.id, pct);
  }, [duration, onTimeUpdate, onProgress, session?.id]);

  const handleVideoTouchEnd = useCallback((e) => {
    const v = videoRef.current;
    if (!v) return;
    const touch = e.changedTouches?.[0];
    if (!touch) return;
    const rect = v.getBoundingClientRect();
    const isLeftHalf = touch.clientX <= rect.left + (rect.width / 2);

    if (isMobilePlayer) {
      const now = Date.now();
      const prev = lastLeftTapRef.current;
      const delta = now - prev;
      lastLeftTapRef.current = now;

      if (isLeftHalf) {
        if (delta <= 320 && prev !== 0) {
          if (nativeTapTimerRef.current) {
            clearTimeout(nativeTapTimerRef.current);
            nativeTapTimerRef.current = null;
          }
          e.preventDefault();
          e.stopPropagation();
          lastRewindGestureAtRef.current = Date.now();
          handleBack10();
          return;
        }
        if (nativeTapTimerRef.current) clearTimeout(nativeTapTimerRef.current);
        nativeTapTimerRef.current = window.setTimeout(() => {
          nativeTapTimerRef.current = null;
          if (Date.now() - lastRewindGestureAtRef.current < 380) return;
          mobileVideoTapHandledRef.current = true;
          window.setTimeout(() => { mobileVideoTapHandledRef.current = false; }, 450);
          togglePlay();
        }, 320);
        return;
      }
      if (nativeTapTimerRef.current) {
        clearTimeout(nativeTapTimerRef.current);
        nativeTapTimerRef.current = null;
      }
      lastLeftTapRef.current = 0;
      if (Date.now() - lastRewindGestureAtRef.current < 380) return;
      mobileVideoTapHandledRef.current = true;
      window.setTimeout(() => { mobileVideoTapHandledRef.current = false; }, 450);
      togglePlay();
      return;
    }

    if (!isLeftHalf) return;
    const now = Date.now();
    const delta = now - lastLeftTapRef.current;
    lastLeftTapRef.current = now;
    if (delta <= 320) {
      e.preventDefault();
      e.stopPropagation();
      lastRewindGestureAtRef.current = Date.now();
      handleBack10();
    }
  }, [handleBack10, isMobilePlayer, togglePlay]);

  const handleVideoDoubleClick = useCallback((e) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = v.getBoundingClientRect();
    const isLeftHalf = e.clientX <= rect.left + (rect.width / 2);
    if (!isLeftHalf) return;
    e.preventDefault();
    lastRewindGestureAtRef.current = Date.now();
    handleBack10();
  }, [handleBack10]);

  const handleVideoClick = useCallback((e) => {
    if (mobileVideoTapHandledRef.current) return;
    if (Date.now() - lastRewindGestureAtRef.current < 380) return;
    togglePlay(e);
  }, [togglePlay]);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setMuted(val === 0);
  };

  const toggleMute = () => {
    if (muted) {
      setVolume(1);
      if (videoRef.current) videoRef.current.volume = 1;
      setMuted(false);
    } else {
      setVolume(0);
      if (videoRef.current) videoRef.current.volume = 0;
      setMuted(true);
    }
  };

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    const v = videoRef.current;
    if (!el) return;

    if (getFullscreenElement()) {
      exitFullscreenCompat().then(() => setIsFullscreen(false)).catch(() => {});
      return;
    }

    if (v?.webkitDisplayingFullscreen && typeof v.webkitExitFullscreen === 'function') {
      try {
        v.webkitExitFullscreen();
        setIsFullscreen(false);
      } catch {
        /* noop */
      }
      return;
    }

    if (isMobilePlayer && v?.webkitEnterFullscreen) {
      try {
        v.webkitEnterFullscreen();
        return;
      } catch {
        /* noop */
      }
    }

    requestFullscreenElement(el)
      .then(() => setIsFullscreen(true))
      .catch(() => {});
  }, [isMobilePlayer]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!getFullscreenElement());
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    document.addEventListener('mozfullscreenchange', onFs);
    document.addEventListener('MSFullscreenChange', onFs);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
      document.removeEventListener('mozfullscreenchange', onFs);
      document.removeEventListener('MSFullscreenChange', onFs);
    };
  }, []);

  useEffect(() => {
    if (!isMobilePlayer) return;
    if (isFullscreen) {
      lockLandscapeIfSupported();
      return;
    }
    unlockOrientationIfSupported();
  }, [isMobilePlayer, isFullscreen]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isMobilePlayer) return;
    const onBegin = () => setIsFullscreen(true);
    const onEnd = () => setIsFullscreen(false);
    v.addEventListener('webkitbeginfullscreen', onBegin);
    v.addEventListener('webkitendfullscreen', onEnd);
    return () => {
      v.removeEventListener('webkitbeginfullscreen', onBegin);
      v.removeEventListener('webkitendfullscreen', onEnd);
    };
  }, [isMobilePlayer, session?.id]);

  useEffect(() => () => {
    if (nativeTapTimerRef.current) clearTimeout(nativeTapTimerRef.current);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      const target = e.target;
      const isTypingTarget = target instanceof HTMLElement
        && (target.closest('input,textarea,select,[contenteditable="true"]') != null);
      if (isTypingTarget) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleBack10();
      }
      if (allowFullSeek && e.code === 'ArrowRight') {
        e.preventDefault();
        handleForward10();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlay, handleBack10, allowFullSeek, handleForward10]);

  if (!session) {
    return (
      <div
        className="w-full aspect-video rounded-xl bg-gray-200 flex items-center justify-center text-gray-500"
        style={{ borderRadius: '16px' }}
      >
        <p className="text-sm">Select a session to play</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="relative w-full rounded-none sm:rounded-xl overflow-hidden bg-gray-900" style={{ aspectRatio: '16 / 9' }}>
        {session.thumbnail && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${session.thumbnail})`, filter: 'blur(8px) grayscale(0.6) brightness(0.45)', transform: 'scale(1.1)' }}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4">
            <FiLock className="w-7 h-7 text-white/80" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-1.5">Locked Session</h3>
          <p className="text-white/70 text-sm max-w-xs">Complete previous session & assessment to unlock</p>
        </div>
      </div>
    );
  }

  if (isYoutubeSession(session)) {
    return (
      <YouTubePlayerWithControls
        session={session}
        initialPosition={initialPosition}
        maxWatchedTime={maxWatchedTime}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onProgress={onProgress}
        onMetadataReady={onMetadataReady}
        onNextSession={onNextSession}
        hasNextSession={hasNextSession}
        isIntro={isIntro}
        allowFullSeek={allowFullSeek}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-none sm:rounded-xl overflow-hidden bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 [&:fullscreen]:!fixed [&:fullscreen]:!inset-0 [&:fullscreen]:!w-screen [&:fullscreen]:!h-[100dvh] [&:fullscreen]:!max-h-[100dvh] [&:fullscreen]:!min-h-0 [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:rounded-none [&:-webkit-full-screen]:!fixed [&:-webkit-full-screen]:!inset-0 [&:-webkit-full-screen]:!w-screen [&:-webkit-full-screen]:!h-[100dvh] [&:-webkit-full-screen]:flex [&:-webkit-full-screen]:flex-col [&:-webkit-full-screen]:rounded-none"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        paddingTop: isFullscreen && isMobilePlayer ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: isFullscreen && isMobilePlayer ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: isFullscreen && isMobilePlayer ? 'env(safe-area-inset-left)' : undefined,
        paddingRight: isFullscreen && isMobilePlayer ? 'env(safe-area-inset-right)' : undefined,
      }}
    >
      <div
        className={`relative w-full bg-black min-h-0 min-w-0 overflow-hidden rounded-none sm:rounded-xl ${isFullscreen ? 'flex-1 min-h-0 flex items-center justify-center' : 'aspect-video'}`}
        style={
          isFullscreen
            ? { width: '100%', flex: '1 1 auto', minHeight: 0, maxHeight: '100dvh' }
            : undefined
        }
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col justify-between bg-gray-800/95 p-4" aria-hidden aria-busy="true">
            <div className="flex-1 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-2 border-primary-navy/30 border-t-primary-navy animate-spin" />
            </div>
            <div className="flex-shrink-0 w-full px-1">
              <div className="h-2 w-full rounded-full bg-gray-600/80 overflow-hidden" role="presentation">
                <div className="h-full w-1/3 rounded-full bg-gray-500 animate-pulse" style={{ minWidth: '80px' }} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gray-800 text-white text-center">
            <p className="font-medium">Video failed to load</p>
            <p className="text-sm text-white/80 mt-1">Check your connection or try again later.</p>
            {session.thumbnail && (
              <img
                src={session.thumbnail}
                alt=""
                className="mt-4 max-h-32 object-contain rounded-lg opacity-80"
              />
            )}
          </div>
        )}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full ${isMobilePlayer && isFullscreen ? 'object-cover' : 'object-contain'} ${isFullscreen ? 'max-h-[100dvh] max-w-[100vw]' : ''}`}
          poster={session.thumbnail ?? undefined}
          playsInline
          onClick={handleVideoClick}
          onTouchEnd={handleVideoTouchEnd}
          onDoubleClick={handleVideoDoubleClick}
          style={{ visibility: error ? 'hidden' : 'visible' }}
        />
      </div>

      {/* Title overlay */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-b from-black/70 via-black/40 to-transparent flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-base leading-tight truncate">
            {session.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-white/80 text-sm">{session.type}</span>
            <span className="text-white/50 text-xs">·</span>
            <span className="text-white/70 text-xs">Day {session.dayId}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(); }}
          className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <HiHeart
            className={`w-5 h-5 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-white/80'}`}
          />
        </button>
      </div>

      {/* Bottom: progress bar row + control bar - transparent dark blue (theme) */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col backdrop-blur-md bg-gradient-to-t from-primary-navy/95 to-primary-navy/65 border-t border-primary-navy/60">
        {/* Seek bar - theme blue for visibility on blurred background */}
        <div className="w-full px-2 sm:px-3 pt-0.5 pb-1.5 sm:pb-2 flex items-center gap-2 flex-shrink-0">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="flex-1 min-w-0 h-1.5 sm:h-2 rounded-full bg-white/30 accent-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 touch-none"
            aria-label="Seek"
          />
        </div>
        {/* Control row - compact on mobile, aligned */}
        <div
          className="h-8 sm:h-10 px-2 sm:px-3 pt-1.5 sm:pt-2 pb-0.5 sm:pb-1 flex items-center gap-1 sm:gap-2 flex-shrink-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto flex-1 min-w-0 items-center">
          <button
            type="button"
            onClick={handleBack10}
            className="flex items-center justify-center gap-1 px-1.5 w-auto h-6 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white flex-shrink-0 transition-all duration-200 hover:bg-white/30 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Back 10 seconds"
            title="Back 10 seconds"
          >
            <FiRotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          {allowFullSeek && (
            <button
              type="button"
              onClick={handleForward10}
              className="flex items-center justify-center gap-1 px-1.5 w-auto h-6 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white flex-shrink-0 transition-all duration-200 hover:bg-white/30 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Forward 10 seconds"
              title="Forward 10 seconds"
            >
              <FiRotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white flex-shrink-0 transition-all duration-200 hover:bg-white/25 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <FiPause className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <FiPlay className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />
            )}
          </button>
          <span className="text-white/90 text-[10px] sm:text-xs tabular-nums flex-shrink-0 min-w-[3rem] sm:min-w-[4.5rem]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1 sm:p-1.5 rounded text-white/90 hover:bg-white/15 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted || volume === 0 ? (
                <FiVolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <FiVolume2 className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="hidden sm:block w-12 h-0.5 accent-white cursor-pointer"
              aria-label="Volume"
            />
          </div>
          <button
            type="button"
            title={hasCaptions ? (captionsOn ? 'Turn off captions' : 'Turn on captions') : 'No captions available'}
            disabled={!hasCaptions}
            onClick={() => hasCaptions && setCaptionsOn((c) => !c)}
            className={`flex-shrink-0 px-1 py-1 sm:py-1 rounded text-[10px] sm:text-xs font-medium min-h-[32px] min-w-[28px] sm:min-h-0 sm:min-w-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${hasCaptions ? (captionsOn ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/15') : 'text-white/40 cursor-not-allowed'}`}
            aria-label={hasCaptions ? 'Toggle captions' : 'No captions available'}
          >
            CC
          </button>
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setSpeedOpen((o) => !o)}
              className="flex-shrink-0 px-1 py-1 sm:py-1 rounded text-white/90 text-[10px] sm:text-xs font-medium hover:bg-white/15 min-h-[32px] min-w-[24px] sm:min-h-0 sm:min-w-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Playback speed"
              aria-expanded={speedOpen}
            >
              {playbackRate}x
            </button>
            {speedOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setSpeedOpen(false)} />
                <div className="absolute bottom-full left-0 mb-1 py-1 bg-primary-navy rounded-lg shadow-lg z-20 min-w-[5rem]">
                  {SPEED_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setPlaybackRate(s);
                        setSpeedOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-sm text-white hover:bg-white/10 ${playbackRate === s ? 'bg-white/15 font-medium' : ''}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
            </>
          )}
          </div>
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex-shrink-0 ml-auto p-1 sm:p-1.5 rounded text-white/90 hover:bg-white/15 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FiMinimize className="w-3 h-3 sm:w-4 sm:h-4" /> : <FiMaximize className="w-3 h-3 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
