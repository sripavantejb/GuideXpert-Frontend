import { FiFileText, FiBarChart2, FiClock, FiCheckCircle } from 'react-icons/fi';

const statConfig = [
  { key: 'type',          label: 'Session type',    icon: FiFileText },
  { key: 'duration',      label: 'Duration',        icon: FiClock },
  { key: 'totalDuration', label: 'Total duration',  icon: FiBarChart2 },
  { key: 'status',        label: 'Status',          icon: FiCheckCircle },
];

const statusStyle = (val = '') => {
  const v = String(val).toLowerCase();
  if (v === 'completed')   return 'bg-green-100 text-green-800 border border-green-200';
  if (v === 'in progress') return 'bg-amber-100 text-amber-800 border border-amber-200';
  return 'bg-gray-100 text-gray-600 border border-gray-200';
};

export default function StatsBar({ type, duration, totalDuration, status }) {
  const values = { type, duration, totalDuration, status };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statConfig.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100"
        >
          <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
            <Icon className="w-4 h-4 text-primary-navy" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest leading-tight">
              {label}
            </p>
            {key === 'status' ? (
              <span className={`inline-flex mt-1 px-2 py-0.5 rounded-md text-xs font-semibold ${statusStyle(values[key])}`}>
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
