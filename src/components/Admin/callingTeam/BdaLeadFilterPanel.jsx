import { FiFilter } from 'react-icons/fi';
import { BDA_LANGUAGES } from '../../../constants/bdaLanguage';
import {
  APPLICATION_STATUS_OPTIONS,
  EMPTY_BDA_LEAD_FILTERS,
  LEAD_RELEVANCE_OPTIONS,
  MEET_PRESENCE_OPTIONS,
  MEET_VARIANT_OPTIONS,
} from '../../../constants/bdaLeadFilters';

export default function BdaLeadFilterPanel({
  draft,
  onDraftChange,
  onApply,
  onClear,
  applied,
}) {
  const set = (key, value) => onDraftChange({ ...draft, [key]: value });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50/80">
        <h2 className="text-base font-semibold text-gray-900 m-0 flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-primary-blue" aria-hidden />
          Select leads before assigning
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Filter unassigned IIT counselling leads by meet attendance, slot date, language, relevance, and more.
          Click <strong className="font-medium text-gray-800">Apply filters</strong> to load the pool and
          enable assignment actions.
        </p>
      </div>

      <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block sm:col-span-2 lg:col-span-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</span>
          <input
            type="search"
            value={draft.q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Name or phone"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Meet type</span>
          <select
            value={draft.meetVariant}
            onChange={(e) => set('meetVariant', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {MEET_VARIANT_OPTIONS.map((o) => (
              <option key={o.value || 'any'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Meet attendance
          </span>
          <select
            value={draft.meetPresence}
            onChange={(e) => set('meetPresence', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {MEET_PRESENCE_OPTIONS.map((o) => (
              <option key={o.value || 'any'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Preferred language
          </span>
          <select
            value={draft.preferredLanguage}
            onChange={(e) => set('preferredLanguage', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Any language</option>
            {BDA_LANGUAGES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Meet date from
          </span>
          <input
            type="date"
            value={draft.meetFrom}
            onChange={(e) => set('meetFrom', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Meet date to
          </span>
          <input
            type="date"
            value={draft.meetTo}
            onChange={(e) => set('meetTo', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Counselling slot date
          </span>
          <input
            type="date"
            value={draft.slotDate}
            onChange={(e) => set('slotDate', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Application status
          </span>
          <select
            value={draft.applicationStatus}
            onChange={(e) => set('applicationStatus', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {APPLICATION_STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'any'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Lead relevance
          </span>
          <select
            value={draft.leadRelevance}
            onChange={(e) => set('leadRelevance', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            aria-label="Filter by lead relevance"
          >
            {LEAD_RELEVANCE_OPTIONS.map((o) => (
              <option key={o.value || 'any-relevance'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="px-4 pb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onApply}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          Clear
        </button>
        {applied ? (
          <span className="text-sm text-green-800">Filters applied — pool loaded below.</span>
        ) : (
          <span className="text-sm text-gray-500">No filters applied yet.</span>
        )}
      </div>
    </div>
  );
}

export { EMPTY_BDA_LEAD_FILTERS };
