import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiTarget,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '../../components/Admin/DashboardLayout';
import KpiCard from '../../components/Admin/KpiCard';
import ChartContainer from '../../components/Admin/ChartContainer';
import { getNurturingSubmissions, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';

const CHART_COLORS = ['#003366', '#00509e', '#0ea5e9', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

const ACTIVITY_LABELS = {
  reaching_out_contacts: 'Reaching out to contacts',
  shared_posters: 'Shared posters',
  started_conversations: 'Started conversations',
  identified_students: 'Identified students',
  started_counseling: 'Started counseling',
  follow_ups: 'Follow-ups',
  generated_lead: 'Generated a lead',
  started_nat_application: 'Started NAT application',
  booked_nat_exam: 'Booked NAT exam',
  completed_sr: 'Completed SR',
  not_started_yet: "Haven't started yet",
};

const CHALLENGE_LABELS = {
  finding_students: 'Finding Students',
  starting_conversations: 'Starting Conversations',
  counseling_students: 'Counseling Students',
  follow_ups: 'Follow-ups',
  nat_conversions: 'NAT Conversions',
  time_management: 'Time Management',
  confidence: 'Confidence',
  other: 'Other',
};

const COUNT_LABELS = {
  0: '0',
  '1': '1',
  '1-2': '1–2',
  '2-5': '2–5',
  '5+': '5+',
};

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return `${date.toLocaleDateString('en-IN', { dateStyle: 'short' })} ${date.toLocaleTimeString('en-IN', { timeStyle: 'short' })}`;
}

function formatSlotTime(t) {
  if (t === '15:00') return '3:00 PM';
  if (t === '17:00') return '5:00 PM';
  return t || '—';
}

function mapToChartRows(countMap, labelFn) {
  return Object.entries(countMap || {})
    .filter(([key]) => key && key !== 'null' && key !== 'undefined')
    .map(([key, count]) => ({
      name: labelFn ? labelFn(key) : key,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-slate-800">{row.name}</p>
      <p className="text-slate-600">{row.value} responses</p>
    </div>
  );
}

export default function NurturingDashboard() {
  const { logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', from: '', to: '' });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      q: filters.q.trim() || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    };
    getNurturingSubmissions(params, getStoredToken()).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load nurturing data');
        return;
      }
      setRecords(result.data?.data || []);
      setPagination(result.data?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
      setStats(result.data?.stats || null);
    });
    return () => { cancelled = true; };
  }, [pagination.page, pagination.limit, filters.q, filters.from, filters.to, logout]);

  const leadsChart = useMemo(
    () => mapToChartRows(stats?.byNewLeads, (k) => COUNT_LABELS[k] || k),
    [stats]
  );
  const natChart = useMemo(
    () => mapToChartRows(stats?.byNewNatApplications, (k) => COUNT_LABELS[k] || k),
    [stats]
  );
  const srChart = useMemo(
    () => mapToChartRows(stats?.bySeatReservations, (k) => COUNT_LABELS[k] || k),
    [stats]
  );
  const challengePie = useMemo(
    () => mapToChartRows(stats?.byBiggestChallenge, (k) => CHALLENGE_LABELS[k] || k),
    [stats]
  );
  const activityPie = useMemo(
    () => mapToChartRows(stats?.byActivity, (k) => ACTIVITY_LABELS[k] || k).slice(0, 8),
    [stats]
  );
  const slotTimePie = useMemo(
    () => mapToChartRows(stats?.bySlotTime, formatSlotTime),
    [stats]
  );
  const dailyChart = useMemo(() => stats?.byDay || [], [stats]);
  const slotDateChart = useMemo(
    () => mapToChartRows(stats?.bySlotDate, (k) => k),
    [stats]
  );

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const chartsEmpty = !stats?.total;

  return (
    <DashboardLayout
      title="Nurturing"
      subtitle="Progress check-in responses — implementation follow-up, outcomes, and support session bookings."
    >
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">Search</label>
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              placeholder="Name or mobile"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/20"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => handleFilterChange('from', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => handleFilterChange('to', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total check-ins" value={stats?.total ?? '—'} icon={FiUsers} accent="hero" />
        <KpiCard
          label="Sessions booked"
          value={stats?.withSlot ?? '—'}
          icon={FiCalendar}
          subtitle="Selected support slot"
        />
        <KpiCard
          label="Generated leads"
          value={stats?.withLeads ?? '—'}
          icon={FiTrendingUp}
          subtitle="Reported 1+ new leads"
        />
        <KpiCard
          label="Not started yet"
          value={stats?.notStartedYet ?? '—'}
          icon={FiActivity}
          subtitle="No implementation activity"
        />
      </section>

      {loading ? (
        <p className="text-sm text-slate-500">Loading nurturing analytics…</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartContainer title="Submissions per day" empty={chartsEmpty}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Submissions" fill="#003366" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>

            <ChartContainer title="Biggest challenge" empty={chartsEmpty}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={challengePie}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={88}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {challengePie.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartContainer title="New leads generated" empty={chartsEmpty}>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={56} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00509e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>

            <ChartContainer title="NAT applications started" empty={chartsEmpty}>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={natChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={56} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>

            <ChartContainer title="Seat reservations" empty={chartsEmpty}>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={srChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={56} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartContainer title="Activities completed" subtitle="Top selections across all responses" empty={chartsEmpty}>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityPie}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                    >
                      {activityPie.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>

            <div className="grid gap-4">
              <ChartContainer title="Session time preference" empty={chartsEmpty}>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={slotTimePie} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={58}>
                        {slotTimePie.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>

              <ChartContainer title="Bookings by session date" empty={chartsEmpty}>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={slotDateChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>
            </div>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <FiTarget className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">All responses</h2>
              </div>
              <span className="text-xs text-slate-500">{pagination.total} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500">
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-4 py-2.5 font-medium">Mobile</th>
                    <th className="px-4 py-2.5 font-medium">Leads</th>
                    <th className="px-4 py-2.5 font-medium">NAT</th>
                    <th className="px-4 py-2.5 font-medium">SR</th>
                    <th className="px-4 py-2.5 font-medium">Challenge</th>
                    <th className="px-4 py-2.5 font-medium">Session</th>
                    <th className="px-4 py-2.5 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row) => (
                    <Fragment key={row.id}>
                      <tr
                        key={row.id}
                        className="border-b border-slate-50 hover:bg-slate-50/60 cursor-pointer"
                        onClick={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                      >
                        <td className="px-4 py-2.5 font-medium">{row.fullName}</td>
                        <td className="px-4 py-2.5 tabular-nums">{row.mobileNumber}</td>
                        <td className="px-4 py-2.5">{COUNT_LABELS[row.newLeads] || row.newLeads}</td>
                        <td className="px-4 py-2.5">{COUNT_LABELS[row.newNatApplications] || row.newNatApplications}</td>
                        <td className="px-4 py-2.5">{COUNT_LABELS[row.seatReservations] || row.seatReservations}</td>
                        <td className="px-4 py-2.5">{CHALLENGE_LABELS[row.biggestChallenge] || row.biggestChallenge}</td>
                        <td className="px-4 py-2.5">
                          {row.slotDate
                            ? `${row.slotDate} ${formatSlotTime(row.slotTime)}`
                            : '—'}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                      </tr>
                      {expandedId === row.id ? (
                        <tr key={`${row.id}-detail`} className="border-b border-slate-100 bg-slate-50/40">
                          <td colSpan={8} className="px-4 py-3 text-xs text-slate-600">
                            <p className="font-medium text-slate-700 mb-1">Activities</p>
                            <p className="mb-2">
                              {(row.activities || [])
                                .map((a) => ACTIVITY_LABELS[a] || a)
                                .join(' · ') || '—'}
                            </p>
                            {row.biggestChallenge === 'other' && row.biggestChallengeOther ? (
                              <p>
                                <span className="font-medium text-slate-700">Other challenge: </span>
                                {row.biggestChallengeOther}
                              </p>
                            ) : null}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                  {!records.length ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        No progress check-in responses yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => goToPage(pagination.page - 1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  <FiChevronLeft /> Previous
                </button>
                <span className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => goToPage(pagination.page + 1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Next <FiChevronRight />
                </button>
              </div>
            ) : null}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
