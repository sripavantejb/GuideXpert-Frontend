/**
 * Wrapper for dashboard charts: title, padding, loading/empty state.
 */
export default function ChartContainer({
  title,
  subtitle = '',
  children,
  loading,
  empty,
  emptyMessage = 'No data available'
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-primary-blue-200/70 bg-gradient-to-br from-white via-white to-primary-blue-50/30 p-4 lg:p-6 shadow-sm portal-card">
      {(title || subtitle) && (
        <div className="mb-4 border-b border-primary-blue-100/80 pb-3">
          {title && <h3 className="text-sm font-semibold tracking-tight text-primary-navy">{title}</h3>}
          {subtitle && <p className="mt-1 text-[11px] text-gray-600">{subtitle}</p>}
        </div>
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
