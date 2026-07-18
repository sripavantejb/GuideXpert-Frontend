import { useCallback, useEffect, useState } from 'react';
import ChartContainer from '../../../components/Admin/ChartContainer';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { FiLoader } from 'react-icons/fi';
import { getRecoveryFunnel } from '../../../utils/conversationRecoveryAdminApi';

const FUNNEL_KEYS = [
  'eligible',
  'scheduled',
  'sent',
  'delivered',
  'read',
  'replied',
  'conversationResumed',
  'journeyCompleted',
  'booked',
];

export default function ConversationRecoveryFunnel() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getRecoveryFunnel({});
    const data = res.data?.data ?? res.data ?? {};
    setRows(
      FUNNEL_KEYS.map((key) => ({
        stage: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
        count: Number(data[key]) || 0,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <FiLoader className="h-5 w-5 animate-spin" /> Loading funnel…
      </div>
    );
  }

  return (
    <ChartContainer title="Recovery funnel">
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ left: 24, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="stage" width={140} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Count" fill="#0369a1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
