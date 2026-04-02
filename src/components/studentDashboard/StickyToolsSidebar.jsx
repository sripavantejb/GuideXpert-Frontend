import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TOOL_LINKS = [
  { label: 'Rank Predictor', to: '/students/rank-predictor' },
  { label: 'College Predictor', to: '/students/college-predictor' },
  { label: 'Branch Predictor', to: '/students/branch-predictor' },
  { label: 'Course Fit Test', to: '/students/course-fit-test' },
  { label: 'College Fit Test', to: '/students/college-fit-test' },
  { label: 'Compare Colleges', to: '/students/college-comparison' },
];

const focusRing =
  'focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none';

/** Matches Tailwind `top-24` (6rem) — tools sit below sticky navbar */
const PIN_TOP_PX = 96;

const fixedRightStyle = {
  right: 'max(1rem, calc((100vw - 1600px) / 2 + 1rem))',
};

export default function StickyToolsSidebar() {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const workspace = document.getElementById('student-workspace');
      const anchor = document.getElementById('workspace-applications');
      if (!workspace || !anchor) return;
      const wr = workspace.getBoundingClientRect();
      const ar = anchor.getBoundingClientRect();
      // Fixed once "Workspace Applications" reaches the navbar band; release when workspace block leaves view
      const shouldPin =
        ar.top <= PIN_TOP_PX && wr.bottom > PIN_TOP_PX + 140;
      setPinned(shouldPin);
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    onScrollOrResize();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  return (
    <>
      {/* Mobile — in document flow above workspace main */}
      <div className="border-b-2 border-black bg-[#F8FAFC] px-3 py-3 lg:hidden">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-black">Tools</p>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TOOL_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`shrink-0 rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-semibold text-black shadow-[3px_3px_0_0_#000] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] ${focusRing}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop — in flow until Workspace Applications hits the pin line, then viewport-fixed */}
      <aside
        className={`hidden w-full max-w-[228px] lg:z-40 lg:block lg:self-start ${
          pinned ? 'fixed top-24' : 'relative'
        }`}
        style={pinned ? fixedRightStyle : undefined}
        aria-label="Tools"
      >
        <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000]">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-black">Tools</p>
          <ul className="space-y-0.5">
            {TOOL_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-sm font-bold text-[#0F172A] hover:bg-neutral-100 ${focusRing}`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-slate-400 ring-1 ring-black/10"
                    aria-hidden
                  />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
