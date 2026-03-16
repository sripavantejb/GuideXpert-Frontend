import { getModuleState } from '../../contexts/CounsellorTrainingContext';

export default function TrainingProgressBar({ modules, completedModules, currentModule }) {
  const progressPercent = modules.length ? (completedModules.length / modules.length) * 100 : 0;

  return (
    <div className="relative w-6 shrink-0 flex flex-col self-stretch min-h-[200px]">
      {/* Vertical track (full height) */}
      <div
        className="absolute rounded-full bg-white/10 w-1 left-1/2 -translate-x-1/2 top-0 bottom-0"
        style={{ width: '4px' }}
        aria-hidden
      />
      {/* Progress fill */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-1 bg-accent-green rounded-full transition-all duration-300 ease-out top-0"
        style={{
          width: '4px',
          height: `${progressPercent}%`,
          minHeight: 0,
        }}
        role="progressbar"
        aria-valuenow={completedModules.length}
        aria-valuemin={0}
        aria-valuemax={modules.length}
        aria-label="Training progress"
      />
      {/* Nodes for each module */}
      <div className="relative flex flex-col flex-1 justify-evenly py-1 z-10">
        {modules.map((mod) => {
          const state = getModuleState(mod.id, completedModules);
          const isCompleted = state === 'completed';
          const isCurrent = currentModule === mod.id && !isCompleted;
          const isLocked = state === 'locked';

          return (
            <div
              key={mod.id}
              className="flex items-center justify-center shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 mx-auto"
              style={{
                backgroundColor: isCompleted ? '#15803d' : isCurrent ? '#003366' : 'transparent',
                borderColor: isCompleted ? '#15803d' : isCurrent ? '#4d8ec7' : isLocked ? 'rgba(148, 163, 184, 0.5)' : 'rgba(148, 163, 184, 0.4)',
              }}
              aria-hidden
            >
              {isCompleted && (
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
