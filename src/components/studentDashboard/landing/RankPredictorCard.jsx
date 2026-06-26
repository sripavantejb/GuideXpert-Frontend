import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuArrowRight } from 'react-icons/lu';
import { getExamAccent } from './landingPageData';
import { springTransition } from './motion';

export default function RankPredictorCard({ tool, cta = 'Predict rank' }) {
  const examId = tool.id.replace('rank-', '');
  const accent = getExamAccent(examId);
  const Icon = tool.icon;

  return (
    <motion.div whileHover={{ y: -6 }} transition={springTransition}>
      <Link
        to={tool.to}
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${accent.glow}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.gradient} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
          aria-hidden
        />
        <div className="relative flex items-start justify-between gap-3">
          <motion.div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ${accent.ring}`}
            whileHover={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className={`h-4 w-4 ${accent.accent}`} aria-hidden />
          </motion.div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${accent.badge}`}>
            {accent.family}
          </span>
        </div>
        <h3 className="relative mt-3 text-base font-semibold text-white">{tool.title}</h3>
        <p className="relative mt-1.5 flex-1 text-xs leading-relaxed text-slate-400">{tool.description}</p>
        <span className={`relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition group-hover:gap-2.5 ${accent.accent}`}>
          {cta} <LuArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </Link>
    </motion.div>
  );
}
