import {
  CALL_STATUS_OPTIONS,
  DEMO_STATUS_OPTIONS,
  LEAD_STATUS_OPTIONS,
  NIAT_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  labelForOption,
} from '../../../constants/callingTeamCrm';

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('en-IN', { dateStyle: 'short' })} ${d.toLocaleTimeString('en-IN', { timeStyle: 'short' })}`;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { dateStyle: 'short' });
}

export default function BdaAssignedLeadsTable({ leads, compact = false, showAssignMeta = true }) {
  if (!leads?.length) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">No assigned leads for this profile</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${compact ? '' : 'min-w-[900px]'}`}>
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-3 py-2">Student</th>
            <th className="px-3 py-2">Phone</th>
            {showAssignMeta && <th className="px-3 py-2">Assigned at</th>}
            <th className="px-3 py-2">Call</th>
            <th className="px-3 py-2">Lead</th>
            <th className="px-3 py-2">Demo</th>
            <th className="px-3 py-2">NIAT</th>
            <th className="px-3 py-2">Payment</th>
            <th className="px-3 py-2">Callback</th>
            <th className="px-3 py-2">Last remark</th>
            <th className="px-3 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-t border-gray-100 hover:bg-gray-50/80">
              <td className="px-3 py-2 font-medium">{lead.fullName}</td>
              <td className="px-3 py-2">{lead.phone}</td>
              {showAssignMeta && (
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                  {formatDateTime(lead.assignedAt)}
                </td>
              )}
              <td className="px-3 py-2">{labelForOption(CALL_STATUS_OPTIONS, lead.callStatus)}</td>
              <td className="px-3 py-2">{labelForOption(LEAD_STATUS_OPTIONS, lead.leadStatus)}</td>
              <td className="px-3 py-2">{labelForOption(DEMO_STATUS_OPTIONS, lead.demoStatus)}</td>
              <td className="px-3 py-2">{labelForOption(NIAT_STATUS_OPTIONS, lead.niatStatus)}</td>
              <td className="px-3 py-2">{labelForOption(PAYMENT_STATUS_OPTIONS, lead.paymentStatus)}</td>
              <td className="px-3 py-2">{formatDate(lead.callbackDate)}</td>
              <td className="px-3 py-2 max-w-[160px] truncate" title={lead.lastRemark || ''}>
                {lead.lastRemark || '—'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(lead.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BdaProfileSummary({ profile, metrics }) {
  if (!profile) return null;
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
      <span>
        <span className="text-gray-500">Phone:</span> {profile.phone || '—'}
      </span>
      <span>
        <span className="text-gray-500">Email:</span> {profile.email || '—'}
      </span>
      <span>
        <span className="text-gray-500">Status:</span>{' '}
        <span className={profile.status === 'active' ? 'text-green-700 font-medium' : 'text-gray-700'}>
          {profile.status}
        </span>
      </span>
      {metrics && (
        <>
          <span>
            <span className="text-gray-500">Assigned:</span> {metrics.totalAssigned ?? 0}
          </span>
          <span>
            <span className="text-gray-500">Connected:</span> {metrics.callsConnected ?? 0}
          </span>
          <span>
            <span className="text-gray-500">Conversion:</span> {metrics.conversionPct ?? 0}%
          </span>
        </>
      )}
    </div>
  );
}
