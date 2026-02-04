import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getAdminLeads, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

const ALL_SLOT_IDS = [
  'MONDAY_7PM', 'TUESDAY_7PM', 'WEDNESDAY_7PM', 'THURSDAY_7PM',
  'FRIDAY_7PM', 'SATURDAY_7PM', 'SUNDAY_7PM', 'SUNDAY_11AM'
];

function formatSlotIdForDropdown(slotId) {
  if (!slotId || typeof slotId !== 'string') return slotId || '';
  const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM)$/i);
  if (match) {
    const dayNames = { MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday' };
    const time = match[2].replace(/(\d+)(AM|PM)/i, '$1 $2');
    return `${dayNames[match[1]] || match[1]} ${time}`;
  }
  return slotId;
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { dateStyle: 'short' }) + ' ' + date.toLocaleTimeString('en-IN', { timeStyle: 'short' });
}

export default function Overview() {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const leadsParams = { page: 1, limit: 10 };
    if (selectedSlot) leadsParams.selectedSlot = selectedSlot;
    Promise.all([
      getAdminStats({}, getStoredToken()),
      getAdminLeads(leadsParams, getStoredToken())
    ]).then(([statsRes, leadsRes]) => {
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
      if (leadsRes.success && leadsRes.data?.data) {
        setRecent(leadsRes.data.data);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [logout, selectedSlot]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-gray-500">Loading overview…</p>
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

  const cards = [
    { label: 'Total leads', value: stats?.total ?? 0, color: 'primary-navy' },
    { label: 'In progress', value: stats?.inProgress ?? 0 },
    { label: 'Registered', value: stats?.registered ?? 0 },
    { label: 'Completed', value: stats?.completed ?? 0 },
    { label: 'OTP verified', value: stats?.otpVerified ?? 0 },
    { label: 'Slot booked', value: stats?.slotBooked ?? 0 },
  ];

  const signupsOverTime = stats?.signupsOverTime ?? [];
  const maxSignups = Math.max(...signupsOverTime.map((d) => d.count), 1);

  return (
    <div className="max-w-6xl mx-auto">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-5"
          >
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color ? 'text-primary-navy' : 'text-gray-800'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Signups over time (last 30 days) */}
      {signupsOverTime.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Signups (last 30 days)</h3>
          <div className="flex items-end gap-1 h-32" role="img" aria-label="Bar chart of signups per day">
            {signupsOverTime.map((d) => (
              <div
                key={d.date}
                className="flex-1 min-w-0 flex flex-col items-center group"
                title={`${d.date}: ${d.count} signup${d.count !== 1 ? 's' : ''}`}
              >
                <div
                  className="w-full bg-primary-navy rounded-t transition-all hover:opacity-90"
                  style={{ height: `${Math.max(4, (d.count / maxSignups) * 100)}%` }}
                />
                <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-800">Recent leads</h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 outline-none text-sm min-w-[140px]"
              aria-label="Filter recent leads by slot"
            >
              <option value="">All slots</option>
              {ALL_SLOT_IDS.map((slotId) => (
                <option key={slotId} value={slotId}>
                  {formatSlotIdForDropdown(slotId)}
                </option>
              ))}
            </select>
            {selectedSlot && (
              <button
                type="button"
                onClick={() => setSelectedSlot('')}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear filter
              </button>
            )}
            <Link
              to="/admin/leads"
              className="text-sm text-primary-navy hover:underline font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[500px] w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 font-semibold text-gray-700 align-middle">Name</th>
                <th className="px-4 py-2 font-semibold text-gray-700 align-middle">Phone</th>
                <th className="px-4 py-2 font-semibold text-gray-700 align-middle">Status</th>
                <th className="px-4 py-2 font-semibold text-gray-700 align-middle whitespace-nowrap">Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500 align-middle">
                    No leads yet
                  </td>
                </tr>
              ) : (
                recent.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 align-middle">{lead.fullName || '—'}</td>
                    <td className="px-4 py-2 align-middle">{lead.phone || '—'}</td>
                    <td className="px-4 py-2 align-middle">{lead.applicationStatus || '—'}</td>
                    <td className="px-4 py-2 align-middle whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
