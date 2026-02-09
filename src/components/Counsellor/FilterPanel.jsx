import { FiX } from 'react-icons/fi';

const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on-hold', label: 'On hold' },
];

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearAll,
  courseOptions = [],
}) {
  if (!isOpen) return null;

  const { course, status, joinedFrom, joinedTo, showDeleted } = filters;
  const activeCount = [
    course,
    status,
    joinedFrom,
    joinedTo,
    showDeleted,
  ].filter(Boolean).length;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30 lg:bg-transparent" aria-hidden onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col lg:absolute lg:right-0 lg:top-full lg:bottom-auto lg:mt-1 lg:rounded-xl lg:border lg:max-h-[80vh]"
        role="dialog"
        aria-label="Filters"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-900">Filters</span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-[#003366] hover:underline"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Course
            </label>
            <input
              type="text"
              value={course || ''}
              onChange={(e) => onFiltersChange({ ...filters, course: e.target.value.trim() || undefined })}
              placeholder="Filter by course"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status || ''}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'any'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Joined from
            </label>
            <input
              type="date"
              value={joinedFrom || ''}
              onChange={(e) => onFiltersChange({ ...filters, joinedFrom: e.target.value || undefined })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Joined to
            </label>
            <input
              type="date"
              value={joinedTo || ''}
              onChange={(e) => onFiltersChange({ ...filters, joinedTo: e.target.value || undefined })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="filter-show-deleted"
              type="checkbox"
              checked={!!showDeleted}
              onChange={(e) => onFiltersChange({ ...filters, showDeleted: e.target.checked })}
              className="rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
            />
            <label htmlFor="filter-show-deleted" className="text-sm text-gray-700">
              Show deleted students
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
