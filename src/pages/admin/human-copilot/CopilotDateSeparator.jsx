import { formatDateSeparatorLabel } from './copilotUtils';

export default function CopilotDateSeparator({ at }) {
  const label = formatDateSeparatorLabel(at);
  if (!label) return null;

  return (
    <div className="my-3 flex justify-center">
      <span className="rounded-lg bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
        {label}
      </span>
    </div>
  );
}
