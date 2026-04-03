import { useEffect, useRef, useState } from 'react';
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
/** Slightly above PIN_TOP_PX so pin/unpin does not flicker at the boundary when scrolling up */
const UNPIN_TOP_PX = PIN_TOP_PX + 6;
/** Legacy pad: workspace must still extend below the pin band. */
const WORKSPACE_BOTTOM_PAD = 140;
/**
 * Hysteresis (px) for fixed sidebar bottom vs workspace bottom edge.
 * Reduces pin/unpin oscillation near the bottom CTA when layout shifts nudge rects across one threshold.
 */
const WORKSPACE_FIT_LOOSE_PX = 28;
const WORKSPACE_FIT_STRICT_PX = 8;

/** Tailwind `lg` — desktop sidebar is `lg:block` only */
const LG_MIN_PX = 1024;

function clearAsidePinStyles(el) {
  if (!el) return;
  el.style.position = '';
  el.style.left = '';
  el.style.top = '';
  el.style.right = '';
}

export default function StickyToolsSidebar() {
  const asideRef = useRef(null);
  const placeholderRef = useRef(null);
  const pinnedRef = useRef(false);
  /** Reserves column height when aside is fixed (aside is out of flow). */
  const [reservedHeight, setReservedHeight] = useState(0);

  useEffect(() => {
    const asideEl = asideRef.current;
    let raf = 0;
    const update = () => {
      const workspace = document.getElementById('student-workspace');
      const anchor = document.getElementById('workspace-applications');

      const isDesktop = window.innerWidth >= LG_MIN_PX;
      if (!isDesktop) {
        if (pinnedRef.current) {
          pinnedRef.current = false;
        }
        clearAsidePinStyles(asideEl);
        setReservedHeight((prev) => (prev !== 0 ? 0 : prev));
        return;
      }

      if (!workspace || !anchor) {
        return;
      }

      const wr = workspace.getBoundingClientRect();
      const ar = anchor.getBoundingClientRect();
      const el = asideRef.current;
      const h = el?.offsetHeight ?? 0;
      const sidebarBottom = PIN_TOP_PX + h;
      const margin = pinnedRef.current ? WORKSPACE_FIT_LOOSE_PX : WORKSPACE_FIT_STRICT_PX;
      const sidebarFitsWorkspace = sidebarBottom <= wr.bottom - margin;
      const workspaceTallEnough = wr.bottom > PIN_TOP_PX + WORKSPACE_BOTTOM_PAD;

      let shouldPin;
      if (pinnedRef.current) {
        shouldPin = ar.top <= UNPIN_TOP_PX && sidebarFitsWorkspace && workspaceTallEnough;
      } else {
        shouldPin = ar.top <= PIN_TOP_PX && sidebarFitsWorkspace && workspaceTallEnough;
      }

      if (shouldPin !== pinnedRef.current) {
        pinnedRef.current = shouldPin;
      }

      const column = el?.parentElement;

      if (shouldPin && column && el) {
        el.style.position = 'fixed';
        el.style.left = `${column.getBoundingClientRect().left}px`;
        el.style.top = `${PIN_TOP_PX}px`;
        el.style.right = 'auto';

        setReservedHeight((prev) => (Math.abs(prev - h) > 0.5 ? h : prev));
      } else if (el) {
        el.style.position = 'relative';
        el.style.left = '';
        el.style.top = '';
        el.style.right = '';
        setReservedHeight((prev) => (prev !== 0 ? 0 : prev));
      }
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
      clearAsidePinStyles(asideEl);
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

      {/* Desktop — placeholder keeps row height when aside is fixed; position/size applied in rAF (no per-frame setState). */}
      {reservedHeight > 0 && (
        <div
          ref={placeholderRef}
          className="hidden w-full max-w-[228px] shrink-0 lg:block"
          aria-hidden
          style={{ height: reservedHeight }}
        />
      )}
      <aside
        ref={asideRef}
        className="relative hidden w-full max-w-[228px] lg:z-40 lg:block lg:self-start"
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
