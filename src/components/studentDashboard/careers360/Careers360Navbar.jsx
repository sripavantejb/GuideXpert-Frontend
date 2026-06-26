import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiChevronDown, FiMenu, FiSearch, FiX } from 'react-icons/fi';
import {
  compareCollegesNavItems,
  fitTestNavItems,
  getRankPredictorNavItems,
} from '../../../constants/studentWorkspaceNavMenus';
import { C360, LAYOUT, NAV_CATEGORIES } from './careers360Theme';

const LOGO_URL =
  'https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png';

export default function Careers360Navbar({
  searchTerm = '',
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onSearchKeyDown,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const { pathname } = useLocation();
  const navRef = useRef(null);
  const rankItems = useMemo(() => getRankPredictorNavItems(), []);

  const closeAll = useCallback(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, []);

  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  const menus = {
    predictors: { label: 'Predictors', items: rankItems, hub: '/students/rank-predictor' },
    fit: { label: 'Fit tests', items: fitTestNavItems, hub: '/students/tests' },
    compare: { label: 'Compare', items: compareCollegesNavItems, hub: '/students/college-comparison' },
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white shadow-sm" role="banner">
      <div className={LAYOUT.container}>
        <div className="flex h-14 items-center gap-5 lg:h-[4.25rem]">
          <Link to="/students" className="shrink-0" aria-label="GuideXpert students workspace">
            <img src={LOGO_URL} alt="" className="h-7 w-auto object-contain lg:h-8" />
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="relative mx-auto max-w-md xl:max-w-lg">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
                onKeyDown={onSearchKeyDown}
                placeholder="Search predictors, colleges, tools…"
                className="w-full rounded-lg border border-[#ddd] bg-[#fafbfc] py-2.5 pl-9 pr-3 text-sm text-[#333] placeholder:text-[#999] focus:border-[#f27921] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f27921]/15"
              />
            </div>
          </div>

          <div ref={navRef} className="hidden items-center gap-0.5 lg:flex">
            {Object.entries(menus).map(([key, menu]) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => setOpenMenu(key)}
                onMouseLeave={() => setOpenMenu((m) => (m === key ? null : m))}
              >
                <NavLink
                  to={menu.hub}
                  className="inline-flex items-center gap-0.5 px-3 py-2 text-sm font-medium text-[#555] hover:text-[#f27921]"
                >
                  {menu.label}
                  <FiChevronDown className="h-3.5 w-3.5 opacity-60" />
                </NavLink>
                {openMenu === key && (
                  <div className="absolute right-0 top-full z-50 min-w-[220px] pt-1.5">
                    <div className="max-h-72 overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg">
                      {menu.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className="block px-4 py-2.5 text-sm text-[#444] hover:bg-[#fff4ed] hover:text-[#f27921]"
                          onClick={() => setOpenMenu(null)}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/students/rank-predictor"
              className="ml-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: C360.orange }}
            >
              Start predicting
            </Link>
          </div>

          <button
            type="button"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <div className="hidden border-t border-[#eee] lg:block">
          <div className="flex gap-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to={cat.to}
                className="shrink-0 border-b-2 border-transparent px-4 py-1 text-sm font-medium text-[#555] transition hover:border-[#f27921] hover:text-[#f27921]"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#eee] bg-white px-5 py-5 lg:hidden">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search predictors, colleges…"
            className="mb-5 w-full rounded-lg border border-[#ddd] px-3 py-2.5 text-sm"
          />
          {Object.entries(menus).map(([key, menu]) => (
            <div key={key} className="mb-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#999]">{menu.label}</p>
              {menu.items.slice(0, 5).map((item) => (
                <Link key={item.to} to={item.to} className="block py-2.5 text-sm text-[#444]" onClick={closeAll}>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
