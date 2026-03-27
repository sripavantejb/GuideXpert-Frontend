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
};

function safeRate(numerator, denominator) {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
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
    ]).then(([statsRes, trainingRes]) => {
      if (cancelled) return;

      if (!statsRes.success || !trainingRes.success) {
        const failure = !statsRes.success ? statsRes : trainingRes;
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

      setFunnelData({
        totalLeads: Number(stats.total) || 0,
        otpVerified: Number(stats.otpVerified) || 0,
        slotBooked: Number(stats.slotBooked) || 0,
        demoAttended: Number(stats.demoAttended) || 0,
        trainingFormFilled: Number(trainingTotal) || 0,
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

    const transitionRows = [
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
    ];

    return {
      transitionRows,
      maxDomain: funnelData.totalLeads,
      metrics: {
        otpVerificationRate,
        slotBookingRate,
        demoAttendanceRate,
        trainingFormConversionRate,
      },
    };
  }, [funnelData]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 portal-card">
        <div className="h-6 w-56 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
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
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
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
        </div>
      </section>

      <FunnelChart
        data={derived.transitionRows}
        maxDomain={derived.maxDomain}
      />

      <ConversionStats metrics={derived.metrics} />
    </DashboardLayout>
  );
}
