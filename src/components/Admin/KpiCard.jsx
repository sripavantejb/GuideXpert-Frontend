/**
 * Reusable KPI metric card for admin dashboard.
 * Optional: icon, top accent bar, subtitle/context, trend. Theme-aligned hover and focus.
 */
export default function KpiCard({
  label,
  value,
  trend,
  trendLabel,
  title,
  className = '',
  icon: Icon = null,
  accent = false,
  subtitle = '',
}) {
  const hasTrend = trend != null && trend !== 0;
  const trendUp = trend > 0;
  const showAccent = accent === true || accent === 'hero';
  const accentAlways = accent === 'hero';

  return (
    <div
      className={`
        relative rounded-xl border border-gray-200 bg-white p-4 portal-card
        transition-all duration-200
        hover:portal-card-hover hover:border-primary-blue-200
        hover:-translate-y-0.5
        focus-within:ring-2 focus-within:ring-primary-navy focus-within:ring-offset-2 focus-within:outline-none
        ${showAccent ? 'group' : ''}
        ${className}
      `}
      title={title || label}
    >
      {showAccent && (
        <div
          className={`
            absolute left-0 right-0 top-0 h-[3px] rounded-t-xl bg-primary-navy transition-opacity duration-200
            ${accentAlways ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
          aria-hidden
        />
      )}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate min-w-0">
            {label}
          </p>
          {Icon && (
            <span className="shrink-0 text-primary-blue-400" aria-hidden>
              <Icon className="w-4 h-4" />
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-primary-navy tabular-nums truncate">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500" role="status">
            {subtitle}
          </p>
        )}
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
    </div>
  );
}
