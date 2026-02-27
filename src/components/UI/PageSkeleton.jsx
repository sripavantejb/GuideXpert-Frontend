import Skeleton from './Skeleton';
import { StatCardSkeleton } from './CardSkeleton';

/**
 * Generic page skeleton for Suspense / LoadingFallback: title + card grid.
 */
export default function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      <Skeleton className="h-7 w-40 mb-6 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
