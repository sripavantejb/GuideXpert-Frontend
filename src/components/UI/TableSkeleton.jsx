export default function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100"
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-gray-200 rounded flex-1 min-w-0 max-w-[120px]"
              style={{ maxWidth: j === 0 ? 180 : j === cols - 1 ? 80 : 120 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
