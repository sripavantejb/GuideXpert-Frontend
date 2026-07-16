import { FiTag } from 'react-icons/fi';
import {
  formatExtraInfo,
  formatRank,
  getBranchRankSummary,
  getOpeningClosing,
} from './reservationCategoryDisplay';

function RankMetric({ label, value, emphasize = false, placeholder = false }) {
  const formatted = formatRank(value);
  const display = formatted ?? (placeholder ? '—' : null);
  if (display == null) return null;

  return (
    <div
      className={`
        flex flex-col min-w-[5.75rem] sm:min-w-[6.5rem] rounded-xl px-3.5 py-3 border
        ${emphasize
          ? 'bg-emerald-50 border-emerald-200/80 shadow-sm'
          : 'bg-slate-50 border-slate-200/80'}
      `}
    >
      <span
        className={`text-[0.625rem] font-semibold uppercase tracking-wider ${
          emphasize ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        {label}
      </span>
      <span
        className={`mt-1 font-bold tabular-nums leading-none tracking-tight ${
          emphasize
            ? 'text-2xl sm:text-3xl text-emerald-900'
            : formatted
              ? 'text-lg sm:text-xl text-slate-800'
              : 'text-lg sm:text-xl text-slate-300'
        }`}
      >
        {display}
      </span>
    </div>
  );
}

function BranchRankPanel({ opening, closing, cutoff }) {
  const hasCutoff = cutoff != null && cutoff !== '';
  const hasOpening = opening != null && opening !== '';
  const hasClosing = closing != null && closing !== '';

  if (!hasOpening && !hasClosing && !hasCutoff) {
    return (
      <p className="text-sm text-slate-400 italic">Rank data not available for this branch</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Branch rank metrics">
      <RankMetric label="Opening Rank" value={opening} placeholder />
      <RankMetric label="Closing Rank" value={closing} placeholder />
      {hasCutoff && <RankMetric label="Cutoff Rank" value={cutoff} emphasize />}
    </div>
  );
}

function ReservationCategoryRow({ rc }) {
  const name = rc.category_name || rc.name || rc.reservation_category_code || rc.category_code;
  const { opening, closing } = getOpeningClosing(rc);
  const cutoff = rc.cutoff_rank ?? rc.cutoff ?? null;
  const extraParts = formatExtraInfo(rc.extra_info);
  const hasAnyRank = opening != null || closing != null || cutoff != null;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {name}
            </span>
            {(rc.reservation_category_code || rc.category_code) &&
              (rc.reservation_category_code || rc.category_code) !== name && (
                <span className="text-[0.6875rem] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                  {rc.reservation_category_code || rc.category_code}
                </span>
              )}
          </div>
          {extraParts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {extraParts.map((part, i) => (
                <span
                  key={`${part.label}-${part.value}-${i}`}
                  className="inline-flex items-center text-[0.6875rem] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md"
                >
                  {part.label ? `${part.label}: ${part.value}` : part.value}
                </span>
              ))}
            </div>
          )}
        </div>

        {hasAnyRank && (
          <div className="flex flex-wrap gap-2 shrink-0">
            {opening != null && <RankMetric label="Opening" value={opening} />}
            {closing != null && <RankMetric label="Closing" value={closing} />}
            {cutoff != null && <RankMetric label="Cutoff" value={cutoff} emphasize />}
          </div>
        )}
      </div>
    </div>
  );
}

function BranchRow({ branch }) {
  const summary = getBranchRankSummary(branch);
  const categories = Array.isArray(branch.reservation_categories)
    ? branch.reservation_categories
    : [];

  // Expand per-category rows only when ranks differ across categories.
  const showCategoryDetails =
    categories.length > 1 ||
    categories.some((rc) => {
      const { opening, closing } = getOpeningClosing(rc);
      const rcCutoff = rc.cutoff_rank ?? rc.cutoff ?? null;
      const cutoffDiffers =
        rcCutoff != null && summary.cutoff != null && Number(rcCutoff) !== Number(summary.cutoff);
      return opening != null || closing != null || cutoffDiffers;
    });

  const singleCategoryLabel =
    categories.length === 1
      ? categories[0].category_name ||
        categories[0].name ||
        categories[0].reservation_category_code ||
        categories[0].category_code
      : null;

  const inlineExtras = !showCategoryDetails
    ? categories.flatMap((rc) => formatExtraInfo(rc.extra_info))
    : [];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/40 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              {branch.branch_code && (
                <span className="text-xs font-bold tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                  {branch.branch_code}
                </span>
              )}
              <h5 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {branch.branch_name || branch.branch_code || 'Branch'}
              </h5>
            </div>

            <div className="flex flex-wrap gap-2">
              {branch.fee != null && (
                <span className="inline-flex items-center text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  {'\u20B9'} {Number(branch.fee).toLocaleString('en-IN')}
                </span>
              )}
              {singleCategoryLabel && !showCategoryDetails && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  <FiTag className="w-3 h-3 text-slate-400" />
                  {singleCategoryLabel}
                </span>
              )}
              {inlineExtras.map((part, i) => (
                <span
                  key={`${part.label}-${part.value}-${i}`}
                  className="inline-flex items-center text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                >
                  {part.label ? `${part.label}: ${part.value}` : part.value}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:max-w-md lg:shrink-0">
            <BranchRankPanel
              opening={summary.opening}
              closing={summary.closing}
              cutoff={summary.cutoff}
            />
          </div>
        </div>

        {showCategoryDetails && categories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-2">
            <div className="flex items-center gap-1.5 mb-2">
              <FiTag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[0.6875rem] font-semibold text-slate-500 uppercase tracking-wider">
                By reservation category
              </span>
            </div>
            <div className="space-y-2">
              {categories.map((rc, rcIdx) => (
                <ReservationCategoryRow
                  key={`${rc.reservation_category_code || rc.category_code || rc.category_name || rc.name}-${rcIdx}`}
                  rc={rc}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BranchSection({ branches }) {
  if (!branches || branches.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic py-2">No branch data available</p>
    );
  }

  return (
    <div className="space-y-3">
      {branches.map((branch, idx) => (
        <BranchRow key={`${branch.branch_code}-${idx}`} branch={branch} />
      ))}
    </div>
  );
}
