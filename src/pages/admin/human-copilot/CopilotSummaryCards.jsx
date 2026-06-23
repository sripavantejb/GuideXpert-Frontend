import LeadStageBadge from '../lead-intelligence/LeadStageBadge';
import {
  buildSummaryFactRows,
  formatLeadQualityLine,
  formatSummaryFactValue,
} from './copilotUtils';

function BriefingRow({ label, children, highlight }) {
  return (
    <div className={highlight ? 'rounded-md bg-emerald-50/80 px-2.5 py-1.5' : ''}>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-0.5 text-xs leading-snug ${highlight ? 'font-medium text-emerald-900' : 'text-slate-800'}`}>
        {children}
      </dd>
    </div>
  );
}

export default function CopilotSummaryCards({ structuredSummary, loading }) {
  if (loading) {
    return <p className="text-xs text-slate-500">Loading briefing…</p>;
  }

  if (!structuredSummary) {
    return null;
  }

  const factRows = buildSummaryFactRows(structuredSummary.importantFacts);

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-blue-600">
          Counsellor briefing
        </p>
        {structuredSummary.source ? (
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 capitalize">
            {structuredSummary.source}
          </span>
        ) : null}
      </div>

      <dl className="space-y-2.5">
        <BriefingRow label="Goal">{formatSummaryFactValue(structuredSummary.studentGoal)}</BriefingRow>
        <BriefingRow label="Concern">
          {formatSummaryFactValue(structuredSummary.currentConcern)}
        </BriefingRow>

        {factRows.length > 0 ? (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Facts</dt>
            <dd className="mt-1 space-y-0.5 text-xs leading-snug text-slate-700">
              {factRows.map((row) => (
                <p key={row.key}>
                  <span className="font-medium text-slate-800">{row.label}:</span> {row.value}
                </p>
              ))}
            </dd>
          </div>
        ) : null}

        <BriefingRow label="Lead quality">
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span>{formatLeadQualityLine(structuredSummary.leadQuality)}</span>
            {structuredSummary.leadQuality?.stage ? (
              <LeadStageBadge stage={structuredSummary.leadQuality.stage} />
            ) : null}
          </span>
        </BriefingRow>

        <BriefingRow label="Previous interactions">
          {formatSummaryFactValue(structuredSummary.previousInteractions)}
        </BriefingRow>

        <BriefingRow label="Recommended action" highlight>
          {formatSummaryFactValue(structuredSummary.recommendedNextAction)}
        </BriefingRow>
      </dl>
    </div>
  );
}
