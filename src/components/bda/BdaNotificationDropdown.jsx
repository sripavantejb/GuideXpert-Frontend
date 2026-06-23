import { useEffect, useRef } from 'react';
import { FiBell, FiArrowDownLeft, FiArrowUpRight, FiUserPlus } from 'react-icons/fi';
import ListSkeleton from '../UI/ListSkeleton';

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
  return d.toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

function typeIcon(type) {
  if (type === 'lead_assigned') return FiUserPlus;
  if (type === 'lead_reassigned_in') return FiArrowDownLeft;
  if (type === 'lead_reassigned_out') return FiArrowUpRight;
  return FiBell;
}

function typeColor(type) {
  if (type === 'lead_assigned') return 'text-green-600 bg-green-50';
  if (type === 'lead_reassigned_in') return 'text-primary-blue bg-primary-blue-50';
  if (type === 'lead_reassigned_out') return 'text-orange-600 bg-orange-50';
  return 'text-gray-600 bg-gray-50';
}

export default function BdaNotificationDropdown({
  isOpen,
  onClose,
  notifications = [],
  loading,
  onMarkAllRead,
  onItemClick,
  unreadCount,
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

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
        onClick={onClose}
        aria-label="Close notifications"
      />
      <div
        ref={panelRef}
        className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden flex flex-col"
        style={{ width: 360, maxHeight: 420 }}
      >
        <div className="px-4 py-3 border-b border-gray-100 shrink-0 bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-medium text-primary-blue hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="p-4">
              <ListSkeleton rows={4} avatar={true} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <FiBell className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">No notifications</p>
              <p className="text-xs text-gray-500 mt-1">
                You will be notified when leads are assigned or reassigned.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((item) => {
                const Icon = typeIcon(item.type);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onItemClick(item)}
                      className={`w-full flex gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        !item.isRead ? 'bg-primary-blue-50/40' : ''
                      }`}
                    >
                      <div
                        className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${typeColor(item.type)}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900 leading-snug">{item.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{relativeTime(item.createdAt)}</p>
                      </div>
                      {!item.isRead && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-primary-blue mt-1.5" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
