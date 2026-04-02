import { Link, useNavigate } from 'react-router-dom';
import { LuSearch } from 'react-icons/lu';

const LOGO_URL =
  'https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png';

const navLinks = [
  { label: 'Dashboard', to: '/students' },
  { label: 'Predictors', to: '/students/predictors' },
  { label: 'Fit Tests', to: '/students/tests' },
  { label: 'Compare Colleges', to: '/students/college-comparison' },
];

export default function StudentWorkspaceNavbar() {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-50 border-b-[3px] border-black bg-white shadow-[4px_4px_0_0_#000]"
      role="banner"
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/students" className="flex shrink-0 items-center gap-2" aria-label="GuideXpert home">
          <img src={LOGO_URL} alt="" className="h-7 object-contain md:h-8" />
        </Link>

        <nav
          className="order-3 flex w-full flex-wrap items-center justify-center gap-1 sm:gap-2 md:order-0 md:w-auto md:flex-1 md:justify-center"
          aria-label="Student workspace"
        >
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="sw-nav-link rounded-md px-2.5 py-2 text-sm font-bold text-[#0F172A] sm:px-3"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <form
            className="hidden sm:block"
            onSubmit={(e) => {
              e.preventDefault();
              navigate('/students/predictors');
            }}
          >
            <label htmlFor="student-workspace-search" className="sr-only">
              Search tools
            </label>
            <div className="relative">
              <LuSearch
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                id="student-workspace-search"
                type="search"
                placeholder="Search"
                className="w-36 rounded-lg border-2 border-black bg-[#F8FAFC] py-2 pl-8 pr-2 text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C7F36B] md:w-44"
              />
            </div>
          </form>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border-2 border-black bg-[#FFE89A] px-2 py-1.5 text-xs font-bold text-[#0F172A] shadow-[2px_2px_0_0_#000] transition hover:bg-[#ffe066] sm:px-3"
            aria-label="Student profile (demo)"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-black">
              S
            </span>
            <span className="hidden md:inline">Profile</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes sw-nav-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .sw-nav-link:hover {
          animation: sw-nav-bounce 0.35s ease;
          background: #C7F36B;
        }
      `}</style>
    </header>
  );
}
