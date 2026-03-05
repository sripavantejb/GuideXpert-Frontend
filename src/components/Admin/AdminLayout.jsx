import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiLayout, FiUsers, FiBarChart2, FiDownload, FiSettings, FiCalendar, FiVideo, FiFileText, FiBell, FiLink } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { AdminDashboardProvider, useAdminDateRange } from '../../contexts/AdminDashboardContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiLayout },
  { to: '/admin/leads', label: 'Lead Funnel', icon: FiUsers },
  { to: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/admin/meeting-attendance', label: 'User Productivity', icon: FiVideo },
  { to: '/admin/export', label: 'Export Data', icon: FiDownload },
  { to: '/admin/slots', label: 'Slots', icon: FiCalendar },
  { to: '/admin/influencer-tracking', label: 'Influencer / UTM Tracking', icon: FiLink },
  { to: '/admin/assessment-results', label: 'Custom Reports', icon: FiFileText },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = (user?.username || 'A').slice(0, 2).toUpperCase();

  return (
    <div className="counsellor-portal min-h-screen h-screen overflow-hidden bg-gray-50 flex">
      {/* Sidebar overlay (mobile) */}
      <div
        className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-200"
        aria-hidden={!sidebarOpen}
        style={{ visibility: sidebarOpen ? 'visible' : 'hidden', opacity: sidebarOpen ? 1 : 0 }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — theme sidebar-blue (same as counsellor portal), white icons and text, active highlight */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-[280px] flex flex-col bg-sidebar-blue
          transform transition-transform duration-200 ease-out
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ boxShadow: '1px 0 0 0 rgba(255,255,255,0.04), 8px 0 32px rgba(0,0,0,0.16)' }}
      >
        {/* Brand block */}
        <Link
          to="/"
          className="flex w-full flex-col items-start justify-center py-5 border-b border-white/10 hover:bg-white/10 transition-colors duration-200"
          aria-label="GuideXpert Home"
        >
          <div className="w-full flex flex-col items-center justify-center py-3 px-4 gap-1.5">
            <img
              src="https://res.cloudinary.com/dqataciy5/image/upload/v1769258985/Gemini_Generated_Image_ybdgvrybdgvrybdg_fgmdnj.png"
              alt="GuideXpert"
              className="h-8 w-auto object-contain"
            />
            <p className="text-[0.5625rem] font-semibold text-white/70 uppercase tracking-wider text-center leading-tight">
              GuideXpert Admin
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 flex flex-col gap-6 px-3">
          <div>
            <p className="px-3 mb-2 text-[0.6875rem] font-semibold text-white/50 uppercase tracking-wider">Menu</p>
            <div className="space-y-0.5">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin/dashboard'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.8125rem] font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-navy/90 text-white shadow-[inset_3px_0_0_0_#4d8ec7]'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-[1.125rem] h-[1.125rem] shrink-0 opacity-90" aria-hidden />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Profile footer */}
        <div className="p-3 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10">
            <div className="w-9 h-9 rounded-full bg-primary-blue-400 flex items-center justify-center shrink-0 ring-2 ring-white/20">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.username || 'Admin'}</p>
              <p className="text-[0.6875rem] text-white/60 font-medium">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 lg:ml-[280px]">
        <AdminDashboardProvider>
          <AdminHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            initials={initials}
            username={user?.username}
          />
          <main className="grow p-4 lg:p-6 overflow-auto scrollbar-hide bg-gray-50">
            <Outlet />
          </main>
        </AdminDashboardProvider>
      </div>
    </div>
  );
}

function AdminHeader({ sidebarOpen, setSidebarOpen, initials, username }) {
  const { dateRange, setFrom, setTo, applyPreset } = useAdminDateRange();

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
        </button>
        <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">
          Sales Analytics Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="admin-date-from" className="sr-only">From date</label>
          <input
            id="admin-date-from"
            type="date"
            value={dateRange.from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 text-sm text-gray-700 focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
          />
          <span className="text-gray-400 hidden sm:inline">–</span>
          <label htmlFor="admin-date-to" className="sr-only">To date</label>
          <input
            id="admin-date-to"
            type="date"
            value={dateRange.to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 text-sm text-gray-700 focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
          />
          <span className="text-gray-300 hidden md:inline" aria-hidden>|</span>
          <div className="hidden sm:flex items-center gap-1" role="group" aria-label="Date range presets">
            <button type="button" onClick={() => applyPreset('7d')} className="h-9 px-2.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">7d</button>
            <button type="button" onClick={() => applyPreset('30d')} className="h-9 px-2.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">30d</button>
            <button type="button" onClick={() => applyPreset('month')} className="h-9 px-2.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">Month</button>
          </div>
        </div>
        <Link
          to="/admin/export"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiDownload className="w-4 h-4" aria-hidden />
          Export
        </Link>
        <button
          type="button"
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <FiBell className="w-5 h-5" aria-hidden />
        </button>
        <div className="flex items-center gap-2 pl-1 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-primary-navy flex items-center justify-center shrink-0 ring-2 ring-gray-100">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px] hidden sm:block">
            {username || 'Admin'}
          </p>
        </div>
      </div>
    </header>
  );
}
