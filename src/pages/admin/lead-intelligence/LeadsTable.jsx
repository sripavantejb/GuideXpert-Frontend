import { memo } from 'react';
import { FiChevronLeft, FiChevronRight, FiInbox } from 'react-icons/fi';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import LeadProfileSummary from './LeadProfileSummary';
import LeadStageBadge from './LeadStageBadge';
import {
  formatLeadDate,
  PANEL_CLASS,
  PANEL_HEADER_CLASS,
  SECTION_SUBTITLE_CLASS,
  SECTION_TITLE_CLASS,
} from './leadIntelligenceUtils';

const LeadRow = memo(function LeadRow({ row, onSelect }) {
  return (
    <tr className="transition-colors hover:bg-slate-50/80">
      <td className="px-4 py-3 font-medium tabular-nums text-slate-900">{row.phone || '—'}</td>
      <td className="px-4 py-3 font-medium text-slate-900">{row.name || '—'}</td>
      <td className="px-4 py-3 min-w-[10rem]">
        <LeadProfileSummary row={row} />
      </td>
      <td className="px-4 py-3 tabular-nums font-semibold text-slate-800">{row.leadScore ?? '—'}</td>
      <td className="px-4 py-3">
        <LeadStageBadge stage={row.leadStage} />
      </td>
      <td className="px-4 py-3 text-slate-700">{row.branchInterest || '—'}</td>
      <td className="px-4 py-3 text-slate-700">{row.collegeInterest || '—'}</td>
      <td className="px-4 py-3 tabular-nums text-slate-700">{row.eventCount ?? 0}</td>
      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatLeadDate(row.lastInteractionAt)}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onSelect(row.phone)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-primary-blue-200 hover:bg-primary-blue-50 hover:text-primary-navy"
        >
          View profile
        </button>
      </td>
    </tr>
  );
});

export default function LeadsTable({
  items,
  total,
  page,
  limit,
  loading,
  error,
  onRetry,
  onSelectPhone,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

  return (
    <section className={PANEL_CLASS}>
      <div className={`${PANEL_HEADER_CLASS} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <h2 className={SECTION_TITLE_CLASS}>Lead Directory</h2>
          <p className={SECTION_SUBTITLE_CLASS}>
            {total.toLocaleString()} leads matched the current filters
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-1 text-sm text-slate-600">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg p-1.5 transition hover:bg-white disabled:opacity-40"
            aria-label="Previous page"
          >
            <FiChevronLeft />
          </button>
          <span className="min-w-[7rem] text-center text-xs font-medium tabular-nums">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg p-1.5 transition hover:bg-white disabled:opacity-40"
            aria-label="Next page"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-5">
          <TableSkeleton rows={8} cols={10} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-between gap-3 p-5 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FiInbox className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700">No leads found</p>
          <p className="mt-1 text-xs text-slate-500">
            Adjust filters or wait for chatbot extraction to populate lead profiles.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50/90">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Phone</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Name</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Profile</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Lead Score</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stage</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Branch Interest</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">College Interest</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Events</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Last Interaction</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((row) => (
                <LeadRow key={row.phone} row={row} onSelect={onSelectPhone} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
