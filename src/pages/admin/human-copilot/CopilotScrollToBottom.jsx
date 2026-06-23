import { FiChevronDown } from 'react-icons/fi';

export default function CopilotScrollToBottom({ visible, pendingCount = 0, onClick }) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Scroll to latest message"
      className="absolute bottom-6 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-lg transition hover:bg-slate-50 hover:text-slate-900"
    >
      <FiChevronDown className="h-5 w-5" aria-hidden />
      {pendingCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      ) : null}
    </button>
  );
}
