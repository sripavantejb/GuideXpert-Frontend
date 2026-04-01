import { NavLink } from 'react-router-dom';

const TOOL_GROUPS = [
  {
    label: 'Predictors',
    links: [
      { to: '/students/rank-predictor', label: 'Rank Predictor' },
      { to: '/students/college-predictor', label: 'College Predictor' },
      { to: '/students/branch-predictor', label: 'Branch Predictor' },
    ],
  },
  {
    label: 'Fit Tests',
    links: [
      { to: '/students/course-fit-test', label: 'Course Fit Test' },
      { to: '/students/college-fit-test', label: 'College Fit Test' },
    ],
  },
  {
    label: 'Comparison',
    links: [{ to: '/students/college-comparison', label: 'College Comparison' }],
  },
];

function navLinkClassName({ isActive }) {
  return [
    'rounded-[10px] border-2 px-3 py-2 text-xs font-bold transition-all duration-150 sm:text-sm',
    isActive
      ? 'border-black bg-[#C7F36B] text-[#0F172A] shadow-[3px_3px_0px_#000]'
      : 'border-slate-300 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-black hover:text-[#0F172A] hover:shadow-[3px_3px_0px_#000]',
  ].join(' ');
}

export default function ToolNavBar() {
  return (
    <nav className="rounded-[14px] border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000] sm:p-5">
      <div className="grid gap-5 lg:grid-cols-3">
        {TOOL_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.links.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
