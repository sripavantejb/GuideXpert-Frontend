import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { JOURNEY_STEPS } from './landingPageData';
import SectionBackdrop from './SectionBackdrop';
import Reveal from './Reveal';
import { fadeUp, defaultViewport, staggerContainer } from './motion';

export default function StudentJourneyTimeline() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.4'] });
  const pathLength = useSpring(scrollYProgress, { stiffness: 80, damping: 28 });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/80 to-white"
      aria-labelledby="journey-timeline-heading"
    >
      <SectionBackdrop dark={false} particles={false} />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Your path</p>
          <h2 id="journey-timeline-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Student journey timeline
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            From rank to admission — GuideXpert guides every step with clarity.
          </p>
        </Reveal>

        <div className="relative mt-14 hidden lg:block">
          <svg viewBox="0 0 1000 120" className="w-full" aria-hidden>
            <motion.path
              d="M 50 60 H 950"
              fill="none"
              stroke="rgba(148,163,184,0.25)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <motion.path
              d="M 50 60 H 950"
              fill="none"
              stroke="url(#journey-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ pathLength }}
            />
            <defs>
              <linearGradient id="journey-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <motion.ol
          className="relative mt-10 grid gap-6 sm:grid-cols-2 lg:mt-6 lg:grid-cols-5 lg:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
        >
          {JOURNEY_STEPS.map((step, i) => (
            <motion.li key={step.id} variants={fadeUp} className="relative">
              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600 ring-1 ring-emerald-100">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{step.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.description}</p>
              </div>
              {i < JOURNEY_STEPS.length - 1 && (
                <span className="absolute -bottom-4 left-1/2 hidden -translate-x-1/2 text-slate-300 lg:block" aria-hidden>
                  ↓
                </span>
              )}
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
