import { NavLink, Outlet } from 'react-router-dom';
import {
  FiBarChart2,
  FiFilter,
  FiCalendar,
  FiUsers,
  FiSend,
  FiSettings,
  FiActivity,
  FiAlertTriangle,
  FiClipboard,
} from 'react-icons/fi';

const tabs = [
  { to: 'overview', label: 'Overview', icon: FiBarChart2 },
  { to: 'health', label: 'Health', icon: FiActivity },
  { to: 'funnel', label: 'Funnel', icon: FiFilter },
  { to: 'daily', label: 'Daily', icon: FiCalendar },
  { to: 'students', label: 'Students', icon: FiUsers },
  { to: 'delivery', label: 'Delivery', icon: FiSend },
  { to: 'alerts', label: 'Alerts', icon: FiAlertTriangle },
  { to: 'audit', label: 'Audit', icon: FiClipboard },
  { to: 'config', label: 'Config', icon: FiSettings },
];

function tabClass({ isActive }) {
  const base =
    'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30 focus-visible:ring-offset-2';
  if (isActive) {
    return `${base} bg-white text-primary-navy shadow-sm ring-1 ring-slate-200/90`;
  }
  return `${base} text-slate-600 hover:bg-white/70 hover:text-slate-900`;
}

export default function ConversationRecoveryLayout() {
  return (
    <div className="min-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_32px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/[0.04]">
      <div
        className="h-1 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500"
        aria-hidden
      />
      <div className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/40 px-5 pb-0 pt-7 sm:px-10 sm:pt-9">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">
            Platform Feature #1 · v1.0.0
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Conversation Recovery
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Operational control plane for inactive counseling follow-ups — Phases 1–14 remain frozen.
          </p>
        </div>
        <nav className="mt-6 flex gap-1 overflow-x-auto pb-3" aria-label="Conversation recovery tabs">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className={tabClass}>
              <tab.icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="px-5 py-6 sm:px-10">
        <Outlet />
      </div>
    </div>
  );
}
