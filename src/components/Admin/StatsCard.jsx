export default function StatsCard({
  title,
  count,
  indicator,
  icon: Icon,
  iconClassName = 'text-primary-blue-400',
}) {
  return (
    <div className="group flex h-full min-h-0 flex-col rounded-xl border border-gray-200 bg-white p-4 sm:p-5 portal-card transition-all duration-300 hover:portal-card-hover hover:-translate-y-0.5 hover:border-primary-blue-200">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider text-gray-500 leading-snug">
          {title}
        </p>
        {Icon ? (
          <span className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${iconClassName}`} aria-hidden>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="flex min-h-12 flex-1 flex-col justify-center py-2">
        <p className="text-2xl font-bold tabular-nums leading-none text-primary-navy">
          {Number(count).toLocaleString()}
        </p>
      </div>
      <p className="text-xs font-medium leading-snug text-gray-600">{indicator}</p>
    </div>
  );
}
