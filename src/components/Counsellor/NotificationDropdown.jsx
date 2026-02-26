import { useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';

const PRIORITY_BAR = {
  normal: 'bg-primary-blue-500',
  important: 'bg-orange-500',
  urgent: 'bg-red-500',
};

function relativeTime(dateStr) {
  const d = new Date(dateStr);
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

export default function NotificationDropdown({
  isOpen,
  onClose,
  announcements = [],
  loading,
  filter,
  onFilterChange,
  onMarkAllRead,
  onItemClick,
  unreadCount,
  isMobile,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const filtered =
    filter === 'unread'
      ? announcements.filter((a) => !a.read)
      : filter === 'important'
        ? announcements.filter((a) => a.priority === 'important' || a.priority === 'urgent')
        : announcements;

  if (!isOpen) return null;

  const content = (
    <div
      ref={panelRef}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col"
      style={{
        width: isMobile ? '100%' : 380,
        maxHeight: isMobile ? '85vh' : 400,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-medium text-primary-navy hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          {['all', 'unread', 'important'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-primary-blue-100 text-primary-navy'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <FiBell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">No announcements available</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {filter !== 'all' ? 'Try "All" to see past announcements.' : 'Check back later for updates.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onItemClick(item)}
                  className="w-full flex gap-3 px-4 py-3 text-left hover:bg-primary-blue-50/50 transition-colors focus:outline-none focus:ring-0"
                >
                  <div
                    className={`shrink-0 w-1 rounded-full ${PRIORITY_BAR[item.priority] || PRIORITY_BAR.normal}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className={`font-semibold text-gray-900 truncate ${item.read ? 'opacity-90' : ''}`}>
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-primary-blue-500 mt-1.5" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">{item.preview || '—'}</p>
                    <p className="mt-1 text-xs text-gray-500">{relativeTime(item.createdAt)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/30" aria-hidden onClick={onClose} />
        <div className="fixed inset-x-0 top-0 z-50 p-4 pt-12 max-h-[85vh] overflow-hidden flex flex-col">
          {content}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-30" aria-hidden onClick={onClose} />
      <div className="absolute right-0 top-full mt-1.5 z-40 transition-opacity duration-200">
        {content}
      </div>
    </>
  );
}
