import { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useWebinar } from '../context/WebinarContext';
import { FiSettings, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import { HiX as HiXIcon } from 'react-icons/hi';
import { SessionCard } from './SessionList';
import { SESSIONS, getSessionsByDay } from '../data/mockWebinarData';

const USER_ITEMS = [
  { id: 'profile', label: 'Profile', to: '/webinar/profile' },
  { id: 'settings', label: 'Settings', icon: FiSettings, to: '/webinar/settings' },
];

export default function Sidebar({
  open,
  onOpenChange,
}) {
  const navigate = useNavigate();
  const {
    sidebarExpanded: expanded,
    setSidebarExpanded: setExpanded,
    user,
    completedSessions,
    activeSessionId,
    setActiveSessionId,
  } = useWebinar();
  const [internalOpen, setInternalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const sidebarOpen = typeof open === 'boolean' ? open : internalOpen;

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery) return SESSIONS;
    return SESSIONS.filter((s) => s.title.toLowerCase().includes(searchQuery));
  }, [searchQuery]);
  const setSidebarOpen = typeof onOpenChange === 'function' ? onOpenChange : setInternalOpen;

  const width = expanded ? 'w-[280px] lg:w-[30vw]' : 'w-[72px]';

  const isDayUnlocked = useCallback(
    (dayId) => {
      if (dayId === 1) return true;
      const prevDaySessions = getSessionsByDay(dayId - 1);
      const prevDayIds = prevDaySessions.map((s) => s.id);
      return prevDayIds.every((id) => completedSessions.includes(id));
    },
    [completedSessions]
  );

  const handleSelectSession = useCallback(
    (sessionId) => {
      setActiveSessionId(sessionId);
      setSidebarOpen(false);
      navigate('/webinar');
    },
    [setActiveSessionId, setSidebarOpen, navigate]
  );

  const linkBase =
    'flex items-center gap-3 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#041e30] border-l-[3px] border-transparent transition-colors duration-200';
  const linkCollapsed = 'justify-center px-0 py-0 w-12 h-12 min-w-[48px] hover:scale-105';
  const linkExpanded = 'justify-start px-3 py-2.5 w-full';
  const activeClass =
    'bg-primary-navy/90 text-white border-primary-blue-400 font-medium shadow-[inset_3px_0_0_0_#4d8ec7]';
  const inactiveClass = 'text-slate-400 hover:bg-white/5 hover:text-slate-200';

  const renderItem = (item) => (
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
      <span className={`relative flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-white/20 text-slate-200 text-sm font-medium ${expanded ? 'w-8 h-8 min-w-[32px] min-h-[32px]' : 'w-9 h-9 min-w-[36px] min-h-[36px]'}`}>
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
          bg-sidebar-blue border-r border-white/10
          transform transition-[transform,width] duration-200 ease-out
          lg:transform-none
          ${width}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ boxShadow: '1px 0 0 0 rgba(255,255,255,0.04), 8px 0 32px rgba(0,0,0,0.16)' }}
      >
        <div className="flex items-center justify-between shrink-0 px-3 py-3.5 border-b border-white/10">
          <div className={`flex items-center min-w-0 shrink-0 ${expanded ? 'gap-2' : 'flex-1 justify-center min-w-0 overflow-hidden'}`}>
            <Link
              to="/webinar"
              className={`flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 rounded ${expanded ? 'shrink-0' : 'min-w-0 overflow-hidden justify-center max-w-[56px]'}`}
              aria-label="GuideXpert Webinar"
            >
              <img
                src="https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png"
                alt="GuideXpert"
                className={expanded ? 'h-9 w-auto max-w-[140px] object-contain' : 'h-8 w-full max-w-[56px] object-contain object-left'}
              />
            </Link>
            {expanded && (
              <div className="flex flex-col min-w-0 hidden lg:block">
                <span className="text-[11px] font-semibold text-white/95 uppercase tracking-[0.05em]">
                  All sessions ({SESSIONS.length})
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {completedSessions.length} completed
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-blue"
              aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <FiChevronLeft className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-blue"
              aria-label="Close menu"
            >
              <HiXIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {expanded ? (
            <>
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="shrink-0 px-3 pt-3 pb-2">
                  <label htmlFor="sidebar-search" className="sr-only">Search sessions</label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden />
                    <input
                      id="sidebar-search"
                      type="search"
                      placeholder="Search sessions..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/20 bg-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-400/50 focus:border-primary-blue-400/40 focus:bg-white/12 transition-colors"
                      aria-label="Search sessions"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 py-1 px-3 pb-3 space-y-2.5">
                  {filteredSessions.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No sessions match your search.</p>
                  ) : (
                  filteredSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isActive={activeSessionId === session.id}
                      isCompleted={completedSessions.includes(session.id)}
                      progress={
                        activeSessionId === session.id && !completedSessions.includes(session.id)
                          ? 1
                          : 0
                      }
                      isLocked={!isDayUnlocked(session.dayId)}
                      onClick={handleSelectSession}
                      darkVariant
                    />
                  ))
                  )}
                </div>
              </div>

              <div className="shrink-0 px-3 border-t border-white/10 pt-3 pb-4">
                <div className="flex flex-col gap-1">
                  {USER_ITEMS.map((item) =>
                    item.id === 'profile' ? renderProfileItem() : renderItem(item)
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center min-h-0 py-4 px-3">
              <div className="mt-auto shrink-0 pt-4 border-t border-white/10">
                <div className="flex flex-col gap-1">
                  {USER_ITEMS.map((item) =>
                    item.id === 'profile' ? renderProfileItem() : renderItem(item)
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
