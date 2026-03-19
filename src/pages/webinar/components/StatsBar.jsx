import { FiFileText, FiBarChart2, FiClock, FiCheckCircle } from 'react-icons/fi';

const statConfig = [
  { key: 'type',          label: 'Session type',    icon: FiFileText },
  { key: 'duration',      label: 'Duration',        icon: FiClock },
  { key: 'totalDuration', label: 'Total duration',  icon: FiBarChart2 },
  { key: 'status',        label: 'Status',          icon: FiCheckCircle },
];

const statusStyle = (val = '') => {
  const v = String(val).toLowerCase();
  if (v === 'completed')   return 'bg-accent-green/10 text-accent-green border border-accent-green/20';
  if (v === 'in progress') return 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20';
  return 'bg-gray-100 text-gray-600 border border-gray-200';
};

export default function StatsBar({ type, duration, totalDuration, status }) {
  const values = { type, duration, totalDuration, status };

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 p-3 bg-gray-50/80 rounded-lg md:flex md:flex-nowrap md:gap-0 md:p-0 md:rounded-lg overflow-hidden">
      {statConfig.map(({ key, label, icon: Icon }, i) => (
        <div
          key={key}
          className={`
            flex items-center gap-2.5 min-w-0
            md:flex-1 md:basis-0 md:px-4 md:py-3 md:border-r md:border-gray-200
            ${i === statConfig.length - 1 ? 'md:border-r-0' : ''}
          `}
        >
          <span className="w-7 h-7 rounded-lg bg-white/80 border border-gray-100 flex items-center justify-center shrink-0" aria-hidden>
            <Icon className="w-3.5 h-3.5 text-primary-navy/80" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">
              {label}
            </p>
            {key === 'status' ? (
              <span className={`inline-flex mt-0.5 px-2 py-0.5 rounded-md text-xs font-semibold ${statusStyle(values[key])}`}>
                {values[key] ?? '—'}
              </span>
            ) : (
              <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-tight truncate" title={values[key] ?? '—'}>
                {values[key] ?? '—'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
