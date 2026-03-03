import { useRef, useState, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize } from 'react-icons/fi';
import { HiHeart } from 'react-icons/hi';
import { useWebinar } from '../context/WebinarContext';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({
  session,
  initialPosition = 0,
  onTimeUpdate,
  onEnded,
  onProgress,
  isBookmarked,
  onToggleBookmark,
  autoplayOnLoad = false,
  onAutoplayDone,
}) {
  const { settings } = useWebinar();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
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
      if (initialPosition > 0 && d) {
        v.currentTime = Math.min(initialPosition, d - 0.5);
        setCurrentTime(v.currentTime);
        setProgress(d ? (v.currentTime / d) * 100 : 0);
      }
    };
    const onError = () => {
      setLoading(false);
      setError(true);
    };
    const onCanPlay = () => setLoading(false);
    const onTimeUpdateHandler = () => {
      const t = v.currentTime;
      setCurrentTime(t);
      setProgress(v.duration ? (t / v.duration) * 100 : 0);
      onTimeUpdate?.(session?.id, t);
      onProgress?.(session?.id, v.duration ? (t / v.duration) * 100 : 0);
    };
    const onEndedHandler = () => {
      setPlaying(false);
      onEnded?.(session?.id);
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
  }, [session?.id, initialPosition, onTimeUpdate, onEnded, onProgress]);

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
    const time = (pct / 100) * duration;
    v.currentTime = time;
    setCurrentTime(time);
    setProgress(pct);
  };

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

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onKeyDown = (e) => {
      if (e.target.closest('input') || e.target.closest('button')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    container.setAttribute('tabIndex', '0');
    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [togglePlay]);

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

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-none sm:rounded-xl overflow-hidden bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <div className="relative w-full aspect-video bg-black min-h-0">
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
          className="w-full h-full aspect-video object-cover sm:object-contain"
          poster={session.thumbnail ?? undefined}
          playsInline
          onClick={togglePlay}
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

      {/* Bottom: progress bar row (mobile) + control bar - ensures fullscreen etc. visible */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col bg-gradient-to-t from-black/85 to-black/50">
        {/* Full-width seek bar - own row on mobile so controls fit below */}
        <div className="w-full px-2 sm:px-3 pt-1 flex items-center gap-2 flex-shrink-0">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="flex-1 min-w-0 h-2 rounded-full bg-white/30 accent-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 touch-none"
            aria-label="Seek"
          />
        </div>
        {/* Control row: play, time, mute, CC, speed, then fullscreen at far right */}
        <div
          className="h-12 px-2 sm:px-3 pb-1 flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto flex-1 min-w-0">
          <button
            type="button"
            onClick={togglePlay}
            className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-primary-navy shadow flex-shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(0,51,102,0.2)" strokeWidth="2" />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={2 * Math.PI * 18 * (1 - progress / 100)}
                className="text-primary-navy transition-all duration-200"
              />
            </svg>
            {playing ? (
              <FiPause className="w-5 h-5 relative z-10" />
            ) : (
              <FiPlay className="w-5 h-5 ml-0.5 relative z-10" />
            )}
          </button>
          <span className="text-white/90 text-xs tabular-nums flex-shrink-0 min-w-[4rem] sm:min-w-[4.5rem]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded text-white/90 hover:bg-white/10 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center sm:min-w-0 sm:min-h-0 sm:p-1.5"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted || volume === 0 ? (
                <FiVolumeX className="w-4 h-4" />
              ) : (
                <FiVolume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="hidden sm:block w-14 h-1 accent-white cursor-pointer"
              aria-label="Volume"
            />
          </div>
          <button
            type="button"
            title={hasCaptions ? (captionsOn ? 'Turn off captions' : 'Turn on captions') : 'No captions available'}
            disabled={!hasCaptions}
            onClick={() => hasCaptions && setCaptionsOn((c) => !c)}
            className={`flex-shrink-0 px-2 py-2 sm:py-1 rounded text-xs font-medium min-h-[44px] sm:min-h-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${hasCaptions ? (captionsOn ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10') : 'text-white/40 cursor-not-allowed'}`}
            aria-label={hasCaptions ? 'Toggle captions' : 'No captions available'}
          >
            CC
          </button>
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setSpeedOpen((o) => !o)}
              className="flex-shrink-0 px-2 py-2 sm:py-1 rounded text-white/90 text-xs font-medium hover:bg-white/10 min-h-[44px] sm:min-h-0 flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 min-w-[2.5rem] sm:min-w-[2.25rem]"
              aria-label="Playback speed"
              aria-expanded={speedOpen}
            >
              {playbackRate}x
            </button>
            {speedOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setSpeedOpen(false)} />
                <div className="absolute bottom-full left-0 mb-1 py-1 bg-gray-800 rounded-lg shadow-lg z-20 min-w-[5rem]">
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
            className="flex-shrink-0 ml-auto p-2 sm:p-1.5 rounded text-white/90 hover:bg-white/10 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center sm:min-w-0 sm:min-h-0"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
