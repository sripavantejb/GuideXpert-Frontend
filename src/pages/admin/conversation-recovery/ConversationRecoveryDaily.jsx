import { useCallback, useEffect, useState } from 'react';
import ChartContainer from '../../../components/Admin/ChartContainer';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { FiLoader } from 'react-icons/fi';
import { getRecoveryDaily } from '../../../utils/conversationRecoveryAdminApi';

export default function ConversationRecoveryDaily() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getRecoveryDaily({});
    setRows((res.data?.data ?? res.data) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <FiLoader className="h-5 w-5 animate-spin" /> Loading daily stats…
      </div>
    );
  }

  return (
    <ChartContainer title="Daily recovery activity">
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={Array.isArray(rows) ? rows : []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sent" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="replies" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="recovered" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="bookings" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
