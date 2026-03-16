import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiUser, FiSettings, FiChevronDown, FiLogOut, FiSearch } from 'react-icons/fi';
import { HiMenu as HiMenuIcon, HiX as HiXIcon } from 'react-icons/hi';
import { useWebinarAuth } from '../../../contexts/WebinarAuthContext';
import { useWebinar } from '../context/WebinarContext';

export default function WebinarTopNav({ sidebarOpen, onSidebarToggle }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user: authUser, logout } = useWebinarAuth();
  const { user: webinarUser } = useWebinar();
  const displayName = webinarUser?.displayName || authUser?.name || 'Trainee';
  const initials = displayName.trim() ? String(displayName).trim().charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/webinar/login', { replace: true });
  };

  const navButtonClass = 'p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:ring-offset-1';

  return (
    <header className="bg-white border-b border-gray-100 shrink-0" role="banner">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-5 lg:px-6 h-14">
        {/* Left: Mobile menu */}
        <div className="flex items-center min-w-0 flex-1">
          <button
            type="button"
            onClick={onSidebarToggle}
            className={`lg:hidden -ml-1 shrink-0 ${navButtonClass}`}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <HiXIcon className="w-5 h-5" /> : <HiMenuIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Center: Search (sm and up) */}
        <div className="hidden sm:flex items-center flex-1 max-w-sm mx-4 min-w-0">
          <label htmlFor="webinar-nav-search" className="sr-only">Search</label>
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden />
            <input
              id="webinar-nav-search"
              type="search"
              placeholder="Search sessions..."
              autoComplete="off"
              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-100 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy/30 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Right: Account dropdown */}
        <nav className="flex items-center shrink-0" aria-label="Account">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:ring-offset-1"
              aria-label="Account menu"
              aria-expanded={profileOpen}
            >
              <div className="w-8 h-8 rounded-full bg-primary-navy flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-medium">{initials}</span>
              </div>
              <div className="hidden md:block text-left min-w-0 max-w-[140px]">
                <p className="text-sm font-medium text-gray-800 truncate leading-tight">{displayName}</p>
              </div>
              <FiChevronDown className="w-4 h-4 text-gray-400 shrink-0 hidden md:block" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg py-1 z-40 shadow-sm border border-gray-100">
                  <div className="px-3 py-2 border-b border-gray-50">
                    <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  </div>
                  <NavLink to="/webinar/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FiUser className="w-4 h-4 text-gray-400 shrink-0" /> My Profile
                  </NavLink>
                  <NavLink to="/webinar/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FiSettings className="w-4 h-4 text-gray-400 shrink-0" /> Settings
                  </NavLink>
                  <div className="border-t border-gray-50 my-1" />
                  <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 text-left">
                    <FiLogOut className="w-4 h-4 text-gray-400 shrink-0" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
