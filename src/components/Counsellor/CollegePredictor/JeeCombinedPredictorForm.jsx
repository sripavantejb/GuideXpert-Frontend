import { useCallback, useMemo } from 'react';
import { BRANCH_CODES, SORT_ORDER_OPTIONS } from '../../../constants/collegePredictorOptions';
import { getAccentClasses } from '../../../constants/examCardConfig';

/**
 * Combined JEE Main + Advanced filter form (category, gender UI-only, branch mode, dual ranks, sort).
 * Gender is not sent to the predictor API (upstream has no field).
 */
export default function JeeCombinedPredictorForm({
  values,
  onChange,
  onSubmit,
  loading,
  accentKey = 'purple',
  reservationOptions = [],
  reservationFieldLabel = 'Select a Category',
  /** When false, render a div instead of form (avoid nested forms on public page). */
  asForm = true,
}) {
  const update = useCallback(
    (patch) => {
      onChange({ ...values, ...patch });
    },
    [values, onChange]
  );

  const resOpts = useMemo(
    () => (Array.isArray(reservationOptions) && reservationOptions.length > 0 ? reservationOptions : []),
    [reservationOptions]
  );

  const selectedReservation = values.reservation_category_codes?.[0] ?? '';

  const submitClasses = accentKey
    ? getAccentClasses(accentKey).button
    : 'bg-primary-navy hover:bg-primary-navy/90 text-white';

  const toggleBranch = useCallback(
    (val) => {
      const selected = values.branch_codes || [];
      const next = selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val];
      update({ branch_codes: next });
    },
    [values.branch_codes, update]
  );

  const Wrapper = asForm ? 'form' : 'div';
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Wrapper
      {...(asForm ? { onSubmit: handleFormSubmit } : {})}
      className="rounded-2xl bg-white border border-gray-200 shadow-md p-5 sm:p-6 transition-shadow duration-300"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-gray-900">Filters</h3>
        <span className="text-xs text-gray-400 shrink-0">
          <span className="text-red-500">*</span> Required
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {reservationFieldLabel} <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedReservation}
            onChange={(e) => {
              const v = e.target.value;
              update({ reservation_category_codes: v ? [v] : [] });
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            <option value="">Select your category</option>
            {resOpts.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={values.gender ?? ''}
            onChange={(e) => update({ gender: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            <option value="">Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">Select branch</p>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="jee_branch_mode"
              checked={values.branchMode === 'all'}
              onChange={() => update({ branchMode: 'all', branch_codes: [] })}
              className="text-primary-navy focus:ring-primary-navy/30"
            />
            All branches
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="jee_branch_mode"
              checked={values.branchMode === 'specific'}
              onChange={() => update({ branchMode: 'specific' })}
              className="text-primary-navy focus:ring-primary-navy/30"
            />
            Specific branches
          </label>
        </div>
        {values.branchMode === 'specific' && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {BRANCH_CODES.map((o) => {
              const active = (values.branch_codes || []).includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleBranch(o.value)}
                  className={`
                    inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150
                    ${active
                      ? 'bg-primary-navy text-white border-primary-navy'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter your expected JEE Main general rank
          </label>
          <input
            type="number"
            min={1}
            step="1"
            value={values.rankMain}
            onChange={(e) => update({ rankMain: e.target.value })}
            placeholder="Enter your rank here"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter your expected JEE Advanced general rank
          </label>
          <input
            type="number"
            min={1}
            step="1"
            value={values.rankAdvanced}
            onChange={(e) => update({ rankAdvanced: e.target.value })}
            placeholder="Enter your rank here"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-4">
        Note: enter at least one rank (JEE Main and/or JEE Advanced).
      </p>

      <div className="mb-5 max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
        <select
          value={values.sort_order}
          onChange={(e) => update({ sort_order: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
        >
          {SORT_ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <button
        type={asForm ? 'submit' : 'button'}
        disabled={loading}
        onClick={asForm ? undefined : () => onSubmit()}
        className={`rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50 transition-all hover:shadow-md ${submitClasses}`}
      >
        {loading ? 'Searching…' : 'Predict Colleges'}
      </button>
    </Wrapper>
  );
}
