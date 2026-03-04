/**
 * Reusable KPI metric card for admin dashboard.
 * Clean white card, soft shadow, rounded corners, bold number, optional trend indicator.
 */
export default function KpiCard({ label, value, trend, trendLabel, title, className = '' }) {
  const hasTrend = trend != null && trend !== 0;
  const trendUp = trend > 0;

  return (
    <div
      className={`
        rounded-xl border border-gray-200 bg-white p-4 portal-card
        hover:portal-card-hover hover:border-primary-blue-200 transition-all duration-200
        ${className}
      `}
      title={title || label}
    >
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-primary-navy tabular-nums truncate">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {hasTrend && (
        <p
          className={`mt-1 text-xs font-medium ${
            trendUp ? 'text-success' : 'text-error'
          }`}
          role="status"
        >
          {trendUp ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel || 'vs previous'}
        </p>
      )}
    </div>
  );
}
