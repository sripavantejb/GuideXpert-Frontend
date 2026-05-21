import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import CallingTeamDateFilter from '../../../components/Admin/callingTeam/CallingTeamDateFilter';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import { buildStatsQuery, createBda, getBdaStats } from '../../../utils/callingTeamApi';

export default function CallingTeamBdas() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState({ preset: '', fromDate: '', toDate: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', status: 'active' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await getBdaStats(buildStatsQuery(dateFilter));
    if (res.success && res.data?.data?.rows) {
      setRows(res.data.data.rows);
    } else {
      setError(res.message || 'Failed to load BDA stats');
    }
    setLoading(false);
  }, [dateFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await createBda(form);
    setSaving(false);
    if (res.success) {
      setShowForm(false);
      setForm({ name: '', phone: '', email: '', status: 'active' });
      load();
    } else {
      setError(res.message || 'Failed to create BDA');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BDA Management</h1>
          <p className="text-sm text-gray-600 mt-1">Performance stats per BDA</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/calling-team" className="px-3 py-2 text-sm border rounded-lg bg-white">
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white"
          >
            <FiPlus /> Add BDA
          </button>
          <button type="button" onClick={load} className="p-2 border rounded-lg bg-white">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <CallingTeamDateFilter value={dateFilter} onChange={setDateFilter} />
      {error && <p className="text-sm text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-4 grid md:grid-cols-4 gap-3">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Phone (10 digits)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg">
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
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
                {rows.map((row) => (
                  <tr
                    key={row.bdaId}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/admin/calling-team/bdas/${row.bdaId}`)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
