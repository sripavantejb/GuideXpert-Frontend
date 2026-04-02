import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiMapPin } from 'react-icons/fi';
import BranchSection from './BranchSection';

export default function CollegeCard({ college }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start justify-between gap-3 p-5 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-gray-900 leading-snug">
              {college.college_name}
            </h4>
            {college.is_promoted && (
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-semibold bg-amber-100 text-amber-800">
                Promoted
              </span>
            )}
          </div>
          {college.college_address && (
            <p className="text-xs text-gray-500 leading-relaxed">
              {college.college_address}
            </p>
          )}
          {college.district_enum && (
            <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <FiMapPin className="w-3 h-3" />
              {college.district_enum}
            </p>
          )}
        </div>
        <div className="shrink-0 mt-1">
          {expanded
            ? <FiChevronUp className="w-5 h-5 text-gray-400" />
            : <FiChevronDown className="w-5 h-5 text-gray-400" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-2">
            Branches &amp; Cutoffs
          </p>
          <BranchSection branches={college.branches} />
          {college.extra_info && (
            <p className="mt-3 text-xs text-gray-400">{college.extra_info}</p>
          )}
        </div>
      )}
    </div>
  );
}
