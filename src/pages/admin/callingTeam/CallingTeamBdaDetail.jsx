import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import CallingTeamDateFilter from '../../../components/Admin/callingTeam/CallingTeamDateFilter';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import {
  CALL_STATUS_OPTIONS,
  DEMO_STATUS_OPTIONS,
  LEAD_STATUS_OPTIONS,
  NIAT_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  labelForOption,
} from '../../../constants/callingTeamCrm';
import {
  buildStatsQuery,
  getBdaAssignedLeads,
  getBdaStatsById,
  updateBda,
} from '../../../utils/callingTeamApi';
import { getLeadClassStatus, getLeadTopColleges } from '../../../utils/callingDataLeadMapper';

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('en-IN', { dateStyle: 'medium' })} ${d.toLocaleTimeString('en-IN', { timeStyle: 'short' })}`;
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold mt-1">{value ?? '—'}</p>
    </div>
  );
}

export default function CallingTeamBdaDetail() {
  const { id } = useParams();
  const [dateFilter, setDateFilter] = useState({ preset: '', fromDate: '', toDate: '' });
  const [detail, setDetail] = useState(null);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDetail = useCallback(async () => {
    setLoading(true);
    const res = await getBdaStatsById(id, buildStatsQuery(dateFilter));
    if (res.success && res.data?.data) {
      setDetail(res.data.data);
    } else {
      setError(res.message || 'Failed to load BDA');
    }
    setLoading(false);
  }, [id, dateFilter]);

  const loadLeads = useCallback(async (page = 1) => {
    setLeadsLoading(true);
    const res = await getBdaAssignedLeads(id, { page, limit: 25 });
    if (res.success) {
      setLeads(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, totalPages: 1 });
    }
    setLeadsLoading(false);
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    loadLeads(1);
  }, [loadLeads]);

  const bda = detail?.bda;
  const m = detail?.metrics || {};
  const activities = detail?.recentActivities || [];

  const toggleStatus = async () => {
    if (!bda) return;
    const next = bda.status === 'active' ? 'inactive' : 'active';
    await updateBda(id, { status: next });
    loadDetail();
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/calling-team/bdas" className="inline-flex items-center gap-1 text-sm text-primary-blue">
        <FiArrowLeft /> Back to BDAs
      </Link>

      {loading ? (
        <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
      ) : bda ? (
        <div className="bg-white rounded-xl border p-4 flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{bda.name}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {bda.phone || '—'} · {bda.email || '—'}
            </p>
            <p className="text-sm text-gray-600">
              Status: <span className="font-medium">{bda.status}</span> · Joined{' '}
              {formatDateTime(bda.joinedAt)}
            </p>
          </div>
          <button type="button" onClick={toggleStatus} className="px-3 py-2 text-sm border rounded-lg">
            Mark {bda.status === 'active' ? 'inactive' : 'active'}
          </button>
        </div>
      ) : null}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <CallingTeamDateFilter value={dateFilter} onChange={setDateFilter} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Assigned" value={m.totalAssigned} />
        <MetricCard label="Calls Done" value={m.callsDone} />
        <MetricCard label="Interested" value={m.interested} />
        <MetricCard label="Demo Attended" value={m.demoAttended} />
        <MetricCard label="NIAT Registered" value={m.niatRegistered} />
        <MetricCard label="Payment Paid" value={m.amountPaid} />
        <MetricCard label="Callback Pending" value={m.callbackPending} />
        <MetricCard label="Conversion Rate" value={`${m.conversionPct ?? 0}%`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 border-b font-semibold">Assigned Leads</div>
          {leadsLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="px-3 py-2 text-left">Student</th>
                    <th className="px-3 py-2 text-left">Phone</th>
                    <th className="px-3 py-2 text-left">Current studying</th>
                    <th className="px-3 py-2 text-left">Top colleges</th>
                    <th className="px-3 py-2 text-left">Call</th>
                    <th className="px-3 py-2 text-left">Lead</th>
                    <th className="px-3 py-2 text-left">Demo</th>
                    <th className="px-3 py-2 text-left">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t">
                      <td className="px-3 py-2">{lead.fullName}</td>
                      <td className="px-3 py-2">{lead.phone}</td>
                      <td
                        className="px-3 py-2 max-w-[160px] truncate text-xs text-gray-700"
                        title={getLeadClassStatus(lead)}
                      >
                        {getLeadClassStatus(lead)}
                      </td>
                      <td
                        className="px-3 py-2 max-w-[180px] truncate text-xs text-gray-600"
                        title={getLeadTopColleges(lead)}
                      >
                        {getLeadTopColleges(lead)}
                      </td>
                      <td className="px-3 py-2">{labelForOption(CALL_STATUS_OPTIONS, lead.callStatus)}</td>
                      <td className="px-3 py-2">{labelForOption(LEAD_STATUS_OPTIONS, lead.leadStatus)}</td>
                      <td className="px-3 py-2">{labelForOption(DEMO_STATUS_OPTIONS, lead.demoStatus)}</td>
                      <td className="px-3 py-2">{formatDateTime(lead.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-3 border-t">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => loadLeads(pagination.page - 1)}
                className="px-3 py-1 text-sm border rounded"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600 py-1">
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadLeads(pagination.page + 1)}
                className="px-3 py-1 text-sm border rounded"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-3">Activity Timeline</h3>
          <ul className="space-y-3 max-h-[480px] overflow-y-auto">
            {activities.length === 0 ? (
              <li className="text-sm text-gray-500">No activity yet</li>
            ) : (
              activities.map((act) => (
                <li key={act.id} className="text-sm border-b pb-2">
                  <p className="text-gray-500">{formatDateTime(act.createdAt)}</p>
                  <p className="font-medium text-gray-900">{act.label}</p>
                  {act.remark && <p className="text-gray-600 mt-0.5">Remark: {act.remark}</p>}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
