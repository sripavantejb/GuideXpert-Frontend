import { FiCheck, FiLock, FiPlay } from 'react-icons/fi';
import { getModuleState } from '../../contexts/CounsellorTrainingContext';

export default function TrainingProgressOverview({ modules, completedModules, totalModules }) {
  const completedCount = completedModules.length;
  const completionPercent = totalModules ? Math.round((completedCount / totalModules) * 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-6 min-w-0 mb-6">
      <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
        Your training progress
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-6 min-w-0 mb-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-primary-navy transition-all duration-500"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
            {completionPercent}%
          </span>
        </div>
        <div className="text-sm text-gray-600 text-center sm:text-left">
          <p>
            <span className="font-semibold text-gray-800">{completedCount}</span> of {totalModules}{' '}
            modules completed
          </p>
          <p className="mt-1 text-gray-500">
            Finish all modules to unlock your certificate and poster download.
          </p>
        </div>
      </div>

      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Modules</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {modules.map((mod) => {
          const state = getModuleState(mod.id, completedModules);
          return (
            <div
              key={mod.id}
              className="flex items-center gap-2 min-w-0 rounded-lg border border-gray-100 bg-gray-50/80 px-2.5 py-2 text-left"
            >
              <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                {state === 'completed' && <FiCheck className="w-4 h-4 text-accent-green" aria-hidden />}
                {state === 'locked' && <FiLock className="w-3.5 h-3.5 text-gray-400" aria-hidden />}
                {state === 'unlocked' && <FiPlay className="w-3.5 h-3.5 text-primary-navy" aria-hidden />}
              </span>
              <span className="text-xs font-medium text-gray-800 truncate" title={mod.label}>
                {mod.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
