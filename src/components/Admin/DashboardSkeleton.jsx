import Skeleton from '../UI/Skeleton';
import { StatCardSkeleton } from '../UI/CardSkeleton';

/**
 * Skeleton for Sales Analytics Dashboard: KPI grid, Lead pipeline chart, Signups + Slot charts, funnel.
 */
export default function DashboardSkeleton() {
  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div>
        <Skeleton className="h-3 w-24 mb-4 rounded" />
        <div className="rounded-xl border border-gray-200 bg-white p-6 portal-card h-64 flex items-end gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 min-w-0 rounded-t" style={{ height: `${40 + (i % 3) * 15}%` }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Skeleton className="h-3 w-28 mb-4 rounded" />
          <div className="rounded-xl border border-gray-200 bg-white p-6 portal-card h-64 flex items-end gap-0.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 min-w-0 rounded-t" style={{ height: `${25 + (i % 5) * 12}%` }} />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-3 w-32 mb-4 rounded" />
          <div className="rounded-xl border border-gray-200 bg-white p-6 portal-card h-64 flex items-center justify-center">
            <Skeleton className="h-48 w-full rounded" />
          </div>
        </div>
      </div>
      <div>
        <Skeleton className="h-3 w-36 mb-4 rounded" />
        <div className="rounded-xl border border-gray-200 bg-white/80 p-6 portal-card min-h-[320px]">
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 w-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
