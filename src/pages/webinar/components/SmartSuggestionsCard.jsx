import { useNavigate } from 'react-router-dom';
import { FiZap } from 'react-icons/fi';

const CARD_CLASS = 'rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden p-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5';

export default function SmartSuggestionsCard({
  nextSession,
  remainingMinutes = 0,
  onSelectSession,
}) {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (nextSession?.id) {
      onSelectSession?.(nextSession.id);
      navigate('/webinar');
    }
  };

  const message = nextSession
    ? `Complete ${nextSession.title} to unlock your certificate.`
    : 'You have completed all sessions.';
  const estimatedTime = remainingMinutes > 0 ? `Estimated time: ${remainingMinutes} minutes` : null;

  return (
    <div className={CARD_CLASS}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        Recommended action
      </h3>
      <div className="p-2.5 rounded-lg bg-primary-blue-50/50 border border-primary-blue-100">
        <p className="text-sm text-gray-800">{message}</p>
        {estimatedTime && (
          <p className="text-xs text-gray-600 mt-0.5">{estimatedTime}</p>
        )}
      </div>
      {nextSession && (
        <button
          type="button"
          onClick={handleContinue}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 transition-colors"
        >
          <FiZap className="w-4 h-4" /> Continue learning
        </button>
      )}
    </div>
  );
}
