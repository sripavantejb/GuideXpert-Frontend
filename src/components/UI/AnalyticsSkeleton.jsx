import Skeleton from './Skeleton';
import { StatCardSkeleton } from './CardSkeleton';
import TableSkeleton from './TableSkeleton';

/**
 * Skeleton that matches admin Analytics: title + filter card + sections + chart + table.
 */
export default function AnalyticsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <Skeleton className="h-7 w-24 mb-6 rounded" />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <Skeleton className="h-3 w-64 mb-2 rounded" />
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
        <Skeleton className="h-5 w-48 mb-4 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 flex-1 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
        <Skeleton className="h-5 w-40 mb-4 rounded" />
        <div className="flex items-end gap-1 h-32">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 min-w-0 rounded-t" style={{ height: `${25 + (i % 6) * 12}%` }} />
          ))}
        </div>
      </div>

      <TableSkeleton rows={4} cols={5} />
    </div>
  );
}
