import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { FiUsers, FiCheckCircle, FiCalendar, FiVideo, FiEdit3, FiAward, FiLoader, FiUserCheck, FiCheck, FiX } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, AreaChart, Area, ReferenceLine } from 'recharts';
import { getAdminStats, getAdminLeads, getInfluencerLinks, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import { useAdminDateRange } from '../../hooks/useAdminDateRange';
import { leadListFiltersToSearchParams, leadListFiltersToApiParams } from '../../utils/adminLeadFiltersShared';
import DashboardSkeleton from '../../components/Admin/DashboardSkeleton';
import KpiCard from '../../components/Admin/KpiCard';
import ChartContainer from '../../components/Admin/ChartContainer';

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
  'kpi-slot-booked': { params: { slotBooked: 'true' }, hasExactList: true },
  'kpi-demo-attended': { params: { demoAttended: 'true' }, hasExactList: true },
  'kpi-assessment-written': { params: { assessmentWritten: 'true' }, hasExactList: true },
  'kpi-activation-done': { params: { activationCompleted: 'true' }, hasExactList: true },
  'kpi-in-progress': { params: { applicationStatus: 'in_progress' }, hasExactList: true },
  'kpi-registered': { params: { applicationStatus: 'registered' }, hasExactList: true },
  'kpi-completed': { params: { applicationStatus: 'completed' }, hasExactList: true },
  'organic-rank-total': { params: { utm_content: 'organic_rank_predictor' }, hasExactList: true },
  'organic-rank-otp-verified': { params: { utm_content: 'organic_rank_predictor', otpVerified: 'true' }, hasExactList: true },
  'organic-rank-slot-booked': { params: { utm_content: 'organic_rank_predictor', otpVerified: 'true', slotBooked: 'true' }, hasExactList: true },
};

const DRAG_THRESHOLD_PX = 5;

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

function formatLastUpdated(ts) {
  if (!ts) return null;
  const d = (Date.now() - ts) / 60000;
  if (d < 1) return 'Just now';
  if (d < 60) return `${Math.floor(d)} min ago`;
  return `${Math.floor(d / 60)} hr ago`;
}

/** Format YYYY-MM-DD (or date string) for chart tooltip and axis: e.g. "7 Feb 2026". */
function formatChartDateLabel(label) {
  if (label == null || label === '') return '—';
  const s = String(label);
  if (s.startsWith('live-')) return 'Now';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSlotIdForDisplay(slotId) {
  if (!slotId || typeof slotId !== 'string') return slotId || '';
  const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM|6PM)$/i);
  if (match) {
    const dayNames = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' };
    return `${dayNames[match[1].toUpperCase()] || match[1]} ${match[2]}`;
  }
  return slotId;
}

/** Format number as currency (INR) for tooltips and axis. */
function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

/** Aggregate influencer links by influencerName for Budget and Cost-per-lead charts. */
function aggregateUtmLinksByInfluencer(links) {
  if (!Array.isArray(links) || links.length === 0) return { budget: [], costPerLead: [] };
  const byName = new Map();
  for (const link of links) {
    const name = (link.influencerName || '—').trim() || '—';
    const cost = link.cost != null && typeof link.cost === 'number' ? link.cost : 0;
    const leads = Math.max(0, Number(link.leadCount) || 0);
    if (!byName.has(name)) {
      byName.set(name, { name, totalCost: 0, totalLeads: 0 });
    }
    const row = byName.get(name);
    row.totalCost += cost;
    row.totalLeads += leads;
  }
  const budget = [...byName.entries()]
    .filter(([, r]) => r.totalCost > 0)
    .map(([, r]) => ({ name: r.name, cost: r.totalCost }))
    .sort((a, b) => b.cost - a.cost);
  const costPerLead = [...byName.entries()]
    .filter(([, r]) => r.totalLeads > 0 && r.totalCost > 0)
    .map(([, r]) => ({ name: r.name, costPerLead: r.totalCost / r.totalLeads }))
    .sort((a, b) => b.costPerLead - a.costPerLead);
  return { budget, costPerLead };
}

export default function Overview() {
  const { logout } = useAuth();
  const { dateRange, leadListFilters } = useAdminDateRange();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [popoverCardId, setPopoverCardId] = useState(null);
  const [cardLeads, setCardLeads] = useState({ list: [], total: 0, loading: false, error: '' });
  const [scale, setScale] = useState(1);
  const [contentSize, setContentSize] = useState(null);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const funnelScrollRef = useRef(null);
  const funnelContentRef = useRef(null);
  const leadModalCloseRef = useRef(null);
  const dragRef = useRef({ lastX: 0, lastY: 0, pointerDown: false, pastThreshold: false });
  const justDraggedRef = useRef(false);

  const [utmLinks, setUtmLinks] = useState([]);
  const [utmLinksLoading, setUtmLinksLoading] = useState(false);
  const [utmLinksError, setUtmLinksError] = useState('');
  const [organicLeadStats, setOrganicLeadStats] = useState({
    total: 0,
    otpVerified: 0,
    slotBooked: 0,
    loading: false,
  });
  const [liveTick, setLiveTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const params = {};
    if (dateRange.from) params.from = dateRange.from;
    if (dateRange.to) params.to = dateRange.to;
    getAdminStats(params, getStoredToken()).then((statsRes) => {
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
      setLastFetchedAt(Date.now());
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [logout, dateRange.from, dateRange.to, refreshTrigger]);

  // Poll stats every second when tab is visible so the page-visits chart and KPIs stay live
  useEffect(() => {
    const params = {};
    if (dateRange.from) params.from = dateRange.from;
    if (dateRange.to) params.to = dateRange.to;
    const fetchStats = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      getAdminStats(params, getStoredToken()).then((statsRes) => {
        if (!statsRes.success) {
          if (statsRes.status === 401) {
            logout();
            window.location.href = '/admin/login';
          }
          return;
        }
        setStats(statsRes.data?.data || null);
        setLastFetchedAt(Date.now());
      });
    };
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const interval = setInterval(fetchStats, FIVE_MINUTES_MS);
    return () => clearInterval(interval);
  }, [logout, dateRange.from, dateRange.to]);

  // Tick every second so the "now" line and chart can update for stock-style live feel
  useEffect(() => {
    const interval = setInterval(() => setLiveTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setUtmLinksLoading(true);
    setUtmLinksError('');
    getInfluencerLinks(getStoredToken()).then((res) => {
      if (cancelled) return;
      if (!res.success) {
        if (res.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setUtmLinksError(res.message || 'Failed to load UTM links');
        setUtmLinks([]);
      } else {
        setUtmLinks(Array.isArray(res.data?.data) ? res.data.data : []);
      }
      setUtmLinksLoading(false);
    });
    return () => { cancelled = true; };
  }, [logout, refreshTrigger]);

  useEffect(() => {
    let cancelled = false;
    setOrganicLeadStats((prev) => ({ ...prev, loading: true }));

    const baseParams = {};
    if (dateRange.from) baseParams.from = dateRange.from;
    if (dateRange.to) baseParams.to = dateRange.to;

    const getTotalFromResponse = (res) => {
      if (!res?.success) return null;
      const totalFromPagination = Number(res?.data?.pagination?.total);
      if (Number.isFinite(totalFromPagination)) return totalFromPagination;
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      return list.length;
    };

    Promise.all([
      getAdminLeads({ ...baseParams, utm_content: 'organic_rank_predictor', page: 1, limit: 1 }, getStoredToken()),
      getAdminLeads({ ...baseParams, utm_content: 'organic_rank_predictor', otpVerified: 'true', page: 1, limit: 1 }, getStoredToken()),
      getAdminLeads({ ...baseParams, utm_content: 'organic_rank_predictor', otpVerified: 'true', slotBooked: 'true', page: 1, limit: 1 }, getStoredToken()),
    ]).then(([totalRes, otpRes, slotRes]) => {
      if (cancelled) return;
      if ([totalRes, otpRes, slotRes].some((r) => r?.status === 401)) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setOrganicLeadStats({
        total: getTotalFromResponse(totalRes) ?? 0,
        otpVerified: getTotalFromResponse(otpRes) ?? 0,
        slotBooked: getTotalFromResponse(slotRes) ?? 0,
        loading: false,
      });
    }).catch(() => {
      if (cancelled) return;
      setOrganicLeadStats((prev) => ({ ...prev, loading: false }));
    });

    return () => { cancelled = true; };
  }, [dateRange.from, dateRange.to, refreshTrigger, logout]);

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

  useEffect(() => {
    if (!popoverCardId) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPopoverCardId(null);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusId = requestAnimationFrame(() => {
      leadModalCloseRef.current?.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(focusId);
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
    getAdminLeads(
      {
        ...leadListFiltersToApiParams(leadListFilters),
        ...config.params,
        page: 1,
        limit: 25,
        ...(dateRange.from && { from: dateRange.from }),
        ...(dateRange.to && { to: dateRange.to }),
      },
      getStoredToken()
    ).then((res) => {
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
  }, [popoverCardId, dateRange.from, dateRange.to, leadListFilters]);

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
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full max-w-xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 portal-card" role="alert">
          <p className="text-gray-800 font-medium mb-2">Could not load dashboard</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            type="button"
            onClick={() => { setError(''); setRefreshTrigger((t) => t + 1); }}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-navy focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
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
    'kpi-slot-booked': 'Leads who booked a demo slot (any verification stage).',
    'kpi-demo-attended': 'Leads with a booked slot who attended the demo.',
    'kpi-assessment-written': 'Demo attendees who completed an assessment (forms 1–3).',
    'kpi-activation-done': 'Assessment-complete leads who submitted the activation form.',
    'kpi-in-progress': 'Leads whose application status is in progress.',
    'kpi-registered': 'Leads whose application status is registered.',
    'kpi-completed': 'Leads whose application status is completed.',
    'organic-rank-total': 'Organic leads created from the rank predictor flow.',
    'organic-rank-otp-verified': 'Organic rank predictor leads that completed OTP verification.',
    'organic-rank-slot-booked': 'Organic rank predictor leads that verified OTP and booked a slot.',
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
      case 'kpi-slot-booked':
        return { ...base, label: 'Slot booked', value: slotBooked, conversionPct: otpVerified > 0 ? Math.round((slotBooked / otpVerified) * 100) : null, conversionLabel: 'of OTP verified' };
      case 'kpi-demo-attended':
        return { ...base, label: 'Demo attended', value: demoAttended, conversionPct: slotBooked > 0 ? Math.round((demoAttended / slotBooked) * 100) : null, conversionLabel: 'of slot booked' };
      case 'kpi-assessment-written':
        return { ...base, label: 'Assessment written', value: assessmentWritten, conversionPct: demoAttended > 0 ? Math.round((assessmentWritten / demoAttended) * 100) : null, conversionLabel: 'of demo attended' };
      case 'kpi-activation-done':
        return { ...base, label: 'Activation done', value: activationFormCompleted, conversionPct: assessmentWritten > 0 ? Math.round((activationFormCompleted / assessmentWritten) * 100) : null, conversionLabel: 'of assessment written', loginUrl: '/counsellor/login', loginLabel: 'Counsellor dashboard login' };
      case 'kpi-in-progress':
        return { ...base, label: 'In progress', value: stats?.inProgress ?? 0, conversionPct: total > 0 ? Math.round(((stats?.inProgress ?? 0) / total) * 100) : null, conversionLabel: 'of total' };
      case 'kpi-registered':
        return { ...base, label: 'Registered', value: stats?.registered ?? 0, conversionPct: total > 0 ? Math.round(((stats?.registered ?? 0) / total) * 100) : null, conversionLabel: 'of total' };
      case 'kpi-completed':
        return { ...base, label: 'Completed', value: stats?.completed ?? 0, conversionPct: total > 0 ? Math.round(((stats?.completed ?? 0) / total) * 100) : null, conversionLabel: 'of total' };
      case 'organic-rank-total':
        return { ...base, label: 'Organic rank leads', value: organicLeadStats.total ?? 0, conversionPct: total > 0 ? Math.round(((organicLeadStats.total ?? 0) / total) * 100) : null, conversionLabel: 'of total leads' };
      case 'organic-rank-otp-verified':
        return { ...base, label: 'Organic rank OTP verified', value: organicLeadStats.otpVerified ?? 0, conversionPct: (organicLeadStats.total ?? 0) > 0 ? Math.round(((organicLeadStats.otpVerified ?? 0) / (organicLeadStats.total ?? 1)) * 100) : null, conversionLabel: 'of organic rank leads' };
      case 'organic-rank-slot-booked':
        return { ...base, label: 'Organic rank slot booked', value: organicLeadStats.slotBooked ?? 0, conversionPct: (organicLeadStats.otpVerified ?? 0) > 0 ? Math.round(((organicLeadStats.slotBooked ?? 0) / (organicLeadStats.otpVerified ?? 1)) * 100) : null, conversionLabel: 'of OTP verified' };
      default:
        return { ...base, label: '', value: 0, conversionPct: null, conversionLabel: null };
    }
  }

  function handleCardClick(cardId, e) {
    e.stopPropagation();
    if (justDraggedRef.current) return;
    setPopoverCardId((prev) => (prev === cardId ? null : cardId));
  }

  function buildLeadsQuery(cardId) {
    const config = FUNNEL_CARD_LEADS_PARAMS[cardId];
    const search = new URLSearchParams(leadListFiltersToSearchParams(leadListFilters).toString());
    if (config?.params) {
      Object.entries(config.params).forEach(([k, v]) => {
        if (v != null && v !== '') search.set(k, String(v));
      });
    }
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
            className="h-full rounded-full transition-[width] duration-300 ease-out bg-primary-navy"
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

  const pipelineChartData = [
    { name: 'Prospect', count: total },
    { name: 'Opportunity', count: slotBooked },
    { name: 'Customer', count: activationFormCompleted },
    { name: 'Disqualified', count: otpNotVerified },
    { name: 'In progress', count: stats?.inProgress ?? 0 },
  ];
  const pipelineEmpty = pipelineChartData.every((d) => d.count === 0);

  const signupsOverTime = stats?.signupsOverTime ?? [];
  const pageVisitsChartData = stats?.signupsOverTime ?? [];
  const slotData = Object.entries(stats?.bySlot ?? {}).map(([id, value]) => ({
    name: formatSlotIdForDisplay(id),
    count: value,
  }));

  const { budget: utmBudgetData, costPerLead: utmCostPerLeadData } = aggregateUtmLinksByInfluencer(utmLinks);
  const utmTotalBudget = utmLinks.reduce((sum, l) => sum + (l.cost != null && typeof l.cost === 'number' ? l.cost : 0), 0);
  const utmTotalLeads = utmLinks.reduce((sum, l) => sum + Math.max(0, Number(l.leadCount) || 0), 0);
  const utmAvgCostPerLead = utmTotalLeads > 0 && utmTotalBudget > 0 ? utmTotalBudget / utmTotalLeads : null;
  const utmBudgetEmpty = utmBudgetData.length === 0;
  const utmCostPerLeadEmpty = utmCostPerLeadData.length === 0;
  const showLeadConversionFunnel = false;

  return (
    <div className="w-full min-h-0 flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          This dashboard gives you analytics insights of the leads created and conversion funnel.
        </p>
        <div className="flex items-center gap-3">
          {lastFetchedAt != null && (
            <span className="text-xs text-gray-500" aria-live="polite">
              Last updated: {formatLastUpdated(lastFetchedAt)}
            </span>
          )}
          <button
            type="button"
            onClick={() => setRefreshTrigger((t) => t + 1)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-navy focus:ring-offset-2"
            aria-label="Refresh dashboard data"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Page visits on live — stock-market themed chart */}
      <section aria-labelledby="section-page-visits-live" className="mb-2">
        <h2 id="section-page-visits-live" className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-2">
          Page visits on live
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700" aria-label="Live updating">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </h2>
        <p className="text-sm text-gray-500 mb-5">Traffic over time. Refreshes every 5 minutes while you&apos;re on this page.</p>
        <ChartContainer
          title=""
          empty={pageVisitsChartData.length === 0}
          emptyMessage="No page visit data for the selected period"
        >
          {pageVisitsChartData.length > 0 && (
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <AreaChart
                  data={
                    (() => {
                      const last = pageVisitsChartData[pageVisitsChartData.length - 1];
                      const lastCount = last?.count ?? 0;
                      return [...pageVisitsChartData, { date: `live-${liveTick}`, count: lastCount }];
                    })()
                  }
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="pageVisitsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="#64748b"
                    tickFormatter={formatChartDateLabel}
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                    formatter={(value) => [value, 'Page visits']}
                    labelFormatter={formatChartDateLabel}
                  />
                  <ReferenceLine x={`live-${liveTick}`} stroke="#0d9488" strokeDasharray="2 2" />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Page visits"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fill="url(#pageVisitsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartContainer>
      </section>

      {/* Key metrics */}
      <section aria-labelledby="section-key-metrics" className="mb-2">
        <h2 id="section-key-metrics" className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Key metrics</h2>
        <p className="text-sm text-gray-500 mb-5">Lead funnel and application status at a glance.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          <KpiCard
            label="Total Leads"
            value={total}
            title="Total leads added — click to list leads"
            icon={FiUsers}
            accent="hero"
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'leads-added'}
            onActivate={(e) => handleCardClick('leads-added', e)}
          />
          <KpiCard
            label="OTP Verified"
            value={otpVerified}
            title="Leads who verified OTP — click to list"
            icon={FiCheckCircle}
            accent
            subtitle={total > 0 ? `${Math.round((otpVerified / total) * 100)}% of total` : ''}
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'otp-verified'}
            onActivate={(e) => handleCardClick('otp-verified', e)}
          />
          <KpiCard
            label="Slot Booked"
            value={slotBooked}
            title="Leads who booked a slot — click to list"
            icon={FiCalendar}
            accent
            subtitle={otpVerified > 0 ? `${Math.round((slotBooked / otpVerified) * 100)}% of OTP verified` : ''}
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'kpi-slot-booked'}
            onActivate={(e) => handleCardClick('kpi-slot-booked', e)}
          />
          <KpiCard
            label="Demo Attended"
            value={demoAttended}
            title="Leads who attended demo — click to list"
            icon={FiVideo}
            accent
            subtitle={slotBooked > 0 ? `${Math.round((demoAttended / slotBooked) * 100)}% of slot booked` : ''}
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'kpi-demo-attended'}
            onActivate={(e) => handleCardClick('kpi-demo-attended', e)}
          />
          <KpiCard
            label="Assessment Written"
            value={assessmentWritten}
            title="Leads who completed assessment — click to list"
            icon={FiEdit3}
            accent
            subtitle={demoAttended > 0 ? `${Math.round((assessmentWritten / demoAttended) * 100)}% of demo attended` : ''}
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'kpi-assessment-written'}
            onActivate={(e) => handleCardClick('kpi-assessment-written', e)}
          />
          <KpiCard
            label="Activation Done"
            value={activationFormCompleted}
            title="Leads who completed activation form — click to list"
            icon={FiAward}
            accent
            subtitle={assessmentWritten > 0 ? `${Math.round((activationFormCompleted / assessmentWritten) * 100)}% of assessment written` : ''}
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'kpi-activation-done'}
            onActivate={(e) => handleCardClick('kpi-activation-done', e)}
          />
          <KpiCard
            label="In Progress"
            value={stats?.inProgress ?? 0}
            title="Leads in progress — click to list"
            icon={FiLoader}
            accent
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'kpi-in-progress'}
            onActivate={(e) => handleCardClick('kpi-in-progress', e)}
          />
          <KpiCard
            label="Registered"
            value={stats?.registered ?? 0}
            title="Registered leads — click to list"
            icon={FiUserCheck}
            accent
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'kpi-registered'}
            onActivate={(e) => handleCardClick('kpi-registered', e)}
          />
          <KpiCard
            label="Completed"
            value={stats?.completed ?? 0}
            title="Completed applications — click to list"
            icon={FiCheck}
            accent
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'kpi-completed'}
            onActivate={(e) => handleCardClick('kpi-completed', e)}
          />
        </div>
      </section>

      {/* Organic rank predictor leads */}
      <section aria-labelledby="section-organic-rank-leads" className="mb-2">
        <h2 id="section-organic-rank-leads" className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Organic rank predictor leads</h2>
        <p className="text-sm text-gray-500 mb-5">Separate counts for leads coming from the rank predictor lead-gate flow.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          <KpiCard
            label="Organic Total"
            value={organicLeadStats.total}
            title="Organic rank predictor leads — click to list"
            icon={FiUsers}
            accent="hero"
            subtitle={organicLeadStats.loading ? 'Refreshing…' : (total > 0 ? `${Math.round((organicLeadStats.total / total) * 100)}% of total leads` : '')}
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'organic-rank-total'}
            onActivate={(e) => handleCardClick('organic-rank-total', e)}
          />
          <KpiCard
            label="Organic OTP Verified"
            value={organicLeadStats.otpVerified}
            title="Organic rank leads with OTP verified — click to list"
            icon={FiCheckCircle}
            accent
            subtitle={organicLeadStats.loading ? 'Refreshing…' : (organicLeadStats.total > 0 ? `${Math.round((organicLeadStats.otpVerified / organicLeadStats.total) * 100)}% of organic total` : '')}
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'organic-rank-otp-verified'}
            onActivate={(e) => handleCardClick('organic-rank-otp-verified', e)}
          />
          <KpiCard
            label="Organic Slot Booked"
            value={organicLeadStats.slotBooked}
            title="Organic rank leads with slot booked — click to list"
            icon={FiCalendar}
            accent
            subtitle={organicLeadStats.loading ? 'Refreshing…' : (organicLeadStats.otpVerified > 0 ? `${Math.round((organicLeadStats.slotBooked / organicLeadStats.otpVerified) * 100)}% of organic OTP verified` : '')}
            interactive
            funnelCard
            ariaExpanded={!!popoverCardId && popoverCardId === 'organic-rank-slot-booked'}
            onActivate={(e) => handleCardClick('organic-rank-slot-booked', e)}
          />
        </div>
      </section>

      {/* Lead pipeline */}
      <section aria-labelledby="section-lead-pipeline">
        <h2 id="section-lead-pipeline" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Lead pipeline</h2>
        <ChartContainer title="" empty={pipelineEmpty} emptyMessage="No data for the selected period">
          {!pipelineEmpty && (
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <BarChart data={pipelineChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                    formatter={(value) => [value.toLocaleString(), 'Leads']}
                    labelFormatter={(name) => name}
                  />
                  <Legend />
                  <Bar dataKey="count" name="# Leads" fill="#003366" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartContainer>
      </section>

      {/* UTM Budget & ROI */}
      <section aria-labelledby="section-utm-budget-roi" className="mb-2">
        <h2 id="section-utm-budget-roi" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">UTM Budget & ROI</h2>
        <p className="text-sm text-gray-500 mb-4">Spend and cost per lead by UTM source (Influencer / platform).</p>
        {(utmTotalBudget > 0 || utmAvgCostPerLead != null) && (
          <div className="flex flex-wrap gap-4 mb-4">
            {utmTotalBudget > 0 && (
              <span className="text-sm text-gray-700">
                <span className="font-medium text-gray-500">Total budget:</span>{' '}
                <span className="font-semibold text-primary-navy">{formatCurrency(utmTotalBudget)}</span>
              </span>
            )}
            {utmAvgCostPerLead != null && (
              <span className="text-sm text-gray-700">
                <span className="font-medium text-gray-500">Avg cost per lead:</span>{' '}
                <span className="font-semibold text-primary-navy">{formatCurrency(utmAvgCostPerLead)}</span>
              </span>
            )}
          </div>
        )}
        {utmLinksError && (
          <p className="text-sm text-amber-600 mb-4" role="alert">{utmLinksError}</p>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-medium text-gray-600 mb-3">Budget by UTM source</h3>
            <ChartContainer
              title=""
              loading={utmLinksLoading}
              empty={!utmLinksLoading && utmBudgetEmpty}
              emptyMessage="No UTM links with cost data"
            >
              {!utmLinksLoading && !utmBudgetEmpty && (
                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                    <BarChart data={utmBudgetData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#64748b"
                        tickFormatter={(v) => (v && v.length > 12 ? `${v.slice(0, 11)}…` : v)}
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                        formatter={(value) => [formatCurrency(value), 'Budget']}
                        labelFormatter={(label) => label}
                      />
                      <Bar dataKey="cost" name="Budget" fill="#003366" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartContainer>
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-600 mb-3">Cost per lead (ROI)</h3>
            <ChartContainer
              title=""
              loading={utmLinksLoading}
              empty={!utmLinksLoading && utmCostPerLeadEmpty}
              emptyMessage="No cost-per-lead data for the selected sources"
            >
              {!utmLinksLoading && !utmCostPerLeadEmpty && (
                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                    <BarChart data={utmCostPerLeadData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#64748b"
                        tickFormatter={(v) => (v && v.length > 12 ? `${v.slice(0, 11)}…` : v)}
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                        formatter={(value) => [formatCurrency(value), 'Cost per lead']}
                        labelFormatter={(label) => label}
                      />
                      <Bar dataKey="costPerLead" name="Cost per lead" fill="#003366" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartContainer>
          </div>
        </div>
      </section>

      {/* Signups over time + Slot distribution — two charts in a row on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section aria-labelledby="section-signups">
          <h2 id="section-signups" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Signups over time</h2>
          <ChartContainer title="" empty={signupsOverTime.length === 0} emptyMessage="No data for the selected period">
            {signupsOverTime.length > 0 && (
              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                  <AreaChart data={signupsOverTime} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                      formatter={(value) => [value, 'Signups']}
                      labelFormatter={(label) => label}
                    />
                    <Area type="monotone" dataKey="count" name="Signups" stroke="#003366" fill="#003366" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartContainer>
        </section>
        <section aria-labelledby="section-slot-distribution">
          <h2 id="section-slot-distribution" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Slot distribution</h2>
          <ChartContainer title="" empty={slotData.length === 0} emptyMessage="No slot bookings yet">
            {slotData.length > 0 && (
              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                  <BarChart data={slotData} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                      formatter={(value) => [value, 'Bookings']}
                    />
                    <Bar dataKey="count" name="Bookings" fill="#003366" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartContainer>
        </section>
      </div>

      {/* Lead conversion funnel — tree diagram */}
      {showLeadConversionFunnel && (
      <section aria-labelledby="section-funnel">
        <h2 id="section-funnel" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Lead conversion funnel</h2>
      <div
        className="bg-white rounded-xl border border-gray-200 portal-card min-h-[420px] flex flex-col p-4 lg:p-6"
        role="img"
        aria-label="Lead conversion funnel: OTP verified and not verified, slot booked and not booked, demo attended and not attended, assessment written and not written, done and activation form not done, counsellor dashboard logged in and not logged in"
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Stages</span>
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
      </section>
      )}
      {popoverCardId && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
            aria-hidden
          />
          <div
            data-funnel-popover
            role="dialog"
            aria-modal="true"
            aria-label="Lead breakdown"
            className="relative z-10 flex max-h-[min(90dvh,56rem)] w-full max-w-5xl min-h-0 flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-2xl animate-scaleIn"
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
                <div className="shrink-0 border-b border-gray-100 p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 sm:text-sm">{c.label}</p>
                      <p className="mt-2 text-3xl font-bold tabular-nums text-primary-navy sm:text-4xl">{formatCount(c.value)}</p>
                      {c.conversionPct != null && c.conversionLabel && (
                        <p className="mt-2 text-sm text-gray-600 sm:text-base">
                          {c.conversionPct}% {c.conversionLabel}
                        </p>
                      )}
                      {c.description && (
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">{c.description}</p>
                      )}
                      {c.loginUrl && (
                        <p className="mt-4 border-t border-gray-100 pt-4 text-sm">
                          <span className="text-gray-500">{c.loginLabel}: </span>
                          <Link to={c.loginUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-navy hover:underline">
                            {c.loginUrl}
                          </Link>
                        </p>
                      )}
                      <p className="mt-4">
                        {viewRelatedLabel ? (
                          <Link to={viewAllUrl} className="text-sm font-medium text-primary-navy hover:underline sm:text-base">
                            View related leads ({viewRelatedLabel})
                          </Link>
                        ) : (
                          <Link to={viewAllUrl} className="text-sm font-medium text-primary-navy hover:underline sm:text-base">
                            View all {formatCount(c.value)} leads
                          </Link>
                        )}
                      </p>
                    </div>
                    <button
                      ref={leadModalCloseRef}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopoverCardId(null);
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
                      aria-label="Close"
                    >
                      <FiX className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                </div>
                {hasExactList && (
                  <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
                    {cardLeads.loading && (
                      <p className="text-sm text-gray-500 sm:text-base">Loading leads…</p>
                    )}
                    {cardLeads.error && (
                      <p className="text-sm text-red-600 sm:text-base" role="alert">{cardLeads.error}</p>
                    )}
                    {!cardLeads.loading && !cardLeads.error && cardLeads.list.length === 0 && c.value > 0 && (
                      <p className="text-sm text-gray-500 sm:text-base">No leads to show.</p>
                    )}
                    {!cardLeads.loading && !cardLeads.error && cardLeads.list.length > 0 && (
                      <ul className="space-y-3 pb-2">
                        {cardLeads.list.map((lead) => (
                          <li
                            key={lead.id}
                            className="rounded-xl border border-gray-100 bg-gray-50/40 p-4 transition-colors duration-200 hover:bg-gray-50/90 sm:p-5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span
                                className="min-w-0 flex-1 break-words text-sm font-semibold text-gray-900 sm:text-base"
                                title={lead.fullName || ''}
                              >
                                {lead.fullName || '—'}
                              </span>
                              {lead.applicationStatus ? (
                                <span
                                  className={`shrink-0 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                    lead.applicationStatus === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : lead.applicationStatus === 'registered'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {lead.applicationStatus}
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 sm:text-sm">
                              <span className="tabular-nums">{lead.phone || '—'}</span>
                              {lead.phone && lead.email ? <span aria-hidden>·</span> : null}
                              <span
                                className="max-w-none break-all text-gray-600 sm:max-w-md sm:break-words"
                                title={lead.email || ''}
                              >
                                {lead.email || '—'}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 sm:text-sm">
                              Added: {formatDate(lead.createdAt)}
                              {lead.occupation ? (
                                <span className="mt-1 block sm:mt-0 sm:inline sm:before:mx-1 sm:before:content-['·']">
                                  Occupation: <span className="text-gray-700">{lead.occupation}</span>
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-3">
                              <Link
                                to={`/admin/leads?q=${encodeURIComponent(lead.phone || '')}`}
                                className="text-sm font-medium text-primary-navy hover:underline"
                              >
                                View in Leads
                              </Link>
                            </p>
                          </li>
                        ))}
                        {cardLeads.total > cardLeads.list.length && (
                          <li className="pt-2">
                            <Link to={viewAllUrl} className="text-sm font-medium text-primary-navy hover:underline sm:text-base">
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
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
