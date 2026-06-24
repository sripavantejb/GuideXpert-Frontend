import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut } from 'react-icons/fi';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useBdaAuth } from '../../contexts/BdaAuthContext';
import { languageBadgeClass } from '../../constants/bdaLanguage';
import {
  getBdaNotifications,
  markBdaNotificationsRead,
} from '../../utils/bdaApi';
import { showBdaNotificationToast } from '../../utils/bdaNotificationToast';
import BdaNotificationDropdown from './BdaNotificationDropdown';

const POLL_MS = 15000;

/** Module-level so dev StrictMode remount does not re-toast existing items. */
const seenNotificationIds = new Set();
let hasSeededNotifications = false;

export default function BdaLayout({ children, onLeadClick }) {
  const { user, logout } = useBdaAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const onLeadClickRef = useRef(onLeadClick);

  useEffect(() => {
    onLeadClickRef.current = onLeadClick;
  }, [onLeadClick]);

  const fetchNotifications = useCallback(async ({ showToasts = true } = {}) => {
    const res = await getBdaNotifications({ page: 1, limit: 20 });
    if (res.success) {
      const items = res.data || [];

      if (!hasSeededNotifications) {
        items.forEach((item) => seenNotificationIds.add(item.id));
        hasSeededNotifications = true;
      } else if (showToasts) {
        const sortedNew = [...items]
          .filter((item) => !seenNotificationIds.has(item.id))
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        sortedNew.forEach((item) => {
          seenNotificationIds.add(item.id);
          if (!item.isRead) {
            showBdaNotificationToast(item, {
              onLeadClick: (...args) => onLeadClickRef.current?.(...args),
            });
          }
        });
      }

      setNotifications(items);
      setUnreadCount(res.unreadCount ?? 0);
    }
    return res;
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenNotifications = async () => {
    setNotificationsOpen(true);
    setNotificationsLoading(true);
    await fetchNotifications();
    setNotificationsLoading(false);
  };

  const handleMarkAllRead = async () => {
    const res = await markBdaNotificationsRead({ all: true });
    if (res.success) {
      await fetchNotifications();
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.isRead) {
      await markBdaNotificationsRead({ ids: [item.id] });
      await fetchNotifications();
    }
    setNotificationsOpen(false);
    if (
      item.leadId
      && onLeadClick
      && item.type !== 'lead_reassigned_out'
    ) {
      onLeadClick(item.leadId, item.leadType || 'iit_counselling');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/bda/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={8000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        limit={4}
        className="bda-toast-container"
      />
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">BDA Dashboard</h1>
            <p className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
              <span>{user?.name || 'BDA'}</span>
              {user?.language && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${languageBadgeClass(user.language)}`}
                >
                  {user.language} leads only
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => (notificationsOpen ? setNotificationsOpen(false) : handleOpenNotifications())}
                className="relative p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                aria-label="Notifications"
              >
                <FiBell className="w-5 h-5 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <BdaNotificationDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                notifications={notifications}
                loading={notificationsLoading}
                unreadCount={unreadCount}
                onMarkAllRead={handleMarkAllRead}
                onItemClick={handleNotificationClick}
              />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
