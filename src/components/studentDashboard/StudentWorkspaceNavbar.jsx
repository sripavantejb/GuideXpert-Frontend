import { Link } from 'react-router-dom';

const LOGO_URL =
  'https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png';

const navLinks = [
  { label: 'Dashboard', to: '/students' },
  { label: 'Predictors', to: '/students/predictors' },
  { label: 'Fit Tests', to: '/students/tests' },
  { label: 'Compare Colleges', to: '/students/college-comparison' },
];

export default function StudentWorkspaceNavbar() {
  return (
    <header
      className="sticky top-0 z-100 border-b-[3px] border-black bg-white shadow-[4px_4px_0_0_#000]"
      role="banner"
    >
      <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-8 max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:items-center max-sm:gap-x-3 max-sm:gap-y-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3 md:flex-nowrap">
        <div className="order-1 flex min-w-0 shrink-0 max-sm:col-start-1 max-sm:row-start-1 md:order-0 md:flex-1 md:justify-start">
          <Link to="/students" className="flex items-center gap-2" aria-label="GuideXpert home">
            <img src={LOGO_URL} alt="" className="h-7 object-contain md:h-8" />
          </Link>
        </div>

        <div className="order-2 flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 max-sm:contents sm:gap-3 md:order-0 md:flex-1 md:flex-nowrap">
          <nav
            className="flex flex-wrap items-center justify-end gap-1 max-sm:col-span-2 max-sm:row-start-2 max-sm:justify-center sm:gap-2"
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
          <button
            type="button"
            className="flex shrink-0 items-center gap-2 self-center rounded-lg border-2 border-black bg-[#c7f36b] px-2 py-1.5 text-xs font-bold text-[#0F172A] shadow-[2px_2px_0_0_#000] transition hover:bg-[#ffe066] max-sm:col-start-2 max-sm:row-start-1 sm:px-3"
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
          background: #c7f36b;
        }
      `}</style>
    </header>
  );
}
