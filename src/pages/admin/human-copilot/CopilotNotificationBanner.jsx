import { FiAlertCircle } from 'react-icons/fi';

export default function CopilotNotificationBanner({ count, loading }) {
  if (loading || !count) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <FiAlertCircle className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">{count}</strong>{' '}
        {count === 1 ? 'conversation needs' : 'conversations need'} attention (human request, low
        confidence, or hot lead).
      </span>
    </div>
  );
}
