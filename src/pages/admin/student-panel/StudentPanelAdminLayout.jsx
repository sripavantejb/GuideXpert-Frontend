import { createElement } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiBell, FiMessageSquare } from 'react-icons/fi';

const primaryTabs = [
  { to: 'updates', label: 'Education updates', icon: FiBell },
  { to: 'testimonials', label: 'Testimonials', icon: FiMessageSquare },
];

function tabClass({ isActive }) {
  const base =
    'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30 focus-visible:ring-offset-2';
  if (isActive) {
    return `${base} bg-white text-primary-navy shadow-sm ring-1 ring-slate-200/90`;
  }
  return `${base} text-slate-600 hover:bg-white/70 hover:text-slate-900`;
}

export default function StudentPanelAdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_32px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/[0.04]">
      <div
        className="h-1 w-full bg-gradient-to-r from-[#f27921] via-amber-500 to-primary-navy"
        aria-hidden
      />

      <div className="relative border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/40 px-5 pb-0 pt-7 sm:px-10 sm:pt-9">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
            Students workspace
          </span>
          <h1 className="mt-4 text-[1.65rem] font-bold tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.1]">
            Student panel
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
            Maintain education updates, testimonials, and other content shown on the student tools
            home and navbar.
          </p>
        </div>

        <nav
          className="mt-8 flex flex-wrap gap-1 overflow-x-auto scrollbar-hide rounded-xl border border-slate-200/70 bg-slate-100/80 p-2 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]"
          aria-label="Student panel sections"
        >
          {primaryTabs.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={tabClass}>
              {createElement(icon, {
                className: 'h-4 w-4 shrink-0 opacity-90 sm:h-[17px] sm:w-[17px]',
                'aria-hidden': true,
              })}
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="relative min-h-0 bg-gradient-to-b from-slate-50/95 via-slate-50/90 to-slate-100/50 px-4 py-4 sm:px-8 sm:py-6">
        <div key={location.pathname} className="whatsapp-ops-outlet-fade">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
