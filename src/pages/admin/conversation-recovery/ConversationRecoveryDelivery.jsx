import { useCallback, useEffect, useState } from 'react';
import KpiCard from '../../../components/Admin/KpiCard';
import ChartContainer from '../../../components/Admin/ChartContainer';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { FiLoader } from 'react-icons/fi';
import {
  getRecoveryDeliveryStatus,
  getRecoveryFailureReasons,
} from '../../../utils/conversationRecoveryAdminApi';

export default function ConversationRecoveryDelivery() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({});
  const [failures, setFailures] = useState([]);
  const [reasonFilter, setReasonFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [st, fr] = await Promise.all([
      getRecoveryDeliveryStatus({}),
      getRecoveryFailureReasons({
        failureReason: reasonFilter || undefined,
      }),
    ]);
    setStatus(st.data?.data ?? st.data ?? {});
    setFailures(fr.data?.data ?? fr.data ?? []);
    setLoading(false);
  }, [reasonFilter]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <FiLoader className="h-5 w-5 animate-spin" /> Loading delivery…
      </div>
    );
  }

  const statusRows = Object.entries(status || {}).map(([k, v]) => ({ status: k, count: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <label>
          Failure category{' '}
          <select
            className="rounded-md border border-slate-200 px-2 py-1.5"
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="invalid_number">Invalid Number</option>
            <option value="blocked">Blocked</option>
            <option value="opt_out">Opt Out</option>
            <option value="template_missing">Template Missing</option>
            <option value="template_rejected">Template Rejected</option>
            <option value="template_failure">Template Failure</option>
            <option value="api_failure">API Failure</option>
            <option value="rate_limit">Rate Limited</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statusRows.map((r) => (
          <KpiCard key={r.status} label={r.status} value={r.count} />
        ))}
      </div>
      <ChartContainer title="Delivery status">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
      <ChartContainer title="Failure reasons">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Array.isArray(failures) ? failures.filter((f) => !reasonFilter || f.reason === reasonFilter || f.count > 0) : []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="reason" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#b91c1c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
}
