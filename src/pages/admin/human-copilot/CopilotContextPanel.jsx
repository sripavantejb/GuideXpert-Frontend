import CopilotSummaryCards from './CopilotSummaryCards';
import { PANEL_CLASS } from './copilotUtils';

function DetailField({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-xs text-slate-800 break-words">{value || '—'}</dd>
    </div>
  );
}

export default function CopilotContextPanel({
  userProfile,
  leadProfile,
  recentEvents,
  structuredSummary,
  loading,
}) {
  return (
    <section className={`${PANEL_CLASS} flex h-full min-h-0 flex-col overflow-hidden`}>
      <div className="border-b border-slate-200/80 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Lead context</h2>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading context…</p>
        ) : (
          <>
            <CopilotSummaryCards structuredSummary={structuredSummary} loading={loading} />

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
              <h3 className="text-xs font-semibold text-slate-900">User profile</h3>
              <dl className="mt-2 grid grid-cols-2 gap-3">
                <DetailField label="Name" value={userProfile?.name} />
                <DetailField label="Phone" value={userProfile?.phone} />
                <DetailField label="Product" value={userProfile?.productLine} />
                <DetailField label="Branch" value={leadProfile?.branchInterest} />
                <DetailField label="Exam" value={leadProfile?.exam} />
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
              <h3 className="text-xs font-semibold text-slate-900">Recent events</h3>
              {!(recentEvents || []).length ? (
                <p className="mt-2 text-xs text-slate-500">No events recorded.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {recentEvents.slice(0, 8).map((ev, idx) => (
                    <li
                      key={`${ev.type}-${idx}`}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    >
                      <span className="font-medium text-slate-800">{ev.type}</span>
                      {ev.value ? <span className="text-slate-600"> · {ev.value}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
