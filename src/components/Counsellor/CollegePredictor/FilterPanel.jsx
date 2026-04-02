import { useCallback } from 'react';
import { FiX } from 'react-icons/fi';
import {
  ADMISSION_CATEGORIES,
  RESERVATION_CATEGORIES,
  BRANCH_CODES,
  SORT_ORDER_OPTIONS,
  DISTRICTS,
} from '../../../constants/collegePredictorOptions';
import { getAccentClasses } from '../../../constants/examCardConfig';

function MultiSelectChips({ label, options, selected, onChange }) {
  const toggle = useCallback(
    (val) => {
      onChange(
        selected.includes(val)
          ? selected.filter((v) => v !== val)
          : [...selected, val]
      );
    },
    [selected, onChange]
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={`
                inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                border transition-colors duration-150
                ${active
                  ? 'bg-primary-navy text-white border-primary-navy'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {o.label}
              {active && <FiX className="w-3 h-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterPanel({
  filters,
  onChange,
  onSubmit,
  loading,
  selectedExamLabel,
  accent,
}) {
  const update = useCallback(
    (field, value) => onChange({ ...filters, [field]: value }),
    [filters, onChange]
  );

  const submitClasses = accent
    ? getAccentClasses(accent).button
    : 'bg-primary-navy hover:bg-primary-navy/90 text-white';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-xl bg-white border border-gray-200 shadow-md p-5 sm:p-6 transition-shadow duration-300"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Filters</h3>
          {selectedExamLabel && (
            <p className="mt-2 text-xs text-gray-500">
              Selected exam:
              <span className="ml-1.5 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
                {selectedExamLabel}
              </span>
            </p>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          <span className="text-red-500">*</span> Required
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Cutoff from */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rank / Cutoff from <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            step="any"
            value={filters.cutoff_from}
            onChange={(e) => update('cutoff_from', e.target.value)}
            placeholder="e.g. 100"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </div>

        {/* Cutoff to */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rank / Cutoff to <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            step="any"
            value={filters.cutoff_to}
            onChange={(e) => update('cutoff_to', e.target.value)}
            placeholder="e.g. 5000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </div>

        {/* Admission category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admission category
          </label>
          <select
            value={filters.admission_category_name_enum}
            onChange={(e) => update('admission_category_name_enum', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            {ADMISSION_CATEGORIES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Sort order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
          <select
            value={filters.sort_order}
            onChange={(e) => update('sort_order', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            {SORT_ORDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <MultiSelectChips
          label="Reservation categories"
          options={RESERVATION_CATEGORIES}
          selected={filters.reservation_category_codes}
          onChange={(val) => update('reservation_category_codes', val)}
        />
        <MultiSelectChips
          label="Branches"
          options={BRANCH_CODES}
          selected={filters.branch_codes}
          onChange={(val) => update('branch_codes', val)}
        />
        <MultiSelectChips
          label="Districts"
          options={DISTRICTS}
          selected={filters.districts}
          onChange={(val) => update('districts', val)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors duration-300 ${submitClasses}`}
      >
        {loading ? 'Searching…' : 'Predict Colleges'}
      </button>
    </form>
  );
}
