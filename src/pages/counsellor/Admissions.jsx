import { FiBookOpen, FiSearch, FiFilter, FiClock } from 'react-icons/fi';

const stages = ['Application', 'Document Review', 'Shortlisted', 'Confirmed', 'Enrolled'];

const demoAdmissions = [
  { id: 1, student: 'Aarav Sharma', college: 'IIT Delhi', course: 'B.Tech CSE', stage: 2, deadline: '2026-03-15' },
  { id: 2, student: 'Priya Patel', college: 'AIIMS Delhi', course: 'MBBS', stage: 1, deadline: '2026-02-28' },
  { id: 3, student: 'Rohan Gupta', college: 'SRCC Delhi', course: 'B.Com Hons', stage: 3, deadline: '2026-04-01' },
  { id: 4, student: 'Ananya Reddy', college: 'NID Ahmedabad', course: 'B.Des', stage: 4, deadline: '2026-03-20' },
  { id: 5, student: 'Vikram Singh', college: 'IIT Bombay', course: 'B.Tech Mech', stage: 0, deadline: '2026-02-14' },
];

export default function Admissions() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
            Admissions Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Track college applications, course selections, and deadlines</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search admissions..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <FiFilter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Admissions Cards */}
      <div className="space-y-4">
        {demoAdmissions.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h4 className="font-semibold text-gray-900" style={{ fontSize: '0.95rem' }}>{a.student}</h4>
                <p className="text-sm text-gray-500">{a.college} &middot; {a.course}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                <FiClock className="w-3.5 h-3.5" />
                Deadline: {a.deadline}
              </div>
            </div>
            {/* Stage Progress */}
            <div className="flex items-center gap-1">
              {stages.map((s, i) => (
                <div key={s} className="flex-1 flex flex-col items-center">
                  <div className={`w-full h-1.5 rounded-full ${i <= a.stage ? 'bg-[#003366]' : 'bg-gray-200'}`} />
                  <span className={`text-xs mt-1.5 ${i <= a.stage ? 'text-[#003366] font-medium' : 'text-gray-400'} hidden sm:block`}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
