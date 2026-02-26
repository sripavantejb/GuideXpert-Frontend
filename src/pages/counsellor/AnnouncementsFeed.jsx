import { useState, useEffect, useCallback, useRef } from 'react';
import { FiSearch, FiBookmark } from 'react-icons/fi';
import {
  getAnnouncementsFeed,
  markAnnouncementRead,
  setAnnouncementReaction,
  acknowledgeAnnouncement,
  getAnnouncementEngagement,
} from '../../utils/counsellorApi';
import { formatAnnouncementDescription } from '../../utils/formatAnnouncementDescription';
import SlideOverPanel from '../../components/Counsellor/SlideOverPanel';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'important', label: 'Important' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'archived', label: 'Archived' },
];

const PRIORITY_BADGE = {
  normal: 'bg-primary-blue-100 text-primary-navy',
  important: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const REACTIONS = [
  { type: 'helpful', label: 'Helpful', emoji: '👍' },
  { type: 'appreciated', label: 'Appreciated', emoji: '❤️' },
  { type: 'great', label: 'Great', emoji: '👏' },
  { type: 'important', label: 'Important', emoji: '🔥' },
];

function relativeTime(dateStr) {
  if (dateStr == null) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sec = Math.floor((now - d) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr !== 1 ? 's' : ''} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day !== 1 ? 's' : ''} ago`;
  return d.toLocaleDateString();
}

function displayName(raw) {
  if (raw == null || String(raw).trim() === '') return 'Unknown';
  const s = String(raw).trim();
  if (s.toLowerCase() === 'counsellor') return 'Unknown';
  return s;
}

function formatSeenAt(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

const REACTION_LABELS = { helpful: '👍 Helpful', appreciated: '❤️ Appreciated', great: '👏 Great', important: '🔥 Important' };

function EngagementDrawerContent({ data, loading }) {
  const [tab, setTab] = useState('viewed');
  const viewedBy = data?.viewedBy ?? [];
  const reactions = data?.reactions ?? { helpful: [], appreciated: [], great: [], important: [] };

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading engagement...</div>;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex gap-2 border-b border-gray-200 pb-3 mb-4">
        <button
          type="button"
          onClick={() => setTab('viewed')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'viewed' ? 'bg-primary-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Viewed By
        </button>
        <button
          type="button"
          onClick={() => setTab('reactions')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'reactions' ? 'bg-primary-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Reactions
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === 'viewed' && (
          <ul className="space-y-2">
            {viewedBy.length === 0 ? (
              <li className="text-sm text-gray-500 py-2">No views yet.</li>
            ) : (
              viewedBy.map((v, i) => (
                <li key={v.counsellorId + (v.readAt || '') + i} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-primary-blue-100 text-primary-navy flex items-center justify-center text-sm font-semibold shrink-0">
                    {(displayName(v.name) || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{displayName(v.name)}</p>
                    <p className="text-xs text-gray-500">Seen at {v.readAt ? formatSeenAt(v.readAt) : '—'}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
        {tab === 'reactions' && (
          <div className="space-y-5">
            {REACTIONS.map((r) => {
              const list = reactions[r.type] ?? [];
              return (
                <div key={r.type}>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">{REACTION_LABELS[r.type]} ({list.length})</h4>
                  {list.length === 0 ? (
                    <p className="text-sm text-gray-500 py-1">No one yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {list.map((u, i) => (
                        <li key={(u.counsellorId || '') + i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                          <div className="w-8 h-8 rounded-full bg-primary-blue-100 text-primary-navy flex items-center justify-center text-sm font-semibold shrink-0">
                            {(displayName(u.name) || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{displayName(u.name)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedCard({
  item,
  onMarkRead,
  onReaction,
  onAcknowledge,
  onEngagementClick,
}) {
  const cardRef = useRef(null);
  const [read, setRead] = useState(!!item.read);
  const [reactionType, setReactionType] = useState(item.reactionType || null);
  const [reactionCounts, setReactionCounts] = useState(item.reactionCounts || { helpful: 0, appreciated: 0, great: 0, important: 0 });
  const [acknowledged, setAcknowledged] = useState(!!item.acknowledged);
  const [viewCount, setViewCount] = useState(item.viewCount ?? 0);
  const markedReadRef = useRef(false);

  useEffect(() => {
    if (read || markedReadRef.current || !onMarkRead) return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (markedReadRef.current) return;
        markedReadRef.current = true;
        onMarkRead(item.id).then(() => {
          setRead(true);
        }).catch(() => { markedReadRef.current = false; });
      },
      { rootMargin: '80px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [item.id, read, onMarkRead]);

  const handleReaction = async (type) => {
    const next = reactionType === type ? null : type;
    setReactionType(next);
    const prevCounts = { ...reactionCounts };
    if (reactionType) prevCounts[reactionType] = Math.max(0, (prevCounts[reactionType] || 0) - 1);
    if (next) prevCounts[next] = (prevCounts[next] || 0) + 1;
    setReactionCounts(prevCounts);
    try {
      const res = await onReaction(item.id, next);
      const payload = res?.data?.data ?? res?.data;
      if (payload?.reactionCounts) setReactionCounts(payload.reactionCounts);
      if (payload?.reactionType !== undefined) setReactionType(payload.reactionType ?? null);
    } catch {
      setReactionType(reactionType);
      setReactionCounts(item.reactionCounts || { helpful: 0, appreciated: 0, great: 0, important: 0 });
    }
  };

  const totalReactions = Object.values(reactionCounts).reduce((s, n) => s + n, 0);

  return (
    <article
      ref={cardRef}
      className={`rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
        !read ? 'bg-primary-blue-50/50 border-primary-blue-100' : 'bg-white border-gray-200'
      }`}
    >
      <div className="p-5">
        {/* Top row: avatar, Admin Team, time, priority, pin */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-9 h-9 rounded-full bg-primary-navy text-white flex items-center justify-center text-sm font-semibold shrink-0">
            AT
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-gray-700">Admin Team</span>
            <span className="text-gray-400 mx-2">·</span>
            <span className="text-xs text-gray-500">{relativeTime(item.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.pinned && (
              <span className="text-gray-400" title="Pinned">
                <FiBookmark className="w-4 h-4" />
              </span>
            )}
            {item.expired && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Expired</span>
            )}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_BADGE[item.priority] || PRIORITY_BADGE.normal}`}>
              {item.priority === 'urgent' ? 'Urgent' : item.priority === 'important' ? 'Important' : 'Normal'}
            </span>
          </div>
        </div>

        {/* Title + unread dot */}
        <div className="mt-3 flex items-start gap-2">
          {!read && (
            <span className="w-2 h-2 rounded-full bg-primary-blue-500 shrink-0 mt-1.5" aria-hidden />
          )}
          <h3 className="text-lg font-bold text-gray-900 leading-snug">{item.title}</h3>
        </div>

        {/* Description */}
        <div
          className="mt-2 prose prose-sm max-w-none text-gray-700 prose-p:leading-relaxed prose-ul:my-2 prose-li:my-0.5 prose-a:text-primary-navy prose-a:underline"
          dangerouslySetInnerHTML={{ __html: formatAnnouncementDescription(item.description) }}
        />

        {/* Reaction bar + counts */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                type="button"
                onClick={() => handleReaction(r.type)}
                title={r.label}
                className={`px-2 py-1 rounded-lg text-sm transition-all ${
                  reactionType === r.type
                    ? 'bg-primary-blue-100 text-primary-navy ring-1 ring-primary-blue-200'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <span className="mr-0.5">{r.emoji}</span>
                <span className="hidden sm:inline">{r.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onEngagementClick(item)}
            className="text-xs text-gray-500 hover:text-primary-navy hover:underline"
          >
            {totalReactions} reaction{totalReactions !== 1 ? 's' : ''} · {viewCount} seen
          </button>
        </div>

        {/* Urgent: I Acknowledge */}
        {item.priority === 'urgent' && !acknowledged && (
          <div className="mt-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  await onAcknowledge(item.id);
                  setAcknowledged(true);
                } catch {}
              }}
              className="px-4 py-2 rounded-lg bg-red-100 text-red-800 text-sm font-medium hover:bg-red-200 transition-colors"
            >
              I Acknowledge
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function AnnouncementsFeed() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 20;

  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await getAnnouncementsFeed({ filter, q: q || undefined, page: pageNum, limit });
      const data = res?.data?.data ?? res?.data;
      const items = Array.isArray(data) ? data : [];
      if (append) setList((prev) => (pageNum === 1 ? items : [...prev, ...items]));
      else setList(items);
      setHasMore(items.length >= limit);
    } catch {
      if (!append) setList([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, q]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchFeed(1, false);
  }, [filter, q]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchFeed(next, true);
  };

  const [engagementOpen, setEngagementOpen] = useState(false);
  const [engagementAnnouncementId, setEngagementAnnouncementId] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [engagementLoading, setEngagementLoading] = useState(false);

  const openEngagement = useCallback((item) => {
    if (!item?.id) return;
    setEngagementAnnouncementId(item.id);
    setEngagementData(null);
    setEngagementOpen(true);
    setEngagementLoading(true);
    getAnnouncementEngagement(item.id)
      .then((res) => {
        const data = res?.data?.data ?? res?.data;
        setEngagementData(data || { viewedBy: [], reactions: { helpful: [], appreciated: [], great: [], important: [] } });
      })
      .catch(() => setEngagementData({ viewedBy: [], reactions: { helpful: [], appreciated: [], great: [], important: [] } }))
      .finally(() => setEngagementLoading(false));
  }, []);

  const handleMarkRead = useCallback((id) => markAnnouncementRead(id), []);
  const handleReaction = useCallback((id, reactionType) => setAnnouncementReaction(id, reactionType), []);
  const handleAcknowledge = useCallback((id) => acknowledgeAnnouncement(id), []);

  const handleSearch = (e) => {
    e.preventDefault();
    setQ(searchInput.trim());
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
          Announcements
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Stay updated with the latest updates and important notices.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form onSubmit={handleSearch} className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or keyword..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </form>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-primary-navy text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">Loading...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No announcements match your filters.</div>
      ) : (
        <div className="space-y-4">
          {list.map((item, index) => (
            <FeedCard
              key={item.id ?? item._id ?? `ann-${index}`}
              item={item}
              onMarkRead={handleMarkRead}
              onReaction={handleReaction}
              onAcknowledge={handleAcknowledge}
              onEngagementClick={openEngagement}
            />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}

      <SlideOverPanel
        title="Who viewed & reacted"
        isOpen={engagementOpen}
        onClose={() => setEngagementOpen(false)}
      >
        <EngagementDrawerContent data={engagementData} loading={engagementLoading} />
      </SlideOverPanel>
    </div>
  );
}
