export const PANEL_CLASS =
  'rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-100';

export const ALERT_LABELS = {
  human_requested: 'Human requested',
  low_confidence: 'Low confidence',
  hot_lead: 'Hot lead',
  reopened: 'Reopened',
};

export const ALERT_TONES = {
  human_requested: 'bg-violet-100 text-violet-800 border-violet-200',
  low_confidence: 'bg-amber-100 text-amber-900 border-amber-200',
  hot_lead: 'bg-red-100 text-red-800 border-red-200',
  reopened: 'bg-blue-100 text-blue-900 border-blue-200',
};

export const COPILOT_STATE_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  active: 'Active',
  resolved: 'Resolved',
  reopened: 'Reopened',
};

export const DELIVERY_STATUS_LABELS = {
  draft: 'Draft',
  sending: 'Sending…',
  sent: 'Sent',
  submitted: 'Submitted to WhatsApp',
  delivered: 'Delivered',
  read: 'Read',
  simulated: 'Simulated (not sent)',
  failed: 'Failed',
};

export const DELIVERY_STATUS_TONES = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  sending: 'bg-blue-100 text-blue-800 border-blue-200',
  sent: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  submitted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  delivered: 'bg-teal-100 text-teal-800 border-teal-200',
  read: 'bg-sky-100 text-sky-800 border-sky-200',
  simulated: 'bg-amber-100 text-amber-900 border-amber-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
};

export const MOBILE_INBOX_TABS = [
  { id: 'queue', label: 'Queue' },
  { id: 'chat', label: 'Chat' },
  { id: 'context', label: 'Context' },
];

export const SR_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'sr1', label: 'SR Counsellor 1' },
  { value: 'sr2', label: 'SR Counsellor 2' },
];

export const SR_SLOT_LABELS = {
  sr1: 'SR Counsellor 1',
  sr2: 'SR Counsellor 2',
};

export function getAlertLabel(reason) {
  return ALERT_LABELS[reason] || reason;
}

export function getCopilotStateLabel(state) {
  return COPILOT_STATE_LABELS[state] || state || '—';
}

export function getDeliveryStatusLabel(status) {
  return DELIVERY_STATUS_LABELS[status] || status || '—';
}

export function getDeliveryStatusTone(status) {
  return DELIVERY_STATUS_TONES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
}

export function mergeDetailPreserving(prev, incoming) {
  if (!prev || !incoming) return incoming || prev;
  return {
    ...incoming,
    handoff: {
      ...prev.handoff,
      ...incoming.handoff,
      internalNotes: incoming.handoff?.internalNotes ?? prev.handoff?.internalNotes,
    },
    auditTrail: incoming.auditTrail ?? prev.auditTrail,
    userProfile: incoming.userProfile ?? prev.userProfile,
    leadProfile: incoming.leadProfile ?? prev.leadProfile,
    recentEvents: incoming.recentEvents ?? prev.recentEvents,
    structuredSummary: incoming.structuredSummary ?? prev.structuredSummary,
  };
}

export function buildFailedReplyPatch(text, errorMessage = null) {
  return {
    id: `local-failed-${Date.now()}`,
    draftText: text,
    errorMessage: errorMessage || 'Send failed',
    status: 'failed',
  };
}

export function shouldShowRetryBar(handoff, deliveryStatus) {
  if (!handoff?.failedReply) return false;
  const status = normalizeDeliveryStatus(deliveryStatus || handoff.latestDeliveryStatus);
  return status === 'failed' || handoff.failedReply.status === 'failed';
}

export function normalizeDeliveryStatus(status) {
  if (status === 'sent') return 'submitted';
  return status || '';
}

export function getAlertTone(reason) {
  return ALERT_TONES[reason] || 'bg-slate-100 text-slate-700 border-slate-200';
}

export function formatSrSlot(slot, agentName = null) {
  if (agentName) return agentName;
  if (!slot) return 'Unassigned';
  return SR_SLOT_LABELS[slot] || slot;
}

export const AGENT_ROLE_LABELS = {
  sr_counsellor: 'SR Counsellor',
  iit_expert: 'IIT Expert',
  scholarship_expert: 'Scholarship Expert',
  general_counsellor: 'General Counsellor',
  admin: 'Admin',
};

export const AGENT_AVAILABILITY_LABELS = {
  active: 'Active',
  away: 'Away',
  offline: 'Offline',
};

export const ROUTING_MODE_LABELS = {
  manual: 'Manual assignment',
  round_robin: 'Round robin',
  least_workload: 'Least workload',
  specialty: 'Specialty routing',
};

export const ROUTING_MODE_OPTIONS = [
  { value: 'manual', label: 'Manual assignment' },
  { value: 'round_robin', label: 'Round robin' },
  { value: 'least_workload', label: 'Least workload' },
  { value: 'specialty', label: 'Specialty routing' },
];

export function getAgentRoleLabel(role) {
  return AGENT_ROLE_LABELS[role] || role || '—';
}

export function getAvailabilityLabel(status) {
  return AGENT_AVAILABILITY_LABELS[status] || status || '—';
}

export function getAvailabilityTone(status) {
  if (status === 'active') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (status === 'away') return 'bg-amber-100 text-amber-900 border-amber-200';
  if (status === 'offline') return 'bg-slate-100 text-slate-600 border-slate-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export function buildQueueFilterOptions(agents = []) {
  const options = [
    { value: 'all', label: 'All' },
    { value: 'unassigned', label: 'Unassigned' },
  ];
  for (const agent of agents) {
    options.push({
      value: `agent:${agent.id}`,
      label: agent.name || agent.username,
    });
  }
  if (!agents.length) {
    options.push(
      { value: 'sr1', label: 'SR Counsellor 1' },
      { value: 'sr2', label: 'SR Counsellor 2' }
    );
  }
  return options;
}

export function filterQueueBySr(items, srFilter) {
  if (!srFilter || srFilter === 'all') return items;
  if (srFilter === 'unassigned') {
    return items.filter((item) => !item.assignedSrCounsellor && !item.assignedAgentId);
  }
  if (srFilter.startsWith('agent:')) {
    const agentId = srFilter.slice(6);
    return items.filter((item) => item.assignedAgentId === agentId);
  }
  return items.filter((item) => item.assignedSrCounsellor === srFilter);
}

export function formatAssignee(item) {
  if (item?.assignedAgentName) return item.assignedAgentName;
  return formatSrSlot(item?.assignedSrCounsellor);
}

export function formatCopilotDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return String(value);
  }
}

export const MESSAGE_ROLES = Object.freeze({
  user: 'user',
  assistant: 'assistant',
  counsellor: 'counsellor',
  system: 'system',
});

export function getMessageRole(message) {
  if (!message || message.direction === 'in') return MESSAGE_ROLES.user;
  if (message.senderType === 'agent') return MESSAGE_ROLES.counsellor;
  if (message.senderType === 'system') return MESSAGE_ROLES.system;
  return MESSAGE_ROLES.assistant;
}

export function getMessageSenderLabel(message, handoff = null) {
  const role = getMessageRole(message);
  if (role === MESSAGE_ROLES.user) return 'User';
  if (role === MESSAGE_ROLES.system) return 'System';
  if (role === MESSAGE_ROLES.counsellor) {
    return message.senderName || handoff?.assignedAgentName || 'Counsellor';
  }
  return 'Assistant';
}

export function getMessageRowAlignment(message) {
  const role = getMessageRole(message);
  if (role === MESSAGE_ROLES.user) return 'justify-start';
  if (role === MESSAGE_ROLES.system) return 'justify-center';
  return 'justify-end';
}

export const MESSAGE_GROUP_WINDOW_MS = 2 * 60 * 1000;

export function isSameMessageGroup(current, other) {
  if (!current || !other) return false;
  if (getMessageRole(current) !== getMessageRole(other)) return false;
  const currentAt = new Date(current.at).getTime();
  const otherAt = new Date(other.at).getTime();
  if (!Number.isFinite(currentAt) || !Number.isFinite(otherAt)) return false;
  return Math.abs(currentAt - otherAt) <= MESSAGE_GROUP_WINDOW_MS;
}

export function shouldShowMessageMeta(message, prevMessage) {
  const role = getMessageRole(message);
  if (role === MESSAGE_ROLES.system) return true;
  if (role === MESSAGE_ROLES.counsellor) return !isSameMessageGroup(message, prevMessage);
  return false;
}

export function getMessageGroupSpacing(prevMessage, message) {
  if (!prevMessage) return '';
  return isSameMessageGroup(prevMessage, message) ? 'mt-1' : 'mt-4';
}

export function formatMessageTime(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return '';
  }
}

function getMessageDayKey(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  } catch {
    return '';
  }
}

export function shouldShowDateSeparator(message, prevMessage) {
  if (!message?.at) return false;
  if (!prevMessage?.at) return true;
  return getMessageDayKey(message.at) !== getMessageDayKey(prevMessage.at);
}

export function formatDateSeparatorLabel(value) {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const todayKey = getMessageDayKey(new Date().toISOString());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getMessageDayKey(yesterday.toISOString());
    const messageKey = getMessageDayKey(value);
    if (messageKey === todayKey) return 'Today';
    if (messageKey === yesterdayKey) return 'Yesterday';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return '';
  }
}

function getGroupedCornerClasses(role, samePrev, sameNext) {
  if (role === MESSAGE_ROLES.user) {
    const corners = ['rounded-2xl'];
    if (samePrev) corners.push('rounded-tl-md');
    else corners.push('rounded-tl-2xl');
    if (sameNext) corners.push('rounded-bl-md');
    else corners.push('rounded-bl-sm');
    return corners.join(' ');
  }
  if (role === MESSAGE_ROLES.system) {
    return 'rounded-xl';
  }
  const corners = ['rounded-2xl'];
  if (samePrev) corners.push('rounded-tr-md');
  else corners.push('rounded-tr-2xl');
  if (sameNext) corners.push('rounded-br-md');
  else corners.push('rounded-br-sm');
  return corners.join(' ');
}

export function getGroupedBubbleClasses(message, prevMessage = null, nextMessage = null) {
  const role = getMessageRole(message);
  const samePrev = isSameMessageGroup(message, prevMessage);
  const sameNext = isSameMessageGroup(message, nextMessage);
  const corners = getGroupedCornerClasses(role, samePrev, sameNext);
  const base =
    'max-w-[85%] px-3 py-1.5 text-sm leading-relaxed break-words shadow-sm';

  if (role === MESSAGE_ROLES.user) {
    return `${base} ${corners} bg-white text-slate-900 border border-slate-200/80`;
  }
  if (role === MESSAGE_ROLES.counsellor) {
    return `${base} ${corners} bg-emerald-600 text-white`;
  }
  if (role === MESSAGE_ROLES.system) {
    return `${base} max-w-[90%] ${corners} bg-slate-100 text-slate-600 text-xs border border-slate-200`;
  }
  return `${base} ${corners} bg-[#d9fdd3] text-slate-900`;
}

export function getMessageBubbleClasses(message, prevMessage = null, nextMessage = null) {
  return getGroupedBubbleClasses(message, prevMessage, nextMessage);
}

export function normalizeMessageKey(message, index = 0) {
  if (message?.id) return String(message.id);
  return `${message?.at || 'unknown'}-${index}`;
}

export function mergeTranscriptMessages(existing = [], incoming = []) {
  const map = new Map();
  for (const msg of existing) {
    map.set(normalizeMessageKey(msg), msg);
  }
  for (const msg of incoming) {
    map.set(normalizeMessageKey(msg), msg);
  }
  return [...map.values()].sort((a, b) => new Date(a.at) - new Date(b.at));
}

export function isScrollPinnedToBottom(element, threshold = 80) {
  if (!element) return true;
  return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
}

export function scrollElementToBottom(element, { smooth = false } = {}) {
  if (!element) return;
  if (typeof element.scrollTo === 'function') {
    element.scrollTo({ top: element.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    return;
  }
  element.scrollTop = element.scrollHeight;
}

export function truncateText(text, max = 80) {
  const s = String(text || '').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export const SUMMARY_FACT_LABELS = {
  state: 'State',
  language: 'Language',
  stream: 'Stream',
  rank: 'Rank',
  budget: 'Budget',
  parentInvolvement: 'Parent involvement',
  preferredColleges: 'Preferred colleges',
  previousBookings: 'Previous bookings',
};

export function formatSummaryFactValue(value) {
  const s = String(value || '').trim();
  return s || 'Not yet collected';
}

export function buildSummaryFactRows(importantFacts = {}) {
  return Object.entries(SUMMARY_FACT_LABELS).map(([key, label]) => ({
    key,
    label,
    value: formatSummaryFactValue(importantFacts[key]),
  }));
}

export function formatLeadQualityLine(leadQuality = {}) {
  const score = formatSummaryFactValue(leadQuality.score);
  const stage = formatSummaryFactValue(leadQuality.stage);
  const confidence = formatSummaryFactValue(leadQuality.confidence);
  if (score === 'Not yet collected') return 'Not yet collected';
  return `Score ${score} (${stage}), Confidence ${confidence}`;
}

export function formatDurationMs(ms) {
  const value = Number(ms);
  if (!Number.isFinite(value) || value <= 0) return '—';
  const totalMinutes = Math.round(value / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 24) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

export function formatPercentRate(rate) {
  const value = Number(rate);
  if (!Number.isFinite(value) || value <= 0) return '0%';
  return `${Math.round(value * 1000) / 10}%`;
}

export const EDIT_CLASSIFICATION_LABELS = {
  unchanged: 'Unchanged',
  minor_edit: 'Minor edit',
  moderate_edit: 'Moderate edit',
  major_rewrite: 'Major rewrite',
  manual: 'Manual',
};

export const EDIT_TOPIC_LABELS = {
  scholarship: 'Scholarship',
  fees: 'Fees',
  hostel: 'Hostel',
  placements: 'Placements',
  branch_selection: 'Branch selection',
  rank_guidance: 'Rank guidance',
  college_selection: 'College selection',
  general: 'General',
};

export function getEditClassificationLabel(key) {
  return EDIT_CLASSIFICATION_LABELS[key] || key || '—';
}

export function getEditTopicLabel(key) {
  return EDIT_TOPIC_LABELS[key] || key || 'General';
}

export const FOLLOWUP_PRIORITY_LABELS = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

export function getFollowupPriorityLabel(priority) {
  return FOLLOWUP_PRIORITY_LABELS[priority] || priority || '—';
}

export function formatFollowupDelay(days) {
  const value = Number(days);
  if (!Number.isFinite(value) || value <= 0) return 'Send now';
  if (value === 1) return '1 day';
  return `${value} days`;
}
