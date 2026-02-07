import {
  FiTrendingUp, FiEye, FiMail, FiActivity, FiDownload, FiArrowUpRight, FiArrowDownRight, FiUsers,
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const metrics = [
  { label: 'Profile Views', value: '2,847', change: '+12.5%', up: true, icon: FiEye },
  { label: 'Lead Generation', value: '164', change: '+8.3%', up: true, icon: FiTrendingUp },
  { label: 'Active Campaigns', value: '5', change: '+2', up: true, icon: FiActivity },
  { label: 'Student Inquiries', value: '47', change: '-3.1%', up: false, icon: FiMail },
];

const viewsData = [
  { week: 'W1', views: 320 },
  { week: 'W2', views: 410 },
  { week: 'W3', views: 380 },
  { week: 'W4', views: 520 },
  { week: 'W5', views: 480 },
  { week: 'W6', views: 610 },
  { week: 'W7', views: 580 },
];

const campaigns = [
  { name: 'Engineering Admissions 2026', status: 'Active', leads: 42, impressions: '12.4K' },
  { name: 'Medical Career Webinar', status: 'Active', leads: 28, impressions: '8.2K' },
  { name: 'Free Assessment Offer', status: 'Active', leads: 35, impressions: '15.1K' },
  { name: 'Parent Guidance Workshop', status: 'Paused', leads: 18, impressions: '5.6K' },
  { name: 'Board Exam Counseling', status: 'Completed', leads: 56, impressions: '22.3K' },
];

export default function Marketing() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
            Marketing Support
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Track visibility, leads, and campaigns</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <FiDownload className="w-4 h-4" /> Download Assets
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                <m.icon className="w-4 h-4 text-gray-600" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${m.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {m.up ? <FiArrowUpRight className="w-3.5 h-3.5" /> : <FiArrowDownRight className="w-3.5 h-3.5" />}
                {m.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{m.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Views Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Profile Views Trend</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#003366" strokeWidth={2} dot={{ r: 4, fill: '#003366' }} name="Views" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700">Campaigns</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leads</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Impressions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((c) => (
                  <tr key={c.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.status === 'Active' ? 'bg-emerald-50 text-emerald-700'
                        : c.status === 'Paused' ? 'bg-amber-50 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{c.leads}</td>
                    <td className="px-5 py-3 text-gray-500">{c.impressions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
