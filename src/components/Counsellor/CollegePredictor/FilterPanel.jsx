import { useCallback, useMemo } from 'react';
import { FiX } from 'react-icons/fi';
import {
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
  admissionCategories = [],
  admissionFieldLabel = 'Admission category',
  reservationFieldLabel = 'Reservation categories',
  rankFieldLabel = 'Your Rank',
  reservationOptions,
  reservationSelectSingle = false,
  districtOptions,
  districtSelectionHint,
  hideAdmissionField = false,
}) {
  const update = useCallback(
    (field, value) => onChange({ ...filters, [field]: value }),
    [filters, onChange]
  );

  const resOpts = useMemo(
    () => (Array.isArray(reservationOptions) && reservationOptions.length > 0 ? reservationOptions : RESERVATION_CATEGORIES),
    [reservationOptions]
  );

  const distOpts = useMemo(
    () => (Array.isArray(districtOptions) && districtOptions.length > 0 ? districtOptions : DISTRICTS),
    [districtOptions]
  );

  const submitClasses = accent
    ? getAccentClasses(accent).button
    : 'bg-primary-navy hover:bg-primary-navy/90 text-white';

  const selectedReservationSingle = filters.reservation_category_codes?.[0] ?? '';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-2xl bg-white border border-gray-200 shadow-md p-5 sm:p-6 transition-shadow duration-300"
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {rankFieldLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            step="1"
            value={filters.rank}
            onChange={(e) => update('rank', e.target.value)}
            placeholder="e.g. 3200"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </div>

        {admissionCategories.length > 0 && !hideAdmissionField && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {admissionFieldLabel}
            </label>
            <select
              value={filters.admission_category_name_enum}
              onChange={(e) => update('admission_category_name_enum', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
            >
              {admissionCategories.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

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

      {reservationSelectSingle ? (
        <div className="mb-4 max-w-xl">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {reservationFieldLabel} <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedReservationSingle}
            onChange={(e) => {
              const v = e.target.value;
              update('reservation_category_codes', v ? [v] : []);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            {resOpts.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {!reservationSelectSingle && (
          <MultiSelectChips
            label={reservationFieldLabel}
            options={resOpts}
            selected={filters.reservation_category_codes}
            onChange={(val) => update('reservation_category_codes', val)}
          />
        )}
        <MultiSelectChips
          label="Branches"
          options={BRANCH_CODES}
          selected={filters.branch_codes}
          onChange={(val) => update('branch_codes', val)}
        />
        <div>
          <MultiSelectChips
            label="Districts"
            options={distOpts}
            selected={filters.districts}
            onChange={(val) => update('districts', val)}
          />
          {districtSelectionHint && (
            <p className="mt-2 text-xs text-amber-800/90 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {districtSelectionHint}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50 transition-all duration-300 hover:shadow-md ${submitClasses}`}
      >
        {loading ? 'Searching\u2026' : 'Predict Colleges'}
      </button>
    </form>
  );
}
