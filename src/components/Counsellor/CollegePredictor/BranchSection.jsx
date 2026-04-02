import { FiBarChart2, FiTag } from 'react-icons/fi';

export default function BranchSection({ branches }) {
  if (!branches || branches.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-2">No branch data available</p>
    );
  }

  return (
    <div className="space-y-3">
      {branches.map((branch, idx) => (
        <div
          key={`${branch.branch_code}-${idx}`}
          className="rounded-xl bg-white border border-gray-200/80 overflow-hidden hover:border-gray-300 transition-colors"
        >
          <div className="flex items-stretch">
            <div className="w-1 shrink-0 bg-gradient-to-b from-blue-400 to-indigo-400" />
            <div className="flex-1 p-4">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-2">
                <span className="text-sm font-bold text-gray-800">
                  {branch.branch_name || branch.branch_code}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {branch.fee != null && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {'\u20B9'} {Number(branch.fee).toLocaleString('en-IN')}
                  </span>
                )}
                {branch.cutoff != null && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                    <FiBarChart2 className="w-3 h-3" />
                    Cutoff: {Number(branch.cutoff)}
                  </span>
                )}
              </div>

              {Array.isArray(branch.reservation_categories) && branch.reservation_categories.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FiTag className="w-3 h-3 text-gray-400" />
                    <span className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                      Reservation Categories
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {branch.reservation_categories.map((rc, rcIdx) => (
                      <div
                        key={`${rc.reservation_category_code || rc.category_name}-${rcIdx}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs hover:bg-gray-100 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                        <span className="font-semibold text-gray-700">
                          {rc.category_name || rc.reservation_category_code}
                        </span>
                        {rc.cutoff != null && (
                          <span className="text-gray-500">
                            Cutoff: <span className="font-bold text-gray-700">{Number(rc.cutoff)}</span>
                          </span>
                        )}
                        {rc.extra_info && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-400">{rc.extra_info}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
