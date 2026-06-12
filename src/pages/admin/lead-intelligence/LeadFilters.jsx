import { FiSearch, FiSliders } from 'react-icons/fi';
import {
  PANEL_CLASS,
  PANEL_HEADER_CLASS,
  SECTION_SUBTITLE_CLASS,
  SECTION_TITLE_CLASS,
} from './leadIntelligenceUtils';

const STAGE_OPTIONS = [
  { value: '', label: 'All stages' },
  { value: 'cold', label: 'Cold' },
  { value: 'warm', label: 'Warm' },
  { value: 'hot', label: 'Hot' },
];

const LIMIT_OPTIONS = [25, 50, 100];

const inputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-primary-blue-300 focus:outline-none focus:ring-2 focus:ring-primary-blue-100';

export default function LeadFilters({
  stage,
  minScore,
  limit,
  searchPhone,
  debouncedSearch,
  onStageChange,
  onMinScoreChange,
  onLimitChange,
  onSearchChange,
}) {
  const digits = String(debouncedSearch || '').replace(/\D/g, '');
  const showPartialHint = digits.length > 0 && digits.length < 10;

  return (
    <section className={PANEL_CLASS}>
      <div className={PANEL_HEADER_CLASS}>
        <div className="flex items-center gap-2">
          <FiSliders className="h-4 w-4 text-slate-500" aria-hidden />
          <div>
            <h2 className={SECTION_TITLE_CLASS}>Filters &amp; Search</h2>
            <p className={SECTION_SUBTITLE_CLASS}>Refine the lead directory by stage, score, and phone</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stage</span>
            <select value={stage} onChange={(e) => onStageChange(e.target.value)} className={inputClass}>
              {STAGE_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block lg:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Minimum Score
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-700">
                {minScore}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={minScore}
              onChange={(e) => onMinScoreChange(Number(e.target.value))}
              className="mt-4 w-full accent-primary-navy"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Page Size</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className={inputClass}
            >
              {LIMIT_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Phone Search</span>
          <div className="relative mt-1.5">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              inputMode="numeric"
              value={searchPhone}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Enter 10-digit phone for direct lookup"
              className={`${inputClass} mt-0 pl-10`}
            />
          </div>
          {showPartialHint ? (
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Partial matches filter the current page only. Enter all 10 digits to open a full lead profile.
            </p>
          ) : null}
        </label>
      </div>
    </section>
  );
}
