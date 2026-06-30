import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiCalendar, FiLayout, FiLogOut, FiUser } from 'react-icons/fi';
import { useOneOnOneCounselorAuth } from '../../contexts/OneOnOneCounselorAuthContext';

const GUIDEXPERT_LOGO_URL =
  'https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394005/GuideXpert_Logo_inbaz5.png';

const nav = [
  { to: '/one-on-one-counselor/dashboard', label: 'Dashboard', icon: FiLayout },
  { to: '/one-on-one-counselor/slots', label: 'My Slots', icon: FiCalendar },
  { to: '/one-on-one-counselor/bookings', label: 'Bookings', icon: FiBookOpen },
  { to: '/one-on-one-counselor/profile', label: 'Profile', icon: FiUser },
];

export default function OneOnOneCounselorLayout() {
  const { user, logout } = useOneOnOneCounselorAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/one-on-one-counselor/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 flex h-screen w-64 flex-col bg-[#0f2744] text-white">
        <div className="shrink-0 border-b border-white/10 p-5">
          <img
            src={GUIDEXPERT_LOGO_URL}
            alt="GuideXpert"
            className="h-8 w-auto max-w-[140px] object-contain object-left"
          />
          <p className="mt-2 text-[0.5625rem] font-semibold uppercase tracking-wider text-white/60">
            One-on-One Counselor
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isActive ? 'bg-white/15 font-medium' : 'text-white/80 hover:bg-white/10'
                }`
              }
            >
              <Icon aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <FiLogOut /> Log out
          </button>
        </div>
      </aside>
      <main className="ml-64 min-h-screen overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
