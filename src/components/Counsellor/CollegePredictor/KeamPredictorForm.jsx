import { useCallback, useMemo } from 'react';
import {
  BRANCH_CODES,
  SORT_ORDER_OPTIONS,
  KEAM_DISTRICT_OPTIONS,
  KEAM_RESERVATION_OPTIONS,
} from '../../../constants/collegePredictorOptions';
import { INDIAN_STATES_OPTIONS, getDistrictOptionsForNativeState } from '../../../constants/mhtCetOptions';
import { getAccentClasses } from '../../../constants/examCardConfig';

/**
 * KEAM — single-screen filters: rank, category, all/specific Kerala districts & branches, native place, sort.
 * Wire values to `admission_category_name_enum: DEFAULT` on the API (see collegePredictorOptions KEAM meta).
 */
export default function KeamPredictorForm({
  values,
  onChange,
  onSubmit,
  loading,
  accentKey = 'teal',
  reservationOptions = KEAM_RESERVATION_OPTIONS,
  districtOptions = KEAM_DISTRICT_OPTIONS,
  asForm = true,
}) {
  const update = useCallback(
    (patch) => {
      onChange({ ...values, ...patch });
    },
    [values, onChange]
  );

  const selectedReservation = values.reservation_category_codes?.[0] ?? '';

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

  const toggleDistrict = useCallback(
    (val) => {
      const selected = values.districts || [];
      const next = selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val];
      update({ districts: next });
    },
    [values.districts, update]
  );

  const nativeDistrictOptions = useMemo(
    () => getDistrictOptionsForNativeState(values.native_state),
    [values.native_state]
  );

  const nativeDistrictValueSet = useMemo(
    () => new Set(nativeDistrictOptions.map((o) => o.value)),
    [nativeDistrictOptions]
  );

  const canSubmit = useMemo(() => {
    const rank = Number(values.rank);
    const rankOk =
      values.rank !== '' && !Number.isNaN(rank) && rank >= 1 && Number.isInteger(rank);
    const branchOk =
      values.branchMode === 'all' ||
      (values.branch_codes && values.branch_codes.length > 0);
    const districtOk =
      values.districtMode === 'all' ||
      (values.districts && values.districts.length > 0);
    const nativeOk =
      Boolean(values.native_state) &&
      Boolean(values.native_district) &&
      nativeDistrictValueSet.has(values.native_district);
    return (
      rankOk &&
      Boolean(selectedReservation) &&
      branchOk &&
      districtOk &&
      nativeOk &&
      !loading
    );
  }, [
    values.rank,
    values.branchMode,
    values.branch_codes,
    values.districtMode,
    values.districts,
    values.native_state,
    values.native_district,
    selectedReservation,
    loading,
    nativeDistrictValueSet,
  ]);

  const submitClasses = accentKey
    ? getAccentClasses(accentKey).button
    : 'bg-primary-navy hover:bg-primary-navy/90 text-white';

  const Wrapper = asForm ? 'form' : 'div';
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) onSubmit();
  };

  return (
    <Wrapper
      {...(asForm ? { onSubmit: handleFormSubmit } : {})}
      className="rounded-2xl bg-white border border-gray-200 shadow-md p-5 sm:p-6 transition-shadow duration-300"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">KEAM Rank</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-xl">
            Fill your home state and district to contextualize results; college matching uses your rank, category,
            and optional Kerala district and branch filters.
          </p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          <span className="text-red-500">*</span> Required
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Your Expected KEAM Rank <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={values.rank}
            onChange={(e) => update({ rank: e.target.value })}
            placeholder="Enter Your Rank"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select a Category <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedReservation}
            onChange={(e) => {
              const v = e.target.value;
              update({ reservation_category_codes: v ? [v] : [] });
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            <option value="">Select Your Category</option>
            {reservationOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">Select District</p>
        <div className="flex flex-wrap gap-4 mb-2">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="keam_district_mode"
              checked={values.districtMode === 'all'}
              onChange={() => update({ districtMode: 'all', districts: [] })}
              className="text-primary-navy focus:ring-primary-navy/30"
            />
            All Districts
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="keam_district_mode"
              checked={values.districtMode === 'specific'}
              onChange={() => update({ districtMode: 'specific' })}
              className="text-primary-navy focus:ring-primary-navy/30"
            />
            Specific Districts
          </label>
        </div>
        {values.districtMode === 'specific' && (
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-lg border border-gray-100 bg-gray-50/80">
            {districtOptions.map((o) => {
              const active = (values.districts || []).includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleDistrict(o.value)}
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

      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">Select Branch</p>
        <div className="flex flex-wrap gap-4 mb-2">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="keam_branch_mode"
              checked={values.branchMode === 'all'}
              onChange={() => update({ branchMode: 'all', branch_codes: [] })}
              className="text-primary-navy focus:ring-primary-navy/30"
            />
            All branches
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="keam_branch_mode"
              checked={values.branchMode === 'specific'}
              onChange={() => update({ branchMode: 'specific' })}
              className="text-primary-navy focus:ring-primary-navy/30"
            />
            Specific Branches
          </label>
        </div>
        {values.branchMode === 'specific' && (
          <div className="flex flex-wrap gap-1.5">
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

      <div className="space-y-4 mb-4 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Native place</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Native State <span className="text-red-500">*</span>
            </label>
            <select
              value={values.native_state || ''}
              onChange={(e) => update({ native_state: e.target.value, native_district: '' })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
            >
              <option value="">---Select---</option>
              {INDIAN_STATES_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current District <span className="text-red-500">*</span>
            </label>
            <select
              value={values.native_district || ''}
              onChange={(e) => update({ native_district: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
            >
              <option value="">---Select---</option>
              {nativeDistrictOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-5 max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
        <select
          value={values.sort_order || 'ASC'}
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
        disabled={loading || !canSubmit}
        onClick={asForm ? undefined : () => canSubmit && onSubmit()}
        className={`rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50 transition-all hover:shadow-md ${submitClasses}`}
      >
        {loading ? 'Searching…' : 'Predict Colleges'}
      </button>
    </Wrapper>
  );
}
