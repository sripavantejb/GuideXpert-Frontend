import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWebinar } from '../context/WebinarContext';
import { FiChevronLeft, FiChevronRight, FiLock, FiAward } from 'react-icons/fi';
import { HiX as HiXIcon } from 'react-icons/hi';
import { SessionCard } from './SessionList';
import { SESSIONS, ALL_MODULES } from '../data/mockWebinarData';
import { isModuleUnlocked, getUnlockProgress } from '../utils/unlockLogic';

export default function Sidebar({
  open,
  onOpenChange,
  activeModuleId,
  onSelectModule,
}) {
  const navigate = useNavigate();
  const {
    sidebarExpanded: expanded,
    setSidebarExpanded: setExpanded,
    completedSessions,
    completedVideoCount,
    activeSessionId: contextActiveSessionId,
    setActiveSessionId,
  } = useWebinar();
  const [internalOpen, setInternalOpen] = useState(false);
  const sidebarOpen = typeof open === 'boolean' ? open : internalOpen;
  const setSidebarOpen = typeof onOpenChange === 'function' ? onOpenChange : setInternalOpen;

  const width = expanded ? 'w-[280px] lg:w-[30vw]' : 'w-[72px]';

  const resolvedActiveSessionId = activeModuleId ?? contextActiveSessionId;

  const handleSelectSession = useCallback(
    (sessionId) => {
      onSelectModule?.(sessionId);
      setActiveSessionId(sessionId);
      setSidebarOpen(false);
      navigate('/webinar');
    },
    [onSelectModule, setActiveSessionId, setSidebarOpen, navigate]
  );

  const completedVideoCountResolved = completedVideoCount ?? completedSessions.filter((id) => SESSIONS.some((s) => s.id === id)).length;
  // Unlock certificate for now (no completion gate)
  const certificateUnlocked = true;

  const handleCertificateClick = useCallback(() => {
    if (!certificateUnlocked) return;
    setSidebarOpen(false);
    navigate('/webinar/certificates');
  }, [certificateUnlocked, setSidebarOpen, navigate]);

  const { completed: progressCompleted, total: progressTotal, percent: progressPercent } = getUnlockProgress(completedSessions);

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
        data-tour="sidebar"
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
                  src="https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394005/GuideXpert_Logo_inbaz5.png"
                  alt="GuideXpert"
                  className={expanded ? 'h-6 w-auto max-w-[110px] object-contain object-left' : 'h-5 w-full max-w-[44px] object-contain object-left'}
                />
              </Link>
            </div>
            {expanded && (
              <div className="hidden lg:flex flex-1 flex-col items-end justify-center min-h-8 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 leading-tight">
                  Progress
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-sm font-semibold tabular-nums text-white">
                    {progressCompleted}
                    <span className="text-slate-500 font-normal"> / </span>
                    {progressTotal}
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
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        <nav className="flex-1 flex flex-col min-h-0 overflow-hidden" aria-label="Sessions">
          {expanded ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="sidebar-nav-scroll flex-1 overflow-y-auto min-h-0 py-4 px-4 pb-5 space-y-2.5">
                {ALL_MODULES.map((module) => {
                  const unlocked = isModuleUnlocked(module.id, completedSessions);
                  return (
                    <SessionCard
                      key={module.id}
                      session={module}
                      isActive={resolvedActiveSessionId === module.id}
                      isCompleted={completedSessions.includes(module.id)}
                      progress={
                        resolvedActiveSessionId === module.id && !completedSessions.includes(module.id)
                          ? 1
                          : 0
                      }
                      isLocked={!unlocked}
                      onClick={handleSelectSession}
                      darkVariant
                    />
                  );
                })}
              </div>
              {/* Certificate row - always visible, premium styling with gold shimmer */}
              <div className="shrink-0 px-4 pb-4 pt-2">
                <button
                  type="button"
                  onClick={handleCertificateClick}
                  disabled={!certificateUnlocked}
                  className={`
                    relative overflow-hidden w-full text-left flex items-center gap-3 rounded-lg border transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-blue
                    p-3.5
                    ${certificateUnlocked
                      ? 'bg-linear-to-br from-amber-500/20 via-yellow-600/15 to-amber-700/20 border-amber-400/40 text-white hover:from-amber-500/30 hover:via-yellow-600/25 hover:to-amber-700/30 hover:border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.15)] certificate-glow-unlocked'
                      : 'bg-white/5 border-amber-900/30 text-slate-500 opacity-90 cursor-not-allowed'
                    }
                  `}
                  aria-label={certificateUnlocked ? 'View certificate' : 'Certificate locked — complete all sessions to unlock'}
                >
                  <div className="certificate-shimmer" aria-hidden />
                  <div className="w-11 h-11 rounded-md overflow-hidden shrink-0 flex items-center justify-center bg-amber-500/20 ring-1 ring-amber-400/30 relative z-10">
                    <FiAward className="w-5 h-5 text-amber-300" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 relative z-10">
                    <p className="text-sm font-semibold leading-snug truncate text-white">
                      Certificate
                    </p>
                    <p className="text-xs mt-0.5 font-medium text-slate-400">
                      {certificateUnlocked ? 'Ready — view or download' : 'Complete all sessions to unlock'}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-6 h-6 relative z-10">
                    {certificateUnlocked ? (
                      <span className="w-5 h-5 rounded-full bg-amber-400/30 flex items-center justify-center" aria-label="Unlocked">
                        <svg className="w-3 h-3 text-amber-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    ) : (
                      <FiLock className="w-4 h-4 text-slate-500" aria-label="Locked" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 min-h-0 hidden lg:flex flex-col items-center justify-center py-4"
              aria-label={`${progressCompleted} of ${progressTotal} completed`}
              title={`${progressCompleted} of ${progressTotal} completed`}
            >
              <div className="flex-1 min-h-[120px] w-5 flex flex-col items-center relative">
                <div className="absolute inset-0 w-2 rounded-full bg-white/6 overflow-hidden flex flex-col">
                  <div
                    className="w-full bg-primary-blue-400/80 transition-all duration-500 rounded-full shrink-0"
                    style={{ height: `${progressPercent}%` }}
                  />
                </div>
                <div className="relative flex flex-col justify-between h-full w-5 py-0.5">
                  {ALL_MODULES.map((m) => (
                    <span
                      key={m.id}
                      className={`block w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ring-2 ring-sidebar-blue ${
                        completedSessions.includes(m.id)
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
