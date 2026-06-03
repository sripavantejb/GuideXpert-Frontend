import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiCalendar, FiLayout, FiLogOut, FiUser } from 'react-icons/fi';
import { useOneOnOneCounselorAuth } from '../../contexts/OneOnOneCounselorAuthContext';

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
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-[#0f2744] text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <p className="font-semibold">GuideXpert</p>
          <p className="text-xs text-white/70 mt-1">One-on-One Counselor</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
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
        <div className="p-4 border-t border-white/10">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <FiLogOut /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
