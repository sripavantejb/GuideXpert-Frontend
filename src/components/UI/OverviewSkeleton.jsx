import Skeleton from './Skeleton';
import { StatCardSkeleton } from './CardSkeleton';
import TableSkeleton from './TableSkeleton';

/**
 * Skeleton that matches admin Overview: title + quick actions + stat cards + chart + recent leads table.
 */
export default function OverviewSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <Skeleton className="h-7 w-32 mb-6 rounded" />

      <div className="flex flex-wrap gap-3 mb-6">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
        <Skeleton className="h-5 w-40 mb-4 rounded" />
        <div className="flex items-end gap-1 h-32">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 min-w-0 rounded-t" style={{ height: `${30 + (i % 5) * 15}%` }} />
          ))}
        </div>
      </div>

      <TableSkeleton rows={5} cols={4} />
    </div>
  );
}
