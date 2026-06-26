import { motion } from 'framer-motion';
import { TRUST_STATS } from './landingPageData';
import { useCountUp } from './useCountUp';
import SectionBackdrop from './SectionBackdrop';
import { staggerContainer, fadeUp, defaultViewport } from './motion';

function StatItem({ stat }) {
  const { ref, display } = useCountUp(stat.value, {
    suffix: stat.suffix,
    decimals: stat.decimals,
    duration: 2400,
  });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="relative rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center backdrop-blur-sm"
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" aria-hidden />
      <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{display}</p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">{stat.label}</p>
    </motion.div>
  );
}

export default function TrustStatsSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-slate-900" aria-labelledby="trust-stats-heading">
      <SectionBackdrop dark />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <RevealHeader />
        <motion.div
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
        >
          {TRUST_STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function RevealHeader() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={fadeUp}
      className="mx-auto max-w-2xl text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Trusted nationwide</p>
      <h2 id="trust-stats-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Built for serious admission planning
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
        Thousands of students rely on GuideXpert for data-backed rank predictions and college shortlists.
      </p>
    </motion.div>
  );
}
