import { useEffect, useMemo, useState } from 'react';
import {
  FiUsers,
  FiCheckCircle,
  FiCalendar,
  FiPhone,
  FiAward,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useAdminDateRange } from '../../hooks/useAdminDateRange';
import { getOneOnOneCounselingFunnelStats, getStoredToken } from '../../utils/adminApi';
import DashboardLayout from './DashboardLayout';
import StatsCard from './StatsCard';
import FunnelChart from './FunnelChart';
import { RELEVANT_ONE_ON_ONE_CURRENT_CLASSES } from '../../utils/oneOnOneCounselingClassRelevance';

const emptyStageData = {
  totalLeads: 0,
  formStarted: 0,
  formCompleted: 0,
  bookingConfirmed: 0,
  bookingPending: 0,
  contacted: 0,
  counselingDone: 0,
  converted: 0,
  notInterested: 0,
  whatsappConsent: 0,
  parentAttendanceConfirmed: 0,
};

const emptyFunnelData = {
  ...emptyStageData,
  relevantLeads: 0,
  irrelevantLeads: 0,
  relevant: { ...emptyStageData },
  irrelevant: { ...emptyStageData },
};

function safeRate(numerator, denominator) {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

function buildTransitionRows(data, { includeRelevanceSplit = false, colors } = {}) {
  const palette = colors || {
    total: '#002a57',
    form: '#003366',
    booking: '#0f4c81',
    contact: '#1d6fa5',
    counseling: '#3b82a8',
    converted: '#1f9ea1',
    relevant: '#047857',
    irrelevant: '#94a3b8',
  };

  const notFormCompleted = Math.max(0, data.totalLeads - data.formCompleted);
  const notBooked = Math.max(0, data.formCompleted - data.bookingConfirmed);
  const notContacted = Math.max(0, data.bookingConfirmed - data.contacted);
  const notCounselingDone = Math.max(0, data.contacted - data.counselingDone);
  const notConverted = Math.max(0, data.counselingDone - data.converted);

  const rows = [
    {
      stageTitle: 'Total leads',
      cohortTotal: data.totalLeads,
      success: data.totalLeads,
      drop: 0,
      successLabel: 'Total',
      dropLabel: 'Dropped',
      successColor: palette.total,
    },
  ];

  if (includeRelevanceSplit && (data.relevantLeads != null || data.irrelevantLeads != null)) {
    const relevant = data.relevantLeads ?? 0;
    const irrelevant = data.irrelevantLeads ?? 0;
    rows.push({
      stageTitle: 'Lead relevance',
      cohortTotal: data.totalLeads,
      success: relevant,
      drop: irrelevant,
      successLabel: 'Relevant',
      dropLabel: 'Irrelevant',
      successColor: palette.relevant,
    });
  }

  rows.push(
    {
      stageTitle: 'Form completed',
      cohortTotal: data.totalLeads,
      success: data.formCompleted,
      drop: notFormCompleted,
      successLabel: 'Completed',
      dropLabel: 'Incomplete',
      successColor: palette.form,
    },
    {
      stageTitle: 'Booking confirmed',
      cohortTotal: data.formCompleted,
      success: data.bookingConfirmed,
      drop: notBooked,
      successLabel: 'Confirmed',
      dropLabel: 'Not booked',
      successColor: palette.booking,
    },
    {
      stageTitle: 'Contacted',
      cohortTotal: data.bookingConfirmed,
      success: data.contacted,
      drop: notContacted,
      successLabel: 'Contacted',
      dropLabel: 'Not contacted',
      successColor: palette.contact,
    },
    {
      stageTitle: 'Counseling done',
      cohortTotal: data.contacted,
      success: data.counselingDone,
      drop: notCounselingDone,
      successLabel: 'Done',
      dropLabel: 'Pending',
      successColor: palette.counseling,
    },
    {
      stageTitle: 'Converted',
      cohortTotal: data.counselingDone,
      success: data.converted,
      drop: notConverted,
      successLabel: 'Converted',
      dropLabel: 'Not converted',
      successColor: palette.converted,
    }
  );

  const metrics = {
    formCompletionRate: safeRate(data.formCompleted, data.totalLeads),
    bookingRate: safeRate(data.bookingConfirmed, data.formCompleted),
    contactRate: safeRate(data.contacted, data.bookingConfirmed),
    counselingRate: safeRate(data.counselingDone, data.contacted),
    conversionRate: safeRate(data.converted, data.totalLeads),
  };

  return {
    transitionRows: rows,
    maxDomain: data.totalLeads,
    metrics,
  };
}

function buildFunnelDerived(funnelData) {
  const overall = buildTransitionRows(
    {
      ...funnelData,
      relevantLeads: funnelData.relevantLeads,
      irrelevantLeads: funnelData.irrelevantLeads,
    },
    { includeRelevanceSplit: true }
  );

  const relevant = buildTransitionRows(funnelData.relevant || emptyStageData, {
    colors: {
      total: '#047857',
      form: '#059669',
      booking: '#10b981',
      contact: '#34d399',
      counseling: '#6ee7b7',
      converted: '#065f46',
    },
  });

  const irrelevant = buildTransitionRows(funnelData.irrelevant || emptyStageData, {
    colors: {
      total: '#475569',
      form: '#64748b',
      booking: '#94a3b8',
      contact: '#cbd5e1',
      counseling: '#94a3b8',
      converted: '#334155',
    },
  });

  return {
    overall,
    relevant,
    irrelevant,
    relevanceRate: safeRate(funnelData.relevantLeads, funnelData.totalLeads),
    relevantConversionRate: safeRate(funnelData.relevant?.converted, funnelData.relevantLeads),
    irrelevantConversionRate: safeRate(funnelData.irrelevant?.converted, funnelData.irrelevantLeads),
  };
}

function ConversionItem({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 portal-card transition-all duration-300 hover:portal-card-hover hover:border-primary-blue-200">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-primary-navy tabular-nums">{value.toFixed(1)}%</p>
      <p className="mt-1 text-xs text-gray-500">{helper}</p>
      <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-navy transition-all duration-700 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export default function OneOnOneCounselingFunnelDashboard() {
  const { logout } = useAuth();
  const { dateRange } = useAdminDateRange();
  const [funnelData, setFunnelData] = useState(emptyFunnelData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = {};
    if (dateRange.from) params.from = dateRange.from;
    if (dateRange.to) params.to = dateRange.to;

    getOneOnOneCounselingFunnelStats(params, getStoredToken()).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load funnel analytics');
        return;
      }
      setFunnelData({ ...emptyFunnelData, ...(result.data?.data || {}) });
    });

    return () => {
      cancelled = true;
    };
  }, [logout, dateRange.from, dateRange.to, refreshTrigger]);

  const derived = useMemo(() => buildFunnelDerived(funnelData), [funnelData]);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-5 text-left bg-white border-b border-gray-200 hover:bg-gray-50/80 transition-colors"
        aria-expanded={expanded}
      >
        <div>
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <FiTrendingUp className="text-primary-navy" aria-hidden />
            Funnel analytics
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Relevance split → form → booking → contact → counseling → conversion
            {dateRange.from || dateRange.to ? ' (uses admin date range from header)' : ''}
          </p>
        </div>
        <span className="text-gray-400 shrink-0" aria-hidden>
          {expanded ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {expanded ? (
        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 portal-card">
              <div className="h-6 w-56 bg-gray-100 rounded animate-pulse mb-6" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-24 rounded-xl border border-gray-200 bg-gray-50 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-medium mb-2">Could not load funnel analytics</p>
              <p className="mb-3">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setRefreshTrigger((t) => t + 1);
                }}
                className="inline-flex h-9 items-center rounded-lg bg-primary-navy px-4 text-sm font-medium text-white hover:bg-primary-navy/90"
              >
                Retry
              </button>
            </div>
          ) : (
            <DashboardLayout
              title="1-on-1 Counseling Funnel"
              subtitle="Track relevant vs irrelevant leads, intake completion, bookings, CRM progression, and conversions."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-10">
                <StatsCard
                  title="Total Leads"
                  count={funnelData.totalLeads}
                  indicator="Base stage: 100%"
                  icon={FiUsers}
                  iconClassName="text-primary-navy"
                />
                <StatsCard
                  title="Relevant Leads"
                  count={funnelData.relevantLeads}
                  indicator={`${derived.relevanceRate.toFixed(1)}% · ${RELEVANT_ONE_ON_ONE_CURRENT_CLASSES.join(', ')}`}
                  icon={FiUsers}
                  iconClassName="text-emerald-700"
                />
                <StatsCard
                  title="Irrelevant Leads"
                  count={funnelData.irrelevantLeads}
                  indicator={`${safeRate(funnelData.irrelevantLeads, funnelData.totalLeads).toFixed(1)}% of total`}
                  icon={FiUsers}
                  iconClassName="text-slate-400"
                />
                <StatsCard
                  title="Form Completed"
                  count={funnelData.formCompleted}
                  indicator={`${derived.overall.metrics.formCompletionRate.toFixed(1)}% from total`}
                  icon={FiCheckCircle}
                />
                <StatsCard
                  title="Booking Confirmed"
                  count={funnelData.bookingConfirmed}
                  indicator={`${derived.overall.metrics.bookingRate.toFixed(1)}% from form done`}
                  icon={FiCalendar}
                />
                <StatsCard
                  title="Contacted"
                  count={funnelData.contacted}
                  indicator={`${derived.overall.metrics.contactRate.toFixed(1)}% from booked`}
                  icon={FiPhone}
                />
                <StatsCard
                  title="Counseling Done"
                  count={funnelData.counselingDone}
                  indicator={`${derived.overall.metrics.counselingRate.toFixed(1)}% from contacted`}
                  icon={FiCheckCircle}
                />
                <StatsCard
                  title="Converted"
                  count={funnelData.converted}
                  indicator={`${derived.overall.metrics.conversionRate.toFixed(1)}% of all leads`}
                  icon={FiAward}
                  iconClassName="text-emerald-600"
                />
                <StatsCard
                  title="Relevant Converted"
                  count={funnelData.relevant?.converted ?? 0}
                  indicator={`${derived.relevantConversionRate.toFixed(1)}% of relevant`}
                  icon={FiAward}
                  iconClassName="text-emerald-700"
                />
                <StatsCard
                  title="Irrelevant Converted"
                  count={funnelData.irrelevant?.converted ?? 0}
                  indicator={`${derived.irrelevantConversionRate.toFixed(1)}% of irrelevant`}
                  icon={FiAward}
                  iconClassName="text-slate-500"
                />
              </div>

              <FunnelChart
                data={derived.overall.transitionRows}
                maxDomain={derived.overall.maxDomain}
              />

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-800">Relevant leads funnel</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Inter 1st Year, Inter 2nd Year, Inter 2nd Year Completed
                    </p>
                  </div>
                  <FunnelChart
                    data={derived.relevant.transitionRows}
                    maxDomain={derived.relevant.maxDomain}
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600">Irrelevant leads funnel</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      All other classes (10th, Diploma, Other, etc.)
                    </p>
                  </div>
                  <FunnelChart
                    data={derived.irrelevant.transitionRows}
                    maxDomain={derived.irrelevant.maxDomain}
                  />
                </div>
              </div>

              <div
                className="rounded-xl border border-gray-200 bg-white p-5 lg:p-6 portal-card"
                role="region"
                aria-labelledby="one-on-one-conversion-heading"
              >
                <h2
                  id="one-on-one-conversion-heading"
                  className="text-sm font-semibold uppercase tracking-wider text-gray-700"
                >
                  Conversion analytics
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  Stage-to-stage conversion across the full journey and by relevance.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                  <ConversionItem
                    label="Relevance rate"
                    value={derived.relevanceRate}
                    helper="Relevant / Total leads"
                  />
                  <ConversionItem
                    label="Form completion"
                    value={derived.overall.metrics.formCompletionRate}
                    helper="Form completed / Total leads"
                  />
                  <ConversionItem
                    label="Booking rate"
                    value={derived.overall.metrics.bookingRate}
                    helper="Booking confirmed / Form completed"
                  />
                  <ConversionItem
                    label="Contact rate"
                    value={derived.overall.metrics.contactRate}
                    helper="Contacted / Booking confirmed"
                  />
                  <ConversionItem
                    label="Counseling rate"
                    value={derived.overall.metrics.counselingRate}
                    helper="Counseling done / Contacted"
                  />
                  <ConversionItem
                    label="Overall conversion"
                    value={derived.overall.metrics.conversionRate}
                    helper="Converted / Total leads"
                  />
                  <ConversionItem
                    label="Relevant conversion"
                    value={derived.relevantConversionRate}
                    helper="Converted / Relevant leads"
                  />
                  <ConversionItem
                    label="Irrelevant conversion"
                    value={derived.irrelevantConversionRate}
                    helper="Converted / Irrelevant leads"
                  />
                </div>
              </div>
            </DashboardLayout>
          )}
        </div>
      ) : null}
    </div>
  );
}
