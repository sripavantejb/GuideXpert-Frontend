import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiVideo } from 'react-icons/fi';

const CARD_CLASS = 'rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden p-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5';

export default function NextSessionCard({
  nextSession,
  nextLiveSession,
  onSelectSession,
}) {
  const navigate = useNavigate();
  const displayLive = nextLiveSession?.title;
  const displayNext = nextSession;

  const handleContinue = () => {
    if (nextSession?.id) {
      onSelectSession?.(nextSession.id);
      navigate('/webinar');
    }
  };

  return (
    <div className={CARD_CLASS}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {displayLive ? 'Next live session' : 'Next session'}
      </h3>
      {displayLive ? (
        <>
          <p className="text-sm font-semibold text-gray-900">{nextLiveSession.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">Instructor: {nextLiveSession.instructor}</p>
          <p className="text-xs text-gray-600 mt-1">
            {nextLiveSession.date} · {nextLiveSession.time}
          </p>
          <p className="text-[10px] text-primary-navy font-medium mt-1.5">Starts in 02h 13m</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <FiCalendar className="w-3.5 h-3.5" /> Add to calendar
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-navy text-white text-xs font-medium hover:bg-primary-navy/90 transition-colors"
            >
              <FiVideo className="w-3.5 h-3.5" /> Join webinar
            </button>
          </div>
        </>
      ) : displayNext ? (
        <>
          <p className="text-sm font-semibold text-gray-900">{nextSession.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{nextSession.duration}</p>
          <button
            type="button"
            onClick={handleContinue}
            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary-navy text-white text-xs font-medium hover:bg-primary-navy/90 transition-colors"
          >
            <FiVideo className="w-4 h-4" /> Continue learning
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-600">All sessions completed. Great job!</p>
      )}
    </div>
  );
}
