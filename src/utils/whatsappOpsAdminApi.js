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

export async function whatsappOpsRequest(path, options = {}, token = getStoredToken()) {
  const url = `${getApiBaseUrl()}/admin/whatsapp-ops${path}`;
  const headers = { ...(options.headers || {}) };
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isForm) headers['Content-Type'] = 'application/json; charset=utf-8';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    if (res.status === 401) notifyAdminUnauthorized({ endpoint: path, status: 401 });
    return { success: false, message: data.message || 'Request failed', status: res.status, data };
  }
  return { success: true, data, status: res.status };
}

export function buildWhatsappOpsQuery(params = {}) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') s.set(k, String(v));
  });
  const q = s.toString();
  return q ? `?${q}` : '';
}

export const getWhatsappOpsSummary = (params, token) =>
  whatsappOpsRequest(`/summary${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const getWhatsappOpsCalendarMonth = (params, token) =>
  whatsappOpsRequest(`/calendar/month${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const getWhatsappOpsCalendarDay = (params, token) =>
  whatsappOpsRequest(`/calendar/day${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const getWhatsappOpsMeta = (token) => whatsappOpsRequest('/meta', { method: 'GET' }, token);

export const listWhatsappOpsCronRuns = (params, token) =>
  whatsappOpsRequest(`/cron-runs${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const getWhatsappOpsCronRunDetail = (id, token) =>
  whatsappOpsRequest(`/cron-runs/${encodeURIComponent(id)}`, { method: 'GET' }, token);

export const listWhatsappOpsMessages = (params, token) =>
  whatsappOpsRequest(`/messages${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const getWhatsappOpsMessageTimeline = (id, token) =>
  whatsappOpsRequest(`/messages/${encodeURIComponent(id)}/timeline`, { method: 'GET' }, token);

export const getWhatsappOpsRetriesAnalytics = (params, token) =>
  whatsappOpsRequest(`/retries/analytics${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const getWhatsappRetryGroupDetail = (id, token) =>
  whatsappOpsRequest(`/retry-groups/${encodeURIComponent(id)}`, { method: 'GET' }, token);

export const getWhatsappAttemptAnalytics = (params, token) =>
  whatsappOpsRequest(`/attempt-analytics${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const listWhatsappOpsWebhooks = (params, token) =>
  whatsappOpsRequest(`/webhooks${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const getWhatsappOpsFailuresRollup = (params, token) =>
  whatsappOpsRequest(`/failures${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const manualWhatsappOpsResend = (body, token) =>
  whatsappOpsRequest('/actions/resend', { method: 'POST', body: JSON.stringify(body) }, token);

export const triggerWhatsappOpsRetryBatch = (token) =>
  whatsappOpsRequest('/actions/retry-batch', {
    method: 'POST',
    headers: { 'x-whatsapp-ops-confirm': 'RETRY' }
  }, token);

export async function downloadWhatsappOpsCsv(type = 'messages', token = getStoredToken()) {
  const url = `${getApiBaseUrl()}/admin/whatsapp-ops/export?type=${encodeURIComponent(type)}`;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    if (res.status === 401) notifyAdminUnauthorized({ endpoint: 'export', status: 401 });
    const errText = await res.text();
    throw new Error(errText || `Export failed (${res.status})`);
  }
  const blob = await res.blob();
  const dispo = res.headers.get('Content-Disposition') || '';
  const m = dispo.match(/filename="([^"]+)"/);
  const filename = m ? m[1] : `whatsapp-${type}-${Date.now()}.csv`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
