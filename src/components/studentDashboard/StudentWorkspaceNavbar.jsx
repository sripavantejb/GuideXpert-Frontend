import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import {
  compareCollegesNavItems,
  fitTestNavItems,
  getRankPredictorNavItems,
} from '../../constants/studentWorkspaceNavMenus';

const LOGO_URL =
  'https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png';

const DROPDOWN_IDS = {
  predictors: 'predictors',
  fitTests: 'fitTests',
  compare: 'compare',
};

function isPredictorsSectionActive(pathname) {
  return (
    pathname === '/students/rank-predictor' || pathname.startsWith('/students/rank-predictor/')
  );
}

function isFitTestsSectionActive(pathname) {
  return (
    pathname === '/students/tests' ||
    pathname === '/students/course-fit-test' ||
    pathname === '/students/college-fit-test'
  );
}

function isCompareSectionActive(pathname) {
  return pathname === '/students/college-comparison' || pathname.startsWith('/students/college-comparison/');
}

/** Position only — border/radius live on non-scrolling frame so the box is never clipped at the bottom. */
const dropdownAnchorClass =
  'absolute left-0 top-full z-[120] min-w-[min(100vw-2rem,280px)] pt-1';

const dropdownFrameClass =
  'overflow-hidden rounded-[10px] border-[3px] border-black bg-white shadow-[4px_4px_0_#000]';

const dropdownScrollClass =
  'max-h-[min(70vh,calc(100dvh-6rem))] overflow-y-auto py-1';

const dropdownLinkClass =
  'block px-3 py-2.5 text-sm font-bold text-[#0F172A] outline-none transition-colors hover:bg-[#c7f36b]/50 focus-visible:bg-[#c7f36b]/50 focus-visible:ring-2 focus-visible:ring-[#0F172A]/20';

export default function StudentWorkspaceNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const { pathname } = useLocation();
  const menuId = useId();
  const navRef = useRef(null);

  const rankPredictorItems = useMemo(() => getRankPredictorNavItems(), []);

  const closeMenu = useCallback(() => setMobileOpen(false), []);
  const closeDropdown = useCallback(() => setOpenMenuId(null), []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenuId(null);
  }, [pathname]);

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

  useEffect(() => {
    if (!openMenuId) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeDropdown();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openMenuId, closeDropdown]);

  useEffect(() => {
    if (!openMenuId) return;
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [openMenuId]);

  const predictorsActive = isPredictorsSectionActive(pathname);
  const fitTestsActive = isFitTestsSectionActive(pathname);
  const compareActive = isCompareSectionActive(pathname);

  const navLinkBase =
    'sw-nav-link inline-flex items-center gap-0.5 rounded-md px-2.5 py-2.5 text-sm font-bold md:px-3';
  const navLinkActive = 'bg-[#c7f36b]';

  return (
    <header
      className="sticky top-0 z-100 overflow-visible border-b-[3px] border-black bg-white shadow-[4px_4px_0_0_#000]"
      role="banner"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 overflow-visible px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center">
          <Link to="/students" className="flex min-w-0 items-center gap-2" aria-label="GuideXpert home">
            <img src={LOGO_URL} alt="" className="h-7 max-h-8 w-auto max-w-[min(100%,200px)] object-contain md:h-8" />
          </Link>
        </div>

        {/* Desktop / tablet: inline nav */}
        <div
          ref={navRef}
          className="hidden min-w-0 flex-1 items-center justify-end gap-3 overflow-visible sm:flex md:flex-nowrap"
        >
          <nav
            className="flex flex-wrap items-center justify-end gap-1 overflow-visible md:gap-2"
            aria-label="Student workspace"
          >
            {/* Predictors dropdown */}
            <div
              className="relative overflow-visible"
              onMouseEnter={() => setOpenMenuId(DROPDOWN_IDS.predictors)}
              onMouseLeave={() =>
                setOpenMenuId((id) => (id === DROPDOWN_IDS.predictors ? null : id))
              }
              onFocusCapture={() => setOpenMenuId(DROPDOWN_IDS.predictors)}
              onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setOpenMenuId((id) => (id === DROPDOWN_IDS.predictors ? null : id));
                }
              }}
            >
              <NavLink
                to="/students/rank-predictor"
                className={({ isActive }) =>
                  `${navLinkBase} text-[#0F172A] ${isActive ? navLinkActive : ''}`
                }
                aria-haspopup="menu"
                aria-expanded={openMenuId === DROPDOWN_IDS.predictors}
              >
                Predictors
                <FiChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              </NavLink>
              <div
                className={`${dropdownAnchorClass} ${openMenuId === DROPDOWN_IDS.predictors ? 'block' : 'hidden'}`}
                role="menu"
                aria-label="Rank predictor exams"
              >
                <div className={dropdownFrameClass}>
                  <div className={dropdownScrollClass}>
                    <ul className="m-0 list-none p-0">
                      {rankPredictorItems.map((item) => (
                        <li key={item.to} role="none">
                          <NavLink
                            role="menuitem"
                            to={item.to}
                            className={({ isActive }) =>
                              `${dropdownLinkClass} ${isActive ? 'bg-[#c7f36b]/60' : ''}`
                            }
                            onClick={() => setOpenMenuId(null)}
                          >
                            {item.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Fit Tests dropdown */}
            <div
              className="relative overflow-visible"
              onMouseEnter={() => setOpenMenuId(DROPDOWN_IDS.fitTests)}
              onMouseLeave={() =>
                setOpenMenuId((id) => (id === DROPDOWN_IDS.fitTests ? null : id))
              }
              onFocusCapture={() => setOpenMenuId(DROPDOWN_IDS.fitTests)}
              onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setOpenMenuId((id) => (id === DROPDOWN_IDS.fitTests ? null : id));
                }
              }}
            >
              <NavLink
                to="/students/tests"
                className={({ isActive }) =>
                  `${navLinkBase} text-[#0F172A] ${isActive || fitTestsActive ? navLinkActive : ''}`
                }
                aria-haspopup="menu"
                aria-expanded={openMenuId === DROPDOWN_IDS.fitTests}
              >
                Fit Tests
                <FiChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              </NavLink>
              <div
                className={`${dropdownAnchorClass} ${openMenuId === DROPDOWN_IDS.fitTests ? 'block' : 'hidden'}`}
                role="menu"
                aria-label="Fit tests"
              >
                <div className={dropdownFrameClass}>
                  <div className={dropdownScrollClass}>
                    <ul className="m-0 list-none p-0">
                      {fitTestNavItems.map((item) => (
                        <li key={item.to} role="none">
                          <NavLink
                            role="menuitem"
                            to={item.to}
                            className={({ isActive }) =>
                              `${dropdownLinkClass} ${isActive ? 'bg-[#c7f36b]/60' : ''}`
                            }
                            onClick={() => setOpenMenuId(null)}
                          >
                            {item.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Compare Colleges dropdown */}
            <div
              className="relative overflow-visible"
              onMouseEnter={() => setOpenMenuId(DROPDOWN_IDS.compare)}
              onMouseLeave={() =>
                setOpenMenuId((id) => (id === DROPDOWN_IDS.compare ? null : id))
              }
              onFocusCapture={() => setOpenMenuId(DROPDOWN_IDS.compare)}
              onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setOpenMenuId((id) => (id === DROPDOWN_IDS.compare ? null : id));
                }
              }}
            >
              <NavLink
                to="/students/college-comparison"
                className={({ isActive }) =>
                  `${navLinkBase} text-[#0F172A] ${isActive || compareActive ? navLinkActive : ''}`
                }
                aria-haspopup="menu"
                aria-expanded={openMenuId === DROPDOWN_IDS.compare}
              >
                Compare Colleges
                <FiChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              </NavLink>
              <div
                className={`${dropdownAnchorClass} ${openMenuId === DROPDOWN_IDS.compare ? 'block' : 'hidden'}`}
                role="menu"
                aria-label="Compare colleges"
              >
                <div className={dropdownFrameClass}>
                  <div className={dropdownScrollClass}>
                    <ul className="m-0 list-none p-0">
                      {compareCollegesNavItems.map((item) => (
                        <li key={item.to} role="none">
                          <NavLink
                            role="menuitem"
                            to={item.to}
                            className={({ isActive }) =>
                              `${dropdownLinkClass} ${isActive ? 'bg-[#c7f36b]/60' : ''}`
                            }
                            onClick={() => setOpenMenuId(null)}
                          >
                            {item.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile: menu toggle */}
        <div className="flex shrink-0 items-center sm:hidden">
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
                <li className="rounded-lg border-2 border-black/10 bg-slate-50/80 p-2">
                  <div className="px-1 pb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                    Predictors
                  </div>
                  <NavLink
                    to="/students/rank-predictor"
                    className={({ isActive }) =>
                      `mb-2 block min-h-[44px] rounded-md border-2 px-3 py-2.5 text-sm font-bold outline-none transition-colors hover:bg-[#c7f36b]/40 focus-visible:ring-2 focus-visible:ring-[#0F172A]/30 ${
                        isActive || predictorsActive ? 'border-black bg-[#c7f36b]/50' : 'border-transparent text-[#0F172A]'
                      }`
                    }
                    onClick={closeMenu}
                  >
                    All rank predictors
                  </NavLink>
                  <ul className="flex max-h-[min(40vh,280px)] flex-col gap-0.5 overflow-y-auto border-t border-black/10 pt-2">
                    {rankPredictorItems.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `block min-h-[44px] rounded-md px-3 py-2.5 text-sm font-semibold text-[#0F172A] outline-none transition-colors hover:bg-[#c7f36b]/30 focus-visible:ring-2 focus-visible:ring-[#0F172A]/30 ${
                              isActive ? 'bg-[#c7f36b]/50 font-bold' : ''
                            }`
                          }
                          onClick={closeMenu}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="rounded-lg border-2 border-black/10 bg-slate-50/80 p-2">
                  <div className="px-1 pb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                    Fit Tests
                  </div>
                  <NavLink
                    to="/students/tests"
                    className={({ isActive }) =>
                      `mb-2 block min-h-[44px] rounded-md border-2 px-3 py-2.5 text-sm font-bold outline-none transition-colors hover:bg-[#c7f36b]/40 focus-visible:ring-2 focus-visible:ring-[#0F172A]/30 ${
                        isActive || fitTestsActive ? 'border-black bg-[#c7f36b]/50' : 'border-transparent text-[#0F172A]'
                      }`
                    }
                    onClick={closeMenu}
                  >
                    Fit tests hub
                  </NavLink>
                  <ul className="flex flex-col gap-0.5 border-t border-black/10 pt-2">
                    {fitTestNavItems.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `block min-h-[44px] rounded-md px-3 py-2.5 text-sm font-semibold text-[#0F172A] outline-none transition-colors hover:bg-[#c7f36b]/30 focus-visible:ring-2 focus-visible:ring-[#0F172A]/30 ${
                              isActive ? 'bg-[#c7f36b]/50 font-bold' : ''
                            }`
                          }
                          onClick={closeMenu}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="rounded-lg border-2 border-black/10 bg-slate-50/80 p-2">
                  <div className="px-1 pb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                    Compare Colleges
                  </div>
                  <ul className="flex flex-col gap-0.5">
                    {compareCollegesNavItems.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `block min-h-[48px] rounded-md border-2 px-3 py-3 text-base font-bold outline-none transition-colors hover:bg-[#c7f36b]/30 focus-visible:ring-2 focus-visible:ring-[#0F172A]/30 ${
                              isActive || compareActive ? 'border-black bg-[#c7f36b]/50' : 'border-transparent text-[#0F172A]'
                            }`
                          }
                          onClick={closeMenu}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
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
