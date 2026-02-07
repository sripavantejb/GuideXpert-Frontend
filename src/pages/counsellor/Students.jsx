import { FiUsers, FiSearch, FiPlus, FiFilter } from 'react-icons/fi';

const demoStudents = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@example.com', status: 'Active', course: 'Engineering', joined: '2025-09-15' },
  { id: 2, name: 'Priya Patel', email: 'priya@example.com', status: 'Active', course: 'Medical', joined: '2025-10-02' },
  { id: 3, name: 'Rohan Gupta', email: 'rohan@example.com', status: 'Inactive', course: 'Commerce', joined: '2025-08-20' },
  { id: 4, name: 'Ananya Reddy', email: 'ananya@example.com', status: 'Active', course: 'Design', joined: '2025-11-01' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', status: 'Active', course: 'Engineering', joined: '2025-12-10' },
];

export default function Students() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
            Student Management
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage student profiles, documents, and status</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors">
          <FiPlus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <FiFilter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {demoStudents.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#003366]/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-[#003366]">{s.name.charAt(0)}</span>
                    </div>
                    {s.name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{s.email}</td>
                  <td className="px-5 py-3.5 text-gray-700">{s.course}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{s.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
