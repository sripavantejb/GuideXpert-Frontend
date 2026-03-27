export default function StatsCard({
  title,
  count,
  indicator,
  icon: Icon,
  iconClassName = 'text-primary-blue-400',
}) {
  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-4 portal-card transition-all duration-300 hover:portal-card-hover hover:-translate-y-0.5 hover:border-primary-blue-200">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </p>
        {Icon ? (
          <span className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${iconClassName}`} aria-hidden>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-bold text-primary-navy tabular-nums">
        {Number(count).toLocaleString()}
      </p>
      <p className="mt-2 text-xs font-medium text-gray-600">{indicator}</p>
    </div>
  );
}
