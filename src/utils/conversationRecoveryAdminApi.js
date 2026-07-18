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

export async function conversationRecoveryRequest(path, options = {}, token = getStoredToken()) {
  const url = `${getApiBaseUrl()}/admin/conversation-recovery${path}`;
  const headers = { ...(options.headers || {}) };
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isForm) headers['Content-Type'] = 'application/json; charset=utf-8';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    const isFetchFailure =
      err?.name === 'TypeError' && String(err?.message || '').includes('fetch');
    const message = isFetchFailure
      ? 'Cannot reach the API. Start the backend and align VITE_PROXY_TARGET with its port, or check the network.'
      : err?.message || 'Network error';
    return { success: false, message, status: 0, data: {} };
  }
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    if (res.status === 401) notifyAdminUnauthorized({ endpoint: path, status: 401 });
    return { success: false, message: data.message || 'Request failed', status: res.status, data };
  }
  return { success: true, data, status: res.status };
}

export function buildConversationRecoveryQuery(params = {}) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') s.set(k, String(v));
  });
  const q = s.toString();
  return q ? `?${q}` : '';
}

export const getRecoveryOverview = (params, token) =>
  conversationRecoveryRequest(`/overview${buildConversationRecoveryQuery(params)}`, { method: 'GET' }, token);

export const getRecoveryFunnel = (params, token) =>
  conversationRecoveryRequest(`/funnel${buildConversationRecoveryQuery(params)}`, { method: 'GET' }, token);

export const getRecoveryDaily = (params, token) =>
  conversationRecoveryRequest(`/daily${buildConversationRecoveryQuery(params)}`, { method: 'GET' }, token);

export const getRecoveryTrends = (params, token) =>
  conversationRecoveryRequest(`/trends${buildConversationRecoveryQuery(params)}`, { method: 'GET' }, token);

export const getRecoveryByPhase = (params, token) =>
  conversationRecoveryRequest(`/by-phase${buildConversationRecoveryQuery(params)}`, { method: 'GET' }, token);

export const getRecoveryDeliveryStatus = (params, token) =>
  conversationRecoveryRequest(`/delivery-status${buildConversationRecoveryQuery(params)}`, { method: 'GET' }, token);

export const getRecoveryFailureReasons = (params, token) =>
  conversationRecoveryRequest(`/failure-reasons${buildConversationRecoveryQuery(params)}`, { method: 'GET' }, token);

export const listRecoveryStudents = (params, token) =>
  conversationRecoveryRequest(`/students${buildConversationRecoveryQuery(params)}`, { method: 'GET' }, token);

export const getRecoveryStudentDetail = (id, token) =>
  conversationRecoveryRequest(`/students/${encodeURIComponent(id)}`, { method: 'GET' }, token);

export const getRecoveryStudentTimeline = (id, token) =>
  conversationRecoveryRequest(`/students/${encodeURIComponent(id)}/timeline`, { method: 'GET' }, token);

export const resendRecovery = (id, body, token) =>
  conversationRecoveryRequest(`/students/${encodeURIComponent(id)}/resend`, {
    method: 'POST',
    body: JSON.stringify(body || {}),
  }, token);

export const pauseRecovery = (id, body, token) =>
  conversationRecoveryRequest(`/students/${encodeURIComponent(id)}/pause`, {
    method: 'POST',
    body: JSON.stringify(body || {}),
  }, token);

export const resumeRecovery = (id, body, token) =>
  conversationRecoveryRequest(`/students/${encodeURIComponent(id)}/resume`, {
    method: 'POST',
    body: JSON.stringify(body || {}),
  }, token);

export const stopRecovery = (id, body, token) =>
  conversationRecoveryRequest(`/students/${encodeURIComponent(id)}/stop`, {
    method: 'POST',
    body: JSON.stringify(body || {}),
  }, token);

export const assignHumanRecovery = (id, token) =>
  conversationRecoveryRequest(`/students/${encodeURIComponent(id)}/assign-human`, {
    method: 'POST',
    body: '{}',
  }, token);

export const bulkRecoveryAction = (body, token) =>
  conversationRecoveryRequest('/bulk', {
    method: 'POST',
    body: JSON.stringify(body || {}),
  }, token);

export const getRecoveryConfig = (token) =>
  conversationRecoveryRequest('/config', { method: 'GET' }, token);

export const putRecoveryConfig = (body, token) =>
  conversationRecoveryRequest('/config', {
    method: 'PUT',
    body: JSON.stringify(body || {}),
  }, token);

export const getRecoveryHealth = (token) =>
  conversationRecoveryRequest('/health', { method: 'GET' }, token);

export const getRecoveryAlerts = (params, token) =>
  conversationRecoveryRequest(`/alerts${buildConversationRecoveryQuery(params)}`, { method: 'GET' }, token);

export const acknowledgeRecoveryAlert = (id, token) =>
  conversationRecoveryRequest(`/alerts/${encodeURIComponent(id)}/acknowledge`, {
    method: 'POST',
    body: '{}',
  }, token);

export const resolveRecoveryAlert = (id, token) =>
  conversationRecoveryRequest(`/alerts/${encodeURIComponent(id)}/resolve`, {
    method: 'POST',
    body: '{}',
  }, token);

export const getRecoveryAuditLogs = (params, token) =>
  conversationRecoveryRequest(`/audit-logs${buildConversationRecoveryQuery(params)}`, { method: 'GET' }, token);

export const getCampaignPerformance = (token) =>
  conversationRecoveryRequest('/campaign-performance', { method: 'GET' }, token);

export const previewRecoveryMessage = (body, token) =>
  conversationRecoveryRequest('/message-preview', {
    method: 'POST',
    body: JSON.stringify(body || {}),
  }, token);

export const getRecoverySystemMetrics = (token) =>
  conversationRecoveryRequest('/system-metrics', { method: 'GET' }, token);
