import { NavLink } from 'react-router-dom';
import { FiLayers } from 'react-icons/fi';
import { NAV_GROUPS, GROUP_ICONS } from '../workspaceMeta';

function navLinkClassName({ isActive }) {
  return [
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] border-[3px] px-3 py-2.5 text-xs font-black transition-all duration-150 sm:text-sm',
    isActive
      ? 'border-black bg-[#C7F36B] text-[#0F172A] shadow-[3px_3px_0_#000] sm:shadow-[4px_4px_0_#000]'
      : 'border-slate-800 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-black hover:text-[#0F172A] hover:shadow-[3px_3px_0_#000]',
  ].join(' ');
}

export default function ToolNavBar() {
  return (
    <nav className="sticky top-0 z-50 overflow-hidden rounded-[14px] border-[3px] border-black bg-white shadow-[6px_6px_0_#000]">
      <div className="h-1.5 w-full bg-[#C7F36B] border-b-[3px] border-black" aria-hidden />
      <div className="p-4 sm:p-5">
        <div className="grid gap-6 lg:grid-cols-3">
          {NAV_GROUPS.map((group) => {
            const GroupIcon = GROUP_ICONS[group.label] || FiLayers;
            return (
              <div key={group.label}>
                <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  <GroupIcon className="h-4 w-4 shrink-0 text-[#0F172A]" aria-hidden />
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.links.map((item) => {
                    const LinkIcon = item.icon;
                    return (
                      <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                        <LinkIcon className="h-4 w-4 shrink-0" aria-hidden />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
