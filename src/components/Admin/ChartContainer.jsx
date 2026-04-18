/**
 * Wrapper for dashboard charts: title, padding, loading/empty state.
 */
export default function ChartContainer({ title, children, loading, empty, emptyMessage = 'No data available' }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 lg:p-6 portal-card">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      )}
      {loading && (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          <span className="animate-pulse">Loading…</span>
        </div>
      )}
      {!loading && empty && (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          {emptyMessage}
        </div>
      )}
      {!loading && !empty && children}
    </div>
  );
}
