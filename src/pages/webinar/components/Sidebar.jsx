import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useWebinar } from '../context/WebinarContext';
import {
  FiLayout,
  FiVideo,
  FiTrendingUp,
  FiBook,
  FiSettings,
  FiMessageCircle,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { HiMenu as HiMenuIcon, HiX as HiXIcon } from 'react-icons/hi';

const TRAINING_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FiLayout, to: '/webinar' },
  { id: 'webinar', label: 'Videos', icon: FiVideo, to: '/webinar' },
  { id: 'progress', label: 'Progress', icon: FiTrendingUp, to: '/webinar/progress' },
  { id: 'doubts', label: 'Doubts', icon: FiMessageCircle, to: '/webinar/doubts' },
  { id: 'resources', label: 'Resources', icon: FiBook, to: '/webinar/resources' },
];

const USER_ITEMS = [
  { id: 'profile', label: 'Profile', to: '/webinar/profile' },
  { id: 'settings', label: 'Settings', icon: FiSettings, to: '/webinar/settings' },
];

export default function Sidebar({
  open,
  onOpenChange,
  doubtsCount = 0,
}) {
  const { sidebarExpanded: expanded, setSidebarExpanded: setExpanded, user } = useWebinar();
  const [internalOpen, setInternalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const sidebarOpen = typeof open === 'boolean' ? open : internalOpen;
  const setSidebarOpen = typeof onOpenChange === 'function' ? onOpenChange : setInternalOpen;

  const width = expanded ? 'w-[240px]' : 'w-[72px]';

  const linkBase =
    'flex items-center gap-3 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 border-l-[3px] border-transparent transition-colors duration-200';
  const linkCollapsed = 'justify-center px-0 py-0 w-12 h-12 min-w-[48px] hover:scale-105';
  const linkExpanded = 'justify-start px-3 py-2.5 w-full';
  const activeClass =
    'bg-primary-navy/10 text-primary-navy border-primary-navy font-medium';
  const inactiveClass = 'text-gray-600 hover:bg-gray-200/80 hover:text-gray-900';

  const renderItem = (item, showBadge = false) => (
    <NavLink
      key={item.id}
      to={item.to}
      end={item.to === '/webinar'}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `${linkBase} ${expanded ? linkExpanded : linkCollapsed} ${
          isActive ? activeClass : inactiveClass
        }`
      }
      title={!expanded ? item.label : undefined}
      aria-label={item.label}
    >
      <span className="relative flex shrink-0 items-center justify-center w-6 h-6">
        <item.icon className="w-5 h-5" />
        {showBadge && doubtsCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary-navy text-white text-[10px] font-semibold flex items-center justify-center">
            {doubtsCount > 99 ? '99+' : doubtsCount}
          </span>
        )}
      </span>
      {expanded && <span className="truncate text-sm">{item.label}</span>}
    </NavLink>
  );

  const profileItem = USER_ITEMS.find((i) => i.id === 'profile');
  const showAvatar = user?.avatarUrl && !avatarError;
  const initials = user?.name ? String(user.name).trim().charAt(0).toUpperCase() : '?';

  const renderProfileItem = () => (
    <NavLink
      key="profile"
      to={profileItem.to}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `${linkBase} ${expanded ? linkExpanded : linkCollapsed} ${
          isActive ? activeClass : inactiveClass
        }`
      }
      title={!expanded ? 'Profile' : undefined}
      aria-label="Profile"
    >
      <span className={`relative flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-gray-300 text-gray-600 text-sm font-medium ${expanded ? 'w-8 h-8 min-w-[32px] min-h-[32px]' : 'w-9 h-9 min-w-[36px] min-h-[36px]'}`}>
        {showAvatar ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          initials
        )}
      </span>
      {expanded && <span className="truncate text-sm">Profile</span>}
    </NavLink>
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-200"
        aria-hidden={!sidebarOpen}
        style={{
          visibility: sidebarOpen ? 'visible' : 'hidden',
          opacity: sidebarOpen ? 1 : 0,
        }}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col max-w-[85vw] lg:max-w-none
          bg-white border-r border-gray-200/80
          transform transition-[transform,width] duration-200 ease-out
          lg:transform-none
          ${width}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between shrink-0 h-14 px-3 border-b border-gray-100">
          {expanded && <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Menu</span>}
          <div className="flex items-center gap-1 ml-auto">
            {/* On mobile: only close (X). On desktop: collapse chevron. Prevents two close options and overflow. */}
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50"
              aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <FiChevronLeft className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
              aria-label="Close menu"
            >
              <HiXIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 flex flex-col min-h-0 overflow-y-auto py-2">
          {/* Main nav: Dashboard, Videos, Progress, Doubts, Resources — centered in the middle */}
          <div className="flex-1 flex flex-col justify-center min-h-0 py-6 px-2">
            {expanded && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-2">
                Training
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {TRAINING_ITEMS.map((item) => renderItem(item, item.id === 'doubts'))}
            </div>
          </div>
          {/* Profile & Settings — pinned to bottom */}
          <div className="shrink-0 px-2 pt-4 pb-6 border-t border-gray-100">
            {expanded && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-2">
                Account
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {USER_ITEMS.map((item) =>
                item.id === 'profile' ? renderProfileItem() : renderItem(item)
              )}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
