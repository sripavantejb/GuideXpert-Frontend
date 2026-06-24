import { createElement, useState, useMemo, useEffect } from 'react';
import { useSidebarScrollbarActivity } from '../../hooks/useSidebarScrollbarActivity';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiLayout, FiUsers, FiBarChart2, FiDownload, FiSettings, FiCalendar, FiClock, FiVideo, FiFileText, FiBell, FiLink, FiClipboard, FiMessageSquare, FiBookOpen, FiImage, FiPhone, FiLayers, FiTarget, FiUserPlus, FiSend, FiDatabase, FiHeadphones, FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { AdminDashboardProvider } from '../../contexts/AdminDashboardContext';
import { useAdminDateRange } from '../../hooks/useAdminDateRange';
import AdminFiltersPanel, { AdminFiltersTriggerButton } from './AdminFiltersPanel';
import { countActiveLeadFilters } from '../../utils/adminLeadFiltersShared';

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiLayout, sectionKey: 'dashboard' },
  { to: '/admin/executive-dashboard', label: 'Executive Dashboard', icon: FiBarChart2, sectionKey: 'funnel-analytics' },
  { to: '/admin/analytics/alerts', label: 'Smart Alerts', icon: FiBell, sectionKey: 'funnel-analytics' },
  { to: '/admin/analytics/reports', label: 'Executive Reports', icon: FiFileText, sectionKey: 'funnel-analytics' },
  { to: '/admin/funnel-analytics', label: 'Funnel Analytics', icon: FiBarChart2, sectionKey: 'funnel-analytics' },
  { to: '/admin/certified-counsellors', label: 'Certified Counsellors', icon: FiUsers, sectionKey: 'certified-counsellors' },
  { to: '/admin/leads', label: 'Lead Funnel', icon: FiUsers, sectionKey: 'leads' },
  { to: '/admin/iit-counselling', label: 'IIT Counselling', icon: FiClipboard, sectionKey: 'iit-counselling' },
  { to: '/admin/calling-team', label: 'Calling Team', icon: FiPhone, sectionKey: 'calling-team', hideInSidebar: true },
  { to: '/admin/calling-data', label: 'Calling Data', icon: FiDatabase, sectionKey: 'calling-data', hideInSidebar: true },
  { to: '/admin/calling-team/leads', label: 'Calling Team Leads', icon: FiUsers, sectionKey: 'calling-team', hideInSidebar: true },
  { to: '/admin/calling-team/bdas', label: 'BDA Management', icon: FiUserPlus, sectionKey: 'calling-team' },
  { to: '/admin/iit-counselling-utm', label: 'IIT Counselling UTM', icon: FiLink, sectionKey: 'iit-counselling' },
  { to: '/admin/organic-rank-leads', label: 'Organic rank leads', icon: FiTarget, sectionKey: 'leads' },
  { to: '/admin/analytics', label: 'Analytics', icon: FiBarChart2, sectionKey: 'analytics' },
  { to: '/admin/meeting-attendance', label: 'User Productivity', icon: FiVideo, sectionKey: 'meeting-attendance' },
  { to: '/admin/iit-meet-attendance', label: 'IIT Meet Attendance', icon: FiVideo, sectionKey: 'iit-meet-attendance' },
  { to: '/admin/export', label: 'Export Data', icon: FiDownload, sectionKey: 'export' },
  { to: '/admin/slots', label: 'Slots', icon: FiCalendar, sectionKey: 'slots' },
  { to: '/admin/demo-meet-schedule', label: 'Demo meet schedule', icon: FiClock, sectionKey: 'slots' },
  { to: '/admin/training-form-responses', label: 'Training Form', icon: FiClipboard, sectionKey: 'training-form-responses' },
  { to: '/admin/college-dost', label: 'CollegeDost', icon: FiClipboard, sectionKey: 'college-dost' },
  { to: '/admin/one-on-one-counseling', label: '1-on-1 Counseling', icon: FiUsers, sectionKey: 'one-on-one-counseling' },
  { to: '/admin/guidance-slot-bookings', label: 'Guidance Slot Bookings', icon: FiCalendar, sectionKey: 'guidance-slot-bookings' },
  { to: '/admin/one-on-one-counselors', label: 'One-on-One Counselors', icon: FiUserPlus, sectionKey: 'one-on-one-counselors-admin' },
  { to: '/admin/training-feedback', label: 'Activation Form', icon: FiMessageSquare, sectionKey: 'training-feedback' },
  { to: '/admin/counsellor-support-requests', label: 'Counsellor Support', icon: FiMessageSquare, sectionKey: 'training-feedback' },
  { to: '/admin/influencer-create', label: 'Create influencer links', icon: FiUserPlus, sectionKey: 'influencer-tracking', hideInSidebar: true },
  { to: '/admin/influencer-tracking', label: 'Influencer / UTM Tracking', icon: FiLink, sectionKey: 'influencer-tracking' },
  { to: '/admin/poster-downloads', label: 'Poster downloads', icon: FiImage, sectionKey: 'poster-downloads' },
  { to: '/admin/posters', label: 'Poster automation', icon: FiLayers, sectionKey: 'poster-automation' },
  { to: '/admin/assessment-results', label: 'Custom Reports', icon: FiFileText, sectionKey: 'assessment-results' },
  { to: '/admin/webinar-progress', label: 'Webinar Progress', icon: FiVideo, sectionKey: 'webinar-progress' },
  { to: '/admin/bulk-certificates', label: 'Bulk Certificates', icon: FiDownload, sectionKey: 'bulk-certificates', hideInSidebar: true },
  { to: '/admin/blogs', label: 'Blog Management', icon: FiBookOpen, sectionKey: 'blogs' },
  { to: '/admin/osvi-calls', label: 'OSVI Calls', icon: FiPhone, sectionKey: 'osvi-calls', hideInSidebar: true },
  { to: '/admin/osvi-calls-data', label: 'OSVI calls Data', icon: FiPhone, sectionKey: 'osvi-calls-data', hideInSidebar: true },
  { to: '/admin/ai-calls', label: 'AI Calls', icon: FiPhone, sectionKey: 'ai-calls' },
  { to: '/admin/iit-ai-calls-summary', label: 'IITian AI Calls Summary', icon: FiPhone, sectionKey: 'iit-ai-calls-summary' },
  { to: '/admin/whatsapp-ops', label: 'WhatsApp ops', icon: FiSend, sectionKey: 'whatsapp-ops' },
  { to: '/admin/lead-intelligence', label: 'Chatbot Lead Intelligence', icon: FiMessageSquare, sectionKey: 'lead-intelligence' },
  { to: '/admin/human-copilot', label: 'Human Copilot', icon: FiHeadphones, sectionKey: 'human-copilot' },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings, sectionKey: 'settings' },
];

function getVisibleNavItems(user) {
  if (!user) return [];
  if (user.isSuperAdmin === true) return navItems;
  const access = user.sectionAccess;
  if (!Array.isArray(access) || access.length === 0) return [];
  const set = new Set(access);
  return navItems.filter((item) => {
    if (set.has(item.sectionKey)) return true;
    return false;
  });
}

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function formatHeaderRange(from, to) {
  if (!from && !to) return '';
  try {
    const a = from ? new Date(from + 'T12:00:00') : null;
    const b = to ? new Date(to + 'T12:00:00') : null;
    const f = (d) => (d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '…');
    return `${f(a)} – ${f(b)}`;
  } catch {
    return '';
  }
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const visibleNavItems = useMemo(() => getVisibleNavItems(user), [user]);
  const sidebarNavItems = useMemo(
    () => visibleNavItems.filter((item) => !item.hideInSidebar),
    [visibleNavItems]
  );
  const allowedPaths = useMemo(() => new Set(visibleNavItems.map((item) => item.to)), [visibleNavItems]);
  const currentPath = location.pathname;
  const isPathAllowed =
    currentPath === '/admin' ||
    currentPath === '/admin/' ||
    allowedPaths.has(currentPath) ||
    currentPath.startsWith('/admin/whatsapp-ops') ||
    currentPath.startsWith('/admin/calling-team') ||
    currentPath.startsWith('/admin/calling-data') ||
    currentPath.startsWith('/admin/ai-calls') ||
    currentPath.startsWith('/admin/iit-ai-calls-summary') ||
    currentPath.startsWith('/admin/lead-intelligence') ||
    currentPath.startsWith('/admin/human-copilot');
  useEffect(() => {
    const firstAllowed = visibleNavItems[0];
    if (user && !user.isSuperAdmin && !isPathAllowed && firstAllowed) {
      navigate(firstAllowed.to, { replace: true });
    }
  }, [user, isPathAllowed, visibleNavItems, navigate, currentPath]);
  const initials = (user?.username || 'A').slice(0, 2).toUpperCase();
  const { onScroll: onSidebarScroll, active: sidebarScrollActive } = useSidebarScrollbarActivity();

  return (
    <div className="counsellor-portal min-h-screen h-screen overflow-hidden bg-gray-50 flex">
      <div
        className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-200"
        aria-hidden={!sidebarOpen}
        style={{ visibility: sidebarOpen ? 'visible' : 'hidden', opacity: sidebarOpen ? 1 : 0 }}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar-blue
          transform transition-[transform,width] duration-200 ease-out
          lg:transform-none w-[280px]
          ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[280px]'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ boxShadow: '1px 0 0 0 rgba(255,255,255,0.04), 8px 0 32px rgba(0,0,0,0.16)' }}
      >
        <div className="relative border-b border-white/10">
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className={`hidden lg:flex absolute z-10 p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors ${
              sidebarCollapsed ? 'top-2 left-1/2 -translate-x-1/2' : 'top-3 right-2'
            }`}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <FiChevronRight className="w-5 h-5 shrink-0" aria-hidden />
            ) : (
              <FiChevronLeft className="w-5 h-5 shrink-0" aria-hidden />
            )}
          </button>
          <div className="flex w-full flex-col items-start justify-center py-5 lg:py-4">
            <div className={`w-full flex flex-col items-center justify-center py-3 gap-1.5 ${sidebarCollapsed ? 'lg:px-2 lg:py-2 lg:pt-8' : 'px-4 lg:pr-10'}`}>
              <img
                src="https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394005/GuideXpert_Logo_inbaz5.png"
                alt="GuideXpert"
                className={`h-8 w-auto object-contain ${sidebarCollapsed ? 'lg:h-7' : ''}`}
              />
              <p className={`text-[0.5625rem] font-semibold text-white/70 uppercase tracking-wider text-center leading-tight ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                GuideXpert Admin
              </p>
            </div>
          </div>
        </div>

        <nav
          className={`sidebar-nav-scroll flex-1 min-h-0 overflow-y-auto overscroll-y-contain py-5 flex flex-col gap-6 ${sidebarCollapsed ? 'lg:px-2 lg:py-3' : 'px-3'}${sidebarScrollActive ? ' sidebar-nav-scroll--active' : ''}`}
          onScroll={onSidebarScroll}
        >
          <div>
            <p className={`px-3 mb-2 text-[0.6875rem] font-semibold text-white/50 uppercase tracking-wider ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              Menu
            </p>
            <div className="space-y-0.5">
              {sidebarNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin/dashboard'}
                  title={sidebarCollapsed ? label : undefined}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2.5 rounded-lg text-[0.8125rem] font-medium transition-all duration-200 ${
                      sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:gap-0' : 'px-3'
                    } ${
                      isActive
                        ? 'bg-primary-navy/90 text-white shadow-[inset_3px_0_0_0_#4d8ec7]'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {createElement(Icon, {
                    className: 'w-[1.125rem] h-[1.125rem] shrink-0 opacity-90',
                    'aria-hidden': true,
                  })}
                  <span className={sidebarCollapsed ? 'lg:hidden' : 'truncate'}>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className={`p-3 border-t border-white/10 mt-auto space-y-1.5 ${sidebarCollapsed ? 'lg:p-2' : ''}`}>
          <div
            className={`flex items-center gap-3 rounded-lg bg-white/10 ${sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-2' : 'px-3 py-2.5'}`}
            title={sidebarCollapsed ? user?.username || 'Admin' : undefined}
          >
            <div className="w-9 h-9 rounded-full bg-primary-blue-400 flex items-center justify-center shrink-0 ring-2 ring-white/20">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <div className={`min-w-0 flex-1 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-semibold text-white truncate">{user?.username || 'Admin'}</p>
              <p className="text-[0.6875rem] text-white/60 font-medium">Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Log out' : undefined}
            className={`w-full flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors border border-white/10 ${sidebarCollapsed ? 'lg:px-2 lg:py-2' : 'px-3 py-2'}`}
          >
            <FiLogOut className="w-4 h-4 shrink-0" aria-hidden />
            <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Log out</span>
          </button>
        </div>
      </aside>

      <div
        className={`flex-1 flex flex-col min-w-0 min-h-0 transition-[margin] duration-200 ease-out ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]'
        }`}
      >
        <AdminDashboardProvider>
          <AdminChrome
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            initials={initials}
            username={user?.username}
          />
        </AdminDashboardProvider>
      </div>
    </div>
  );
}

function AdminChrome({ sidebarOpen, setSidebarOpen, initials, username }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { dateRange, leadListFilters } = useAdminDateRange();
  const rangeLabel = formatHeaderRange(dateRange.from, dateRange.to);
  const badgeCount = countActiveLeadFilters(leadListFilters);

  return (
    <>
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
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">
              Sales Analytics Dashboard
            </h1>
            {rangeLabel && (
              <p className="text-xs text-gray-500 truncate hidden sm:block">{rangeLabel}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AdminFiltersTriggerButton onClick={() => setFiltersOpen(true)} activeCount={badgeCount} />
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
      <AdminFiltersPanel open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <main
        className={`grow bg-gray-50 p-4 lg:p-6 ${
          location.pathname.includes('/admin/human-copilot')
            ? 'flex min-h-0 flex-col overflow-hidden'
            : 'overflow-auto scrollbar-hide'
        }`}
      >
        <Outlet />
      </main>
    </>
  );
}
