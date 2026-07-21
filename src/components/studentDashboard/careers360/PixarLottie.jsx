import { useEffect, useId, useRef, useState } from 'react';

const PLAYER_SRC = 'https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js';
let playerLoadPromise = null;

function ensureLottiePlayer() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (customElements.get('lottie-player')) return Promise.resolve();
  if (playerLoadPromise) return playerLoadPromise;

  playerLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gx-lottie-player]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = PLAYER_SRC;
    script.async = true;
    script.dataset.gxLottiePlayer = '1';
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return playerLoadPromise;
}

/**
 * Pixar-like vector character animation (Lottie) — GIF-smooth, resolution independent.
 */
export default function PixarLottie({
  src,
  className = '',
  label = 'Animated illustration',
  loop = true,
  speed = 1,
}) {
  const hostRef = useRef(null);
  const reactId = useId();
  const [ready, setReady] = useState(
    () => typeof window !== 'undefined' && Boolean(customElements.get('lottie-player'))
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureLottiePlayer()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !hostRef.current || !src) return;
    const host = hostRef.current;
    host.innerHTML = '';

    const player = document.createElement('lottie-player');
    player.setAttribute('src', src);
    player.setAttribute('background', 'transparent');
    player.setAttribute('speed', String(speed));
    player.setAttribute('direction', '1');
    player.setAttribute('mode', 'normal');
    if (loop) player.setAttribute('loop', '');
    player.setAttribute('autoplay', '');
    player.style.width = '100%';
    player.style.height = '100%';
    player.style.display = 'block';
    player.addEventListener('error', () => setFailed(true));
    host.appendChild(player);

    return () => {
      host.innerHTML = '';
    };
  }, [ready, src, loop, speed]);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#fff4ed] to-[#eef2f7] text-sm text-[#888] ${className}`}
        role="img"
        aria-label={label}
      >
        Animation unavailable
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      id={`gx-lottie-${reactId.replace(/:/g, '')}`}
      className={`relative ${className}`}
      role="img"
      aria-label={label}
    >
      {!ready ? (
        <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-[#fff4ed] via-[#f5f0fa] to-[#eef2f7]" />
      ) : null}
    </div>
  );
}

/** Soft stage frame for character animations — toy-story card feel */
export function PixarStage({
  src,
  label,
  className = '',
  tone = 'cream',
  caption,
}) {
  const tones = {
    cream: 'from-[#fff8f0] via-[#fff4ed] to-[#eef2f7]',
    navy: 'from-[#eef2f7] via-[#f0f4f9] to-[#fff8f3]',
    plum: 'from-[#f5f0fa] via-[#fff8f3] to-[#eef2f7]',
    mint: 'from-[#eefaf4] via-[#f5faf8] to-[#fff8f3]',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#e8eaed] bg-gradient-to-br shadow-sm ${tones[tone] || tones.cream} ${className}`}
    >
      <div
        className="pointer-events-none absolute -left-8 top-6 h-28 w-28 rounded-full bg-white/70 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 bottom-4 h-32 w-32 rounded-full bg-[#f27921]/12 blur-2xl"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[220px] items-center justify-center p-3 sm:min-h-[260px] sm:p-4">
        <PixarLottie
          src={src}
          label={label}
          className="h-[200px] w-full max-w-[320px] sm:h-[240px]"
        />
      </div>
      {caption ? (
        <p className="relative border-t border-[#e8eaed]/80 bg-white/50 px-4 py-2 text-center text-xs font-medium text-[#666]">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
