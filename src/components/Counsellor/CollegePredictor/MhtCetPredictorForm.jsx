import { useCallback, useEffect, useMemo } from 'react';
import { BRANCH_CODES, SORT_ORDER_OPTIONS } from '../../../constants/collegePredictorOptions';
import {
  MHT_CET_ADMISSION_TYPE_OPTIONS,
  MHT_CET_DISTRICT_OPTIONS,
  INDIAN_STATES_OPTIONS,
  getDistrictOptionsForNativeState,
  getMhtCetReservationOptionsForAdmissionType,
  normalizeMhtReservationCodeForApi,
} from '../../../constants/mhtCetOptions';
import { getAccentClasses } from '../../../constants/examCardConfig';

/**
 * MHT-CET filters — same shell as {@link JeeCombinedPredictorForm} (Filters card, grid, branch chips, Predict Colleges).
 */
export default function MhtCetPredictorForm({
  values,
  onChange,
  onSubmit,
  loading,
  accentKey = 'indigo',
  /** When false, render a div instead of form (avoid nested forms on public page). */
  asForm = true,
}) {
  const update = useCallback(
    (patch) => {
      onChange({ ...values, ...patch });
    },
    [values, onChange]
  );

  const admissionType = values.admission_type_enum || 'STATE_LEVEL';

  const resOpts = useMemo(
    () => getMhtCetReservationOptionsForAdmissionType(admissionType),
    [admissionType]
  );

  const selectedReservation = values.reservation_category_codes?.[0] ?? '';

  /** Migrate legacy OHU codes (e.g. PWDSEBCO) to canonical …S PWD codes when options change. */
  useEffect(() => {
    const v = values.reservation_category_codes?.[0];
    if (!v) return;
    const fixed = normalizeMhtReservationCodeForApi(admissionType, v);
    if (fixed === v) return;
    const allowed = new Set(resOpts.map((o) => o.value));
    if (allowed.has(fixed)) {
      update({ reservation_category_codes: [fixed] });
    }
  }, [admissionType, resOpts, selectedReservation, update, values.reservation_category_codes]);

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

  const nativeDistrictOptions = useMemo(
    () => getDistrictOptionsForNativeState(values.native_state),
    [values.native_state]
  );

  const nativeDistrictValueSet = useMemo(
    () => new Set(nativeDistrictOptions.map((o) => o.value)),
    [nativeDistrictOptions]
  );

  const canSubmit = useMemo(() => {
    const p = Number(values.percentile);
    const percentileOk =
      values.percentile !== '' && !Number.isNaN(p) && p >= 1 && p <= 100;
    const branchOk =
      values.branchMode === 'all' ||
      (values.branch_codes && values.branch_codes.length > 0);
    if (!percentileOk || !branchOk || loading) return false;
    if (!selectedReservation) return false;
    if (admissionType === 'STATE_LEVEL') {
      return Boolean(
        values.native_state &&
          values.mh_district &&
          nativeDistrictValueSet.has(values.mh_district)
      );
    }
    return Boolean(values.district);
  }, [
    values.percentile,
    values.branchMode,
    values.branch_codes,
    loading,
    selectedReservation,
    admissionType,
    values.native_state,
    values.mh_district,
    values.district,
    nativeDistrictValueSet,
  ]);

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
        <h3 className="text-base font-bold text-gray-900">Filters</h3>
        <span className="text-xs text-gray-400 shrink-0">
          <span className="text-red-500">*</span> Required
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admission type <span className="text-red-500">*</span>
          </label>
          <select
            value={admissionType}
            onChange={(e) => {
              const v = e.target.value;
              update({
                admission_type_enum: v,
                reservation_category_codes: [],
                district: '',
                mh_district: '',
                native_state: '',
              });
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            {MHT_CET_ADMISSION_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected MHT-CET percentile <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={100}
            step={0.01}
            value={values.percentile}
            onChange={(e) => update({ percentile: e.target.value })}
            placeholder="1 – 100"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select a category <span className="text-red-500">*</span>
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

      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">Select branch</p>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="mht_branch_mode"
              checked={values.branchMode === 'all'}
              onChange={() => update({ branchMode: 'all', branch_codes: [] })}
              className="text-primary-navy focus:ring-primary-navy/30"
            />
            All branches
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="mht_branch_mode"
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

      {admissionType === 'STATE_LEVEL' && (
        <div className="space-y-4 mb-4 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Native place (State Level)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Native state <span className="text-red-500">*</span>
              </label>
              <select
                value={values.native_state || ''}
                onChange={(e) => update({ native_state: e.target.value, mh_district: '' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
              >
                <option value="">Enter your state</option>
                {INDIAN_STATES_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {values.native_state
                  ? `District (${values.native_state})`
                  : 'District'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={values.mh_district || ''}
                onChange={(e) => update({ mh_district: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
              >
                <option value="">Select your district</option>
                {nativeDistrictOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          {values.native_state && values.native_state !== 'Maharashtra' && (
            <p className="text-xs text-gray-500">
              College lists are for Maharashtra CAP; your native state and district are for reference. The search uses all Maharashtra districts so results are not empty.
            </p>
          )}
        </div>
      )}

      {admissionType !== 'STATE_LEVEL' && (
        <div className="mb-4 pt-2 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select district (Maharashtra) <span className="text-red-500">*</span>
          </label>
          <select
            value={values.district || ''}
            onChange={(e) => update({ district: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            <option value="">Select your district</option>
            {MHT_CET_DISTRICT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">
            Home University / Other than Home University: predictions use Maharashtra-wide matching for the
            predictor service; use <span className="font-medium">Search colleges</span> in results to focus on
            a district.
          </p>
        </div>
      )}

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
