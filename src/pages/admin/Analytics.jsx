import { useState, useEffect } from 'react';
import { getAdminStats, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

export default function Analytics() {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getAdminStats(getStoredToken()).then((result) => {
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
  }, [logout]);

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
  const slotData = [
    { label: 'Sat 7PM', value: stats?.bySlot?.SATURDAY_7PM ?? 0 },
    { label: 'Sun 3PM', value: stats?.bySlot?.SUNDAY_3PM ?? 0 },
  ];
  const maxSlot = Math.max(...slotData.map((d) => d.value), 1);
  const signupsOverTime = stats?.signupsOverTime ?? [];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Analytics</h2>

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
            {slotData.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3">
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
          <h3 className="font-semibold text-gray-800 mb-4">Signups over time (last 30 days)</h3>
          {signupsOverTime.length === 0 ? (
            <p className="text-gray-500 text-sm">No signup data in the last 30 days.</p>
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
