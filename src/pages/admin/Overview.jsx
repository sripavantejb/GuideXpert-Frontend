import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { getAdminStats, getAdminLeads, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';
import OverviewSkeleton from '../../components/UI/OverviewSkeleton';

/** Card ID -> getAdminLeads params and optional "View related" label for unsupported stages */
const FUNNEL_CARD_LEADS_PARAMS = {
  'leads-added': { params: {}, hasExactList: true },
  'otp-verified': { params: { otpVerified: 'true' }, hasExactList: true },
  'otp-not-verified': { params: { otpVerified: 'false' }, hasExactList: true },
  'slot-booked': { params: { otpVerified: 'true', slotBooked: 'true' }, hasExactList: true },
  'slot-not-booked': { params: { otpVerified: 'true', slotBooked: 'false' }, hasExactList: true },
  'demo-attended': { params: { otpVerified: 'true', slotBooked: 'true' }, hasExactList: false, viewRelatedLabel: 'Slot booked' },
  'demo-not-attended': { params: { otpVerified: 'true', slotBooked: 'true' }, hasExactList: false, viewRelatedLabel: 'Slot booked' },
  'assessment-written': { params: { otpVerified: 'true', slotBooked: 'true' }, hasExactList: false, viewRelatedLabel: 'Slot booked' },
  'assessment-not-written': { params: { otpVerified: 'true', slotBooked: 'true' }, hasExactList: false, viewRelatedLabel: 'Slot booked' },
  'done': { params: { otpVerified: 'true', slotBooked: 'true' }, hasExactList: false, viewRelatedLabel: 'Slot booked' },
  'activation-form-not-done': { params: { otpVerified: 'true', slotBooked: 'true' }, hasExactList: false, viewRelatedLabel: 'Slot booked' },
  'counsellor-dashboard-logged-in': { params: { otpVerified: 'true', slotBooked: 'true' }, hasExactList: false, viewRelatedLabel: 'Slot booked' },
  'counsellor-dashboard-not-logged-in': { params: { otpVerified: 'true', slotBooked: 'true' }, hasExactList: false, viewRelatedLabel: 'Slot booked' },
};

const DRAG_THRESHOLD_PX = 5;

export default function Overview() {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [popoverCardId, setPopoverCardId] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [cardLeads, setCardLeads] = useState({ list: [], total: 0, loading: false, error: '' });
  const [scale, setScale] = useState(1);
  const [contentSize, setContentSize] = useState(null);
  const funnelScrollRef = useRef(null);
  const funnelContentRef = useRef(null);
  const dragRef = useRef({ lastX: 0, lastY: 0, pointerDown: false, pastThreshold: false });
  const justDraggedRef = useRef(false);

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
    setContentSize(null);
  }, [stats]);

  useLayoutEffect(() => {
    const el = funnelContentRef.current;
    if (el && contentSize === null) {
      setContentSize({ width: el.scrollWidth, height: el.scrollHeight });
    }
  }, [stats, contentSize]);

  useLayoutEffect(() => {
    const el = funnelScrollRef.current;
    if (el) {
      el.scrollTop = 0;
      const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      el.scrollLeft = maxScrollLeft / 2;
    }
  }, [stats]);

  useLayoutEffect(() => {
    if (scale !== 1) return;
    const el = funnelScrollRef.current;
    if (el) {
      el.scrollTop = 0;
      const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      el.scrollLeft = maxScrollLeft / 2;
    }
  }, [scale]);

  useEffect(() => {
    if (!popoverCardId) return;
    function onDocClick(ev) {
      const target = ev.target;
      if (target.closest('[data-funnel-popover]') || target.closest('[data-funnel-card]')) return;
      setPopoverCardId(null);
    }
    const t = setTimeout(() => document.addEventListener('click', onDocClick, true), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', onDocClick, true);
    };
  }, [popoverCardId]);

  // Fetch first page of leads for the opened card when stage maps to getAdminLeads
  useEffect(() => {
    if (!popoverCardId) {
      setCardLeads({ list: [], total: 0, loading: false, error: '' });
      return;
    }
    const config = FUNNEL_CARD_LEADS_PARAMS[popoverCardId];
    if (!config?.hasExactList) {
      setCardLeads({ list: [], total: 0, loading: false, error: '' });
      return;
    }
    setCardLeads((prev) => ({ ...prev, loading: true, error: '' }));
    getAdminLeads({ ...config.params, page: 1, limit: 10 }, getStoredToken()).then((res) => {
      if (!res.success) {
        setCardLeads({ list: [], total: 0, loading: false, error: res.message || 'Failed to load leads' });
        return;
      }
      const data = res.data?.data ?? [];
      const pagination = res.data?.pagination ?? {};
      setCardLeads({
        list: data,
        total: pagination.total ?? 0,
        loading: false,
        error: '',
      });
    });
  }, [popoverCardId]);

  // Panel is fixed on the right, so we no longer close it on funnel scroll

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
    justDraggedRef.current = ref.pastThreshold;
    if (ref.pointerDown && el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
    dragRef.current = { lastX: 0, lastY: 0, pointerDown: false, pastThreshold: false };
    setIsDragging(false);
    setTimeout(() => {
      justDraggedRef.current = false;
    }, 0);
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
  const counsellorDashboardLoggedIn = stats?.counsellorDashboardLoggedIn ?? 0;
  const counsellorDashboardNotLoggedIn = stats?.counsellorDashboardNotLoggedIn ?? 0;
  const maxOtp = Math.max(otpVerified, otpNotVerified, 1);
  const maxSlot = Math.max(otpVerifiedSlotBooked, otpVerifiedSlotNotBooked, 1);
  const maxDemo = Math.max(demoAttended, demoNotAttended, 1);
  const maxAssessment = Math.max(assessmentWritten, assessmentNotWritten, 1);
  const maxActivation = Math.max(activationFormCompleted, activationFormNotDone, 1);
  const maxCounsellorDashboard = Math.max(counsellorDashboardLoggedIn, counsellorDashboardNotLoggedIn, 1);

  function formatCount(n) {
    return Number(n).toLocaleString();
  }

  const CARD_DESCRIPTIONS = {
    'leads-added': 'Total leads added to the system.',
    'otp-verified': 'Leads who completed OTP verification.',
    'otp-not-verified': 'Leads who did not verify OTP.',
    'slot-booked': 'Leads who booked a demo slot.',
    'slot-not-booked': 'Leads who did not book a slot after OTP.',
    'demo-attended': 'Leads who attended the demo.',
    'demo-not-attended': 'Leads who did not attend the demo.',
    'assessment-written': 'Leads who completed the assessment.',
    'assessment-not-written': 'Leads who did not complete the assessment.',
    'done': 'Leads who completed the activation form.',
    'activation-form-not-done': 'Leads who have not completed the activation form.',
    'counsellor-dashboard-logged-in': 'Activation-complete leads who have logged in to the Counsellor dashboard.',
    'counsellor-dashboard-not-logged-in': 'Activation-complete leads who have not yet logged in to the Counsellor dashboard.',
  };

  function getPopoverContent(cardId) {
    const description = CARD_DESCRIPTIONS[cardId] ?? '';
    const base = { description };
    switch (cardId) {
      case 'leads-added':
        return { ...base, label: 'Leads added', value: total, conversionPct: null, conversionLabel: null };
      case 'otp-verified':
        return { ...base, label: 'OTP verified', value: otpVerified, conversionPct: total > 0 ? Math.round((otpVerified / total) * 100) : null, conversionLabel: 'of leads' };
      case 'otp-not-verified':
        return { ...base, label: 'OTP not verified', value: otpNotVerified, conversionPct: total > 0 ? Math.round((otpNotVerified / total) * 100) : null, conversionLabel: 'of leads' };
      case 'slot-booked':
        return { ...base, label: 'Slot booked', value: otpVerifiedSlotBooked, conversionPct: otpVerified > 0 ? Math.round((otpVerifiedSlotBooked / otpVerified) * 100) : null, conversionLabel: 'of OTP verified' };
      case 'slot-not-booked':
        return { ...base, label: 'Slot not booked', value: otpVerifiedSlotNotBooked, conversionPct: otpVerified > 0 ? Math.round((otpVerifiedSlotNotBooked / otpVerified) * 100) : null, conversionLabel: 'of OTP verified' };
      case 'demo-attended':
        return { ...base, label: 'Demo attended', value: demoAttended, conversionPct: slotBooked > 0 ? Math.round((demoAttended / slotBooked) * 100) : null, conversionLabel: 'of slot booked' };
      case 'demo-not-attended':
        return { ...base, label: 'Demo not attended', value: demoNotAttended, conversionPct: slotBooked > 0 ? Math.round((demoNotAttended / slotBooked) * 100) : null, conversionLabel: 'of slot booked' };
      case 'assessment-written':
        return { ...base, label: 'Assessment written', value: assessmentWritten, conversionPct: demoAttended > 0 ? Math.round((assessmentWritten / demoAttended) * 100) : null, conversionLabel: 'of demo attended' };
      case 'assessment-not-written':
        return { ...base, label: 'Assessment not written', value: assessmentNotWritten, conversionPct: demoAttended > 0 ? Math.round((assessmentNotWritten / demoAttended) * 100) : null, conversionLabel: 'of demo attended' };
      case 'done':
        return { ...base, label: 'Done', value: activationFormCompleted, conversionPct: assessmentWritten > 0 ? Math.round((activationFormCompleted / assessmentWritten) * 100) : null, conversionLabel: 'of assessment written', loginUrl: '/counsellor/login', loginLabel: 'Counsellor dashboard login' };
      case 'activation-form-not-done':
        return { ...base, label: 'Activation form not done', value: activationFormNotDone, conversionPct: assessmentWritten > 0 ? Math.round((activationFormNotDone / assessmentWritten) * 100) : null, conversionLabel: 'of assessment written' };
      case 'counsellor-dashboard-logged-in':
        return { ...base, label: 'Counsellor dashboard: Logged in', value: counsellorDashboardLoggedIn, conversionPct: activationFormCompleted > 0 ? Math.round((counsellorDashboardLoggedIn / activationFormCompleted) * 100) : null, conversionLabel: 'of activation form done' };
      case 'counsellor-dashboard-not-logged-in':
        return { ...base, label: 'Counsellor dashboard: Not logged in', value: counsellorDashboardNotLoggedIn, conversionPct: activationFormCompleted > 0 ? Math.round((counsellorDashboardNotLoggedIn / activationFormCompleted) * 100) : null, conversionLabel: 'of activation form done' };
      default:
        return { ...base, label: '', value: 0, conversionPct: null, conversionLabel: null };
    }
  }

  function handleCardClick(cardId, e) {
    e.stopPropagation();
    if (justDraggedRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverAnchor({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    setPopoverCardId((prev) => (prev === cardId ? null : cardId));
  }

  function buildLeadsQuery(cardId) {
    const config = FUNNEL_CARD_LEADS_PARAMS[cardId];
    if (!config?.params) return '';
    const search = new URLSearchParams();
    Object.entries(config.params).forEach(([k, v]) => { if (v != null && v !== '') search.set(k, String(v)); });
    return search.toString();
  }

  function handleZoomIn() {
    setScale((s) => Math.min(2, s * 1.25));
  }
  function handleZoomOut() {
    setScale((s) => Math.max(0.5, s / 1.25));
  }
  function handleResetView() {
    setScale(1);
  }
  function handleFitToView() {
    const el = funnelScrollRef.current;
    if (!el || !contentSize?.width || !contentSize?.height) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const fitScale = Math.min(cw / contentSize.width, ch / contentSize.height, 1);
    const capped = Math.max(0.5, fitScale);
    setScale(capped);
    requestAnimationFrame(() => {
      el.scrollTop = 0;
      const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      el.scrollLeft = maxScrollLeft / 2;
    });
  }

  const CARD_WIDTH = 240;
  const CARD_MIN_HEIGHT = 132;

  function FunnelNode({ label, value, widthPct, conversionPct, conversionLabel, cardId, onCardClick }) {
    const card = (
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
    if (cardId != null && onCardClick) {
      return (
        <div
          role="button"
          tabIndex={0}
          data-funnel-card
          onClick={(e) => onCardClick(cardId, e)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(cardId, e); } }}
          className="cursor-pointer"
          aria-haspopup="dialog"
          aria-expanded={!!popoverCardId && popoverCardId === cardId}
        >
          {card}
        </div>
      );
    }
    return card;
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
        aria-label="Lead conversion funnel: OTP verified and not verified, slot booked and not booked, demo attended and not attended, assessment written and not written, done and activation form not done, counsellor dashboard logged in and not logged in"
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Lead conversion funnel</h3>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm" role="toolbar" aria-label="Canvas zoom and view">
            <button type="button" onClick={handleZoomOut} className="h-8 w-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 font-medium" title="Zoom out" aria-label="Zoom out">−</button>
            <button type="button" onClick={handleZoomIn} className="h-8 w-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 font-medium" title="Zoom in" aria-label="Zoom in">+</button>
            <span className="text-xs text-gray-500 px-1 min-w-[3rem] text-center" aria-live="polite">{Math.round(scale * 100)}%</span>
            <button type="button" onClick={handleFitToView} className="h-8 px-2 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 text-xs font-medium" title="Fit to view" aria-label="Fit to view">Fit</button>
            <button type="button" onClick={handleResetView} className="h-8 px-2 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 text-xs font-medium" title="Reset view" aria-label="Reset view">Reset</button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 overflow-hidden min-h-0 flex-1 flex flex-col">
          <div
            ref={funnelScrollRef}
            className="flex-1 min-h-0 overflow-x-auto overflow-y-auto scrollbar-hide bg-white/50 pl-48 pr-8 pt-6 pb-8"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: isDragging ? 'none' : undefined,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
          <div
            style={contentSize ? { width: contentSize.width * scale, height: contentSize.height * scale, position: 'relative' } : undefined}
          >
            <div
              style={contentSize ? { position: 'absolute', left: 0, top: 0, width: contentSize.width, height: contentSize.height, transform: `scale(${scale})`, transformOrigin: '0 0' } : undefined}
            >
              <div
                ref={funnelContentRef}
                className="w-max min-w-full pt-2 pb-4 inline-block pl-64 pr-24"
                style={{ minWidth: 'max(100%, 1600px)' }}
              >
              {/* Tree: Root */}
              <div className="flex flex-col items-center">
          <div
            role="button"
            tabIndex={0}
            data-funnel-card
            onClick={(e) => handleCardClick('leads-added', e)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick('leads-added', e); } }}
            className="rounded-lg border-2 border-primary-navy bg-white shadow-sm p-4 flex flex-col min-h-[132px] w-[240px] box-border cursor-pointer hover:shadow-md transition-shadow"
            style={{ minHeight: CARD_MIN_HEIGHT, width: CARD_WIDTH }}
            aria-haspopup="dialog"
            aria-expanded={!!popoverCardId && popoverCardId === 'leads-added'}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leads added</p>
            <p className="text-xl font-bold text-primary-navy tabular-nums">{formatCount(total)}</p>
            <div className="mt-auto h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary-navy rounded-full w-full" /></div>
          </div>
          <div className="my-1"><ConnectorV h={16} /></div>
          <div className="flex justify-center w-full">
            <div style={{ minWidth: 280 + 560 + 40 }} className="flex justify-center">
              <ConnectorHFull className="w-full" />
            </div>
          </div>
        </div>

        {/* Tree: Level 1 — OTP division. Right column first in DOM so left column paints on top. */}
        <div className="flex justify-center gap-8 sm:gap-10 mt-1.5 mb-1.5 min-w-max">
          {/* OTP not verified (right) */}
          <div className="flex flex-col items-center shrink-0 w-[280px] rounded-lg bg-gray-50/50 py-2 px-2 order-2">
            <div className="mb-1"><ConnectorV h={16} /></div>
            <FunnelNode
              cardId="otp-not-verified"
              onCardClick={handleCardClick}
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
              cardId="otp-verified"
              onCardClick={handleCardClick}
              label="OTP verified"
              value={otpVerified}
              widthPct={maxOtp > 0 ? (otpVerified / maxOtp) * 100 : 0}
              conversionPct={total > 0 ? Math.round((otpVerified / total) * 100) : null}
              conversionLabel="of leads"
            />
            <div className="mt-1 mb-1"><ConnectorV h={16} /></div>
            <div className="flex justify-center w-full">
              <ConnectorHFull className="w-full max-w-[22rem]" style={{ maxWidth: '22rem' }} />
            </div>
            <div className="flex gap-6 sm:gap-8 w-full max-w-[568px] justify-center mt-1">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="mb-1"><ConnectorV h={12} /></div>
                <FunnelNode
                  cardId="slot-booked"
                  onCardClick={handleCardClick}
                  label="Slot booked"
                  value={otpVerifiedSlotBooked}
                  widthPct={maxSlot > 0 ? (otpVerifiedSlotBooked / maxSlot) * 100 : 0}
                  conversionPct={otpVerified > 0 ? Math.round((otpVerifiedSlotBooked / otpVerified) * 100) : null}
                  conversionLabel="of OTP verified"
                />
                <div className="mt-1.5 mb-1"><ConnectorV h={12} /></div>
                {/* Bar and row same width so both Demo cards connect: left column (Assessment block 752) + gap + right 240 */}
                <div className="flex flex-col items-center w-full">
                  <div className="w-full" style={{ width: (2 * CARD_WIDTH + 24) + 8 + CARD_WIDTH + 12 + CARD_WIDTH }}>
                    <ConnectorHFull className="w-full" />
                  </div>
                  <div className="flex gap-3 mt-1 w-full" style={{ width: (2 * CARD_WIDTH + 24) + 8 + CARD_WIDTH + 12 + CARD_WIDTH }}>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="mb-1"><ConnectorV h={16} /></div>
                      <FunnelNode
                        cardId="demo-attended"
                        onCardClick={handleCardClick}
                        label="Demo attended"
                        value={demoAttended}
                        widthPct={maxDemo > 0 ? (demoAttended / maxDemo) * 100 : 0}
                        conversionPct={slotBooked > 0 ? Math.round((demoAttended / slotBooked) * 100) : null}
                        conversionLabel="of slot booked"
                      />
                      <div className="mt-1 mb-1"><ConnectorV h={12} /></div>
                      {/* Bar and row same width so both Assessment cards connect */}
                      <div className="w-full" style={{ width: (2 * CARD_WIDTH + 24) + 8 + CARD_WIDTH }}>
                        <ConnectorHFull className="w-full" />
                      </div>
                      <div className="flex gap-2 mt-1 items-start w-full" style={{ width: (2 * CARD_WIDTH + 24) + 8 + CARD_WIDTH }}>
                        <div className="flex flex-col items-center shrink-0">
                          <div className="mb-1"><ConnectorV h={16} /></div>
                          <FunnelNode
                            cardId="assessment-written"
                            onCardClick={handleCardClick}
                            label="Assessment written"
                            value={assessmentWritten}
                            widthPct={maxAssessment > 0 ? (assessmentWritten / maxAssessment) * 100 : 0}
                            conversionPct={demoAttended > 0 ? Math.round((assessmentWritten / demoAttended) * 100) : null}
                            conversionLabel="of demo attended"
                          />
                          <div className="mt-2 mb-1"><ConnectorV h={12} /></div>
                          <div className="w-full mt-2" style={{ width: 2 * CARD_WIDTH + 24 }}>
                            <ConnectorHFull className="w-full" />
                          </div>
                          <div className="flex gap-6 mt-2 justify-center w-full" style={{ width: 2 * CARD_WIDTH + 24 }}>
                            <div className="flex flex-col items-center shrink-0">
                              <div className="mb-1"><ConnectorV h={16} /></div>
                              <FunnelNode
                                cardId="done"
                                onCardClick={handleCardClick}
                                label="Done"
                                value={activationFormCompleted}
                                widthPct={maxActivation > 0 ? (activationFormCompleted / maxActivation) * 100 : 0}
                                conversionPct={assessmentWritten > 0 ? Math.round((activationFormCompleted / assessmentWritten) * 100) : null}
                                conversionLabel="of assessment written"
                              />
                              <div className="mt-2 mb-1"><ConnectorV h={12} /></div>
                              <div className="w-full" style={{ width: 2 * CARD_WIDTH + 24 }}>
                                <ConnectorHFull className="w-full" />
                              </div>
                              <div className="flex gap-6 mt-2 justify-center w-full" style={{ width: 2 * CARD_WIDTH + 24 }}>
                                <div className="flex flex-col items-center shrink-0">
                                  <div className="mb-1"><ConnectorV h={16} /></div>
                                  <FunnelNode
                                    cardId="counsellor-dashboard-logged-in"
                                    onCardClick={handleCardClick}
                                    label="Counsellor dashboard: Logged in"
                                    value={counsellorDashboardLoggedIn}
                                    widthPct={maxCounsellorDashboard > 0 ? (counsellorDashboardLoggedIn / maxCounsellorDashboard) * 100 : 0}
                                    conversionPct={activationFormCompleted > 0 ? Math.round((counsellorDashboardLoggedIn / activationFormCompleted) * 100) : null}
                                    conversionLabel="of activation form done"
                                  />
                                </div>
                                <div className="flex flex-col items-center shrink-0">
                                  <div className="mb-1"><ConnectorV h={16} /></div>
                                  <FunnelNode
                                    cardId="counsellor-dashboard-not-logged-in"
                                    onCardClick={handleCardClick}
                                    label="Counsellor dashboard: Not logged in"
                                    value={counsellorDashboardNotLoggedIn}
                                    widthPct={maxCounsellorDashboard > 0 ? (counsellorDashboardNotLoggedIn / maxCounsellorDashboard) * 100 : 0}
                                    conversionPct={activationFormCompleted > 0 ? Math.round((counsellorDashboardNotLoggedIn / activationFormCompleted) * 100) : null}
                                    conversionLabel="of activation form done"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center shrink-0">
                              <div className="mb-1"><ConnectorV h={16} /></div>
                              <FunnelNode
                                cardId="activation-form-not-done"
                                onCardClick={handleCardClick}
                                label="Activation form not done"
                                value={activationFormNotDone}
                                widthPct={maxActivation > 0 ? (activationFormNotDone / maxActivation) * 100 : 0}
                                conversionPct={assessmentWritten > 0 ? Math.round((activationFormNotDone / assessmentWritten) * 100) : null}
                                conversionLabel="of assessment written"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center shrink-0">
                          <div className="mb-1"><ConnectorV h={16} /></div>
                          <FunnelNode
                            cardId="assessment-not-written"
                            onCardClick={handleCardClick}
                            label="Assessment not written"
                            value={assessmentNotWritten}
                            widthPct={maxAssessment > 0 ? (assessmentNotWritten / maxAssessment) * 100 : 0}
                            conversionPct={demoAttended > 0 ? Math.round((assessmentNotWritten / demoAttended) * 100) : null}
                            conversionLabel="of demo attended"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="mb-1"><ConnectorV h={16} /></div>
                      <FunnelNode
                        cardId="demo-not-attended"
                        onCardClick={handleCardClick}
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
                  cardId="slot-not-booked"
                  onCardClick={handleCardClick}
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
      </div>
      {popoverCardId && popoverAnchor && createPortal(
        <div
          data-funnel-popover
          role="dialog"
          aria-label="Funnel stage details"
          className="fixed z-[10000] w-[min(360px,calc(100vw-24px))] max-h-[min(80vh,480px)] rounded-lg border border-gray-200 bg-white shadow-xl flex flex-col overflow-hidden"
          style={{
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const c = getPopoverContent(popoverCardId);
            const config = FUNNEL_CARD_LEADS_PARAMS[popoverCardId];
            const query = buildLeadsQuery(popoverCardId);
            const viewAllUrl = query ? `/admin/leads?${query}` : '/admin/leads';
            const hasExactList = config?.hasExactList;
            const viewRelatedLabel = config?.viewRelatedLabel;
            return (
              <>
                <div className="p-3 border-b border-gray-100 shrink-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
                  <p className="font-bold text-primary-navy tabular-nums text-lg">{formatCount(c.value)}</p>
                  {c.conversionPct != null && c.conversionLabel && (
                    <p className="text-sm text-gray-600 mt-1">{c.conversionPct}% {c.conversionLabel}</p>
                  )}
                  {c.description && <p className="text-sm text-gray-500 mt-2">{c.description}</p>}
                  {c.loginUrl && (
                    <p className="text-sm mt-2 border-t border-gray-100 pt-2">
                      <span className="text-gray-500">{c.loginLabel}: </span>
                      <Link to={c.loginUrl} target="_blank" rel="noopener noreferrer" className="text-primary-navy font-medium hover:underline">{c.loginUrl}</Link>
                    </p>
                  )}
                  <p className="mt-2">
                    {viewRelatedLabel ? (
                      <Link to={viewAllUrl} className="text-sm text-primary-navy font-medium hover:underline">
                        View related leads ({viewRelatedLabel})
                      </Link>
                    ) : (
                      <Link to={viewAllUrl} className="text-sm text-primary-navy font-medium hover:underline">
                        View all {formatCount(c.value)} leads
                      </Link>
                    )}
                  </p>
                </div>
                {hasExactList && (
                  <div className="flex-1 min-h-0 overflow-y-auto p-3">
                    {cardLeads.loading && (
                      <p className="text-sm text-gray-500">Loading leads…</p>
                    )}
                    {cardLeads.error && (
                      <p className="text-sm text-red-600" role="alert">{cardLeads.error}</p>
                    )}
                    {!cardLeads.loading && !cardLeads.error && cardLeads.list.length === 0 && c.value > 0 && (
                      <p className="text-sm text-gray-500">No leads to show.</p>
                    )}
                    {!cardLeads.loading && !cardLeads.error && cardLeads.list.length > 0 && (
                      <ul className="space-y-2">
                        {cardLeads.list.map((lead) => (
                          <li key={lead.id} className="flex items-center justify-between gap-2 text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <span className="truncate flex-1" title={lead.fullName || lead.phone}>{lead.fullName || '—'}</span>
                            <span className="text-gray-500 tabular-nums shrink-0">{lead.phone || '—'}</span>
                            <Link
                              to={`/admin/leads?q=${encodeURIComponent(lead.phone || '')}`}
                              className="shrink-0 text-primary-navy font-medium hover:underline text-xs"
                            >
                              View
                            </Link>
                          </li>
                        ))}
                        {cardLeads.total > cardLeads.list.length && (
                          <li className="pt-1">
                            <Link to={viewAllUrl} className="text-xs text-primary-navy font-medium hover:underline">
                              View all {formatCount(cardLeads.total)} →
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </div>,
        document.body
      )}
    </div>
  );
}
