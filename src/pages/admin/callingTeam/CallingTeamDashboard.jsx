import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiUsers, FiTrendingUp } from 'react-icons/fi';
import CallingTeamDateFilter from '../../../components/Admin/callingTeam/CallingTeamDateFilter';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import {
  buildStatsQuery,
  getBdaLeaderboard,
  getCallingTeamDashboard,
} from '../../../utils/callingTeamApi';

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value ?? '—'}</p>
    </div>
  );
}

export default function CallingTeamDashboard() {
  const [dateFilter, setDateFilter] = useState({ preset: '', fromDate: '', toDate: '' });
  const [team, setTeam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const q = buildStatsQuery(dateFilter);
    const [dashRes, lbRes] = await Promise.all([
      getCallingTeamDashboard(q),
      getBdaLeaderboard(q),
    ]);
    if (dashRes.success && dashRes.data?.data) {
      setTeam(dashRes.data.data);
    } else {
      setError(dashRes.message || 'Failed to load dashboard');
    }
    if (lbRes.success && lbRes.data?.data?.table) {
      setLeaderboard(lbRes.data.data.table);
    }
    setLoading(false);
  }, [dateFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calling Team</h1>
          <p className="text-sm text-gray-600 mt-1">Team performance and BDA leaderboard</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/calling-team/leads"
            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
          >
            Leads CRM
          </Link>
          <Link
            to="/admin/calling-team/bdas"
            className="px-3 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white"
          >
            BDA Management
          </Link>
        </div>
      </div>

      <CallingTeamDateFilter value={dateFilter} onChange={setDateFilter} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : team ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Total BDAs" value={team.totalBdas} />
          <StatCard label="Active BDAs" value={team.activeBdas} />
          <StatCard label="Assigned Leads" value={team.totalAssignedLeads} />
          <StatCard label="Unassigned Leads" value={team.unassignedLeads} />
          <StatCard label="Connected Calls" value={team.totalConnectedCalls} />
          <StatCard label="Interested Leads" value={team.totalInterestedLeads} />
          <StatCard label="Demo Attended" value={team.totalDemoAttended} />
          <StatCard label="NIAT Registered" value={team.totalNiatRegistered} />
          <StatCard label="Amount Paid" value={team.totalAmountPaid} />
          <StatCard label="Callback Pending" value={team.totalCallbackPending} />
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <FiTrendingUp className="text-primary-blue" />
          <h2 className="font-semibold text-gray-900">BDA Leaderboard</h2>
        </div>
        {loading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">BDA Name</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Connected</th>
                  <th className="px-4 py-3">Demo Attended</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No BDA data for this period
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((row) => (
                    <tr key={row.bdaId} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.rank}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/calling-team/bdas/${row.bdaId}`}
                          className="text-primary-blue hover:underline"
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{row.assignedLeads}</td>
                      <td className="px-4 py-3">{row.connected}</td>
                      <td className="px-4 py-3">{row.demoAttended}</td>
                      <td className="px-4 py-3">{row.registered}</td>
                      <td className="px-4 py-3">{row.paid}</td>
                      <td className="px-4 py-3">{row.conversionPct}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex gap-4 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1">
          <FiUsers /> Manage BDAs
        </span>
        <span className="inline-flex items-center gap-1">
          <FiPhone /> Assign & track leads
        </span>
      </div>
    </div>
  );
}
