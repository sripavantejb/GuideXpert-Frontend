import { useMemo } from 'react';
import { FiInbox, FiX } from 'react-icons/fi';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import { useLeadDetails } from '../../../hooks/useLeadDetails';
import LeadStageBadge from './LeadStageBadge';
import {
  flattenRecentEvents,
  formatConfidence,
  formatLeadDate,
} from './leadIntelligenceUtils';
import LeadPredictionSection from './LeadPredictionSection';

function DetailField({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-primary-navy break-words">{value || '—'}</dd>
    </div>
  );
}

export default function LeadDetailDrawer({ phone, onClose }) {
  const { details, loading, error, retry } = useLeadDetails(phone);
  const profile = details?.profile || null;
  const score = details?.score || null;
  const eventRows = useMemo(
    () => flattenRecentEvents(details?.recentEvents || []),
    [details?.recentEvents]
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close lead details"
      />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue-600">
              Chatbot Lead Profile
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
              {details?.name || profile?.name || 'Lead Details'}
            </h2>
            <p className="mt-0.5 text-xs tabular-nums text-slate-500">{phone}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {loading ? (
            <TableSkeleton rows={6} cols={2} />
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={retry}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4">
                <h3 className="mb-3 text-sm font-semibold tracking-tight text-slate-900">Profile</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailField label="Name" value={details?.name || profile?.name} />
                  <DetailField label="Branch" value={profile?.branchInterest} />
                  <DetailField label="College" value={profile?.collegeInterest} />
                  <DetailField label="Exam" value={profile?.exam} />
                  <DetailField label="Language" value={profile?.languagePreference} />
                  <DetailField
                    label="Assistant Types Used"
                    value={
                      Array.isArray(profile?.assistantTypesUsed) && profile.assistantTypesUsed.length
                        ? profile.assistantTypesUsed.join(', ')
                        : '—'
                    }
                  />
                  <DetailField label="Event Count" value={profile?.eventCount ?? 0} />
                </dl>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4">
                <h3 className="mb-3 text-sm font-semibold tracking-tight text-slate-900">Score</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailField label="Lead Score" value={score?.leadScore ?? '—'} />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lead Stage</dt>
                    <dd className="mt-1">
                      <LeadStageBadge stage={score?.leadStage} />
                    </dd>
                  </div>
                  <DetailField label="Confidence" value={formatConfidence(score?.confidence)} />
                  <DetailField
                    label="Reasons"
                    value={
                      Array.isArray(score?.scoreReasons) && score.scoreReasons.length
                        ? score.scoreReasons.join(', ')
                        : '—'
                    }
                  />
                </dl>
              </section>

              <LeadPredictionSection phone={phone} />

              <section className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4">
                <h3 className="mb-3 text-sm font-semibold tracking-tight text-slate-900">Recent Events</h3>
                {eventRows.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-slate-500">
                    <FiInbox className="mx-auto mb-2 h-5 w-5" />
                    No events recorded for this lead.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">Type</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">Value</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">Confidence</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {eventRows.map((row, index) => (
                          <tr key={`${row.type}-${row.createdAt}-${index}`}>
                            <td className="px-3 py-2">{row.type}</td>
                            <td className="px-3 py-2">{row.value}</td>
                            <td className="px-3 py-2">{formatConfidence(row.confidence)}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatLeadDate(row.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
