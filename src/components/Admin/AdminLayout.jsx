import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { FiLayout, FiUsers, FiUserCheck, FiBarChart2, FiDownload, FiSettings, FiCalendar, FiVideo, FiLink, FiAward, FiMessageSquare, FiRadio } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: FiLayout },
  { to: '/admin/leads', label: 'Leads', icon: FiUsers },
  { to: '/admin/lead-status', label: 'Lead Status', icon: FiUserCheck },
  { to: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/admin/slots', label: 'Slots', icon: FiCalendar },
  { to: '/admin/export', label: 'Export', icon: FiDownload },
  { to: '/admin/meeting-attendance', label: 'Meeting Attendance', icon: FiVideo },
  { to: '/admin/training-feedback', label: 'Activation Form Results', icon: FiMessageSquare },
  { to: '/admin/influencer-tracking', label: 'Influencer Tracking', icon: FiLink },
  { to: '/admin/assessment-results', label: 'Assessment Results', icon: FiAward },
  { to: '/admin/assessment-2-results', label: 'Assessment 2 Results', icon: FiAward },
  { to: '/admin/assessment-3-results', label: 'Assessment 3 Results', icon: FiAward },
  { to: '/admin/announcements', label: 'Announcements', icon: FiRadio },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = (user?.username || 'A').slice(0, 2).toUpperCase();

  return (
    <div className="counsellor-portal min-h-screen h-screen overflow-hidden bg-[#f1f5f9] flex">
      {/* Sidebar overlay (mobile) */}
      <div
        className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-200"
        aria-hidden={!sidebarOpen}
        style={{ visibility: sidebarOpen ? 'visible' : 'hidden', opacity: sidebarOpen ? 1 : 0 }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — dark theme to match counsellor dashboard */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-[280px] flex flex-col
          transform transition-transform duration-200 ease-out
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: '#041e30',
          boxShadow: '1px 0 0 0 rgba(255,255,255,0.04), 8px 0 32px rgba(0,0,0,0.16)',
        }}
      >
        {/* Brand block */}
        <Link
          to="/"
          className="flex w-full flex-col items-start justify-center py-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200"
          aria-label="GuideXpert Home"
        >
          <div className="w-full flex flex-col items-center justify-center py-3 px-4 gap-1.5">
            <img
              src="https://res.cloudinary.com/dqataciy5/image/upload/v1769258985/Gemini_Generated_Image_ybdgvrybdgvrybdg_fgmdnj.png"
              alt="GuideXpert"
              className="h-8 w-auto object-contain"
            />
            <p className="text-[0.5625rem] font-semibold text-slate-400 uppercase tracking-wider text-center leading-tight">
              GuideXpert Admin
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 flex flex-col gap-6 px-3">
          <div>
            <p className="px-3 mb-2 text-[0.6875rem] font-semibold text-slate-500 uppercase tracking-wider">Admin</p>
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
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-[1.125rem] h-[1.125rem] shrink-0 opacity-90" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Profile footer */}
        <div className="p-3 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
            <div className="w-9 h-9 rounded-full bg-primary-navy flex items-center justify-center shrink-0 ring-2 ring-white/10">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.username || 'Admin'}</p>
              <p className="text-[0.6875rem] text-slate-500 font-medium">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 lg:ml-[280px]">
        <main className="grow p-4 lg:p-6 overflow-auto scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
