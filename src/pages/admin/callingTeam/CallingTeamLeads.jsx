import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiRefreshCw, FiSearch, FiUserPlus } from 'react-icons/fi';
import AssignToBdaModal from '../../../components/Admin/callingTeam/AssignToBdaModal';
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
  getCallingTeamLead,
  getCallingTeamLeads,
  getLeadAssignmentHistory,
  listBdas,
  patchCallingTeamLeadCrm,
  reassignLeadToBda,
} from '../../../utils/callingTeamApi';

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('en-IN', { dateStyle: 'short' })} ${d.toLocaleTimeString('en-IN', { timeStyle: 'short' })}`;
}

function toDateInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export default function CallingTeamLeads() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [assignedBdaId, setAssignedBdaId] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [bdas, setBdas] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [assignOpen, setAssignOpen] = useState(false);
  const [drawerId, setDrawerId] = useState('');
  const [drawerLead, setDrawerLead] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [crmForm, setCrmForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listBdas({ status: 'all' }).then((res) => {
      if (res.success && Array.isArray(res.data?.data)) setBdas(res.data.data);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = { page, limit: 25, q };
    if (assignedBdaId) params.assignedBdaId = assignedBdaId;
    if (unassignedOnly) params.unassignedOnly = 'true';
    const res = await getCallingTeamLeads(params);
    if (res.success) {
      setRows(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, totalPages: 1, total: 0 });
      setSelected(new Set());
    } else {
      setError(res.message || 'Failed to load leads');
    }
    setLoading(false);
  }, [page, q, assignedBdaId, unassignedOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const pageIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openDrawer = async (id) => {
    setDrawerId(id);
    setDrawerLoading(true);
    const [leadRes, histRes] = await Promise.all([
      getCallingTeamLead(id),
      getLeadAssignmentHistory(id),
    ]);
    if (leadRes.success && leadRes.data?.data) {
      const lead = leadRes.data.data;
      setDrawerLead(lead);
      setCrmForm({
        callStatus: lead.callStatus || 'not_called',
        leadStatus: lead.leadStatus || '',
        demoStatus: lead.demoStatus || 'not_scheduled',
        niatStatus: lead.niatStatus || 'not_registered',
        paymentStatus: lead.paymentStatus || 'none',
        callbackDate: toDateInputValue(lead.callbackDate),
        lastRemark: lead.lastRemark || '',
        reassignBdaId: lead.assignedBdaId || '',
        reassignReason: '',
      });
    }
    if (histRes.success) setHistory(histRes.data?.data || []);
    setDrawerLoading(false);
  };

  const closeDrawer = () => {
    setDrawerId('');
    setDrawerLead(null);
    setHistory([]);
  };

  const saveCrm = async () => {
    if (!drawerId) return;
    setSaving(true);
    const body = {
      callStatus: crmForm.callStatus,
      leadStatus: crmForm.leadStatus || null,
      demoStatus: crmForm.demoStatus,
      niatStatus: crmForm.niatStatus,
      paymentStatus: crmForm.paymentStatus,
      callbackDate: crmForm.callbackDate || null,
      lastRemark: crmForm.lastRemark,
    };
    const res = await patchCallingTeamLeadCrm(drawerId, body);
    if (res.success) {
      if (
        crmForm.reassignBdaId &&
        drawerLead?.assignedBdaId &&
        String(crmForm.reassignBdaId) !== String(drawerLead.assignedBdaId)
      ) {
        await reassignLeadToBda(drawerId, {
          bdaId: crmForm.reassignBdaId,
          reason: crmForm.reassignReason,
        });
      }
      await openDrawer(drawerId);
      load();
    } else {
      setError(res.message || 'Failed to save');
    }
    setSaving(false);
  };

  const selectedIds = Array.from(selected);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IIT Counselling Leads</h1>
          <p className="text-sm text-gray-600 mt-1">Assign leads to BDAs and track CRM status</p>
        </div>
        <Link to="/admin/calling-team" className="text-sm text-primary-blue hover:underline">
          Team dashboard
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setQ(searchDraft.trim());
            setPage(1);
          }}
        >
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search name or phone"
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-56"
            />
          </div>
          <button type="submit" className="px-3 py-2 text-sm border rounded-lg bg-white">
            Search
          </button>
        </form>

        <select
          value={assignedBdaId}
          onChange={(e) => {
            setAssignedBdaId(e.target.value);
            setUnassignedOnly(false);
            setPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All BDAs</option>
          {bdas.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={unassignedOnly}
            onChange={(e) => {
              setUnassignedOnly(e.target.checked);
              if (e.target.checked) setAssignedBdaId('');
              setPage(1);
            }}
          />
          Unassigned only
        </label>

        <button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={() => setAssignOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white disabled:opacity-40"
        >
          <FiUserPlus /> Assign to BDA
        </button>

        <button type="button" onClick={load} className="p-2 border rounded-lg bg-white">
          <FiRefreshCw />
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <TableSkeleton rows={10} cols={10} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase text-left">
                  <th className="px-3 py-2 w-10">
                    <input type="checkbox" checked={allPageSelected} onChange={toggleAll} />
                  </th>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Assigned BDA</th>
                  <th className="px-3 py-2">Call</th>
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Demo</th>
                  <th className="px-3 py-2">NIAT</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggleOne(row.id)}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{row.fullName}</td>
                    <td className="px-3 py-2">{row.phone}</td>
                    <td className="px-3 py-2">{row.assignedBdaName || '—'}</td>
                    <td className="px-3 py-2">{labelForOption(CALL_STATUS_OPTIONS, row.callStatus)}</td>
                    <td className="px-3 py-2">{labelForOption(LEAD_STATUS_OPTIONS, row.leadStatus)}</td>
                    <td className="px-3 py-2">{labelForOption(DEMO_STATUS_OPTIONS, row.demoStatus)}</td>
                    <td className="px-3 py-2">{labelForOption(NIAT_STATUS_OPTIONS, row.niatStatus)}</td>
                    <td className="px-3 py-2">{labelForOption(PAYMENT_STATUS_OPTIONS, row.paymentStatus)}</td>
                    <td className="px-3 py-2">{formatDateTime(row.updatedAt)}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => openDrawer(row.id)}
                        className="text-primary-blue hover:underline inline-flex items-center gap-1"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
          <span>{pagination.total ?? 0} leads</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              {page} / {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AssignToBdaModal
        open={assignOpen}
        leadIds={selectedIds}
        onClose={() => setAssignOpen(false)}
        onSuccess={() => load()}
      />

      {drawerId && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30">
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between">
              <h2 className="font-semibold">Lead details</h2>
              <button type="button" onClick={closeDrawer} className="text-gray-500">
                Close
              </button>
            </div>
            {drawerLoading ? (
              <div className="p-4 animate-pulse space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ) : drawerLead ? (
              <div className="p-4 space-y-4">
                <div>
                  <p className="font-semibold text-lg">{drawerLead.fullName}</p>
                  <p className="text-sm text-gray-600">{drawerLead.phone}</p>
                  <p className="text-sm mt-1">
                    BDA: {drawerLead.assignedBdaName || 'Unassigned'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Call status</label>
                  <select
                    value={crmForm.callStatus}
                    onChange={(e) => setCrmForm((f) => ({ ...f, callStatus: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {CALL_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Lead status</label>
                  <select
                    value={crmForm.leadStatus}
                    onChange={(e) => setCrmForm((f) => ({ ...f, leadStatus: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {LEAD_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Demo</label>
                    <select
                      value={crmForm.demoStatus}
                      onChange={(e) => setCrmForm((f) => ({ ...f, demoStatus: e.target.value }))}
                      className="w-full border rounded-lg px-2 py-2 text-sm"
                    >
                      {DEMO_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">NIAT</label>
                    <select
                      value={crmForm.niatStatus}
                      onChange={(e) => setCrmForm((f) => ({ ...f, niatStatus: e.target.value }))}
                      className="w-full border rounded-lg px-2 py-2 text-sm"
                    >
                      {NIAT_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Payment</label>
                  <select
                    value={crmForm.paymentStatus}
                    onChange={(e) => setCrmForm((f) => ({ ...f, paymentStatus: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {PAYMENT_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Callback date</label>
                  <input
                    type="date"
                    value={crmForm.callbackDate}
                    onChange={(e) => setCrmForm((f) => ({ ...f, callbackDate: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Last remark</label>
                  <textarea
                    value={crmForm.lastRemark}
                    onChange={(e) => setCrmForm((f) => ({ ...f, lastRemark: e.target.value }))}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {drawerLead.assignedBdaId && (
                  <div className="space-y-2 border-t pt-3">
                    <label className="text-xs font-medium text-gray-500">Reassign to BDA</label>
                    <select
                      value={crmForm.reassignBdaId}
                      onChange={(e) => setCrmForm((f) => ({ ...f, reassignBdaId: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      {bdas
                        .filter((b) => b.status === 'active')
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                    </select>
                    <input
                      placeholder="Reason"
                      value={crmForm.reassignReason}
                      onChange={(e) => setCrmForm((f) => ({ ...f, reassignReason: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                )}

                <button
                  type="button"
                  disabled={saving}
                  onClick={saveCrm}
                  className="w-full py-2 text-sm font-medium rounded-lg bg-primary-blue text-white disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save CRM updates'}
                </button>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Assignment history</h3>
                  <ul className="text-sm space-y-2">
                    {history.length === 0 ? (
                      <li className="text-gray-500">No history</li>
                    ) : (
                      history.map((h) => (
                        <li key={h.id} className="border-b pb-2">
                          <span className="text-gray-500">{formatDateTime(h.assignedAt)}</span>
                          <br />
                          {h.previousBdaName || '—'} → {h.newBdaName}
                          {h.reason && <span className="text-gray-600"> ({h.reason})</span>}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
