import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiRefreshCw, FiSearch } from 'react-icons/fi';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import {
  CALL_STATUS_OPTIONS,
  DEMO_STATUS_OPTIONS,
  LEAD_STATUS_OPTIONS,
  NIAT_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  labelForOption,
} from '../../../constants/callingTeamCrm';
import { mapCallingDataLeadRow } from '../../../utils/callingDataLeadMapper';
import { getCallingTeamLeads, listBdas } from '../../../utils/callingTeamApi';

export default function CallingData() {
  const [mapped, setMapped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [assignedBdaId, setAssignedBdaId] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [bdas, setBdas] = useState([]);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    listBdas({ status: 'all' }).then((res) => {
      if (res.success && Array.isArray(res.data?.data)) setBdas(res.data.data);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = { page, limit: 50, q };
    if (assignedBdaId) params.assignedBdaId = assignedBdaId;
    if (unassignedOnly) params.unassignedOnly = 'true';

    const res = await getCallingTeamLeads(params);
    if (res.success) {
      const data = res.data?.data || [];
      setMapped(data.map(mapCallingDataLeadRow));
      setPagination(res.data?.pagination || { total: data.length, totalPages: 1 });
    } else {
      setError(res.message || 'Failed to load IIT counselling leads');
      setMapped([]);
    }
    setLoading(false);
  }, [page, q, assignedBdaId, unassignedOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const unassignedOnPage = mapped.filter((r) => !r.assignedBdaId).length;
  const assignedOnPage = mapped.filter((r) => r.assignedBdaId).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calling Data</h1>
          <p className="text-sm text-gray-600 mt-1">
            IIT counselling leads — submission, UTM, and calling CRM fields
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/calling-team/leads"
            className="px-3 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90"
          >
            Manage &amp; assign leads
          </Link>
          <Link
            to="/admin/iit-counselling"
            className="px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50"
          >
            IIT Counselling (full)
          </Link>
          <button type="button" onClick={load} className="p-2 border rounded-lg bg-white" aria-label="Refresh">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">Total leads (this list)</p>
          <p className="text-2xl font-semibold mt-1">{pagination.total ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">On this page</p>
          <p className="text-2xl font-semibold mt-1">{mapped.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">Assigned (page)</p>
          <p className="text-2xl font-semibold mt-1">{assignedOnPage}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">Unassigned (page)</p>
          <p className="text-2xl font-semibold mt-1">{unassignedOnPage}</p>
        </div>
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
            <option key={b.id || b.bdaId} value={b.id || b.bdaId}>
              {b.name}
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
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
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <TableSkeleton rows={12} cols={12} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-2 sticky left-0 bg-gray-50">Name</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Language</th>
                  <th className="px-3 py-2">Studying</th>
                  <th className="px-3 py-2">Step</th>
                  <th className="px-3 py-2">Done</th>
                  <th className="px-3 py-2">Slot</th>
                  <th className="px-3 py-2">Demo date</th>
                  <th className="px-3 py-2">UTM Source</th>
                  <th className="px-3 py-2">Assigned BDA</th>
                  <th className="px-3 py-2">Call</th>
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Demo</th>
                  <th className="px-3 py-2">NIAT</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2">View</th>
                </tr>
              </thead>
              <tbody>
                {mapped.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="px-4 py-10 text-center text-gray-500">
                      No IIT counselling leads match your filters
                    </td>
                  </tr>
                ) : (
                  mapped.map((row) => (
                    <tr key={row.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium sticky left-0 bg-white">{row.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.phone}</td>
                      <td className="px-3 py-2">{row.preferredLanguage}</td>
                      <td className="px-3 py-2 max-w-[140px] truncate" title={row.classStatus}>
                        {row.classStatus}
                      </td>
                      <td className="px-3 py-2">{row.currentStep}</td>
                      <td className="px-3 py-2">{row.completed}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.slot}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.demoDate}</td>
                      <td className="px-3 py-2 max-w-[100px] truncate" title={row.utmSource}>
                        {row.utmSource}
                      </td>
                      <td className="px-3 py-2">{row.assignedBda}</td>
                      <td className="px-3 py-2">{labelForOption(CALL_STATUS_OPTIONS, row.callStatus)}</td>
                      <td className="px-3 py-2">{labelForOption(LEAD_STATUS_OPTIONS, row.leadStatus)}</td>
                      <td className="px-3 py-2">{labelForOption(DEMO_STATUS_OPTIONS, row.demoStatus)}</td>
                      <td className="px-3 py-2">{labelForOption(NIAT_STATUS_OPTIONS, row.niatStatus)}</td>
                      <td className="px-3 py-2">{labelForOption(PAYMENT_STATUS_OPTIONS, row.paymentStatus)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.updatedAt}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setDetail(row)}
                          className="text-primary-blue hover:underline inline-flex items-center gap-1"
                        >
                          <FiEye /> Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
          <span>{pagination.total ?? 0} leads total</span>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              Page {page} / {pagination.totalPages || 1}
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

      {detail && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Lead detail</h2>
              <button type="button" onClick={() => setDetail(null)} className="text-gray-500 text-sm">
                Close
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div>
                <p className="text-lg font-semibold">{detail.name}</p>
                <p className="text-gray-600">{detail.phone}</p>
              </div>
              <dl className="grid grid-cols-1 gap-2">
                <div>
                  <dt className="text-gray-500">Language</dt>
                  <dd>{detail.preferredLanguage}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Current studying</dt>
                  <dd>{detail.classStatus}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Top colleges</dt>
                  <dd className="wrap-break-word">{detail.topColleges}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Slot / Demo</dt>
                  <dd>
                    {detail.slot} · {detail.demoDate}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">UTM</dt>
                  <dd>
                    {detail.utmSource} / {detail.utmMedium} / {detail.utmCampaign} / {detail.utmContent}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Assigned BDA</dt>
                  <dd>{detail.assignedBda}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Call / Lead / Demo / NIAT / Payment</dt>
                  <dd>
                    {labelForOption(CALL_STATUS_OPTIONS, detail.callStatus)} ·{' '}
                    {labelForOption(LEAD_STATUS_OPTIONS, detail.leadStatus)} ·{' '}
                    {labelForOption(DEMO_STATUS_OPTIONS, detail.demoStatus)} ·{' '}
                    {labelForOption(NIAT_STATUS_OPTIONS, detail.niatStatus)} ·{' '}
                    {labelForOption(PAYMENT_STATUS_OPTIONS, detail.paymentStatus)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last remark</dt>
                  <dd>{detail.lastRemark}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Created / Updated</dt>
                  <dd>
                    {detail.createdAt} · {detail.updatedAt}
                  </dd>
                </div>
              </dl>
              <Link
                to="/admin/calling-team/leads"
                className="inline-block text-primary-blue font-medium hover:underline"
              >
                Edit in Calling Team Leads →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
