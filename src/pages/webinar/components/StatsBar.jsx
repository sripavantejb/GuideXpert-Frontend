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
    <div className="flex flex-wrap items-center gap-0 bg-gray-50/80 rounded-lg overflow-hidden">
      {statConfig.map(({ key, label, icon: Icon }, i) => (
        <div
          key={key}
          className={`
            flex items-center gap-2.5 px-4 py-3 min-w-0 flex-1 basis-0
            ${i < statConfig.length - 1 ? 'border-r border-gray-200' : ''}
          `}
        >
          <span className="w-7 h-7 rounded-lg bg-white/80 border border-gray-100 flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5 text-primary-navy/80" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">
              {label}
            </p>
            {key === 'status' ? (
              <span className={`inline-flex mt-0.5 px-2 py-0.5 rounded-md text-xs font-semibold ${statusStyle(values[key])}`}>
                {values[key] ?? '—'}
              </span>
            ) : (
              <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-tight">
                {values[key] ?? '—'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
