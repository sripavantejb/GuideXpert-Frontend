import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FiZap, FiCalendar } from 'react-icons/fi';
import { getStudentLiveActivityFeed } from '../../utils/api';

/**
 * Smooth live toasts under the hero — name + tool/booking (never results).
 */
export default function HeroLiveActivityToasts() {
  const [feed, setFeed] = useState([]);
  const cursorRef = useRef(0);
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await getStudentLiveActivityFeed({ limit: 24, sinceHours: 72 });
      if (cancelled) return;
      const items = res.success ? res.data?.data?.items || [] : [];
      // Prefer newer booked sessions near the front so live pops feel social.
      const booked = items.filter((i) => i.action === 'booked');
      const used = items.filter((i) => i.action !== 'booked');
      const interleaved = [];
      const max = Math.max(booked.length, used.length);
      for (let i = 0; i < max; i += 1) {
        if (booked[i]) interleaved.push(booked[i]);
        if (used[i]) interleaved.push(used[i]);
      }
      setFeed(interleaved.length ? interleaved : items);
    };
    load();
    const poll = window.setInterval(load, 12_000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (!feed.length) {
      setVisible(null);
      return undefined;
    }

    let cancelled = false;
    let hideTimer;
    let gapTimer;

    const tick = () => {
      if (cancelled || !feed.length) return;
      const idx = cursorRef.current % feed.length;
      const item = feed[idx];
      cursorRef.current = (idx + 1) % feed.length;
      setVisible(item);
      hideTimer = window.setTimeout(() => {
        if (cancelled) return;
        setVisible(null);
        gapTimer = window.setTimeout(tick, 1100);
      }, 4400);
    };

    const start = window.setTimeout(tick, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.clearTimeout(hideTimer);
      window.clearTimeout(gapTimer);
    };
  }, [feed]);

  return (
    <div className="relative min-h-[3.25rem]">
      <AnimatePresence mode="wait">
        {visible ? (
          <motion.div
            key={visible.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex max-w-[min(100%,24rem)] items-center gap-3 rounded-2xl border border-[#e8eaed] bg-white/95 px-3.5 py-2.5 shadow-[0_14px_36px_-18px_rgba(15,23,42,0.35)] backdrop-blur-md sm:px-4 sm:py-3"
            role="status"
            aria-live="polite"
          >
            <span
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                visible.action === 'booked'
                  ? 'bg-[#eef6ff] text-[#2563eb]'
                  : 'bg-[#fff4ed] text-[#f27921]'
              }`}
            >
              {visible.action === 'booked' ? (
                <FiCalendar className="h-4 w-4" aria-hidden />
              ) : (
                <FiZap className="h-4 w-4" aria-hidden />
              )}
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </span>
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0f172a]">
                <span className="text-[#f27921]">{visible.name}</span>
                {visible.action === 'booked' ? (
                  <>
                    {' '}just booked{' '}
                    <span>{visible.tool || 'a counselling session'}</span>
                  </>
                ) : (
                  <>
                    {' '}just used{' '}
                    <span>{visible.tool}</span>
                  </>
                )}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-[#94a3b8]">{visible.when}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
