import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuTrendingUp, LuGraduationCap } from 'react-icons/lu';
import { STUDENT_OUTCOMES } from './landingPageData';
import SectionBackdrop from './SectionBackdrop';
import Reveal from './Reveal';

const INTERVAL_MS = 5000;

export default function StudentSuccessCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % STUDENT_OUTCOMES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const outcome = STUDENT_OUTCOMES[index];

  return (
    <section
      className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/80 to-white"
      aria-labelledby="success-carousel-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <SectionBackdrop dark={false} particles={false} />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Real outcomes</p>
          <h2 id="success-carousel-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Student success stories
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            See how accurate predictions help students land at the right colleges.
          </p>
        </Reveal>

        <div className="relative mt-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.article
              key={outcome.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-xl rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-10"
              aria-live="polite"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Student rank</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{outcome.rank}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <LuTrendingUp className="h-3.5 w-3.5" aria-hidden />
                  {outcome.accuracy}% accuracy
                </span>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Exam type</p>
              <p className="mt-1 font-medium text-slate-700">{outcome.exam}</p>

              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Predicted colleges</p>
              <ul className="mt-2 space-y-2">
                {outcome.colleges.map((college) => (
                  <li key={college} className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <LuGraduationCap className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    {college}
                  </li>
                ))}
              </ul>
            </motion.article>
          </AnimatePresence>

          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Success story slides">
            {STUDENT_OUTCOMES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Story ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
