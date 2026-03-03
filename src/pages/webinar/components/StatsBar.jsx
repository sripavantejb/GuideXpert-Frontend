import { FiFileText, FiBarChart2, FiClock, FiCheckCircle } from 'react-icons/fi';

const statConfig = [
  { key: 'type', label: 'SESSION TYPE', icon: FiFileText },
  { key: 'duration', label: 'DURATION', icon: FiClock },
  { key: 'totalDuration', label: 'TOTAL DURATION', icon: FiBarChart2 },
  { key: 'status', label: 'STATUS', icon: FiCheckCircle },
];

export default function StatsBar({ type, duration, totalDuration, status }) {
  const values = { type, duration, totalDuration, status };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 mt-4 pt-4 border-t border-gray-100 rounded-b-xl overflow-hidden bg-gray-50/90">
      {statConfig.map(({ key, label, icon: Icon }, i) => (
        <div
          key={key}
          className={`flex items-center gap-2.5 px-3 sm:px-4 min-h-[56px] min-w-0 ${
            i === 0 || i === 2 ? 'border-r border-gray-200' : i === 1 ? 'lg:border-r border-gray-200' : ''
          }`}
        >
          <div className="flex-shrink-0 text-primary-navy opacity-80">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">
              {label}
            </p>
            <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
              {values[key] ?? '—'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
