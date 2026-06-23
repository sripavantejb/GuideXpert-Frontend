import { getApiBaseUrl } from './apiBaseUrl';
import { getStoredToken } from './adminApi';
import { notifyAdminUnauthorized } from './authSession';

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function copilotRequest(path, options = {}, token = getStoredToken()) {
  const url = `${getApiBaseUrl()}/admin/human-copilot${path}`;
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    return { success: false, message: err?.message || 'Network error', status: 0, data: {} };
  }

  const body = await parseJsonSafe(res);
  if (!res.ok) {
    if (res.status === 401) notifyAdminUnauthorized({ endpoint: path, status: 401 });
    return {
      success: false,
      message: body.message || 'Request failed',
      status: res.status,
      data: body,
      ...body,
    };
  }

  return { success: true, status: res.status, data: body };
}

export async function fetchCopilotConfig() {
  const result = await copilotRequest('/config');
  if (!result.success) return result;
  return { success: true, config: result.data.config || result.data };
}

export async function fetchCopilotQueue({ srCounsellor, status, limit } = {}) {
  const params = new URLSearchParams();
  if (srCounsellor) params.set('srCounsellor', srCounsellor);
  if (status) params.set('status', status);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString();
  const result = await copilotRequest(`/queue${qs ? `?${qs}` : ''}`);
  if (!result.success) return result;
  return { success: true, items: result.data.items || [] };
}

export async function fetchCopilotNotifications() {
  const result = await copilotRequest('/notifications');
  if (!result.success) return result;
  return {
    success: true,
    items: result.data.items || [],
    count: result.data.count ?? (result.data.items || []).length,
  };
}

export async function fetchCopilotMetrics(sinceDays) {
  const qs = sinceDays ? `?sinceDays=${encodeURIComponent(sinceDays)}` : '';
  const result = await copilotRequest(`/metrics${qs}`);
  if (!result.success) return result;
  return { success: true, metrics: result.data.metrics };
}

function analyticsQuery(sinceDays) {
  return sinceDays ? `?sinceDays=${encodeURIComponent(sinceDays)}` : '';
}

async function fetchAnalyticsEndpoint(path, sinceDays) {
  const result = await copilotRequest(`${path}${analyticsQuery(sinceDays)}`);
  if (!result.success) return result;
  return {
    success: true,
    meta: result.data.meta || {},
    data: result.data.data || {},
  };
}

export async function fetchCopilotAnalyticsOverview(sinceDays) {
  return fetchAnalyticsEndpoint('/analytics/overview', sinceDays);
}

export async function fetchCopilotAnalyticsWorkloads(sinceDays) {
  return fetchAnalyticsEndpoint('/analytics/workloads', sinceDays);
}

export async function fetchCopilotAnalyticsAiUsage(sinceDays) {
  return fetchAnalyticsEndpoint('/analytics/ai-usage', sinceDays);
}

export async function fetchCopilotAnalyticsEscalations(sinceDays) {
  return fetchAnalyticsEndpoint('/analytics/escalations', sinceDays);
}

export async function fetchCopilotAnalyticsDelivery(sinceDays) {
  return fetchAnalyticsEndpoint('/analytics/delivery', sinceDays);
}

export async function fetchCopilotAnalyticsLeadQuality(sinceDays) {
  return fetchAnalyticsEndpoint('/analytics/lead-quality', sinceDays);
}

export async function fetchAllCopilotAnalytics(sinceDays) {
  const [overview, workloads, aiUsage, escalations, delivery, leadQuality] = await Promise.all([
    fetchCopilotAnalyticsOverview(sinceDays),
    fetchCopilotAnalyticsWorkloads(sinceDays),
    fetchCopilotAnalyticsAiUsage(sinceDays),
    fetchCopilotAnalyticsEscalations(sinceDays),
    fetchCopilotAnalyticsDelivery(sinceDays),
    fetchCopilotAnalyticsLeadQuality(sinceDays),
  ]);
  const failed = [overview, workloads, aiUsage, escalations, delivery, leadQuality].find(
    (r) => !r.success
  );
  if (failed) return failed;
  return {
    success: true,
    overview: overview.data,
    workloads: workloads.data,
    aiUsage: aiUsage.data,
    escalations: escalations.data,
    delivery: delivery.data,
    leadQuality: leadQuality.data,
    meta: overview.meta,
  };
}

async function fetchLearningEndpoint(path, sinceDays, limit) {
  const params = new URLSearchParams();
  if (sinceDays) params.set('sinceDays', String(sinceDays));
  if (limit) params.set('limit', String(limit));
  const qs = params.toString();
  const result = await copilotRequest(`${path}${qs ? `?${qs}` : ''}`);
  if (!result.success) return result;
  return {
    success: true,
    meta: result.data.meta || {},
    data: result.data.data || {},
  };
}

export async function fetchCopilotLearningOverview(sinceDays) {
  return fetchLearningEndpoint('/learning/overview', sinceDays);
}

export async function fetchCopilotLearningEditPatterns(sinceDays) {
  return fetchLearningEndpoint('/learning/edit-patterns', sinceDays);
}

export async function fetchCopilotLearningTopics(sinceDays) {
  return fetchLearningEndpoint('/learning/topics', sinceDays);
}

export async function fetchCopilotLearningExamples(sinceDays, limit = 20) {
  return fetchLearningEndpoint('/learning/examples', sinceDays, limit);
}

export async function fetchAllCopilotLearning(sinceDays) {
  const [overview, editPatterns, topics, examples] = await Promise.all([
    fetchCopilotLearningOverview(sinceDays),
    fetchCopilotLearningEditPatterns(sinceDays),
    fetchCopilotLearningTopics(sinceDays),
    fetchCopilotLearningExamples(sinceDays, 20),
  ]);
  const failed = [overview, editPatterns, topics, examples].find((r) => !r.success);
  if (failed) return failed;
  return {
    success: true,
    overview: overview.data,
    editPatterns: editPatterns.data,
    topics: topics.data,
    examples: examples.data,
    meta: overview.meta,
  };
}

export async function fetchRecommendedFollowups(sinceDays = 3) {
  const params = new URLSearchParams();
  if (sinceDays) params.set('sinceDays', String(sinceDays));
  const qs = params.toString();
  const result = await copilotRequest(`/followups/recommended${qs ? `?${qs}` : ''}`);
  if (!result.success) return result;
  return {
    success: true,
    meta: result.data.meta || {},
    data: result.data.data || {},
  };
}

export async function fetchFollowupForHandoff(handoffId, sinceDays = 3) {
  const params = new URLSearchParams();
  if (sinceDays) params.set('sinceDays', String(sinceDays));
  const qs = params.toString();
  const result = await copilotRequest(`/followups/${handoffId}${qs ? `?${qs}` : ''}`);
  if (!result.success) return result;
  return {
    success: true,
    meta: result.data.meta || {},
    data: result.data.data || {},
  };
}

export async function sendFollowupMessage(handoffId, { followupId, message, lockVersion } = {}) {
  const result = await copilotRequest(`/followups/${handoffId}/send`, {
    method: 'POST',
    body: JSON.stringify({ followupId, message, lockVersion }),
  });
  if (!result.success) return result;
  return {
    success: true,
    deliveryStatus: result.data.deliveryStatus,
    replyId: result.data.replyId,
    lockVersion: result.data.lockVersion,
  };
}

export async function skipFollowupSuggestion(handoffId, followupId) {
  const result = await copilotRequest(`/followups/${handoffId}/skip`, {
    method: 'POST',
    body: JSON.stringify({ followupId }),
  });
  if (!result.success) return result;
  return { success: true, skippedAt: result.data.skippedAt };
}

export async function fetchHandoffDetail(handoffId) {
  const result = await copilotRequest(`/handoffs/${handoffId}`);
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchHandoffMessages(handoffId, { limit, before, beforeId, after, afterId } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (before) params.set('before', before);
  if (beforeId) params.set('beforeId', beforeId);
  if (after) params.set('after', after);
  if (afterId) params.set('afterId', afterId);
  const qs = params.toString();
  const result = await copilotRequest(`/handoffs/${handoffId}/messages${qs ? `?${qs}` : ''}`);
  if (!result.success) return result;
  const payload = result.data.data || result.data;
  return {
    success: true,
    messages: payload.messages || [],
    hasMoreOlder: Boolean(payload.hasMoreOlder),
    hasMoreNewer: Boolean(payload.hasMoreNewer),
    oldestCursor: payload.oldestCursor || null,
    newestCursor: payload.newestCursor || null,
  };
}

export async function assignHandoff(handoffId, target, { lockVersion, force } = {}) {
  const body =
    typeof target === 'string'
      ? { srCounsellor: target, lockVersion, force }
      : { ...target, lockVersion, force };
  const result = await copilotRequest(`/handoffs/${handoffId}/assign`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!result.success) return result;
  return {
    success: true,
    handoff: result.data.handoff,
    lockVersion: result.data.lockVersion,
  };
}

export async function addHandoffNote(handoffId, text) {
  const result = await copilotRequest(`/handoffs/${handoffId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  if (!result.success) return result;
  return { success: true, internalNotes: result.data.internalNotes || [] };
}

export async function suggestHandoffReply(handoffId, inboundText) {
  const result = await copilotRequest(`/handoffs/${handoffId}/suggest-reply`, {
    method: 'POST',
    body: JSON.stringify(inboundText ? { inboundText } : {}),
  });
  if (!result.success) return result;
  return {
    success: true,
    suggestions: result.data.suggestions || [],
    contextUsed: result.data.contextUsed,
    fallback: Boolean(result.data.fallback),
    fallbackMessage: result.data.message || null,
  };
}

export async function sendHandoffReply(handoffId, text, { lockVersion, suggestedText, replySource } = {}) {
  const result = await copilotRequest(`/handoffs/${handoffId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ text, lockVersion, suggestedText, replySource }),
  });
  if (!result.success) {
    return {
      ...result,
      errorMessage: result.data?.message || result.message || null,
      deliveryStatus: result.data?.deliveryStatus || 'failed',
    };
  }
  return {
    success: true,
    deliveryStatus: result.data.deliveryStatus,
    providerStatus: result.data.providerStatus || result.data.deliveryStatus,
    outboundMessageId: result.data.outboundMessageId || null,
    errorMessage: result.data.errorMessage || null,
    replyId: result.data.replyId,
    lockVersion: result.data.lockVersion,
  };
}

export async function retryHandoffReply(handoffId, replyId, { lockVersion } = {}) {
  const result = await copilotRequest(`/handoffs/${handoffId}/retry-reply`, {
    method: 'POST',
    body: JSON.stringify({ replyId, lockVersion }),
  });
  if (!result.success) return result;
  return {
    success: true,
    deliveryStatus: result.data.deliveryStatus,
    replyId: result.data.replyId,
    lockVersion: result.data.lockVersion,
  };
}

export async function resolveHandoff(handoffId) {
  return copilotRequest(`/handoffs/${handoffId}/resolve`, { method: 'POST' });
}

export async function fetchCopilotAgents() {
  const result = await copilotRequest('/agents');
  if (!result.success) return result;
  return {
    success: true,
    agents: result.data.agents || [],
    routing: result.data.routing || {},
    analytics: result.data.analytics || {},
  };
}

export async function fetchCopilotRouting() {
  const result = await copilotRequest('/routing');
  if (!result.success) return result;
  return { success: true, data: result.data.data || result.data };
}

export async function updateCopilotAgentStatus(adminId, availability) {
  const result = await copilotRequest('/agents/status', {
    method: 'POST',
    body: JSON.stringify({ adminId, availability }),
  });
  if (!result.success) return result;
  return { success: true, agent: result.data.agent };
}

export async function updateCopilotAgentSettings(payload) {
  const result = await copilotRequest('/agents/settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!result.success) return result;
  return {
    success: true,
    agent: result.data.agent,
    routing: result.data.routing,
  };
}

export async function autoAssignHandoff(handoffId) {
  const result = await copilotRequest(`/handoffs/${handoffId}/auto-assign`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!result.success) return result;
  return {
    success: true,
    assigned: Boolean(result.data.assigned),
    agent: result.data.agent,
    agentId: result.data.agentId,
    routingMode: result.data.routingMode,
    reason: result.data.reason,
    fallback: result.data.fallback,
    handoff: result.data.handoff,
    lockVersion: result.data.lockVersion,
  };
}
