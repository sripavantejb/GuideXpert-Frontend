import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiRefreshCw } from 'react-icons/fi';
import CallingTeamDateFilter from '../../../components/Admin/callingTeam/CallingTeamDateFilter';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import BdaCredentialsPanel from '../../../components/Admin/callingTeam/BdaCredentialsPanel';
import BdaLanguageAutoAssignPanel from '../../../components/Admin/callingTeam/BdaLanguageAutoAssignPanel';
import BdaProfilesPanel from '../../../components/Admin/callingTeam/BdaProfilesPanel';
import { buildStatsQuery, getBdaStats } from '../../../utils/callingTeamApi';

export default function CallingTeamBdas() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState({ preset: '', fromDate: '', toDate: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileRefresh, setProfileRefresh] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await getBdaStats(buildStatsQuery(dateFilter));
    if (res.success && Array.isArray(res.data?.data?.rows)) {
      setRows(res.data.data.rows);
    } else {
      const msg = res.message || 'Failed to load BDA stats';
      setError(
        res.status === 404
          ? `${msg}. Redeploy the backend with Calling Team routes.`
          : msg
      );
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
          <h1 className="text-2xl font-bold text-gray-900">BDA Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create BDA portal login credentials, manage profiles, and view performance
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/calling-team" className="px-3 py-2 text-sm border rounded-lg bg-white">
            Dashboard
          </Link>
          <button type="button" onClick={load} className="p-2 border rounded-lg bg-white">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <CallingTeamDateFilter value={dateFilter} onChange={setDateFilter} />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <BdaLanguageAutoAssignPanel
        autoSplitOnLoad
        onAssigned={() => {
          load();
          setProfileRefresh((k) => k + 1);
        }}
      />

      <BdaCredentialsPanel
        onCreated={() => {
          load();
          setProfileRefresh((k) => k + 1);
        }}
      />

      <BdaProfilesPanel refreshKey={profileRefresh} showCredentialsHint />

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">Performance stats</h2>
          <p className="text-xs text-gray-500">Metrics by date range (below)</p>
        </div>
        {loading ? (
          <TableSkeleton rows={8} cols={9} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">BDA Name</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Connected</th>
                  <th className="px-4 py-3">Interested</th>
                  <th className="px-4 py-3">Demo Attended</th>
                  <th className="px-4 py-3">NIAT Reg.</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Callback</th>
                  <th className="px-4 py-3">Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No BDAs yet — use the form above to add your first BDA
                    </td>
                  </tr>
                ) : (
                rows.map((row) => (
                  <tr
                    key={row.bdaId || row.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/admin/calling-team/bdas/${row.bdaId || row.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-primary-blue">{row.name}</td>
                    <td className="px-4 py-3">{row.totalAssigned}</td>
                    <td className="px-4 py-3">{row.callsConnected}</td>
                    <td className="px-4 py-3">{row.interested}</td>
                    <td className="px-4 py-3">{row.demoAttended}</td>
                    <td className="px-4 py-3">{row.niatRegistered}</td>
                    <td className="px-4 py-3">{row.amountPaid}</td>
                    <td className="px-4 py-3">{row.callbackPending}</td>
                    <td className="px-4 py-3">{row.conversionPct}%</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
