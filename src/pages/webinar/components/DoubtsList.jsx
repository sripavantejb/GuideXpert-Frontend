import { useState, useMemo } from 'react';
import {
  FiChevronDown,
  FiChevronRight,
  FiThumbsUp,
  FiMessageCircle,
} from 'react-icons/fi';
import { getSessionById } from '../data/mockWebinarData';
import { normalizeDoubt } from '../utils/doubtHelpers';

function formatRelativeTime(ts) {
  if (!ts) return 'Earlier';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
  return d.toLocaleDateString();
}

const STATUS_CONFIG = {
  answered: {
    label: 'Answered',
    badge: 'bg-green-100 text-green-800 border-green-200',
    border: 'border-l-green-500',
  },
  under_review: {
    label: 'Under Review',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    border: 'border-l-amber-500',
  },
  pending: {
    label: 'Pending',
    badge: 'bg-red-100 text-red-800 border-red-200',
    border: 'border-l-red-500',
  },
};

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'upvoted', label: 'Most Upvoted' },
];

export default function DoubtsList({
  doubts: rawDoubts,
  onDoubtsChange,
  showFilters = true,
  showSearch = true,
  showSort = false,
  emptyMessage = 'No doubts yet.',
  emptySubmessage = 'Ask your first question above.',
}) {
  const doubts = useMemo(() => rawDoubts.map(normalizeDoubt).filter(Boolean), [rawDoubts]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [expandedId, setExpandedId] = useState(null);

  const counts = useMemo(() => {
    return {
      all: doubts.length,
      pending: doubts.filter((d) => d.status === 'pending').length,
      under_review: doubts.filter((d) => d.status === 'under_review').length,
      answered: doubts.filter((d) => d.status === 'answered').length,
    };
  }, [doubts]);

  const filtered = useMemo(() => {
    let list = doubts;
    if (filter !== 'all') list = list.filter((d) => d.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (d) =>
          (d.title && d.title.toLowerCase().includes(q)) ||
          (d.description && String(d.description).toLowerCase().includes(q))
      );
    }
    if (sort === 'oldest') list = [...list].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    else if (sort === 'upvoted') list = [...list].sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));
    else list = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return list;
  }, [doubts, filter, search, sort]);

  const handleMarkResolved = (id) => {
    onDoubtsChange(
      doubts.map((d) =>
        d.id === id ? { ...d, status: 'answered', answer: d.answer || 'Marked as resolved.', answeredAt: Date.now() } : d
      )
    );
  };

  const handleUpvote = (id) => {
    onDoubtsChange(
      doubts.map((d) => (d.id === id ? { ...d, upvotes: (d.upvotes ?? 0) + 1 } : d))
    );
  };

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'answered', label: 'Answered' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Filters + search + sort row */}
      {(showFilters || showSearch || showSort) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {filterTabs.map(({ key, label }) => {
                const count = counts[key] ?? 0;
                const active = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 ${
                      active
                        ? 'bg-primary-navy text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                    {count > 0 && (
                      <span className={`ml-1.5 ${active ? 'text-white/90' : 'text-gray-500'}`}>
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {showSearch && (
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="flex-1 min-w-0 max-w-full sm:max-w-[500px] px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy bg-white"
              aria-label="Search doubts"
            />
          )}
          {showSort && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full sm:w-auto min-h-[44px] px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy bg-white text-gray-700"
              aria-label="Sort doubts"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-[20px] bg-gray-50 border border-gray-200 py-12 px-4 text-center">
          <FiMessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" aria-hidden />
          <p className="text-sm font-medium text-gray-700">{emptyMessage}</p>
          {emptySubmessage && (
            <p className="text-xs text-gray-500 mt-1">{emptySubmessage}</p>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((d) => {
            const session = d.sessionId ? getSessionById(d.sessionId) : null;
            const isExpanded = expandedId === d.id;
            const hasAnswer = d.status === 'answered' && d.answer;
            const statusConf = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.pending;
            const preview = (d.description || '').replace(/\s+/g, ' ').trim().slice(0, 80);
            const upvotes = d.upvotes ?? 0;

            return (
              <li
                key={d.id}
                id={`doubt-${d.id}`}
                className={`rounded-[20px] border border-gray-200 bg-white shadow-card overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 border-l-4 ${statusConf.border}`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    {/* Left: avatar, title, preview, meta */}
                    <div className="flex gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-navy/10 text-primary-navy text-sm font-bold flex items-center justify-center">
                        Q
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-gray-900 leading-snug truncate">
                          {d.title}
                        </p>
                        {preview && (
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                            {preview}
                            {(d.description || '').trim().length > 80 ? '…' : ''}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2 text-xs text-gray-500">
                          {session && (
                            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-gray-600 truncate max-w-[180px] sm:max-w-none">
                              {session.title}
                            </span>
                          )}
                          <span>{formatRelativeTime(d.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Right: status, upvote, expand */}
                    <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${statusConf.badge}`}
                      >
                        {statusConf.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpvote(d.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-navy transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 rounded p-1"
                        aria-label={`Upvote (${upvotes})`}
                        title="Upvote"
                      >
                        <FiThumbsUp className="w-4 h-4" />
                        <span className="font-medium">{upvotes}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : d.id)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? (
                          <FiChevronDown className="w-5 h-5" />
                        ) : (
                          <FiChevronRight className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable answer panel */}
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="px-4 pb-5 pt-0 pl-14 border-t border-gray-100 bg-gray-50/70">
                      {d.description && (
                        <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                          {d.description}
                        </p>
                      )}
                      {hasAnswer && (
                        <div className="rounded-xl bg-white border border-gray-100 p-4 mt-4 shadow-sm">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Answer
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {d.answer}
                          </p>
                          {d.answeredAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              {formatRelativeTime(d.answeredAt)}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        {d.status !== 'answered' && (
                          <button
                            type="button"
                            onClick={() => handleMarkResolved(d.id)}
                            className="text-sm font-medium text-primary-navy hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 rounded"
                          >
                            Mark as resolved
                          </button>
                        )}
                        {d.attachment && (
                          <span className="text-xs text-gray-500">
                            Attachment: {d.attachment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
