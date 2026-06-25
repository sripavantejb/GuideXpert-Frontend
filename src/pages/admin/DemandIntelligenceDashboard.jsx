import { useEffect, useMemo, useState } from 'react';
import {
  FiBarChart2,
  FiBookOpen,
  FiGlobe,
  FiLayers,
  FiMapPin,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '../../components/Admin/DashboardLayout';
import ChartContainer from '../../components/Admin/ChartContainer';
import { getDemandIntelligenceSummary, getStoredToken } from '../../utils/adminApi';

function RankList({ title, icon: Icon, rows }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      {rows?.length ? (
        <ol className="space-y-2 text-xs">
          {rows.map((row, idx) => (
            <li key={`${row.label}-${idx}`} className="flex items-center justify-between gap-2">
              <span className="truncate text-slate-700">
                {idx + 1}. {row.label}
              </span>
              <span className="shrink-0 tabular-nums text-slate-500">{row.count}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-slate-500">No data in this window yet.</p>
      )}
    </section>
  );
}

export default function DemandIntelligenceDashboard() {
  const [windowDays, setWindowDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getDemandIntelligenceSummary({ window: windowDays }, getStoredToken()).then((res) => {
      if (cancelled) return;
      if (!res.success) {
        setError(res.message || 'Failed to load demand intelligence');
        setData(null);
      } else {
        setData(res.data?.data || res.data);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [windowDays]);

  const trend7 = useMemo(() => data?.trends?.['7d'] || [], [data]);
  const trend30 = useMemo(() => data?.trends?.['30d'] || [], [data]);
  const ranked = data?.mostSearched || {};

  return (
    <DashboardLayout
      title="Demand Intelligence"
      subtitle="Most searched colleges, branches, categories, and states from college predictor usage and lead interests."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-600">Ranking window</span>
        {[7, 30].map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => setWindowDays(days)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              windowDays === days
                ? 'bg-primary-blue-700 text-white'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {days} days
          </button>
        ))}
        {data?.meta?.searchCount != null ? (
          <span className="text-xs text-slate-500">
            {data.meta.searchCount} predictor searches logged
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading demand intelligence…</p>
      ) : (
        <>
          <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <RankList title="Most searched colleges" icon={FiBookOpen} rows={ranked.colleges} />
            <RankList title="Most searched branches" icon={FiLayers} rows={ranked.branches} />
            <RankList title="Most searched categories" icon={FiBarChart2} rows={ranked.categories} />
            <RankList title="Most searched states" icon={FiMapPin} rows={ranked.states} />
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartContainer title="7-day search trend" icon={FiTrendingUp}>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend7}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#1e40af" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>

            <ChartContainer title="30-day search trend" icon={FiGlobe}>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend30}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
