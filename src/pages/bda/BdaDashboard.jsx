import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { useBdaAuth } from '../../contexts/BdaAuthContext';
import {
  CALL_STATUS_OPTIONS,
  DEMO_STATUS_OPTIONS,
  LEAD_STATUS_OPTIONS,
  NIAT_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  labelForOption,
  statusBadgeClass,
} from '../../constants/callingTeamCrm';
import {
  getBdaDashboardStats,
  getBdaLead,
  getBdaLeadHistory,
  getBdaLeads,
  updateBdaLead,
} from '../../utils/bdaApi';

const STAT_CARDS = [
  ['totalAssignedLeads', 'Total Assigned'],
  ['notCalled', 'Not Called'],
  ['callConnected', 'Connected'],
  ['notConnected', 'Not Connected'],
  ['interested', 'Interested'],
  ['notInterested', 'Not Interested'],
  ['demoScheduled', 'Demo Scheduled'],
  ['demoAttended', 'Demo Attended'],
  ['demoNotAttended', 'Demo Not Attended'],
  ['niatRegistered', 'NIAT Registered'],
  ['paymentInitiated', 'Payment Initiated'],
  ['amountPaid', 'Amount Paid'],
  ['callbackPending', 'Callback Pending'],
  ['converted', 'Converted'],
  ['lost', 'Lost'],
];

function formatDt(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function toDateInput(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function toTimeInput(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
}

export default function BdaDashboard() {
  const { user, logout } = useBdaAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [q, setQ] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [filters, setFilters] = useState({
    callStatus: '',
    leadStatus: '',
    demoStatus: '',
    niatStatus: '',
    paymentStatus: '',
    callbackNeeded: '',
  });
  const [drawerId, setDrawerId] = useState('');
  const [drawerLead, setDrawerLead] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const loadStats = useCallback(async () => {
    const res = await getBdaDashboardStats();
    if (res.success) setStats(res.data?.data || {});
  }, []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = { page, limit, q, ...filters };
    if (filters.callbackNeeded === 'true') params.callbackNeeded = 'true';
    if (filters.callbackNeeded === 'false') params.callbackNeeded = 'false';
    const res = await getBdaLeads(params);
    if (res.success) {
      setRows(res.data || []);
      setPagination(res.pagination || { totalPages: 1, total: 0 });
    } else {
      setError(res.message || 'Failed to load leads');
    }
    setLoading(false);
  }, [page, limit, q, filters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const openDrawer = async (id) => {
    setDrawerId(id);
    setDrawerLead(null);
    setHistory([]);
    setSaveMsg('');
    const [leadRes, histRes] = await Promise.all([getBdaLead(id), getBdaLeadHistory(id)]);
    if (leadRes.success) {
      const lead = leadRes.data?.data;
      setDrawerLead(lead);
      setForm({
        callStatus: lead.callStatus || 'not_called',
        leadStatus: lead.leadStatus || '',
        demoStatus: lead.demoStatus || 'not_scheduled',
        niatStatus: lead.niatStatus || 'not_registered',
        paymentStatus: lead.paymentStatus || 'not_paid',
        callbackNeeded: !!lead.callbackNeeded,
        callbackDate: toDateInput(lead.callbackDateTime),
        callbackTime: toTimeInput(lead.callbackDateTime),
        callbackNote: lead.callbackNote || '',
        remark: '',
      });
    }
    if (histRes.success) setHistory(histRes.data?.data || []);
  };

  const closeDrawer = () => {
    setDrawerId('');
    setDrawerLead(null);
  };

  const handleSave = async () => {
    if (!drawerId) return;
    if (!form.remark?.trim()) {
      setSaveMsg('Remark is required');
      return;
    }
    setSaving(true);
    setSaveMsg('');
    const body = {
      callStatus: form.callStatus,
      leadStatus: form.leadStatus || undefined,
      demoStatus: form.demoStatus,
      niatStatus: form.niatStatus,
      paymentStatus: form.paymentStatus,
      callbackNeeded: form.callbackNeeded,
      callbackDate: form.callbackNeeded ? form.callbackDate : undefined,
      callbackTime: form.callbackNeeded ? form.callbackTime : undefined,
      callbackNote: form.callbackNeeded ? form.callbackNote : undefined,
      remark: form.remark.trim(),
    };
    const res = await updateBdaLead(drawerId, body);
    setSaving(false);
    if (res.success) {
      setSaveMsg('Saved');
      await openDrawer(drawerId);
      loadLeads();
      loadStats();
    } else {
      setSaveMsg(res.message || 'Save failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/bda/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">BDA Dashboard</h1>
            <p className="text-sm text-gray-600">{user?.name || 'BDA'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAT_CARDS.map(([key, label]) => (
            <div key={key} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-xs text-gray-500 truncate">{label}</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{stats[key] ?? 0}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (setQ(searchDraft), setPage(1))}
                placeholder="Search name or phone"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => { setQ(searchDraft); setPage(1); }}
              className="px-3 py-2 text-sm rounded-lg bg-primary-blue text-white"
            >
              Search
            </button>
            <button type="button" onClick={loadLeads} className="p-2 rounded-lg border border-gray-200">
              <FiRefreshCw />
            </button>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filters.callStatus} onChange={(e) => setFilters((f) => ({ ...f, callStatus: e.target.value }))} className="border rounded-lg px-2 py-1.5 text-sm">
              <option value="">Call status</option>
              {CALL_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filters.leadStatus} onChange={(e) => setFilters((f) => ({ ...f, leadStatus: e.target.value }))} className="border rounded-lg px-2 py-1.5 text-sm">
              <option value="">Lead status</option>
              {LEAD_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filters.demoStatus} onChange={(e) => setFilters((f) => ({ ...f, demoStatus: e.target.value }))} className="border rounded-lg px-2 py-1.5 text-sm">
              <option value="">Demo</option>
              {DEMO_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filters.niatStatus} onChange={(e) => setFilters((f) => ({ ...f, niatStatus: e.target.value }))} className="border rounded-lg px-2 py-1.5 text-sm">
              <option value="">NIAT</option>
              {NIAT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filters.paymentStatus} onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))} className="border rounded-lg px-2 py-1.5 text-sm">
              <option value="">Payment</option>
              {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filters.callbackNeeded} onChange={(e) => setFilters((f) => ({ ...f, callbackNeeded: e.target.value }))} className="border rounded-lg px-2 py-1.5 text-sm">
              <option value="">Callback</option>
              <option value="true">Callback needed</option>
              <option value="false">No callback</option>
            </select>
            <button type="button" onClick={() => setPage(1)} className="px-3 py-1.5 text-sm rounded-lg border">Apply filters</button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Call</th>
                <th className="px-3 py-2">Lead</th>
                <th className="px-3 py-2">Demo</th>
                <th className="px-3 py-2">NIAT</th>
                <th className="px-3 py-2">Payment</th>
                <th className="px-3 py-2">Callback</th>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-gray-500">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-gray-500">No assigned leads</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/80">
                    <td className="px-3 py-2 font-medium">{row.fullName}</td>
                    <td className="px-3 py-2">{row.phone}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${statusBadgeClass('call', row.callStatus)}`}>
                        {labelForOption(CALL_STATUS_OPTIONS, row.callStatus)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${statusBadgeClass('lead', row.leadStatus)}`}>
                        {labelForOption(LEAD_STATUS_OPTIONS, row.leadStatus)}
                      </span>
                    </td>
                    <td className="px-3 py-2">{labelForOption(DEMO_STATUS_OPTIONS, row.demoStatus)}</td>
                    <td className="px-3 py-2">{labelForOption(NIAT_STATUS_OPTIONS, row.niatStatus)}</td>
                    <td className="px-3 py-2">{labelForOption(PAYMENT_STATUS_OPTIONS, row.paymentStatus)}</td>
                    <td className="px-3 py-2">{row.callbackNeeded ? formatDt(row.callbackDateTime) : 'No'}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{formatDt(row.lastUpdatedAt)}</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => openDrawer(row.id)} className="text-primary-blue text-sm font-medium">
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Page {page} of {pagination.totalPages || 1} ({pagination.total || 0} leads)</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40">Prev</button>
            <button type="button" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40">Next</button>
          </div>
        </div>
      </main>

      {drawerId && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <button type="button" className="flex-1 bg-black/30" onClick={closeDrawer} aria-label="Close" />
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl p-5">
            {!drawerLead ? (
              <p className="text-gray-500">Loading…</p>
            ) : (
              <>
                <h2 className="text-lg font-semibold">{drawerLead.fullName}</h2>
                <p className="text-sm text-gray-600">{drawerLead.phone}</p>
                <p className="text-xs text-gray-500 mt-1">Last remark: {drawerLead.latestRemark || drawerLead.lastRemark || '—'}</p>

                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium">Call status</label>
                  <select value={form.callStatus} onChange={(e) => setForm((f) => ({ ...f, callStatus: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {CALL_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <label className="block text-sm font-medium">Lead status</label>
                  <select value={form.leadStatus} onChange={(e) => setForm((f) => ({ ...f, leadStatus: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {LEAD_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <label className="block text-sm font-medium">Demo status</label>
                  <select value={form.demoStatus} onChange={(e) => setForm((f) => ({ ...f, demoStatus: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {DEMO_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <label className="block text-sm font-medium">NIAT registration</label>
                  <select value={form.niatStatus} onChange={(e) => setForm((f) => ({ ...f, niatStatus: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {NIAT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <label className="block text-sm font-medium">Payment status</label>
                  <select value={form.paymentStatus} onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!form.callbackNeeded} onChange={(e) => setForm((f) => ({ ...f, callbackNeeded: e.target.checked }))} />
                    Callback needed
                  </label>
                  {form.callbackNeeded && (
                    <>
                      <input type="date" value={form.callbackDate} onChange={(e) => setForm((f) => ({ ...f, callbackDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                      <input type="time" value={form.callbackTime} onChange={(e) => setForm((f) => ({ ...f, callbackTime: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                      <input placeholder="Callback note" value={form.callbackNote} onChange={(e) => setForm((f) => ({ ...f, callbackNote: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </>
                  )}
                  <label className="block text-sm font-medium">Remark *</label>
                  <textarea value={form.remark} onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Required for every update" />
                  {saveMsg && <p className={`text-sm ${saveMsg === 'Saved' ? 'text-green-700' : 'text-red-600'}`}>{saveMsg}</p>}
                  <button type="button" disabled={saving} onClick={handleSave} className="w-full py-2 rounded-lg bg-primary-blue text-white font-medium disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save update'}
                  </button>
                </div>

                <div className="mt-8 border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity timeline</h3>
                  <ul className="space-y-4">
                    {history.length === 0 ? (
                      <li className="text-sm text-gray-500">No activity yet</li>
                    ) : (
                      history.map((h) => (
                        <li key={h.id} className="text-sm border-l-2 border-primary-blue pl-3">
                          <p className="text-gray-500 text-xs">{formatDt(h.createdAt)}</p>
                          <p className="font-medium">Updated by: {h.bdaName || 'BDA'}</p>
                          <p className="text-gray-800">
                            {[h.callStatus, h.leadStatus, h.demoStatus, h.niatRegistrationStatus, h.paymentStatus]
                              .filter(Boolean)
                              .join(' | ')}
                          </p>
                          {h.remark && <p className="text-gray-600 mt-1">Remark: {h.remark}</p>}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
