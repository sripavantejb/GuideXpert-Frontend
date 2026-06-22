export default function CopilotNewMessagesPill({ count, onClick }) {
  if (!count) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-md hover:bg-emerald-50"
    >
      {count} new message{count === 1 ? '' : 's'} ↓
    </button>
  );
}
