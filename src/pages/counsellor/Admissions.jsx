import { FiBookOpen } from 'react-icons/fi';

export default function Admissions() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
            Admissions
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Track college applications and deadlines</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <FiBookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden />
        <p className="text-gray-500 text-sm">Admissions tracking will be available here.</p>
      </div>
    </div>
  );
}
