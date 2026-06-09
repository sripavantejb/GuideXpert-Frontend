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

export async function aiCallsRequest(path, options = {}, token = getStoredToken()) {
  const url = `${getApiBaseUrl()}/admin/ai-calls${path}`;
  const headers = { ...(options.headers || {}) };
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isForm) headers['Content-Type'] = 'application/json; charset=utf-8';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    return { success: false, message: err?.message || 'Network error', status: 0, data: {} };
  }

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    if (res.status === 401) notifyAdminUnauthorized({ endpoint: path, status: 401 });
    return {
      success: false,
      message: data.message || 'Request failed',
      status: res.status,
      data,
    };
  }
  return { success: true, data, status: res.status };
}

export function buildAiCallsQuery(params = {}) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') s.set(k, String(v));
  });
  const q = s.toString();
  return q ? `?${q}` : '';
}

export const getAiCallsSettings = () => aiCallsRequest('/settings');
export const patchAiCallsSettings = (body) =>
  aiCallsRequest('/settings', { method: 'PATCH', body: JSON.stringify(body) });
export const getAiCallsAnalytics = () => aiCallsRequest('/analytics');
export const getAiCallsQueue = (params) =>
  aiCallsRequest(`/queue${buildAiCallsQuery(params)}`);
export const getAiCallsReminders = (params) =>
  aiCallsRequest(`${buildAiCallsQuery(params)}`);
export const getAiCallReminder = (id) => aiCallsRequest(`/${id}`);
export const getAiCallPreviewPayload = (id) => aiCallsRequest(`/${id}/preview-payload`);
export const patchAiCallReminder = (id, body) =>
  aiCallsRequest(`/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const scheduleAiCallReminder = (id) =>
  aiCallsRequest(`/${id}/schedule`, { method: 'POST' });
export const rejectAiCallReminder = (id, body) =>
  aiCallsRequest(`/${id}/reject`, { method: 'POST', body: JSON.stringify(body || {}) });
export const retryAiCallReminder = (id) =>
  aiCallsRequest(`/${id}/retry`, { method: 'POST' });
export const rescheduleAiCallReminder = (id, body) =>
  aiCallsRequest(`/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify(body) });
export const cancelAiCallReminder = (id) =>
  aiCallsRequest(`/${id}/cancel`, { method: 'PATCH' });
export const deleteAiCallReminder = (id) =>
  aiCallsRequest(`/${id}`, { method: 'DELETE' });
export const bulkScheduleAiCalls = (ids) =>
  aiCallsRequest('/bulk-schedule', { method: 'POST', body: JSON.stringify({ ids }) });
export const bulkScheduleAllPendingAiCalls = () =>
  aiCallsRequest('/bulk-schedule-all-pending', { method: 'POST' });
export const previewAiTestCall = (body) =>
  aiCallsRequest('/test/preview', { method: 'POST', body: JSON.stringify(body) });
export const createAiTestCall = (body) =>
  aiCallsRequest('/test', { method: 'POST', body: JSON.stringify(body) });

export const getIitAiCallSummaryStats = () => aiCallsRequest('/summary/stats');
export const getIitAiCallSummaries = (params) =>
  aiCallsRequest(`/summary${buildAiCallsQuery(params)}`);
export const getIitAiCallSummary = (id) => aiCallsRequest(`/summary/${id}`);
