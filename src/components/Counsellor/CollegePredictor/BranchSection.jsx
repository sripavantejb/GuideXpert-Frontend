export default function BranchSection({ branches }) {
  if (!branches || branches.length === 0) {
    return <p className="text-sm text-gray-400 italic">No branch data available</p>;
  }

  return (
    <div className="space-y-3">
      {branches.map((branch, idx) => (
        <div
          key={`${branch.branch_code}-${idx}`}
          className="rounded-lg bg-gray-50 border border-gray-100 p-3"
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="text-sm font-semibold text-gray-900">
              {branch.branch_name || branch.branch_code}
            </span>
            {branch.fee != null && (
              <span className="text-xs text-gray-500">
                Fee: <span className="font-medium text-gray-700">₹{Number(branch.fee).toLocaleString('en-IN')}</span>
              </span>
            )}
            {branch.cutoff != null && (
              <span className="text-xs text-gray-500">
                Cutoff: <span className="font-medium text-gray-700">{Number(branch.cutoff)}</span>
              </span>
            )}
          </div>

          {Array.isArray(branch.reservation_categories) && branch.reservation_categories.length > 0 && (
            <div className="mt-2 ml-3 border-l-2 border-gray-200 pl-3 space-y-1">
              {branch.reservation_categories.map((rc, rcIdx) => (
                <div
                  key={`${rc.reservation_category_code || rc.category_name}-${rcIdx}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs"
                >
                  <span className="font-medium text-gray-700">
                    {rc.category_name || rc.reservation_category_code}
                  </span>
                  {rc.cutoff != null && (
                    <span className="text-gray-500">
                      Cutoff: <span className="font-medium text-gray-700">{Number(rc.cutoff)}</span>
                    </span>
                  )}
                  {rc.extra_info && (
                    <span className="text-gray-400">{rc.extra_info}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
