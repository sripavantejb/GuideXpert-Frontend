import { useCallback, useMemo } from 'react';
import {
  BRANCH_CODES,
  SORT_ORDER_OPTIONS,
  WBJEE_CATEGORY_OPTIONS,
  WBJEE_QUOTA_OPTIONS,
} from '../../../constants/collegePredictorOptions';
import { INDIAN_STATES_OPTIONS, getDistrictOptionsForNativeState } from '../../../constants/mhtCetOptions';
import { getAccentClasses } from '../../../constants/examCardConfig';

/**
 * WBJEE — WBJEE and/or JEE Main rank, category, quota (All India / Home State WB), state → district, branches.
 */
export default function WbjeePredictorForm({
  values,
  onChange,
  onSubmit,
  loading,
  accentKey = 'sky',
  categoryOptions = WBJEE_CATEGORY_OPTIONS,
  quotaOptions = WBJEE_QUOTA_OPTIONS,
  asForm = true,
}) {
  const update = useCallback(
    (patch) => {
      onChange({ ...values, ...patch });
    },
    [values, onChange]
  );

  const selectedCategory = values.reservation_category_codes?.[0] ?? '';

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

  const districtOptions = useMemo(
    () => getDistrictOptionsForNativeState(values.current_state),
    [values.current_state]
  );
  const districtValueSet = useMemo(() => new Set(districtOptions.map((o) => o.value)), [districtOptions]);

  const quotaSelected = Boolean(values.quota);

  const canSubmit = useMemo(() => {
    const rw = values.rankWbjee !== '' ? Number(values.rankWbjee) : NaN;
    const rj = values.rankJeeMain !== '' ? Number(values.rankJeeMain) : NaN;
    const rankOk =
      (Number.isInteger(rw) && rw >= 1) ||
      (Number.isInteger(rj) && rj >= 1);
    const branchOk =
      values.branchMode === 'all' ||
      (values.branch_codes && values.branch_codes.length > 0);
    const locOk =
      Boolean(values.current_state) &&
      Boolean(values.current_district) &&
      districtValueSet.has(values.current_district);
    return (
      rankOk &&
      Boolean(selectedCategory) &&
      quotaSelected &&
      branchOk &&
      locOk &&
      !loading
    );
  }, [
    values.rankWbjee,
    values.rankJeeMain,
    values.branchMode,
    values.branch_codes,
    values.current_state,
    values.current_district,
    selectedCategory,
    quotaSelected,
    districtValueSet,
    loading,
  ]);

  const submitClasses = accentKey ? getAccentClasses(accentKey).button : 'bg-primary-navy hover:bg-primary-navy/90 text-white';

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
          <h3 className="text-base font-bold text-gray-900">WBJEE prediction</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-xl">
            Choose category, quota, state, and district. Results use the earlywave WBJEE dataset (rank cutoff from WBJEE
            rank if entered, otherwise JEE Main rank), then filtered to your district.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Your Expected WBJEE 2026 Rank
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={values.rankWbjee ?? ''}
            onChange={(e) => update({ rankWbjee: e.target.value })}
            placeholder="Enter your Rank here"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Your Expected JEE MAIN 2026 Rank
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={values.rankJeeMain ?? ''}
            onChange={(e) => update({ rankJeeMain: e.target.value })}
            placeholder="Enter your Rank here"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">Note: Enter JEE Main Rank or WBJEE Rank or both.</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select a Category <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            const v = e.target.value;
            update({ reservation_category_codes: v ? [v] : [] });
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
        >
          <option value="">Select Your Category</option>
          {categoryOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="pt-4 border-t border-gray-100 space-y-4">
        <p className="text-sm font-medium text-gray-800">
          Choose the Quota &amp; Branch you are interested in for your undergraduate studies.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Quota: <span className="text-red-500">*</span>
          </label>
          <select
            value={values.quota ?? ''}
            onChange={(e) => update({ quota: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
          >
            <option value="">---Select---</option>
            {quotaOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Your State <span className="text-red-500">*</span>
            </label>
            <select
              value={values.current_state || ''}
              onChange={(e) => update({ current_state: e.target.value, current_district: '' })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy"
            >
              <option value="">Select Your State</option>
              {INDIAN_STATES_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Your District <span className="text-red-500">*</span>
            </label>
            <select
              value={values.current_district || ''}
              onChange={(e) => update({ current_district: e.target.value })}
              disabled={!values.current_state}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy disabled:bg-gray-50"
            >
              <option value="">Select Your District</option>
              {districtOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Select Branch</p>
          <div className="flex flex-wrap gap-4 mb-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="wbjee_branch_mode"
                checked={values.branchMode === 'all'}
                onChange={() => update({ branchMode: 'all', branch_codes: [] })}
                className="text-primary-navy focus:ring-primary-navy/30"
              />
              All branches
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="wbjee_branch_mode"
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
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                  `}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 max-w-xs mt-4">
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
