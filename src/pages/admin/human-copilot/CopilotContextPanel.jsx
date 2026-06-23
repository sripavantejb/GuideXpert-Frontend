import CopilotSummaryCards from './CopilotSummaryCards';
import { CopilotRailSection, ProfileGrid, RailEmptyState } from './CopilotRailSection';

export default function CopilotContextPanel({
  userProfile,
  leadProfile,
  recentEvents,
  structuredSummary,
  loading,
}) {
  const events = recentEvents || [];

  return (
    <CopilotRailSection title="Lead context">
      {loading ? (
        <p className="text-xs text-slate-500">Loading context…</p>
      ) : (
        <div className="space-y-4">
          {structuredSummary ? (
            <CopilotSummaryCards structuredSummary={structuredSummary} loading={false} />
          ) : null}

          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              User profile
            </h3>
            <ProfileGrid
              rows={[
                { label: 'Name', value: userProfile?.name },
                { label: 'Phone', value: userProfile?.phone },
                { label: 'Product', value: userProfile?.productLine },
                { label: 'Branch', value: leadProfile?.branchInterest },
                { label: 'Exam', value: leadProfile?.exam, fullWidth: true },
              ]}
            />
          </div>

          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Recent events
            </h3>
            {!events.length ? (
              <RailEmptyState>No events recorded.</RailEmptyState>
            ) : (
              <ul className="space-y-1.5">
                {events.slice(0, 8).map((ev, idx) => (
                  <li
                    key={`${ev.type}-${idx}`}
                    className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue-400" />
                    <span className="min-w-0 leading-snug">
                      <span className="font-medium text-slate-800">{ev.type}</span>
                      {ev.value ? <span className="text-slate-600"> · {ev.value}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </CopilotRailSection>
  );
}
