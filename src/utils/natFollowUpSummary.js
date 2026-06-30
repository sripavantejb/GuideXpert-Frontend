import {
  NAT_CAMPAIGN_OPTIONS,
  NAT_CBA_NAME_OPTIONS,
  NAT_CHANNEL_OPTIONS,
  NAT_COUNSELLOR_BY_OPTIONS,
  NAT_LANGUAGE_OPTIONS,
  NAT_SESSION_STAGE_OPTIONS,
} from '../constants/natFollowUp';

function buildNatFieldBreakdown(students, fieldKey, options) {
  const labels = [...options, 'Not set'];
  return labels.map((label) => {
    const matched = students.filter((student) => {
      const value = (student[fieldKey] || '').trim();
      if (label === 'Not set') return !value;
      return value === label;
    });
    return {
      label,
      count: matched.length,
      names: matched.map((student) => student.studentName).filter(Boolean),
    };
  });
}

export function mapBookingToNatStudent(booking) {
  return {
    studentName: booking.studentName || '',
    natChannel: booking.natChannel || '',
    natCampaign: booking.natCampaign || '',
    natLanguage: booking.natLanguage || '',
    natCounsellorBy: booking.natCounsellorBy || '',
    natCbaName: booking.natCbaName || '',
    natBeforeSessionStage: booking.natBeforeSessionStage || '',
    natPresentStage: booking.natPresentStage || '',
  };
}

export function buildNatSummaryFromStudents(students) {
  const sorted = [...students].sort((a, b) => a.studentName.localeCompare(b.studentName));
  return {
    totalConfirmed: sorted.length,
    students: sorted,
    byChannel: buildNatFieldBreakdown(sorted, 'natChannel', NAT_CHANNEL_OPTIONS),
    byCampaign: buildNatFieldBreakdown(sorted, 'natCampaign', NAT_CAMPAIGN_OPTIONS),
    byLanguage: buildNatFieldBreakdown(sorted, 'natLanguage', NAT_LANGUAGE_OPTIONS),
    byCounsellorBy: buildNatFieldBreakdown(sorted, 'natCounsellorBy', NAT_COUNSELLOR_BY_OPTIONS),
    byCbaName: buildNatFieldBreakdown(sorted, 'natCbaName', NAT_CBA_NAME_OPTIONS),
    byBeforeSessionStage: buildNatFieldBreakdown(
      sorted,
      'natBeforeSessionStage',
      NAT_SESSION_STAGE_OPTIONS
    ),
    byPresentStage: buildNatFieldBreakdown(sorted, 'natPresentStage', NAT_SESSION_STAGE_OPTIONS),
  };
}

export function buildNatSummaryFromBookings(bookings) {
  return buildNatSummaryFromStudents((bookings || []).map(mapBookingToNatStudent));
}
