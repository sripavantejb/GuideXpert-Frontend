import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWebinar } from '../context/WebinarContext';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiX as HiXIcon } from 'react-icons/hi';
import { SessionCard } from './SessionList';
import { SESSIONS, ALL_MODULES, getSessionsByDay } from '../data/mockWebinarData';

export default function Sidebar({
  open,
  onOpenChange,
}) {
  const navigate = useNavigate();
  const {
    sidebarExpanded: expanded,
    setSidebarExpanded: setExpanded,
    completedSessions,
    completedVideoCount,
    activeSessionId,
    setActiveSessionId,
  } = useWebinar();
  const [internalOpen, setInternalOpen] = useState(false);
  const sidebarOpen = typeof open === 'boolean' ? open : internalOpen;
  const setSidebarOpen = typeof onOpenChange === 'function' ? onOpenChange : setInternalOpen;

  const width = expanded ? 'w-[280px] lg:w-[30vw]' : 'w-[72px]';

  const isDayUnlocked = useCallback(
    (dayId) => {
      if (dayId === 1) return true;
      const prevDaySessions = getSessionsByDay(dayId - 1);
      const prevDayIds = prevDaySessions.map((s) => s.id);
      return prevDayIds.every((id) => completedSessions.includes(id));
    },
    [completedSessions]
  );

  const handleSelectSession = useCallback(
    (sessionId) => {
      setActiveSessionId(sessionId);
      setSidebarOpen(false);
      navigate('/webinar');
    },
    [setActiveSessionId, setSidebarOpen, navigate]
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-200"
        aria-hidden={!sidebarOpen}
        style={{
          visibility: sidebarOpen ? 'visible' : 'hidden',
          opacity: sidebarOpen ? 1 : 0,
        }}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col max-w-[85vw] lg:max-w-none
          bg-sidebar-blue border-r border-white/8
          transform transition-[transform,width] duration-200 ease-out
          lg:transform-none
          ${width}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-white/8">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className={`flex items-center min-w-0 ${expanded ? 'shrink-0' : 'flex-1 justify-center overflow-hidden'}`}>
              <Link
                to="/webinar"
                className={`flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-blue rounded-md ${expanded ? 'h-8 shrink-0' : 'min-w-0 overflow-hidden max-w-[44px] h-8'}`}
                aria-label="GuideXpert"
              >
                <img
                  src="https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png"
                  alt="GuideXpert"
                  className={expanded ? 'h-6 w-auto max-w-[110px] object-contain object-left' : 'h-5 w-full max-w-[44px] object-contain object-left'}
                />
              </Link>
            </div>
            {expanded && (
              <div className="hidden lg:flex flex-1 flex-col items-end justify-center min-h-8 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 leading-tight">
                  Sessions
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-sm font-semibold tabular-nums text-white">
                    {completedVideoCount ?? completedSessions.filter((id) => SESSIONS.some((s) => s.id === id)).length}
                    <span className="text-slate-500 font-normal"> / </span>
                    {SESSIONS.length}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">completed</span>
                </div>
              </div>
            )}
            <div className="flex items-center shrink-0 gap-0.5">
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="hidden lg:flex p-2.5 rounded-lg text-slate-400 hover:bg-white/8 hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-blue"
                aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                title={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <FiChevronLeft className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2.5 rounded-lg text-slate-400 hover:bg-white/8 hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-blue"
                aria-label="Close menu"
              >
                <HiXIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Progress bar */}
          {expanded && (
            <div className="hidden lg:block h-0.5 bg-white/6 mx-4 mb-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-blue-400/80 transition-all duration-500 rounded-full"
                style={{ width: `${SESSIONS.length ? Math.min(100, ((completedVideoCount ?? completedSessions.length) / SESSIONS.length) * 100) : 0}%` }}
              />
            </div>
          )}
        </div>

        <nav className="flex-1 flex flex-col min-h-0 overflow-hidden" aria-label="Sessions">
          {expanded ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto min-h-0 py-4 px-4 pb-5 space-y-2.5">
                {ALL_MODULES.map((module) => (
                    <SessionCard
                      key={module.id}
                      session={module}
                      isActive={activeSessionId === module.id}
                      isCompleted={module.type === 'Assessment' ? false : completedSessions.includes(module.id)}
                      progress={
                        activeSessionId === module.id && module.type !== 'Assessment' && !completedSessions.includes(module.id)
                          ? 1
                          : 0
                      }
                      isLocked={!isDayUnlocked(module.dayId)}
                      onClick={handleSelectSession}
                      darkVariant
                    />
                ))}
              </div>
            </div>
          ) : (
            <div
              className="flex-1 min-h-0 hidden lg:flex flex-col items-center justify-center py-4"
              aria-label={`${completedVideoCount ?? completedSessions.length} of ${SESSIONS.length} sessions completed`}
              title={`${completedVideoCount ?? completedSessions.length} of ${SESSIONS.length} completed`}
            >
              {/* Vertical bar with dots on top: bar as track, dots overlaid along it */}
              <div className="flex-1 min-h-[120px] w-5 flex flex-col items-center relative">
                {/* Bar track + fill */}
                <div className="absolute inset-0 w-2 rounded-full bg-white/6 overflow-hidden flex flex-col">
                  <div
                    className="w-full bg-primary-blue-400/80 transition-all duration-500 rounded-full shrink-0"
                    style={{
                      height: `${SESSIONS.length ? Math.min(100, ((completedVideoCount ?? completedSessions.length) / SESSIONS.length) * 100) : 0}%`,
                    }}
                  />
                </div>
                {/* Dots on top of the bar, spaced along its height */}
                <div className="relative flex flex-col justify-between h-full w-5 py-0.5">
                  {SESSIONS.map((session) => (
                    <span
                      key={session.id}
                      className={`block w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ring-2 ring-sidebar-blue ${
                        completedSessions.includes(session.id)
                          ? 'bg-primary-blue-400/80'
                          : 'bg-white/6'
                      }`}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
