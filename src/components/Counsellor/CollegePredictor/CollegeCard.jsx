import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMapPin, FiBookOpen, FiStar, FiBarChart2 } from 'react-icons/fi';
import BranchSection from './BranchSection';

const expandMotion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
};

function getTopCutoff(branches) {
  if (!branches?.length) return null;
  const cutoffs = branches.map((b) => b.cutoff).filter((c) => c != null);
  return cutoffs.length ? Math.min(...cutoffs) : null;
}

export default function CollegeCard({ college, accentKey: _accentKey, index }) {
  const [expanded, setExpanded] = useState(false);
  const branchCount = college.branches?.length ?? 0;
  const topCutoff = getTopCutoff(college.branches);
  const promoted = college.is_promoted;

  return (
    <article
      className={`
        relative overflow-hidden border transition-colors duration-200
        ${promoted
          ? 'border-[#e8b84a] bg-gradient-to-r from-[#fffdf5] via-white to-white'
          : `border-[#d5dde8] bg-white ${expanded ? 'border-[#041e30]/35' : 'hover:border-[#041e30]/22'}`
        }
      `}
    >
      {promoted ? <div className="promoted-shimmer-bar" /> : null}

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="group flex w-full items-start gap-4 p-5 text-left sm:gap-5 sm:p-6"
      >
        {index != null ? (
          <span className="font-sw-display shrink-0 pt-0.5 text-2xl font-bold tabular-nums tracking-tight text-[#f27921]/75 sm:text-[1.65rem]">
            {String(index).padStart(2, '0')}
          </span>
        ) : null}

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-sw-display text-base font-bold leading-snug tracking-tight text-[#041e30] transition-colors group-hover:text-[#0a2f48] sm:text-[1.05rem]">
              {college.college_name}
            </h4>
            {promoted ? (
              <span className="promoted-badge">
                <FiStar className="h-3.5 w-3.5 fill-current" />
                Promoted
              </span>
            ) : null}
          </div>

          {college.college_address ? (
            <p className="text-sm leading-relaxed text-[#5a6570]">{college.college_address}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-0.5 text-xs font-medium text-[#5a6570]">
            {college.district_enum ? (
              <span className="inline-flex items-center gap-1.5">
                <FiMapPin className="h-3.5 w-3.5 text-[#8a94a0]" aria-hidden />
                {college.district_enum}
              </span>
            ) : null}
            {branchCount > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <FiBookOpen className="h-3.5 w-3.5 text-[#8a94a0]" aria-hidden />
                {branchCount} branch{branchCount !== 1 ? 'es' : ''}
              </span>
            ) : null}
            {topCutoff != null ? (
              <span className="inline-flex items-center gap-1.5 text-[#041e30]">
                <FiBarChart2 className="h-3.5 w-3.5 text-[#f27921]" aria-hidden />
                Best cutoff {topCutoff}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-1 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center border border-[#e4e9f0] bg-[#f7f9fc] transition-colors group-hover:border-[#d0d7e1]">
            <FiChevronDown
              className={`h-4 w-4 text-[#5a6570] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div {...expandMotion} className="overflow-hidden">
            <div className="border-t border-[#e4e9f0] px-5 pb-5 sm:px-6 sm:pb-6">
              <p className="mb-3 mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a94a0]">
                Branches &amp; cutoffs
              </p>
              <BranchSection branches={college.branches} />
              {college.extra_info ? (
                <p className="mt-4 text-xs italic text-[#8a94a0]">{college.extra_info}</p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
