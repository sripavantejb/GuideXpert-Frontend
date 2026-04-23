import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiLink, FiUsers, FiEye } from 'react-icons/fi';
import { getIitCounsellingUtmAnalytics, getStoredToken } from '../../utils/adminApi';

function StatCard({ title, value, icon, accent, loading }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className={`inline-flex items-center justify-center rounded-md px-2 py-1 ${accent}`}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900">{loading ? '…' : value}</p>
    </div>
  );
}

function DimensionTable({ title, rows, labelKey }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Visits</th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Unique</th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Linked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500 text-sm">No data</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={String(row[labelKey])}>
                  <td className="px-3 py-2 text-gray-800 max-w-[200px] truncate" title={row[labelKey]}>
                    {row[labelKey] === '(none)' ? <span className="text-gray-400">(none)</span> : row[labelKey]}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-900">{row.visits}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700">{row.uniqueVisitors}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700">{row.linkedSubmissions}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function IitCounsellingUtm() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromTime, setFromTime] = useState('00:00');
  const [toTime, setToTime] = useState('23:59');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sharedFilters = useMemo(() => ({
    fromDate,
    toDate,
    fromTime,
    toTime,
  }), [fromDate, toDate, fromTime, toTime]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getIitCounsellingUtmAnalytics(sharedFilters, getStoredToken()).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.success) {
        setError(res.message || 'Failed to load UTM analytics');
        setData(null);
        return;
      }
      setData(res.data?.data || null);
    });
    return () => { cancelled = true; };
  }, [sharedFilters]);

  const summary = data?.summary || {};

  return (
    <div className="max-w-[1400px] mx-auto px-1 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">
            <Link to="/admin/iit-counselling" className="text-primary-navy hover:underline">IIT Counselling</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700">UTM</span>
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">IIT Counselling UTM</h2>
          <p className="text-sm text-gray-500 mt-1">
            Attribution for public <code className="text-xs bg-gray-100 px-1 rounded">/iit-counselling</code> page loads (visit records). Empty dimensions show as (none).
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setLoading(true); setFromDate(e.target.value); }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setLoading(true); setToDate(e.target.value); }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">From Time</label>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => { setLoading(true); setFromTime(e.target.value); }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">To Time</label>
            <input
              type="time"
              value={toTime}
              onChange={(e) => { setLoading(true); setToTime(e.target.value); }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setFromDate('');
              setToDate('');
              setFromTime('00:00');
              setToTime('23:59');
            }}
            className="h-9 px-3 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {error ? <p className="text-red-600 text-sm">{error}</p> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <StatCard title="Total visits" value={summary.totalVisits ?? 0} icon={<FiEye className="w-4 h-4" />} accent="bg-blue-50 text-blue-700" loading={loading} />
        <StatCard title="Visits with any UTM" value={summary.visitsWithAnyUtm ?? 0} icon={<FiLink className="w-4 h-4" />} accent="bg-emerald-50 text-emerald-700" loading={loading} />
        <StatCard title="Visits without UTM" value={summary.visitsWithoutUtm ?? 0} icon={<FiBarChart2 className="w-4 h-4" />} accent="bg-gray-100 text-gray-700" loading={loading} />
        <StatCard title="Unique visitors" value={summary.uniqueVisitors ?? 0} icon={<FiUsers className="w-4 h-4" />} accent="bg-indigo-50 text-indigo-700" loading={loading} />
        <StatCard title="Unique with UTM" value={summary.uniqueVisitorsWithUtm ?? 0} icon={<FiUsers className="w-4 h-4" />} accent="bg-violet-50 text-violet-700" loading={loading} />
        <StatCard title="Unique without UTM" value={summary.uniqueVisitorsWithoutUtm ?? 0} icon={<FiUsers className="w-4 h-4" />} accent="bg-amber-50 text-amber-800" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DimensionTable title="By utm_source" rows={data?.bySource || []} labelKey="utm_source" />
        <DimensionTable title="By utm_medium" rows={data?.byMedium || []} labelKey="utm_medium" />
        <DimensionTable title="By utm_campaign" rows={data?.byCampaign || []} labelKey="utm_campaign" />
        <DimensionTable title="By utm_content" rows={data?.byContent || []} labelKey="utm_content" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Full UTM combinations</h3>
            <p className="text-xs text-gray-500 mt-0.5">Top 50 by visits. Linked = visits with a linked form submission (section 1 saved).</p>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">utm_source</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">utm_medium</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">utm_campaign</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">utm_content</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Visits</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Unique</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Linked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Loading…</td></tr>
              ) : (data?.byCombo || []).length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">No visit data in this range.</td></tr>
              ) : (
                (data.byCombo || []).map((row, idx) => (
                  <tr key={`${row.utm_source}-${row.utm_medium}-${row.utm_campaign}-${row.utm_content}-${idx}`}>
                    <td className="px-3 py-2 text-gray-800 max-w-[160px] truncate" title={row.utm_source}>{row.utm_source === '(none)' ? <span className="text-gray-400">(none)</span> : row.utm_source}</td>
                    <td className="px-3 py-2 text-gray-800 max-w-[140px] truncate" title={row.utm_medium}>{row.utm_medium === '(none)' ? <span className="text-gray-400">(none)</span> : row.utm_medium}</td>
                    <td className="px-3 py-2 text-gray-800 max-w-[160px] truncate" title={row.utm_campaign}>{row.utm_campaign === '(none)' ? <span className="text-gray-400">(none)</span> : row.utm_campaign}</td>
                    <td className="px-3 py-2 text-gray-800 max-w-[160px] truncate" title={row.utm_content}>{row.utm_content === '(none)' ? <span className="text-gray-400">(none)</span> : row.utm_content}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.visits}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-700">{row.uniqueVisitors}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-700">{row.linkedSubmissions}</td>
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
