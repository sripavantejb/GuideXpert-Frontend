import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiUser, FiAward, FiSettings, FiLogOut } from 'react-icons/fi';
import { useWebinar } from '../context/WebinarContext';

export default function TopProfileBar() {
  const { user } = useWebinar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!dropdownOpen) return;
    const focusables = panelRef.current?.querySelectorAll(
      'a[href], button:not([disabled])'
    );
    const first = focusables?.[0];
    first?.focus?.();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
      if (e.key === 'Tab' && panelRef.current) {
        const list = Array.from(focusables ?? []);
        const idx = list.indexOf(document.activeElement);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          list[list.length - 1]?.focus?.();
        } else if (!e.shiftKey && idx >= list.length - 1) {
          e.preventDefault();
          list[0]?.focus?.();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownOpen &&
        buttonRef.current &&
        panelRef.current &&
        !buttonRef.current.contains(e.target) &&
        !panelRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const completionPercent = user?.completionPercent ?? 0;
  const ringOffset = 2;
  const circumference = 2 * Math.PI * (18 - ringOffset);
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="flex items-center gap-2">
        {pathname.startsWith('/webinar') && pathname !== '/webinar' && pathname !== '/webinar/' && (
          <span className="text-sm text-gray-500 capitalize">
            {pathname.split('/').filter(Boolean).slice(1).join(' / ')}
          </span>
        )}
      </div>
      <div className="relative flex items-center" ref={buttonRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          aria-label="Profile menu"
        >
          <span className="relative inline-block w-10 h-10 rounded-full overflow-hidden bg-gray-200 ring-2 ring-white shadow">
            <img
              src={user?.avatarUrl ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=webinar'}
              alt=""
              className="w-full h-full object-cover"
            />
            {completionPercent > 0 && completionPercent < 100 && (
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 36 36"
                aria-hidden
              >
                <circle
                  cx="18"
                  cy="18"
                  r={18 - ringOffset}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary-navy/40"
                />
                <circle
                  cx="18"
                  cy="18"
                  r={18 - ringOffset}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary-navy"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
            )}
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"
              aria-hidden
            />
          </span>
          {user?.name && (
            <span className="hidden sm:inline text-sm font-medium text-gray-700 truncate max-w-[120px]">
              {user.name}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <div
            ref={panelRef}
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 top-full mt-2 w-56 py-1 rounded-xl bg-white border border-gray-200 shadow-lg z-50"
          >
            <Link
              to="/webinar/profile"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              <FiUser className="w-4 h-4 text-gray-500 shrink-0" />
              View Profile
            </Link>
            <Link
              to="/webinar/certificates"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              <FiAward className="w-4 h-4 text-gray-500 shrink-0" />
              My Certificates
            </Link>
            <Link
              to="/webinar/settings"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              <FiSettings className="w-4 h-4 text-gray-500 shrink-0" />
              Settings
            </Link>
            <div className="border-t border-gray-100 my-1" />
            <a
              href="#"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                setDropdownOpen(false);
                // Logout placeholder
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              <FiLogOut className="w-4 h-4 text-gray-500 shrink-0" />
              Logout
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
