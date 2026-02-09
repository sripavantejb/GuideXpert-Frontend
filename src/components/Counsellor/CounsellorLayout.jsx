import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCounsellorAuth } from '../../contexts/CounsellorAuthContext';
import {
  FiLayout,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiTool,
  FiBarChart2,
  FiFolder,
  FiTrendingUp,
  FiSettings,
  FiBell,
  FiHelpCircle,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiSearch,
} from 'react-icons/fi';
import { HiMenu as HiMenuIcon, HiX as HiXIcon } from 'react-icons/hi';

const primaryNav = [
  { to: '/counsellor/dashboard', label: 'Dashboard', icon: FiLayout },
  { to: '/counsellor/students', label: 'Students', icon: FiUsers },
  { to: '/counsellor/admissions', label: 'Admissions', icon: FiBookOpen },
  { to: '/counsellor/sessions', label: 'Sessions', icon: FiCalendar },
];
const secondaryNav = [
  { to: '/counsellor/tools', label: 'Tools', icon: FiTool },
  { to: '/counsellor/reports', label: 'Reports', icon: FiBarChart2 },
  { to: '/counsellor/resources', label: 'Resources', icon: FiFolder },
  { to: '/counsellor/marketing', label: 'Marketing', icon: FiTrendingUp },
];
const settingsNav = [{ to: '/counsellor/settings', label: 'Settings', icon: FiSettings }];

const pageMeta = {
  '/counsellor/dashboard': { title: 'Dashboard', subtitle: 'Overview of your counseling practice' },
  '/counsellor/students': { title: 'Students', subtitle: 'Manage student profiles and documents' },
  '/counsellor/admissions': { title: 'Admissions', subtitle: 'Track college applications and deadlines' },
  '/counsellor/sessions': { title: 'Sessions', subtitle: 'Schedule and manage counseling sessions' },
  '/counsellor/tools': { title: 'Tools', subtitle: 'Assessment and prediction tools' },
  '/counsellor/reports': { title: 'Reports', subtitle: 'Performance and analytics reports' },
  '/counsellor/resources': { title: 'Resources', subtitle: 'PDFs, videos, notes and templates' },
  '/counsellor/marketing': { title: 'Marketing', subtitle: 'Reach more students and grow your practice' },
  '/counsellor/settings': { title: 'Settings', subtitle: 'Manage your account and preferences' },
};

export default function CounsellorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useCounsellorAuth();
  const displayName = user?.name || 'Counsellor';
  const displayEmail = user?.email || '';
  const initials = displayName.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'C';

  const currentPage = pageMeta[location.pathname] || { title: 'Counsellor Portal', subtitle: '' };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/counsellor/login', { replace: true });
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-[#f1f5f9] flex">
      {/* Sidebar overlay (mobile) */}
      <div
        className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-200"
        aria-hidden={!sidebarOpen}
        style={{ visibility: sidebarOpen ? 'visible' : 'hidden', opacity: sidebarOpen ? 1 : 0 }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar — Premium Command Panel ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-[272px] flex flex-col
          transform transition-transform duration-200 ease-out
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #0b1220 50%, #070d18 100%)',
          boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.03), 4px 0 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Sidebar Header / Logo */}
        <Link
          to="/"
          className="px-5 py-5 flex items-center gap-3.5 border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors duration-150"
        >
          <div
            className="w-11 h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 p-1.5"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <img
              src="https://res.cloudinary.com/dqataciy5/image/upload/v1769173121/guidexpert-logo-3Ifn2ZP2_ljlxlc.png"
              alt="GuideXpert"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div>
            <span className="text-white font-bold text-[0.9375rem] tracking-tight block leading-snug">GuideXpert</span>
            <span className="text-slate-500 text-[0.6875rem] font-medium opacity-90">Counsellor Portal</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto flex flex-col gap-5">
          {/* Primary */}
          <div className="space-y-1">
            {primaryNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/counsellor/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-2 px-3.5 py-3 rounded-xl text-[0.8125rem] font-medium leading-relaxed transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1d4ed8] text-white'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        boxShadow: '0 2px 8px rgba(29,78,216,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                      }
                    : {}
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
          {/* Secondary */}
          <div className="space-y-1">
            {secondaryNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-2 px-3.5 py-3 rounded-xl text-[0.8125rem] font-medium leading-relaxed transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1d4ed8] text-white'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        boxShadow: '0 2px 8px rgba(29,78,216,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                      }
                    : {}
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
          {/* Settings */}
          <div className="space-y-1">
            {settingsNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-2 px-3.5 py-3 rounded-xl text-[0.8125rem] font-medium leading-relaxed transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1d4ed8] text-white'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        boxShadow: '0 2px 8px rgba(29,78,216,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                      }
                    : {}
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer — Profile Card */}
        <div className="px-4 py-4 border-t border-white/[0.06] mt-auto">
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#003366] flex items-center justify-center shrink-0 ring-2 ring-white/10">
              <span className="text-white text-sm font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <span className="inline-flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-[0.625rem] font-semibold text-emerald-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Certified
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 lg:ml-[272px]">
        {/* Top Header */}
        <header className="bg-white px-4 lg:px-6 py-3 flex items-center justify-between shrink-0" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {/* Left: Mobile toggle + Page title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? <HiXIcon className="w-6 h-6" /> : <HiMenuIcon className="w-6 h-6" />}
            </button>
            <div className="hidden sm:block">
              <h1 className="text-[1.0625rem] font-bold text-gray-900 leading-tight">
                {currentPage.title}
              </h1>
              {currentPage.subtitle && (
                <p className="text-xs text-gray-500 mt-0.5" style={{ lineHeight: '1.4' }}>
                  {currentPage.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students, tools, reports..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]/40 focus:bg-white placeholder:text-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Right: Notifications + Help + Profile */}
          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            <button
              type="button"
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Help */}
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors hidden sm:block"
              aria-label="Help"
            >
              <FiHelpCircle className="w-5 h-5" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#003366] flex items-center justify-center ring-2 ring-gray-100">
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-[0.6875rem] text-emerald-600 font-semibold">Certified</span>
                  </div>
                </div>
                <FiChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl py-1.5 z-40" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)' }}>
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{displayEmail || '—'}</p>
                    </div>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FiUser className="w-4 h-4 text-gray-400" /> My Profile
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FiSettings className="w-4 h-4 text-gray-400" /> Settings
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FiHelpCircle className="w-4 h-4 text-gray-400" /> Help & Support
                    </button>
                    {user && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <FiLogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="grow p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
