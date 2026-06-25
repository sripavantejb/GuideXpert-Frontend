import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import AssignToBdaModal from '../../../components/Admin/callingTeam/AssignToBdaModal';
import BdaAssignedLeadsTable from '../../../components/Admin/callingTeam/BdaAssignedLeadsTable';
import TransferAllLeadsModal from '../../../components/Admin/callingTeam/TransferAllLeadsModal';
import CallingTeamDateFilter from '../../../components/Admin/callingTeam/CallingTeamDateFilter';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import {
  buildStatsQuery,
  getBdaAssignedLeads,
  getBdaStatsById,
  updateBda,
} from '../../../utils/callingTeamApi';
import { BDA_LEAD_TYPES, DEFAULT_BDA_LEAD_TYPE } from '../../../constants/bdaLeadTypes';

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignLeadIds, setReassignLeadIds] = useState([]);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [assignedLeadType, setAssignedLeadType] = useState(DEFAULT_BDA_LEAD_TYPE);

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
    const res = await getBdaAssignedLeads(id, { page, limit: 25, leadType: assignedLeadType });
    if (res.success) {
      setLeads(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, totalPages: 1 });
      setSelectedIds([]);
    }
    setLeadsLoading(false);
  }, [id, assignedLeadType]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    loadLeads(1);
  }, [loadLeads]);

  const bda = detail?.bda;
  const m = detail?.metrics || {};
  const activities = detail?.recentActivities || [];
  const totalAssigned = m.totalAssigned ?? 0;

  const toggleStatus = async () => {
    if (!bda) return;
    const next = bda.status === 'active' ? 'inactive' : 'active';
    await updateBda(id, { status: next });
    loadDetail();
  };

  const handleToggleSelect = (leadId) => {
    setSelectedIds((prev) =>
      prev.includes(leadId) ? prev.filter((x) => x !== leadId) : [...prev, leadId]
    );
  };

  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? leads.map((l) => l.id) : []);
  };

  const openReassignModal = (leadIds) => {
    setReassignLeadIds(leadIds);
    setReassignModalOpen(true);
  };

  const handleReassignSuccess = (result) => {
    const updated = result?.updated;
    setActionMessage(
      typeof updated === 'number'
        ? `Reassigned ${updated} lead${updated !== 1 ? 's' : ''} successfully.`
        : 'Lead reassigned successfully.'
    );
    loadDetail();
    loadLeads(pagination.page);
  };

  const handleTransferSuccess = (result) => {
    const updated = result?.updated ?? 0;
    setActionMessage(`Transferred ${updated} lead${updated !== 1 ? 's' : ''} successfully.`);
    loadDetail();
    loadLeads(1);
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTransferModalOpen(true)}
              disabled={totalAssigned === 0 || bda.status !== 'active'}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Transfer all leads
            </button>
            <button type="button" onClick={toggleStatus} className="px-3 py-2 text-sm border rounded-lg">
              Mark {bda.status === 'active' ? 'inactive' : 'active'}
            </button>
          </div>
        </div>
      ) : null}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {actionMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {actionMessage}
        </div>
      )}

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
          <div className="px-4 py-3 border-b space-y-2">
            <div className="flex flex-wrap gap-2">
              {BDA_LEAD_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAssignedLeadType(t.id)}
                  className={`px-3 py-1 text-sm rounded-lg border ${
                    assignedLeadType === t.id
                      ? 'bg-primary-blue text-white border-primary-blue'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">Assigned Leads</span>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => openReassignModal(selectedIds)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90"
              >
                Reassign selected ({selectedIds.length})
              </button>
            )}
            </div>
          </div>
          {leadsLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <BdaAssignedLeadsTable
              leads={leads}
              compact
              showAssignMeta
              selectable
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onReassignLead={(lead) => openReassignModal([lead.id])}
            />
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

      <AssignToBdaModal
        open={reassignModalOpen}
        leadIds={reassignLeadIds}
        mode="reassign"
        leadType={assignedLeadType}
        excludeBdaId={id}
        preferredLanguage={bda?.language || ''}
        onClose={() => setReassignModalOpen(false)}
        onSuccess={handleReassignSuccess}
      />

      <TransferAllLeadsModal
        open={transferModalOpen}
        sourceBdaId={id}
        sourceBdaName={bda?.name}
        leadCount={totalAssigned}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
}
