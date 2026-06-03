import { deriveSlotDemoDateKeyIST } from './weekendSlots';

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('en-IN', { dateStyle: 'short' })} ${d.toLocaleTimeString('en-IN', { timeStyle: 'short' })}`;
}

export function formatDemoDateDisplay(dateKey) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey))) return '—';
  const d = new Date(`${dateKey}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

/** Top 5 colleges from IIT section 1 — comma-separated for tables. */
export function formatTopColleges(value) {
  if (!Array.isArray(value) || value.length === 0) return '—';
  const cleaned = value.map((item) => String(item || '').trim()).filter(Boolean);
  return cleaned.length ? cleaned.join(', ') : '—';
}

export function getLeadClassStatus(row) {
  const raw = row?.classStatus ?? row?.section1Data?.classStatus;
  const t = String(raw ?? '').trim();
  return t || '—';
}

export function getLeadTopColleges(row) {
  if (typeof row?.topColleges === 'string' && row.topColleges.trim()) {
    return row.topColleges.trim();
  }
  return formatTopColleges(row?.section1Data?.top5Colleges ?? row?.top5Colleges);
}

export function mapCallingDataLeadRow(row) {
  const utm = row?.utm || {};
  const s1 = row?.section1Data || {};
  const s2 = row?.section2Data || {};
  const colleges = Array.isArray(s1.top5Colleges)
    ? s1.top5Colleges.map((c) => String(c || '').trim()).filter(Boolean).join(', ')
    : '—';
  const demoDateKey = deriveSlotDemoDateKeyIST(row);

  return {
    id: row?.id || '',
    name: row?.fullName || '—',
    phone: row?.phone || '—',
    preferredLanguage: s2.preferredLanguage || '—',
    classStatus: s1.classStatus || '—',
    currentStep: row?.currentStep ?? '—',
    completed: row?.isCompleted ? 'Yes' : 'No',
    slot: s1.slotBooking || '—',
    demoDate: formatDemoDateDisplay(demoDateKey),
    topColleges: colleges,
    utmSource: utm.utm_source || '—',
    utmMedium: utm.utm_medium || '—',
    utmCampaign: utm.utm_campaign || '—',
    utmContent: utm.utm_content || '—',
    assignedBda: row?.assignedBdaName || '—',
    assignedBdaId: row?.assignedBdaId || '',
    callStatus: row?.callStatus || 'not_called',
    leadStatus: row?.leadStatus || '',
    demoStatus: row?.demoStatus || 'not_scheduled',
    niatStatus: row?.niatStatus || 'not_registered',
    paymentStatus: row?.paymentStatus || 'none',
    lastRemark: row?.lastRemark || '—',
    createdAt: formatDateTime(row?.createdAt),
    updatedAt: formatDateTime(row?.updatedAt),
    raw: row,
  };
}
