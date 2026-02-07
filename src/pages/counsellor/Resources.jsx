import { FiFolder, FiFileText, FiVideo, FiDownload, FiSearch, FiGrid, FiList } from 'react-icons/fi';

const resources = [
  { id: 1, title: 'Career Counseling Guide 2026', type: 'PDF', size: '2.4 MB', category: 'Guides', icon: FiFileText, color: 'text-red-500 bg-red-50' },
  { id: 2, title: 'Student Assessment Templates', type: 'PDF', size: '1.1 MB', category: 'Templates', icon: FiFileText, color: 'text-red-500 bg-red-50' },
  { id: 3, title: 'Effective Counseling Techniques', type: 'Video', size: '45 min', category: 'Training', icon: FiVideo, color: 'text-purple-500 bg-purple-50' },
  { id: 4, title: 'Admission Process Flowchart', type: 'PDF', size: '800 KB', category: 'Guides', icon: FiFileText, color: 'text-red-500 bg-red-50' },
  { id: 5, title: 'Communication Skills Workshop', type: 'Video', size: '1 hr 20 min', category: 'Training', icon: FiVideo, color: 'text-purple-500 bg-purple-50' },
  { id: 6, title: 'Session Notes Template', type: 'PDF', size: '340 KB', category: 'Templates', icon: FiFileText, color: 'text-red-500 bg-red-50' },
  { id: 7, title: 'College Database 2026', type: 'PDF', size: '5.2 MB', category: 'Data', icon: FiFileText, color: 'text-blue-500 bg-blue-50' },
  { id: 8, title: 'Parent Communication Guide', type: 'PDF', size: '1.8 MB', category: 'Guides', icon: FiFileText, color: 'text-red-500 bg-red-50' },
];

export default function Resources() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
            Resource Library
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">PDFs, videos, notes, and templates for your practice</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['All', 'Guides', 'Templates', 'Training', 'Data'].map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              cat === 'All'
                ? 'bg-[#003366] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-lg ${r.color} flex items-center justify-center mb-3`}>
              <r.icon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{r.title}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <span>{r.type}</span>
              <span>&middot;</span>
              <span>{r.size}</span>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{r.category}</span>
            <button className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#003366] opacity-0 group-hover:opacity-100 transition-opacity">
              <FiDownload className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
