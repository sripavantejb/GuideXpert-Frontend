import { useState, useEffect } from 'react';
import { getAdminStats, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import { useAdminDateRange } from '../../hooks/useAdminDateRange';
import AnalyticsSkeleton from '../../components/UI/AnalyticsSkeleton';
import SalesAnalyticsUtmSection from '../../components/Admin/SalesAnalyticsUtmSection';

function formatRangeLabel(from, to) {
  if (!from && !to) return 'selected range';
  const f = (d) => {
    if (!d) return '…';
    const x = new Date(d + 'T12:00:00');
    return Number.isNaN(x.getTime()) ? d : x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  return `${f(from)} – ${f(to)}`;
}

export default function Analytics() {
  const { logout } = useAuth();
  const { dateRange } = useAdminDateRange();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* eslint-disable react-hooks/set-state-in-effect -- standard fetch lifecycle (matches Overview) */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const params = {};
    if (dateRange.from) params.from = dateRange.from;
    if (dateRange.to) params.to = dateRange.to;
    getAdminStats(params, getStoredToken()).then((result) => {
      if (cancelled) return;
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load analytics');
        setLoading(false);
        return;
      }
      setStats(result.data?.data || null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [logout, dateRange.from, dateRange.to]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-red-600" role="alert">{error}</p>
      </div>
    );
  }

  const total = stats?.total ?? 0;
  const statusData = [
    { label: 'Lead in progress', value: stats?.inProgress ?? 0, key: 'in_progress' },
  ];
  const maxStatus = Math.max(...statusData.map((d) => d.value), 1);
  const formatSlotIdForDisplay = (slotId) => {
    if (!slotId || typeof slotId !== 'string') return slotId || '';
    const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM|6PM)$/i);
    if (match) {
      const dayNames = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' };
      return `${dayNames[match[1]] || match[1]} ${match[2]}`;
    }
    return slotId;
  };
  const slotData = Object.entries(stats?.bySlot ?? {}).map(([id, value]) => ({
    id,
    label: formatSlotIdForDisplay(id),
    value,
  }));
  const maxSlot = Math.max(...slotData.map((d) => d.value), 1);
  const signupsOverTime = stats?.signupsOverTime ?? [];
  const rangeSummary = formatRangeLabel(dateRange.from, dateRange.to);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Analytics</h2>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <p className="text-sm text-gray-600">
          All figures below use the dashboard <strong className="font-medium text-gray-800">date range</strong> from{' '}
          <strong className="font-medium text-gray-800">Filters</strong> in the header ({rangeSummary}).
        </p>
      </div>

      <div className="mb-8">
        <SalesAnalyticsUtmSection />
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Status distribution</h3>
          <div className="space-y-3">
            {statusData.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-28 text-sm text-gray-600">{label}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-primary-navy rounded"
                    style={{ width: `${(value / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-8">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Slot distribution</h3>
          <div className="space-y-3">
            {slotData.map(({ id, label, value }) => (
              <div key={id} className="flex items-center gap-3">
                <span className="w-28 text-sm text-gray-600">{label}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-primary-blue-400 rounded"
                    style={{ width: `${(value / maxSlot) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-8">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Signups over time ({rangeSummary})
          </h3>
          {signupsOverTime.length === 0 ? (
            <p className="text-gray-500 text-sm">No signup data for the selected range.</p>
          ) : (
            <div className="space-y-2">
              {signupsOverTime.map(({ date, count }) => (
                <div key={date} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-600">{date}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-primary-navy rounded"
                      style={{
                        width: `${(count / Math.max(...signupsOverTime.map((d) => d.count), 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-6">{count}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
          <p className="text-sm text-gray-600">
            Leads added: <strong>{total}</strong>. OTP verified: <strong>{stats?.otpVerified ?? 0}</strong>. Slot booked: <strong>{stats?.slotBooked ?? 0}</strong>. Page visited: <strong>{stats?.pageVisited ?? 0}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
