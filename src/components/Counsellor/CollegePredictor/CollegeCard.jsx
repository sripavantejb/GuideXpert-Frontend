import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMapPin, FiBookOpen, FiStar, FiBarChart2 } from 'react-icons/fi';
import { getAccentClasses } from '../../../constants/examCardConfig';
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

export default function CollegeCard({ college, accentKey, index }) {
  const [expanded, setExpanded] = useState(false);
  const accent = getAccentClasses(accentKey);
  const branchCount = college.branches?.length ?? 0;
  const topCutoff = getTopCutoff(college.branches);

  return (
    <div
      className={`
        rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-hidden
        transition-all duration-300
        ${expanded ? `shadow-md ring-1 ${accent.ring}` : 'hover:shadow-md'}
        ${accent.leftStrip}
      `}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start gap-4 p-5 sm:p-6 text-left group"
      >
        {index != null && (
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${accent.indexBg}`}>
            {String(index).padStart(2, '0')}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-gray-900 leading-snug group-hover:text-gray-700 transition-colors">
              {college.college_name}
            </h4>
            {college.is_promoted && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.6875rem] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <FiStar className="w-3 h-3" />
                Promoted
              </span>
            )}
          </div>

          {college.college_address && (
            <p className="text-sm text-gray-500 leading-relaxed">
              {college.college_address}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {college.district_enum && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                <FiMapPin className="w-3.5 h-3.5" />
                {college.district_enum}
              </span>
            )}
            {branchCount > 0 && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${accent.badge}`}>
                <FiBookOpen className="w-3 h-3" />
                {branchCount} branch{branchCount !== 1 ? 'es' : ''}
              </span>
            )}
            {topCutoff != null && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${accent.badge}`}>
                <FiBarChart2 className="w-3 h-3" />
                Best cutoff: {topCutoff}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 mt-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
            <FiChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div {...expandMotion} className="overflow-hidden">
            <div className={`px-5 sm:px-6 pb-5 sm:pb-6 border-t ${accent.divider}`}>
              <div className="flex items-center gap-2 mt-4 mb-3">
                <div className={`w-1 h-4 rounded-full ${accent.leftStrip.replace('border-l-4 ', '').replace('border-', 'bg-')}`} />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Branches &amp; Cutoffs
                </p>
              </div>
              <BranchSection branches={college.branches} />
              {college.extra_info && (
                <p className="mt-4 text-xs text-gray-400 italic">{college.extra_info}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
