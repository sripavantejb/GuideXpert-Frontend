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
        className="fixed right-0 top-0 bottom-0 w-[min(100vw,320px)] min-w-[280px] bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col lg:absolute lg:right-0 lg:top-full lg:bottom-auto lg:mt-1.5 lg:rounded-xl lg:border lg:max-h-[85vh] lg:w-[320px] lg:min-w-[320px]"
        role="dialog"
        aria-label="Filters"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-slate-200 shrink-0">
          <span className="text-sm font-semibold text-slate-900">Filters</span>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-medium text-[#003366] hover:underline whitespace-nowrap"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-w-0">
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Course
            </label>
            <input
              type="text"
              value={course || ''}
              onChange={(e) => onFiltersChange({ ...filters, course: e.target.value.trim() || undefined })}
              placeholder="Filter by course"
              className="w-full min-w-0 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] box-border"
            />
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status || ''}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
              className="w-full min-w-0 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] box-border bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'any'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Joined from
            </label>
            <input
              type="date"
              value={joinedFrom || ''}
              onChange={(e) => onFiltersChange({ ...filters, joinedFrom: e.target.value || undefined })}
              className="w-full min-w-0 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] box-border"
            />
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Joined to
            </label>
            <input
              type="date"
              value={joinedTo || ''}
              onChange={(e) => onFiltersChange({ ...filters, joinedTo: e.target.value || undefined })}
              className="w-full min-w-0 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] box-border"
            />
          </div>
          <div className="flex items-start gap-3 pt-1 min-w-0">
            <input
              id="filter-show-deleted"
              type="checkbox"
              checked={!!showDeleted}
              onChange={(e) => onFiltersChange({ ...filters, showDeleted: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-[#003366] focus:ring-[#003366] shrink-0"
            />
            <label htmlFor="filter-show-deleted" className="text-sm text-slate-700 leading-snug cursor-pointer">
              Show deleted students
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
