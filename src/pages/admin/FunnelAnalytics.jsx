import { useEffect, useMemo, useState } from 'react';
import {
  FiUsers,
  FiCheckCircle,
  FiCalendar,
  FiVideo,
  FiFileText,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useAdminDateRange } from '../../hooks/useAdminDateRange';
import {
  getAdminStats,
  getStoredToken,
  getTrainingFormResponses,
  getWebinarProgressList,
  getWebinarProgressStats,
} from '../../utils/adminApi';
import DashboardLayout from '../../components/Admin/DashboardLayout';
import StatsCard from '../../components/Admin/StatsCard';
import FunnelChart from '../../components/Admin/FunnelChart';
import ConversionStats from '../../components/Admin/ConversionStats';

const emptyFunnelData = {
  totalLeads: 0,
  otpVerified: 0,
  slotBooked: 0,
  demoAttended: 0,
  trainingFormFilled: 0,
  webinarPanelLogged: 0,
  webinarCompleted100: 0,
};

function safeRate(numerator, denominator) {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

function pickNumber(payload, keys) {
  for (const key of keys) {
    const value = payload?.[key];
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

export default function FunnelAnalytics() {
  const { logout } = useAuth();
  const { dateRange } = useAdminDateRange();
  const [funnelData, setFunnelData] = useState(emptyFunnelData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = {};
    if (dateRange.from) params.from = dateRange.from;
    if (dateRange.to) params.to = dateRange.to;

    const token = getStoredToken();

    Promise.all([
      getAdminStats(params, token),
      getTrainingFormResponses({ ...params, page: 1, limit: 1 }, token),
      getWebinarProgressStats(params, token),
      getWebinarProgressList({ ...params, page: 1, limit: 1, status: 'not_started' }, token),
    ]).then(([statsRes, trainingRes, webinarStatsRes, webinarNotStartedRes]) => {
      if (cancelled) return;

      if (!statsRes.success || !trainingRes.success || !webinarStatsRes.success || !webinarNotStartedRes.success) {
        const failure = !statsRes.success
          ? statsRes
          : !trainingRes.success
            ? trainingRes
            : !webinarStatsRes.success
              ? webinarStatsRes
              : webinarNotStartedRes;
        if (failure.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(failure.message || 'Failed to load funnel analytics');
        setLoading(false);
        return;
      }

      const stats = statsRes.data?.data || {};
      const trainingPayload = trainingRes.data || {};
      const trainingList = Array.isArray(trainingPayload?.data)
        ? trainingPayload.data
        : Array.isArray(trainingPayload?.responses)
          ? trainingPayload.responses
          : [];
      const trainingTotalRaw = trainingPayload?.pagination?.total;
      const trainingTotal = Number.isFinite(Number(trainingTotalRaw))
        ? Number(trainingTotalRaw)
        : trainingList.length;
      const webinarStats = webinarStatsRes.data?.data || {};
      const webinarNotStartedTotalRaw = webinarNotStartedRes.data?.data?.total;
      const webinarNotStartedTotal = Number.isFinite(Number(webinarNotStartedTotalRaw))
        ? Number(webinarNotStartedTotalRaw)
        : null;

      const webinarTotalEnrolled = pickNumber(webinarStats, [
        'totalEnrolled',
        'totalUsers',
        'usersTotal',
        'total',
      ]);
      const webinarFullyCompletedRaw = pickNumber(webinarStats, [
        'fullyCompleted',
        'completed100',
        'completedCount',
        'fullyCompletedCount',
      ]);
      const webinarNotStartedRaw = pickNumber(webinarStats, [
        'notStarted',
        'notStartedCount',
        'not_started',
      ]);
      const webinarLoggedRaw = pickNumber(webinarStats, [
        'panelLogged',
        'panelLoggedCount',
        'loggedInUsers',
        'loggedUsers',
        'usersLoggedIn',
      ]);

      const notStartedFallback = webinarNotStartedRaw != null
        ? webinarNotStartedRaw
        : webinarNotStartedTotal;
      const loggedFromProgress = (webinarTotalEnrolled != null && notStartedFallback != null)
        ? Math.max(0, webinarTotalEnrolled - notStartedFallback)
        : 0;
      const webinarPanelLogged = Math.max(
        0,
        Math.min(trainingTotal, webinarLoggedRaw != null ? webinarLoggedRaw : loggedFromProgress)
      );
      const webinarCompleted100 = Math.max(
        0,
        Math.min(webinarPanelLogged, webinarFullyCompletedRaw != null ? webinarFullyCompletedRaw : 0)
      );

      setFunnelData({
        totalLeads: Number(stats.total) || 0,
        otpVerified: Number(stats.otpVerified) || 0,
        slotBooked: Number(stats.slotBooked) || 0,
        demoAttended: Number(stats.demoAttended) || 0,
        trainingFormFilled: Number(trainingTotal) || 0,
        webinarPanelLogged,
        webinarCompleted100,
      });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [logout, dateRange.from, dateRange.to, refreshTrigger]);

  const derived = useMemo(() => {
    const otpVerificationRate = safeRate(
      funnelData.otpVerified,
      funnelData.totalLeads
    );
    const slotBookingRate = safeRate(
      funnelData.slotBooked,
      funnelData.otpVerified
    );
    const demoAttendanceRate = safeRate(
      funnelData.demoAttended,
      funnelData.slotBooked
    );
    const trainingFormConversionRate = safeRate(
      funnelData.trainingFormFilled,
      funnelData.demoAttended
    );
    const webinarPanelLoginRate = safeRate(
      funnelData.webinarPanelLogged,
      funnelData.trainingFormFilled
    );
    const webinarCompletedRate = safeRate(
      funnelData.webinarCompleted100,
      funnelData.webinarPanelLogged
    );

    const notOtpVerified = Math.max(
      0,
      funnelData.totalLeads - funnelData.otpVerified
    );
    const notSlotBooked = Math.max(
      0,
      funnelData.otpVerified - funnelData.slotBooked
    );
    const notDemoAttended = Math.max(
      0,
      funnelData.slotBooked - funnelData.demoAttended
    );
    const notFormFilled = Math.max(
      0,
      funnelData.demoAttended - funnelData.trainingFormFilled
    );
    const notWebinarPanelLogged = Math.max(
      0,
      funnelData.trainingFormFilled - funnelData.webinarPanelLogged
    );
    const notWebinarCompleted100 = Math.max(
      0,
      funnelData.webinarPanelLogged - funnelData.webinarCompleted100
    );

    const transitionRows = [
      {
        stageTitle: 'Total leads added',
        cohortTotal: funnelData.totalLeads,
        success: funnelData.totalLeads,
        drop: 0,
        successLabel: 'Total Leads',
        dropLabel: 'Dropped',
        successColor: '#002a57',
      },
      {
        stageTitle: 'OTP verification',
        cohortTotal: funnelData.totalLeads,
        success: funnelData.otpVerified,
        drop: notOtpVerified,
        successLabel: 'OTP Verified',
        dropLabel: 'Not OTP Verified',
        successColor: '#003366',
      },
      {
        stageTitle: 'Slot booking',
        cohortTotal: funnelData.otpVerified,
        success: funnelData.slotBooked,
        drop: notSlotBooked,
        successLabel: 'Slot Booked',
        dropLabel: 'Not Slot Booked',
        successColor: '#0f4c81',
      },
      {
        stageTitle: 'Demo attendance',
        cohortTotal: funnelData.slotBooked,
        success: funnelData.demoAttended,
        drop: notDemoAttended,
        successLabel: 'Demo Attended',
        dropLabel: 'Not Demo Attended',
        successColor: '#1d6fa5',
      },
      {
        stageTitle: 'Training form',
        cohortTotal: funnelData.demoAttended,
        success: funnelData.trainingFormFilled,
        drop: notFormFilled,
        successLabel: 'Form Filled',
        dropLabel: 'Not Form Filled',
        successColor: '#3b82a8',
      },
      {
        stageTitle: 'Webinar panel login',
        cohortTotal: funnelData.trainingFormFilled,
        success: funnelData.webinarPanelLogged,
        drop: notWebinarPanelLogged,
        successLabel: 'Panel Logged',
        dropLabel: 'Not Logged',
        successColor: '#2f8ca8',
      },
      {
        stageTitle: 'Webinar completion (100%)',
        cohortTotal: funnelData.webinarPanelLogged,
        success: funnelData.webinarCompleted100,
        drop: notWebinarCompleted100,
        successLabel: 'Completed 100%',
        dropLabel: 'Not Completed 100%',
        successColor: '#1f9ea1',
      },
    ];

    return {
      transitionRows,
      maxDomain: funnelData.totalLeads,
      metrics: {
        otpVerificationRate,
        slotBookingRate,
        demoAttendanceRate,
        trainingFormConversionRate,
        webinarPanelLoginRate,
        webinarCompletedRate,
      },
    };
  }, [funnelData]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 portal-card">
        <div className="h-6 w-56 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="h-24 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 portal-card" role="alert">
          <p className="text-gray-800 font-medium mb-2">Could not load funnel analytics</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError('');
              setRefreshTrigger((t) => t + 1);
            }}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-navy focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Lead Funnel Analytics Dashboard"
      subtitle="Monitor stage conversion, identify drop-offs, and track webinar/training lead performance."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
          <StatsCard
            title="Total Leads"
            count={funnelData.totalLeads}
            indicator="Base stage: 100.0%"
            icon={FiUsers}
            iconClassName="text-primary-navy"
          />
          <StatsCard
            title="OTP Verified"
            count={funnelData.otpVerified}
            indicator={`${derived.metrics.otpVerificationRate.toFixed(1)}% from Total Leads`}
            icon={FiCheckCircle}
          />
          <StatsCard
            title="Slot Booked"
            count={funnelData.slotBooked}
            indicator={`${derived.metrics.slotBookingRate.toFixed(1)}% from OTP Verified`}
            icon={FiCalendar}
          />
          <StatsCard
            title="Demo Attended"
            count={funnelData.demoAttended}
            indicator={`${derived.metrics.demoAttendanceRate.toFixed(1)}% from Slot Booked`}
            icon={FiVideo}
          />
          <StatsCard
            title="Training Form Filled"
            count={funnelData.trainingFormFilled}
            indicator={`${derived.metrics.trainingFormConversionRate.toFixed(1)}% from Demo Attended`}
            icon={FiFileText}
          />
          <StatsCard
            title="Webinar Panel Logged"
            count={funnelData.webinarPanelLogged}
            indicator={`${derived.metrics.webinarPanelLoginRate.toFixed(1)}% from Training Form`}
            icon={FiUsers}
          />
          <StatsCard
            title="Webinar Completed (100%)"
            count={funnelData.webinarCompleted100}
            indicator={`${derived.metrics.webinarCompletedRate.toFixed(1)}% from Panel Logged`}
            icon={FiCheckCircle}
          />
      </div>

      <FunnelChart
        data={derived.transitionRows}
        maxDomain={derived.maxDomain}
      />

      <ConversionStats metrics={derived.metrics} />
    </DashboardLayout>
  );
}
