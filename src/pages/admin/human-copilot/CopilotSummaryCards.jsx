import LeadStageBadge from '../lead-intelligence/LeadStageBadge';
import {
  buildSummaryFactRows,
  formatLeadQualityLine,
  formatSummaryFactValue,
  PANEL_CLASS,
} from './copilotUtils';

function SummaryCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-primary-blue-600">
        {title}
      </h3>
      <div className="mt-1.5 text-xs leading-relaxed text-slate-800">{children}</div>
    </div>
  );
}

export default function CopilotSummaryCards({ structuredSummary, loading }) {
  if (loading) {
    return (
      <div className={`${PANEL_CLASS} p-4 text-sm text-slate-500`}>Loading briefing…</div>
    );
  }

  if (!structuredSummary) {
    return (
      <div className={`${PANEL_CLASS} p-4 text-xs text-slate-500`}>
        Briefing summary will appear when conversation detail loads.
      </div>
    );
  }

  const factRows = buildSummaryFactRows(structuredSummary.importantFacts);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Counsellor briefing
        </p>
        {structuredSummary.source ? (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 capitalize">
            {structuredSummary.source}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SummaryCard title="Goal">
          {formatSummaryFactValue(structuredSummary.studentGoal)}
        </SummaryCard>
        <SummaryCard title="Concern">
          {formatSummaryFactValue(structuredSummary.currentConcern)}
        </SummaryCard>
      </div>

      <SummaryCard title="Facts">
        <ul className="space-y-1">
          {factRows.map((row) => (
            <li key={row.key}>
              <span className="font-medium text-slate-700">{row.label}:</span>{' '}
              <span className="text-slate-600">{row.value}</span>
            </li>
          ))}
        </ul>
      </SummaryCard>

      <SummaryCard title="Lead quality">
        <div className="flex flex-wrap items-center gap-2">
          <span>{formatLeadQualityLine(structuredSummary.leadQuality)}</span>
          {structuredSummary.leadQuality?.stage ? (
            <LeadStageBadge stage={structuredSummary.leadQuality.stage} />
          ) : null}
        </div>
      </SummaryCard>

      <SummaryCard title="Previous interactions">
        {formatSummaryFactValue(structuredSummary.previousInteractions)}
      </SummaryCard>

      <SummaryCard title="Recommended action">
        <span className="font-medium text-emerald-900">
          {formatSummaryFactValue(structuredSummary.recommendedNextAction)}
        </span>
      </SummaryCard>
    </div>
  );
}
