import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWebinar } from '../context/WebinarContext';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiX as HiXIcon } from 'react-icons/hi';
import { SessionCard } from './SessionList';
import { SESSIONS, getSessionsByDay } from '../data/mockWebinarData';

export default function Sidebar({
  open,
  onOpenChange,
}) {
  const navigate = useNavigate();
  const {
    sidebarExpanded: expanded,
    setSidebarExpanded: setExpanded,
    completedSessions,
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
          bg-sidebar-blue border-r border-white/6
          transform transition-[transform,width] duration-200 ease-out
          lg:transform-none
          ${width}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 gap-3 px-4 py-3.5 border-b border-white/6">
          <div className={`flex items-center min-w-0 shrink-0 ${expanded ? 'gap-3' : 'flex-1 justify-center min-w-0 overflow-hidden'}`}>
            <Link
              to="/webinar"
              className={`flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-blue rounded ${expanded ? 'shrink-0' : 'min-w-0 overflow-hidden justify-center max-w-[44px]'}`}
              aria-label="GuideXpert"
            >
              <img
                src="https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png"
                alt="GuideXpert"
                className={expanded ? 'h-7 w-auto max-w-[110px] object-contain' : 'h-6 w-full max-w-[44px] object-contain object-left'}
              />
            </Link>
            {expanded && (
              <div className="hidden lg:flex flex-col min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90">Sessions</span>
                <span className="text-[11px] text-slate-400 mt-0.5">{completedSessions.length} of {SESSIONS.length} completed</span>
              </div>
            )}
          </div>
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:bg-white/6 hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-blue"
              aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <FiChevronLeft className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-white/6 hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-blue"
              aria-label="Close menu"
            >
              <HiXIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 flex flex-col min-h-0 overflow-hidden" aria-label="Sessions">
          {expanded ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto min-h-0 py-3 px-4 pb-4 space-y-2">
                {SESSIONS.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isActive={activeSessionId === session.id}
                      isCompleted={completedSessions.includes(session.id)}
                      progress={
                        activeSessionId === session.id && !completedSessions.includes(session.id)
                          ? 1
                          : 0
                      }
                      isLocked={!isDayUnlocked(session.dayId)}
                      onClick={handleSelectSession}
                      darkVariant
                    />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0" aria-hidden="true" />
          )}
        </nav>
      </aside>
    </>
  );
}
