import { useState, useEffect } from 'react';
import { getAdminStats, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function Analytics() {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const params = {};
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
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
  }, [logout, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-gray-500">Loading analytics…</p>
      </div>
    );
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
    { label: 'In progress', value: stats?.inProgress ?? 0, key: 'in_progress' },
    { label: 'Registered', value: stats?.registered ?? 0, key: 'registered' },
    { label: 'Completed', value: stats?.completed ?? 0, key: 'completed' },
  ];
  const maxStatus = Math.max(...statusData.map((d) => d.value), 1);
  const formatSlotIdForDisplay = (slotId) => {
    if (!slotId || typeof slotId !== 'string') return slotId || '';
    const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM)$/i);
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

  const hasDateFilter = dateFrom || dateTo;
  const applyDefaultRange = () => {
    const { from, to } = defaultDateRange();
    setDateFrom(from);
    setDateTo(to);
  };
  const clearDateRange = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Analytics</h2>

      {/* Date range for signups chart */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <p className="text-xs font-medium text-gray-500 mb-2">Signups chart date range (status and slot metrics are all-time)</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="analytics-from" className="block text-xs font-medium text-gray-500 mb-0.5">From</label>
            <input
              id="analytics-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label htmlFor="analytics-to" className="block text-xs font-medium text-gray-500 mb-0.5">To</label>
            <input
              id="analytics-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={applyDefaultRange}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Last 30 days
            </button>
            {hasDateFilter && (
              <button
                type="button"
                onClick={clearDateRange}
                className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
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
            Signups over time{hasDateFilter ? ` (${dateFrom || '…'} to ${dateTo || '…'})` : ' (last 30 days)'}
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
            Total leads: <strong>{total}</strong>. OTP verified: <strong>{stats?.otpVerified ?? 0}</strong>. Slot booked: <strong>{stats?.slotBooked ?? 0}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
