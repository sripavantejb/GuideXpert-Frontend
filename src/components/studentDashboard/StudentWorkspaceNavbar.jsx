import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const LOGO_URL =
  'https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png';

const navLinks = [
  { label: 'Dashboard', to: '/students' },
  { label: 'Predictors', to: '/students/predictors' },
  { label: 'Fit Tests', to: '/students/tests' },
  { label: 'Compare Colleges', to: '/students/college-comparison' },
];

export default function StudentWorkspaceNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const menuId = useId();

  const closeMenu = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, closeMenu]);

  return (
    <header
      className="sticky top-0 z-100 border-b-[3px] border-black bg-white shadow-[4px_4px_0_0_#000]"
      role="banner"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center">
          <Link to="/students" className="flex min-w-0 items-center gap-2" aria-label="GuideXpert home">
            <img src={LOGO_URL} alt="" className="h-7 max-h-8 w-auto max-w-[min(100%,200px)] object-contain md:h-8" />
          </Link>
        </div>

        {/* Desktop / tablet: inline nav */}
        <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 sm:flex md:flex-nowrap">
          <nav className="flex flex-wrap items-center justify-end gap-1 md:gap-2" aria-label="Student workspace">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="sw-nav-link rounded-md px-2.5 py-2.5 text-sm font-bold text-[#0F172A] md:px-3"
              >
                {label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className="flex shrink-0 items-center gap-2 rounded-lg border-2 border-black bg-[#c7f36b] px-2 py-2 text-xs font-bold text-[#0F172A] shadow-[2px_2px_0_0_#000] transition hover:bg-[#ffe066] sm:px-3"
            aria-label="Student profile (demo)"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-black">
              S
            </span>
            <span className="hidden md:inline">Profile</span>
          </button>
        </div>

        {/* Mobile: menu toggle + profile */}
        <div className="flex shrink-0 items-center gap-2 sm:hidden">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-black bg-white text-[#0F172A] shadow-[2px_2px_0_0_#000] transition hover:bg-slate-50"
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <FiX className="h-6 w-6" aria-hidden /> : <FiMenu className="h-6 w-6" aria-hidden />}
          </button>
          <button
            type="button"
            className="flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#c7f36b] px-2 text-xs font-bold text-[#0F172A] shadow-[2px_2px_0_0_#000] transition hover:bg-[#ffe066]"
            aria-label="Student profile (demo)"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-black">
              S
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-16 z-90 bg-black/40 sm:hidden"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div
            id={menuId}
            className="absolute left-0 right-0 top-full z-95 max-h-[min(70vh,calc(100dvh-5rem))] overflow-y-auto border-b-[3px] border-black bg-white shadow-[0_8px_0_0_#000] sm:hidden"
            role="navigation"
            aria-label="Student workspace"
          >
            <nav className="mx-auto max-w-[1600px] px-4 py-3">
              <ul className="flex flex-col gap-1">
                {navLinks.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="sw-nav-link block min-h-[48px] rounded-lg border-2 border-transparent px-3 py-3 text-base font-bold text-[#0F172A] hover:border-black hover:bg-[#c7f36b]/30"
                      onClick={closeMenu}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      ) : null}

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
