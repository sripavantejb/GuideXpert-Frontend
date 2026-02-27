import Skeleton from './Skeleton';

/**
 * Full table skeleton with thead and tbody. Wrapper matches admin/counsellor table styles.
 */
export default function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {Array.from({ length: cols }).map((_, j) => (
              <th key={j} className="px-3 py-2">
                <Skeleton className="h-4 w-20 rounded" style={{ maxWidth: j === 0 ? 120 : 80 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-3 py-2 align-middle">
                  <Skeleton
                    className="h-4 rounded"
                    style={{
                      maxWidth: j === 0 ? 160 : j === cols - 1 ? 72 : 100,
                      width: '100%',
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
