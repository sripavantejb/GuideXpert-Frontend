import Skeleton from './Skeleton';

/**
 * Stat card skeleton: label + value line, optional icon. Matches admin Overview and counsellor dashboard stat cards.
 */
export function StatCardSkeleton({ showIcon = true }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      {showIcon && (
        <div className="flex items-start justify-between gap-3 mb-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      )}
      <Skeleton className="h-4 w-20 mb-2 rounded" />
      <Skeleton className="h-7 w-14 rounded" />
    </div>
  );
}

/**
 * Generic card skeleton: optional top bar + 2–3 lines. For announcement-style cards.
 */
export function GenericCardSkeleton({ lines = 3 }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <Skeleton className="h-4 w-3/4 mb-3 rounded" />
      <Skeleton className="h-3 w-full mb-2 rounded" />
      <Skeleton className="h-3 w-5/6 mb-2 rounded" />
      {lines >= 3 && <Skeleton className="h-3 w-4/5 rounded" />}
    </div>
  );
}

export default function CardSkeleton({ variant = 'stat', ...rest }) {
  if (variant === 'generic') return <GenericCardSkeleton {...rest} />;
  return <StatCardSkeleton {...rest} />;
}
