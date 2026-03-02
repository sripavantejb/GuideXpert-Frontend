import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { getAdminStats, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';
import OverviewSkeleton from '../../components/UI/OverviewSkeleton';

const DRAG_THRESHOLD_PX = 5;

export default function Overview() {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const funnelScrollRef = useRef(null);
  const dragRef = useRef({ lastX: 0, lastY: 0, pointerDown: false, pastThreshold: false });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getAdminStats({}, getStoredToken()).then((statsRes) => {
      if (cancelled) return;
      if (!statsRes.success) {
        if (statsRes.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(statsRes.message || 'Failed to load stats');
        setLoading(false);
        return;
      }
      setStats(statsRes.data?.data || null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [logout]);

  useLayoutEffect(() => {
    const el = funnelScrollRef.current;
    if (el) {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    }
  }, [stats]);

  function handlePointerDown(e) {
    if (e.button !== 0) return;
    dragRef.current = {
      lastX: e.clientX,
      lastY: e.clientY,
      pointerDown: true,
      pastThreshold: false,
    };
  }

  function handlePointerMove(e) {
    const ref = dragRef.current;
    const el = funnelScrollRef.current;
    if (!ref.pointerDown || !el) return;
    const dx = e.clientX - ref.lastX;
    const dy = e.clientY - ref.lastY;
    if (!ref.pastThreshold) {
      if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
        ref.pastThreshold = true;
        setIsDragging(true);
        el.setPointerCapture(e.pointerId);
      }
    }
    if (ref.pastThreshold) {
      e.preventDefault();
      el.scrollLeft -= dx;
      el.scrollTop -= dy;
      ref.lastX = e.clientX;
      ref.lastY = e.clientY;
    }
  }

  function handlePointerUp(e) {
    if (e.button !== 0) return;
    const ref = dragRef.current;
    const el = funnelScrollRef.current;
    if (ref.pointerDown && el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
    dragRef.current = { lastX: 0, lastY: 0, pointerDown: false, pastThreshold: false };
    setIsDragging(false);
  }

  function handlePointerCancel(e) {
    handlePointerUp(e);
  }

  if (loading) {
    return <OverviewSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full">
        <p className="text-red-600" role="alert">{error}</p>
      </div>
    );
  }

  const total = stats?.total ?? 0;
  const otpVerified = stats?.otpVerified ?? 0;
  const otpNotVerified = stats?.otpNotVerified ?? 0;
  const otpVerifiedSlotBooked = stats?.otpVerifiedSlotBooked ?? 0;
  const otpVerifiedSlotNotBooked = stats?.otpVerifiedSlotNotBooked ?? 0;
  const slotBooked = stats?.slotBooked ?? 0;
  const demoAttended = stats?.demoAttended ?? 0;
  const demoNotAttended = stats?.demoNotAttended ?? 0;
  const assessmentWritten = stats?.assessmentWritten ?? 0;
  const assessmentNotWritten = stats?.assessmentNotWritten ?? 0;
  const activationFormCompleted = stats?.activationFormCompleted ?? 0;
  const activationFormNotDone = stats?.activationFormNotDone ?? 0;
  const maxOtp = Math.max(otpVerified, otpNotVerified, 1);
  const maxSlot = Math.max(otpVerifiedSlotBooked, otpVerifiedSlotNotBooked, 1);
  const maxDemo = Math.max(demoAttended, demoNotAttended, 1);
  const maxAssessment = Math.max(assessmentWritten, assessmentNotWritten, 1);
  const maxActivation = Math.max(activationFormCompleted, activationFormNotDone, 1);

  function formatCount(n) {
    return Number(n).toLocaleString();
  }

  const CARD_WIDTH = 240;
  const CARD_MIN_HEIGHT = 132;

  function FunnelNode({ label, value, widthPct, conversionPct, conversionLabel }) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-visible p-4 flex flex-col min-h-[132px] w-[240px] min-w-[240px] shrink-0 box-border"
        style={{ minHeight: CARD_MIN_HEIGHT, width: CARD_WIDTH }}
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 break-words line-clamp-2">{label}</p>
        <p className="font-bold text-primary-navy tabular-nums text-xl mb-2">{formatCount(value)}</p>
        {conversionPct != null && conversionLabel && (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-blue-50 text-primary-navy text-xs font-medium mb-2">
            {conversionPct}% {conversionLabel}
          </span>
        )}
        <div className="mt-auto h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-navy rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${widthPct}%` }}
          />
        </div>
      </div>
    );
  }

  function ConnectorV({ h = 16 }) {
    return (
      <svg width="2" height={h} className="shrink-0" aria-hidden="true">
        <line x1="1" y1="0" x2="1" y2={h} stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  function ConnectorH({ w }) {
    return (
      <svg width={w} height="2" className="shrink-0" aria-hidden="true">
        <line x1="0" y1="1" x2={w} y2="1" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  function ConnectorHFull({ className = '' }) {
    return (
      <div className={className} aria-hidden="true">
        <svg width="100%" height="2" viewBox="0 0 100 2" preserveAspectRatio="none" className="block">
          <line x1="0" y1="1" x2="100" y2="1" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 flex flex-col">
      {/* Lead conversion funnel — tree diagram */}
      <div
        className="bg-gray-50/80 rounded-xl border border-gray-200 shadow-md flex-1 min-h-0 flex flex-col p-4 lg:p-6"
        role="img"
        aria-label="Lead conversion funnel: OTP verified and not verified, slot booked and not booked, demo attended and not attended, assessment written and not written, done and activation form not done"
      >
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Lead conversion funnel</h3>

        <div className="rounded-lg border border-gray-200 overflow-hidden min-h-0 flex-1 flex flex-col">
          <div
            ref={funnelScrollRef}
            className="flex-1 min-h-0 overflow-x-auto overflow-y-auto scrollbar-hide bg-white/50 pl-10 pr-8 pt-6 pb-8"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: isDragging ? 'none' : undefined,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
          <div className="w-max min-w-full pt-2 pb-4 inline-block px-24" style={{ minWidth: 'max(100%, 1600px)' }}>
              {/* Tree: Root */}
              <div className="flex flex-col items-center">
          <div className="rounded-lg border-2 border-primary-navy bg-white shadow-sm p-4 flex flex-col min-h-[132px] w-[240px] box-border" style={{ minHeight: CARD_MIN_HEIGHT, width: CARD_WIDTH }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leads added</p>
            <p className="text-xl font-bold text-primary-navy tabular-nums">{formatCount(total)}</p>
            <div className="mt-auto h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary-navy rounded-full w-full" /></div>
          </div>
          <div className="my-1"><ConnectorV h={16} /></div>
          <ConnectorHFull className="w-full max-w-2xl" style={{ maxWidth: 'min(100%, 32rem)' }} />
        </div>

        {/* Tree: Level 1 — OTP division. Right column first in DOM so left column paints on top. */}
        <div className="flex justify-center gap-8 sm:gap-10 mt-1.5 mb-1.5 min-w-max">
          {/* OTP not verified (right) */}
          <div className="flex flex-col items-center shrink-0 w-[280px] rounded-lg bg-gray-50/50 py-2 px-2 order-2">
            <div className="mb-1"><ConnectorV h={16} /></div>
            <FunnelNode
              label="OTP not verified"
              value={otpNotVerified}
              widthPct={maxOtp > 0 ? (otpNotVerified / maxOtp) * 100 : 0}
              conversionPct={total > 0 ? Math.round((otpNotVerified / total) * 100) : null}
              conversionLabel="of leads"
            />
          </div>
          {/* OTP verified + Slot booked + Slot not booked (left) */}
          <div className="flex flex-col items-center shrink-0 min-w-[560px] order-1">
            <div className="mb-1"><ConnectorV h={16} /></div>
            <FunnelNode
              label="OTP verified"
              value={otpVerified}
              widthPct={maxOtp > 0 ? (otpVerified / maxOtp) * 100 : 0}
              conversionPct={total > 0 ? Math.round((otpVerified / total) * 100) : null}
              conversionLabel="of leads"
            />
            <div className="mt-1 mb-1"><ConnectorV h={16} /></div>
            <ConnectorHFull className="w-full max-w-[280px]" />
            <div className="flex gap-6 sm:gap-8 w-full max-w-[568px] justify-center mt-1">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="mb-1"><ConnectorV h={12} /></div>
                <FunnelNode
                  label="Slot booked"
                  value={otpVerifiedSlotBooked}
                  widthPct={maxSlot > 0 ? (otpVerifiedSlotBooked / maxSlot) * 100 : 0}
                  conversionPct={otpVerified > 0 ? Math.round((otpVerifiedSlotBooked / otpVerified) * 100) : null}
                  conversionLabel="of OTP verified"
                />
                <div className="mt-1.5 mb-1"><ConnectorV h={12} /></div>
                <div className="w-max flex flex-col items-stretch" style={{ minWidth: 2 * CARD_WIDTH + 12 }}>
                  <ConnectorHFull className="w-full" />
                  <div className="flex gap-3 mt-1 justify-center">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="mb-1"><ConnectorV h={16} /></div>
                      <FunnelNode
                        label="Demo attended"
                        value={demoAttended}
                        widthPct={maxDemo > 0 ? (demoAttended / maxDemo) * 100 : 0}
                        conversionPct={slotBooked > 0 ? Math.round((demoAttended / slotBooked) * 100) : null}
                        conversionLabel="of slot booked"
                      />
                      <div className="mt-1 mb-1"><ConnectorV h={12} /></div>
                      <ConnectorHFull className="w-full max-w-[100px]" />
                      <div className="flex gap-2 mt-1">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="flex justify-center w-full"><ConnectorV h={16} /></div>
                          <FunnelNode
                            label="Assessment written"
                            value={assessmentWritten}
                            widthPct={maxAssessment > 0 ? (assessmentWritten / maxAssessment) * 100 : 0}
                            conversionPct={demoAttended > 0 ? Math.round((assessmentWritten / demoAttended) * 100) : null}
                            conversionLabel="of demo attended"
                          />
                          <div className="mt-1 mb-1"><ConnectorV h={12} /></div>
                          <div className="w-full" style={{ minWidth: 2 * CARD_WIDTH + 24 }}>
                            <ConnectorHFull className="w-full" />
                          </div>
                          <div className="flex gap-6 mt-1 justify-center">
                            <div className="flex flex-col items-center shrink-0">
                              <div className="mb-1"><ConnectorV h={16} /></div>
                              <FunnelNode
                                label="Done"
                                value={activationFormCompleted}
                                widthPct={maxActivation > 0 ? (activationFormCompleted / maxActivation) * 100 : 0}
                                conversionPct={assessmentWritten > 0 ? Math.round((activationFormCompleted / assessmentWritten) * 100) : null}
                                conversionLabel="of assessment written"
                              />
                            </div>
                            <div className="flex flex-col items-center shrink-0">
                              <div className="mb-1"><ConnectorV h={16} /></div>
                              <FunnelNode
                                label="Activation form not done"
                                value={activationFormNotDone}
                                widthPct={maxActivation > 0 ? (activationFormNotDone / maxActivation) * 100 : 0}
                                conversionPct={assessmentWritten > 0 ? Math.round((activationFormNotDone / assessmentWritten) * 100) : null}
                                conversionLabel="of assessment written"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center w-full"><ConnectorV h={16} /></div>
                        <FunnelNode
                          label="Assessment not written"
                          value={assessmentNotWritten}
                          widthPct={maxAssessment > 0 ? (assessmentNotWritten / maxAssessment) * 100 : 0}
                          conversionPct={demoAttended > 0 ? Math.round((assessmentNotWritten / demoAttended) * 100) : null}
                          conversionLabel="of demo attended"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="mb-1"><ConnectorV h={16} /></div>
                      <FunnelNode
                        label="Demo not attended"
                        value={demoNotAttended}
                        widthPct={maxDemo > 0 ? (demoNotAttended / maxDemo) * 100 : 0}
                        conversionPct={slotBooked > 0 ? Math.round((demoNotAttended / slotBooked) * 100) : null}
                        conversionLabel="of slot booked"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="mb-1"><ConnectorV h={12} /></div>
                <FunnelNode
                  label="Slot not booked"
                  value={otpVerifiedSlotNotBooked}
                  widthPct={maxSlot > 0 ? (otpVerifiedSlotNotBooked / maxSlot) * 100 : 0}
                  conversionPct={otpVerified > 0 ? Math.round((otpVerifiedSlotNotBooked / otpVerified) * 100) : null}
                  conversionLabel="of OTP verified"
                />
              </div>
            </div>
          </div>
        </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
