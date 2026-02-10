import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiLayout, FiUsers, FiUserCheck, FiBarChart2, FiDownload, FiSettings, FiCalendar, FiVideo, FiLink, FiAward } from 'react-icons/fi';
import { HiMenu as HiMenuIcon, HiX as HiXIcon } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: FiLayout },
  { to: '/admin/leads', label: 'Leads', icon: FiUsers },
  { to: '/admin/lead-status', label: 'Lead Status', icon: FiUserCheck },
  { to: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/admin/slots', label: 'Slots', icon: FiCalendar },
  { to: '/admin/export', label: 'Export', icon: FiDownload },
  { to: '/admin/meeting-attendance', label: 'Meeting Attendance', icon: FiVideo },
  { to: '/admin/influencer-tracking', label: 'Influencer Tracking', icon: FiLink },
  { to: '/admin/assessment-results', label: 'Assessment Results', icon: FiAward },
  { to: '/admin/assessment-2-results', label: 'Assessment 2 Results', icon: FiAward },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gray-50 flex">
      {/* Sidebar overlay (mobile) */}
      <div
        className="fixed inset-0 bg-black/30 z-20 lg:hidden"
        aria-hidden={!sidebarOpen}
        style={{ visibility: sidebarOpen ? 'visible' : 'hidden', opacity: sidebarOpen ? 1 : 0 }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-200 ease-out
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-gray-200">
          <span className="text-lg font-bold" style={{ color: '#003366' }}>
            GuideXpert Admin
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-blue-100 text-primary-navy border-l-2 border-primary-navy'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 lg:ml-64">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <HiXIcon className="w-6 h-6" /> : <HiMenuIcon className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-semibold text-gray-800 hidden lg:block">GuideXpert Admin</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.username}</span>
            <button
              type="button"
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="grow p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
