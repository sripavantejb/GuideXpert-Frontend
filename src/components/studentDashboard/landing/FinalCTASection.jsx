import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuArrowRight, LuSearch, LuScale } from 'react-icons/lu';
import FloatingParticles from './FloatingParticles';
import Reveal from './Reveal';

export default function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-slate-900" aria-labelledby="final-cta-heading">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(52, 211, 153, 0.18), transparent 55%), radial-gradient(ellipse 60% 50% at 0% 50%, rgba(59, 130, 246, 0.1), transparent 50%)',
        }}
      />
      <FloatingParticles count={24} dark />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.05] p-10 text-center backdrop-blur-xl sm:p-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Start today</p>
            <h2 id="final-cta-heading" className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready to find your dream college?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400">
              Predict ranks, compare colleges, and discover the best opportunities tailored for you.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/students/rank-predictor"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
                >
                  Predict my rank <LuArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/students/college-predictor"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  Explore colleges <LuSearch className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/students/college-comparison"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  Compare colleges <LuScale className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
