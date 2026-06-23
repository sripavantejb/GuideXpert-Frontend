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

const emptyFunnelData = {
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

function safeRate(numerator, denominator) {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
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

  const derived = useMemo(() => {
    const formCompletionRate = safeRate(funnelData.formCompleted, funnelData.totalLeads);
    const bookingRate = safeRate(funnelData.bookingConfirmed, funnelData.formCompleted);
    const contactRate = safeRate(funnelData.contacted, funnelData.bookingConfirmed);
    const counselingRate = safeRate(funnelData.counselingDone, funnelData.contacted);
    const conversionRate = safeRate(funnelData.converted, funnelData.totalLeads);

    const notFormCompleted = Math.max(0, funnelData.totalLeads - funnelData.formCompleted);
    const notBooked = Math.max(0, funnelData.formCompleted - funnelData.bookingConfirmed);
    const notContacted = Math.max(0, funnelData.bookingConfirmed - funnelData.contacted);
    const notCounselingDone = Math.max(0, funnelData.contacted - funnelData.counselingDone);
    const notConverted = Math.max(0, funnelData.counselingDone - funnelData.converted);

    const transitionRows = [
      {
        stageTitle: 'Total leads',
        cohortTotal: funnelData.totalLeads,
        success: funnelData.totalLeads,
        drop: 0,
        successLabel: 'Total',
        dropLabel: 'Dropped',
        successColor: '#002a57',
      },
      {
        stageTitle: 'Form completed',
        cohortTotal: funnelData.totalLeads,
        success: funnelData.formCompleted,
        drop: notFormCompleted,
        successLabel: 'Completed',
        dropLabel: 'Incomplete',
        successColor: '#003366',
      },
      {
        stageTitle: 'Booking confirmed',
        cohortTotal: funnelData.formCompleted,
        success: funnelData.bookingConfirmed,
        drop: notBooked,
        successLabel: 'Confirmed',
        dropLabel: 'Not booked',
        successColor: '#0f4c81',
      },
      {
        stageTitle: 'Contacted',
        cohortTotal: funnelData.bookingConfirmed,
        success: funnelData.contacted,
        drop: notContacted,
        successLabel: 'Contacted',
        dropLabel: 'Not contacted',
        successColor: '#1d6fa5',
      },
      {
        stageTitle: 'Counseling done',
        cohortTotal: funnelData.contacted,
        success: funnelData.counselingDone,
        drop: notCounselingDone,
        successLabel: 'Done',
        dropLabel: 'Pending',
        successColor: '#3b82a8',
      },
      {
        stageTitle: 'Converted',
        cohortTotal: funnelData.counselingDone,
        success: funnelData.converted,
        drop: notConverted,
        successLabel: 'Converted',
        dropLabel: 'Not converted',
        successColor: '#1f9ea1',
      },
    ];

    return {
      transitionRows,
      maxDomain: funnelData.totalLeads,
      metrics: {
        formCompletionRate,
        bookingRate,
        contactRate,
        counselingRate,
        conversionRate,
      },
    };
  }, [funnelData]);

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
            Form → booking → contact → counseling → conversion
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
              subtitle="Track intake completion, slot bookings, CRM progression, and conversions."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                <StatsCard
                  title="Total Leads"
                  count={funnelData.totalLeads}
                  indicator="Base stage: 100%"
                  icon={FiUsers}
                  iconClassName="text-primary-navy"
                />
                <StatsCard
                  title="Form Completed"
                  count={funnelData.formCompleted}
                  indicator={`${derived.metrics.formCompletionRate.toFixed(1)}% from total`}
                  icon={FiCheckCircle}
                />
                <StatsCard
                  title="Booking Confirmed"
                  count={funnelData.bookingConfirmed}
                  indicator={`${derived.metrics.bookingRate.toFixed(1)}% from form done`}
                  icon={FiCalendar}
                />
                <StatsCard
                  title="Contacted"
                  count={funnelData.contacted}
                  indicator={`${derived.metrics.contactRate.toFixed(1)}% from booked`}
                  icon={FiPhone}
                />
                <StatsCard
                  title="Counseling Done"
                  count={funnelData.counselingDone}
                  indicator={`${derived.metrics.counselingRate.toFixed(1)}% from contacted`}
                  icon={FiCheckCircle}
                />
                <StatsCard
                  title="Converted"
                  count={funnelData.converted}
                  indicator={`${derived.metrics.conversionRate.toFixed(1)}% of all leads`}
                  icon={FiAward}
                  iconClassName="text-emerald-600"
                />
                <StatsCard
                  title="Booking Pending"
                  count={funnelData.bookingPending}
                  indicator="Awaiting slot confirmation"
                  icon={FiCalendar}
                  iconClassName="text-amber-600"
                />
                <StatsCard
                  title="Not Interested"
                  count={funnelData.notInterested}
                  indicator="Marked not interested"
                  icon={FiUsers}
                  iconClassName="text-gray-400"
                />
              </div>

              <FunnelChart data={derived.transitionRows} maxDomain={derived.maxDomain} />

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
                  Stage-to-stage conversion across the 1-on-1 counseling journey.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <ConversionItem
                    label="Form completion"
                    value={derived.metrics.formCompletionRate}
                    helper="Form completed / Total leads"
                  />
                  <ConversionItem
                    label="Booking rate"
                    value={derived.metrics.bookingRate}
                    helper="Booking confirmed / Form completed"
                  />
                  <ConversionItem
                    label="Contact rate"
                    value={derived.metrics.contactRate}
                    helper="Contacted / Booking confirmed"
                  />
                  <ConversionItem
                    label="Counseling rate"
                    value={derived.metrics.counselingRate}
                    helper="Counseling done / Contacted"
                  />
                  <ConversionItem
                    label="Overall conversion"
                    value={derived.metrics.conversionRate}
                    helper="Converted / Total leads"
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
