import { FiLock, FiPlay, FiCheck } from 'react-icons/fi';

export default function TrainingModuleItem({ module, state, isCurrent, onClick, onCloseSidebar }) {
  const isLocked = state === 'locked';
  const isCompleted = state === 'completed';
  const certificateLockedNavigable = isLocked && module.type === 'certificate';

  const handleClick = () => {
    if (isLocked && !certificateLockedNavigable) return;
    onClick(module.id);
    onCloseSidebar?.();
  };

  const baseClass =
    'flex items-center gap-3 px-3 py-2 rounded-lg text-[0.8125rem] font-medium transition-all duration-200 w-full text-left';
  const activeClass =
    'bg-primary-navy/90 text-white shadow-[inset_3px_0_0_0_#4d8ec7]';
  const inactiveClass = 'text-slate-400 hover:bg-white/5 hover:text-slate-200';
  const lockedClass = 'text-slate-500 cursor-not-allowed opacity-70';
  const lockedCertificateClass =
    'text-slate-500 opacity-90 cursor-pointer hover:bg-white/5 hover:text-slate-200';
  const lockedCertificateCurrentClass =
    'bg-primary-navy/90 text-white shadow-[inset_3px_0_0_0_#4d8ec7] opacity-95 cursor-pointer hover:bg-primary-navy';

  const buttonClass = `${baseClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#041e30] ${
    certificateLockedNavigable && isCurrent
      ? lockedCertificateCurrentClass
      : certificateLockedNavigable
        ? lockedCertificateClass
        : isLocked
          ? lockedClass
          : isCurrent
            ? activeClass
            : inactiveClass
  }`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLocked && !certificateLockedNavigable}
      aria-disabled={isLocked && !certificateLockedNavigable}
      aria-current={isCurrent ? 'step' : undefined}
      className={buttonClass}
    >
      <span className="shrink-0 w-5 h-5 flex items-center justify-center">
        {isLocked && (
          <FiLock
            className={`w-3.5 h-3.5 ${certificateLockedNavigable && isCurrent ? 'text-white/80' : 'text-slate-500'}`}
            aria-hidden
          />
        )}
        {!isLocked && !isCompleted && (
          <FiPlay className="w-3.5 h-3.5 text-current" aria-hidden />
        )}
        {isCompleted && (
          <FiCheck className="w-4 h-4 text-accent-green" aria-hidden />
        )}
      </span>
      <span className="truncate">{module.label}</span>
    </button>
  );
}
