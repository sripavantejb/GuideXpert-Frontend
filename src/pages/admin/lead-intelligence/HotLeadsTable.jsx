import { memo } from 'react';
import { FiInbox } from 'react-icons/fi';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import LeadStageBadge from './LeadStageBadge';
import {
  PANEL_CLASS,
  PANEL_HEADER_CLASS,
  SECTION_SUBTITLE_CLASS,
  SECTION_TITLE_CLASS,
} from './leadIntelligenceUtils';

const HotLeadRow = memo(function HotLeadRow({ row, onSelect }) {
  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-slate-50/80"
      onClick={() => onSelect?.(row.phone)}
    >
      <td className="px-4 py-3 font-medium tabular-nums text-slate-900">{row.phone || '—'}</td>
      <td className="px-4 py-3 tabular-nums font-semibold text-slate-800">{row.leadScore ?? '—'}</td>
      <td className="px-4 py-3">
        <LeadStageBadge stage={row.leadStage} />
      </td>
      <td className="px-4 py-3 text-slate-700">{row.branchInterest || '—'}</td>
      <td className="px-4 py-3 text-slate-700">{row.collegeInterest || '—'}</td>
      <td className="px-4 py-3 tabular-nums text-slate-700">{row.eventCount ?? 0}</td>
    </tr>
  );
});

export default function HotLeadsTable({ items, loading, error, onRetry, onSelectPhone }) {
  return (
    <section className={PANEL_CLASS}>
      <div className={PANEL_HEADER_CLASS}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className={SECTION_TITLE_CLASS}>Hot Leads</h2>
            <p className={SECTION_SUBTITLE_CLASS}>Top 50 leads ranked by score and engagement</p>
          </div>
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700 ring-1 ring-red-100">
            Priority
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-5">
          <TableSkeleton rows={5} cols={6} />
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
          <p className="text-sm font-medium text-slate-700">No hot leads yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Hot leads appear here once chatbot scoring identifies high-intent profiles.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50/90">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Phone</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Score</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stage</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Branch</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">College</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Events</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((row) => (
                <HotLeadRow key={row.phone} row={row} onSelect={onSelectPhone} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
