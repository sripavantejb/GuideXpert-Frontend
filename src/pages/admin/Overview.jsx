import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';
import OverviewSkeleton from '../../components/UI/OverviewSkeleton';

export default function Overview() {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return <OverviewSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
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
  const maxOtp = Math.max(otpVerified, otpNotVerified, 1);
  const maxSlot = Math.max(otpVerifiedSlotBooked, otpVerifiedSlotNotBooked, 1);
  const maxDemo = Math.max(demoAttended, demoNotAttended, 1);
  const maxAssessment = Math.max(assessmentWritten, assessmentNotWritten, 1);

  function formatCount(n) {
    return Number(n).toLocaleString();
  }

  function FunnelNode({ label, value, widthPct, conversionPct, conversionLabel, compact }) {
    return (
      <div
        className={
          'rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden shrink-0 ' +
          (compact ? 'p-4 min-w-0 w-full max-w-[200px]' : 'p-5 flex-1 min-w-0')
        }
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`font-bold text-primary-navy tabular-nums ${compact ? 'text-xl' : 'text-2xl'} mb-2`}>
          {formatCount(value)}
        </p>
        {conversionPct != null && conversionLabel && (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-blue-50 text-primary-navy text-xs font-medium mb-2">
            {conversionPct}% {conversionLabel}
          </span>
        )}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-navy rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${widthPct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto min-w-0 overflow-x-hidden">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Overview</h2>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          to="/admin/leads?applicationStatus=in_progress"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          View incomplete leads
        </Link>
        <Link
          to="/admin/export"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          Export data
        </Link>
        <Link
          to="/admin/analytics"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          View analytics
        </Link>
      </div>

      {/* Lead conversion funnel — tree layout */}
      <div
        className="bg-gray-50/80 rounded-xl border border-gray-200 shadow-sm p-6 mb-8 min-w-0 overflow-x-auto"
        role="img"
        aria-label="Lead conversion funnel: OTP verified and not verified, slot booked and not booked, demo attended and not attended, assessment written and not written"
      >
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Lead conversion funnel</h3>

        {/* Tree: Root */}
        <div className="flex flex-col items-center min-w-0">
          <div className="rounded-lg border-2 border-primary-navy bg-white px-6 py-3 shadow-sm shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leads added</p>
            <p className="text-2xl font-bold text-primary-navy tabular-nums">{formatCount(total)}</p>
          </div>
          <div className="w-0.5 h-6 bg-gray-300 rounded-full my-0.5" aria-hidden="true" />
          <div className="w-full max-w-2xl h-0.5 bg-gray-300 rounded-full" style={{ maxWidth: 'min(100%, 32rem)' }} aria-hidden="true" />
        </div>

        {/* Tree: Level 1 — OTP division */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-2 mb-2 min-w-0">
          <div className="flex flex-col items-center flex-1 min-w-0 basis-0 sm:basis-auto sm:max-w-sm">
            <div className="w-0.5 h-4 bg-gray-300 rounded-full mb-1" aria-hidden="true" />
            <FunnelNode
              label="OTP verified"
              value={otpVerified}
              widthPct={maxOtp > 0 ? (otpVerified / maxOtp) * 100 : 0}
              conversionPct={total > 0 ? Math.round((otpVerified / total) * 100) : null}
              conversionLabel="of leads"
            />
            <div className="w-0.5 h-6 bg-gray-300 rounded-full mt-2 mb-1" aria-hidden="true" />
            <div className="w-full max-w-xs h-0.5 bg-gray-300 rounded-full" aria-hidden="true" />
            <div className="flex flex-wrap gap-4 sm:gap-6 w-full justify-center mt-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0 basis-0 sm:basis-auto">
                <div className="w-0.5 h-4 bg-gray-300 rounded-full mb-1" aria-hidden="true" />
                <FunnelNode
                  compact
                  label="Slot booked"
                  value={otpVerifiedSlotBooked}
                  widthPct={maxSlot > 0 ? (otpVerifiedSlotBooked / maxSlot) * 100 : 0}
                  conversionPct={otpVerified > 0 ? Math.round((otpVerifiedSlotBooked / otpVerified) * 100) : null}
                  conversionLabel="of OTP verified"
                />
                <div className="w-0.5 h-5 bg-gray-300 rounded-full mt-2 mb-0.5" aria-hidden="true" />
                <div className="w-full h-0.5 bg-gray-300 rounded-full max-w-[140px]" aria-hidden="true" />
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-0.5 justify-center">
                  <div className="flex flex-col items-center shrink-0 min-w-0">
                    <div className="w-0.5 h-3 bg-gray-300 rounded-full shrink-0" aria-hidden="true" />
                    <FunnelNode
                      compact
                      label="Demo attended"
                      value={demoAttended}
                      widthPct={maxDemo > 0 ? (demoAttended / maxDemo) * 100 : 0}
                      conversionPct={slotBooked > 0 ? Math.round((demoAttended / slotBooked) * 100) : null}
                      conversionLabel="of slot booked"
                    />
                    <div className="w-0.5 h-4 bg-gray-300 rounded-full mt-1.5 mb-0.5" aria-hidden="true" />
                    <div className="w-full h-0.5 bg-gray-300 rounded-full max-w-[120px]" aria-hidden="true" />
                    <div className="flex gap-2 mt-0.5">
                      <div className="w-0.5 h-3 bg-gray-300 rounded-full self-center shrink-0" aria-hidden="true" />
                      <FunnelNode
                        compact
                        label="Assessment written"
                        value={assessmentWritten}
                        widthPct={maxAssessment > 0 ? (assessmentWritten / maxAssessment) * 100 : 0}
                        conversionPct={demoAttended > 0 ? Math.round((assessmentWritten / demoAttended) * 100) : null}
                        conversionLabel="of demo attended"
                      />
                      <div className="w-0.5 h-3 bg-gray-300 rounded-full self-center shrink-0" aria-hidden="true" />
                      <FunnelNode
                        compact
                        label="Assessment not written"
                        value={assessmentNotWritten}
                        widthPct={maxAssessment > 0 ? (assessmentNotWritten / maxAssessment) * 100 : 0}
                        conversionPct={demoAttended > 0 ? Math.round((assessmentNotWritten / demoAttended) * 100) : null}
                        conversionLabel="of demo attended"
                      />
                    </div>
                  </div>
                  <div className="w-0.5 h-3 bg-gray-300 rounded-full self-center shrink-0" aria-hidden="true" />
                  <FunnelNode
                    compact
                    label="Demo not attended"
                    value={demoNotAttended}
                    widthPct={maxDemo > 0 ? (demoNotAttended / maxDemo) * 100 : 0}
                    conversionPct={slotBooked > 0 ? Math.round((demoNotAttended / slotBooked) * 100) : null}
                    conversionLabel="of slot booked"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-0 basis-0 sm:basis-auto">
                <div className="w-0.5 h-4 bg-gray-300 rounded-full mb-1" aria-hidden="true" />
                <FunnelNode
                  compact
                  label="Slot not booked"
                  value={otpVerifiedSlotNotBooked}
                  widthPct={maxSlot > 0 ? (otpVerifiedSlotNotBooked / maxSlot) * 100 : 0}
                  conversionPct={otpVerified > 0 ? Math.round((otpVerifiedSlotNotBooked / otpVerified) * 100) : null}
                  conversionLabel="of OTP verified"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center flex-1 min-w-0 basis-0 sm:basis-auto sm:max-w-sm">
            <div className="w-0.5 h-4 bg-gray-300 rounded-full mb-1" aria-hidden="true" />
            <FunnelNode
              label="OTP not verified"
              value={otpNotVerified}
              widthPct={maxOtp > 0 ? (otpNotVerified / maxOtp) * 100 : 0}
              conversionPct={total > 0 ? Math.round((otpNotVerified / total) * 100) : null}
              conversionLabel="of leads"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
