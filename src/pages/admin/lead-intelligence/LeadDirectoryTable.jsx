import { memo } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiInbox,
  FiMessageSquare,
} from 'react-icons/fi';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import LeadProfileSummary from './LeadProfileSummary';
import LeadStageBadge from './LeadStageBadge';
import {
  formatLeadShortDate,
  formatNoReplyDuration,
  formatPhoneDisplay,
  LI,
  PANEL_CLASS,
  PANEL_HEADER_CLASS,
} from './leadIntelligenceUtils';

function DetailChip({ children }) {
  return (
    <span className="inline-flex max-w-full truncate rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-2 py-0.5 text-[12px] font-medium text-[#374151]">
      {children}
    </span>
  );
}

function MainDetails({ row }) {
  const facts = [
    row.branchInterest ? `Branch: ${row.branchInterest}` : null,
    row.collegeInterest ? `College: ${row.collegeInterest}` : null,
  ].filter(Boolean);

  const hasTags = Boolean(
    row.exam ||
      row.handoffRequested ||
      row.demoInterested ||
      row.priceSensitive ||
      row.languagePreference
  );

  if (!facts.length && !hasTags) {
    return <span className={`text-[13px] ${LI.muted}`}>No chatbot details yet</span>;
  }

  return (
    <div className="space-y-1.5">
      {facts.length ? (
        <div className="flex flex-wrap gap-1.5">
          {facts.map((fact) => (
            <DetailChip key={fact}>{fact}</DetailChip>
          ))}
        </div>
      ) : null}
      {hasTags ? <LeadProfileSummary row={row} /> : null}
    </div>
  );
}

const LeadDirectoryRow = memo(function LeadDirectoryRow({ row, selected, onSelect }) {
  return (
    <tr
      className={`cursor-pointer transition-colors duration-150 ${
        selected ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'
      }`}
      onClick={() => onSelect?.(row.phone)}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[13px] font-semibold text-white">
            {(row.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className={`truncate text-[14px] font-semibold ${LI.text}`}>
              {row.name || 'Unknown'}
            </p>
            <p className={`mt-0.5 text-[12px] tabular-nums ${LI.muted}`}>
              Score {row.leadScore ?? '—'}
            </p>
          </div>
        </div>
      </td>
      <td className={`px-4 py-3.5 text-[14px] font-medium tabular-nums ${LI.text}`}>
        {formatPhoneDisplay(row.phone)}
      </td>
      <td className="px-4 py-3.5 min-w-[14rem]">
        <MainDetails row={row} />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <LeadStageBadge stage={row.leadStage} />
          {row.awaitingReply ? (
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 text-[12px] font-medium text-amber-700">
              <FiClock className="h-3 w-3" />
              {formatNoReplyDuration(row.noReplyMs)}
            </span>
          ) : null}
        </div>
      </td>
      <td className={`px-4 py-3.5 text-[13px] tabular-nums ${LI.muted}`}>
        {formatLeadShortDate(row.lastInboundAt || row.lastInteractionAt)}
      </td>
      <td className="px-4 py-3.5 text-right">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.(row.phone);
          }}
          className={`inline-flex items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[12px] font-semibold ${LI.text} transition-colors hover:border-[#2563EB] hover:text-[#2563EB]`}
        >
          <FiMessageSquare className="h-3.5 w-3.5" />
          View chat
        </button>
      </td>
    </tr>
  );
});

export default function LeadDirectoryTable({
  items,
  total,
  page,
  limit,
  loading,
  error,
  selectedPhone,
  hasActiveFilters,
  onRetry,
  onSelectPhone,
  onPageChange,
  onClearFilters,
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

  return (
    <section className={`${PANEL_CLASS} mb-4`}>
      <div className={`${PANEL_HEADER_CLASS} flex flex-wrap items-center justify-between gap-3`}>
        <div className="min-w-0">
          <h2 className={`text-[15px] font-semibold ${LI.text}`}>All leads</h2>
          <p className={`mt-0.5 text-[13px] ${LI.muted}`}>
            Name, number, and chatbot-captured details for the current filter set
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[13px] tabular-nums ${LI.muted}`}>
            {total.toLocaleString()} total
          </span>
          <div className="flex h-8 items-center gap-0.5 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-1 text-[12px] text-[#6B7280]">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="rounded-md p-1.5 transition-all duration-200 hover:bg-white disabled:opacity-40"
              aria-label="Previous page"
            >
              <FiChevronLeft />
            </button>
            <span className="min-w-[3.25rem] text-center tabular-nums">
              {page}/{totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              className="rounded-md p-1.5 transition-all duration-200 hover:bg-white disabled:opacity-40"
              aria-label="Next page"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-5">
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-between gap-3 p-5 text-[14px] text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className={`${LI.input} px-3 py-1.5 text-[13px] font-semibold text-red-800`}
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F8FAFC] text-[#6B7280]">
            <FiInbox className="h-5 w-5" />
          </div>
          <p className={`text-[15px] font-semibold ${LI.text}`}>No leads to show</p>
          <p className={`mt-1 text-[13px] ${LI.muted}`}>
            {hasActiveFilters
              ? 'Try clearing filters or search by phone above.'
              : 'Leads appear after WhatsApp bot conversations.'}
          </p>
          {hasActiveFilters && onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className={`${LI.input} mt-3 px-3 py-1.5 text-[13px] font-medium`}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className={`overflow-x-auto ${LI.scrollbar}`}>
          <table className="min-w-full text-left">
            <thead className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
              <tr>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  Name
                </th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  Number
                </th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  Main details
                </th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  Status
                </th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  Last active
                </th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {items.map((row) => (
                <LeadDirectoryRow
                  key={row.phone}
                  row={row}
                  selected={selectedPhone === row.phone}
                  onSelect={onSelectPhone}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
