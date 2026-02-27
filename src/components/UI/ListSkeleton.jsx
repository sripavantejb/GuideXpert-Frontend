import Skeleton from './Skeleton';

/**
 * List rows with optional left avatar + 2–3 skeleton lines (title + subtitle).
 * Used for NotificationDropdown, feed lists, etc.
 */
export default function ListSkeleton({ rows = 4, avatar = true }) {
  return (
    <ul className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          {avatar && (
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-[200px] rounded" />
            <Skeleton className="h-3 w-4/5 max-w-[160px] rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}
