import {
  FiBarChart2, FiTrendingUp, FiUsers, FiCheckCircle, FiCalendar, FiStar, FiDownload,
  FiArrowUpRight, FiArrowDownRight,
} from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const performanceData = [
  { month: 'Sep', sessions: 22, admissions: 8 },
  { month: 'Oct', sessions: 28, admissions: 12 },
  { month: 'Nov', sessions: 35, admissions: 15 },
  { month: 'Dec', sessions: 30, admissions: 18 },
  { month: 'Jan', sessions: 42, admissions: 22 },
  { month: 'Feb', sessions: 48, admissions: 26 },
];

const kpis = [
  { label: 'Total Students', value: '342', change: '+12%', up: true, icon: FiUsers },
  { label: 'Success Rate', value: '87%', change: '+4.2%', up: true, icon: FiCheckCircle },
  { label: 'Sessions Held', value: '205', change: '+18', up: true, icon: FiCalendar },
  { label: 'Avg. Rating', value: '4.8/5', change: '+0.2', up: true, icon: FiStar },
];

export default function Reports() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
            Reports & Insights
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Performance trends and success metrics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <FiDownload className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#003366]/5 flex items-center justify-center">
                <k.icon className="w-4 h-4 text-[#003366]" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {k.up ? <FiArrowUpRight className="w-3.5 h-3.5" /> : <FiArrowDownRight className="w-3.5 h-3.5" />}
                {k.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Sessions Over Time</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#003366" strokeWidth={2} dot={{ r: 4, fill: '#003366' }} name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Admissions by Month</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="admissions" fill="#003366" name="Admissions" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
