/**
 * Base skeleton building block with pulse animation.
 * Use for inline bars, blocks, or inside card/table/list skeletons.
 */
export default function Skeleton({ className = '', rounded = 'rounded-md', style = {}, ...props }) {
  return (
    <div
      className={`skeleton-pulse animate-pulse bg-gray-200 ${rounded} ${className}`.trim()}
      style={style}
      aria-hidden
      {...props}
    />
  );
}

/**
 * Small content skeleton for modals / SlideOver: title + 4–5 definition lines.
 */
export function ContentSkeleton({ lines = 5 }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-32 rounded bg-gray-200 skeleton-pulse animate-pulse" aria-hidden />
      </div>
      <dl className="grid grid-cols-1 gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="h-4 w-16 rounded bg-gray-200 skeleton-pulse animate-pulse shrink-0" aria-hidden />
            <div className="h-4 flex-1 max-w-[180px] rounded bg-gray-200 skeleton-pulse animate-pulse" aria-hidden />
          </div>
        ))}
      </dl>
    </div>
  );
}
