import { Link } from 'react-router-dom';
import { FiMessageCircle } from 'react-icons/fi';

const CARD_CLASS = 'rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden p-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5';

const MOCK_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=A',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=B',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=C',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=D',
];

export default function CommunityEngagementCard({
  learnersCount = 0,
  messagesCount = 0,
  questionsToday = 0,
  reactions = {},
}) {
  return (
    <div className={CARD_CLASS}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        Community
      </h3>
      <div className="space-y-1.5">
        <p className="text-sm text-gray-700 flex items-center gap-1.5">
          <span aria-hidden>👥</span>
          <span>{learnersCount} learners attending</span>
        </p>
        <div className="flex -space-x-2">
        {MOCK_AVATARS.map((src, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shrink-0"
            title={`Learner ${i + 1}`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        {learnersCount > 4 && (
          <span className="w-8 h-8 rounded-full border-2 border-white bg-primary-navy/10 flex items-center justify-center text-xs font-medium text-primary-navy shrink-0">
            +{learnersCount - 4}
          </span>
        )}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span>Messages: {messagesCount}</span>
        <span className="text-gray-300">·</span>
        <span>Today: {questionsToday}</span>
        {reactions && Object.keys(reactions).length > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1.5">
              {reactions.like != null && <span>👍 {reactions.like}</span>}
              {reactions.fire != null && <span>🔥 {reactions.fire}</span>}
              {reactions.target != null && <span>🎯 {reactions.target}</span>}
            </span>
          </>
        )}
      </div>
      <Link
        to="/webinar/doubts"
        className="mt-2 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary-navy/10 text-primary-navy text-xs font-medium hover:bg-primary-navy/20 transition-colors w-fit"
      >
        <FiMessageCircle className="w-4 h-4" /> Join discussion
      </Link>
    </div>
  );
}
