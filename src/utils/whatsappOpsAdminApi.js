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

export const captureWhatsappOpsSnapshot = (body, token) =>
  whatsappOpsRequest('/snapshots/capture', {
    method: 'POST',
    body: JSON.stringify(body || {})
  }, token);

export const getLatestWhatsappOpsSnapshot = (params, token) =>
  whatsappOpsRequest(`/snapshots/latest${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const getOperationalHealth = (params, token) =>
  whatsappOpsRequest(`/operational-health${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

export const getUnresolvedRecipients = (params, token) =>
  whatsappOpsRequest(`/unresolved${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

const CSV_BOM = '\uFEFF';

async function fetchUnresolvedExport(params = {}, token = getStoredToken()) {
  const url = `${getApiBaseUrl()}/admin/whatsapp-ops/unresolved/export${buildWhatsappOpsQuery(params)}`;
  const headers = { Accept: 'text/csv;charset=utf-8' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    if (res.status === 401) notifyAdminUnauthorized({ endpoint: 'unresolved-export', status: 401 });
    const errText = await res.text();
    throw new Error(errText || `Export failed (${res.status})`);
  }
  const dispo = res.headers.get('Content-Disposition') || '';
  const m = dispo.match(/filename="([^"]+)"/);
  const filename = m ? m[1] : `unresolved-${Date.now()}.csv`;
  const buf = await res.arrayBuffer();
  const text = new TextDecoder('utf-8').decode(buf);
  return { text, filename };
}

/** Same payload as file download — use for clipboard so Copy matches Download. */
export async function fetchUnresolvedCsvText(params = {}, token = getStoredToken()) {
  const { text } = await fetchUnresolvedExport(params, token);
  return text;
}

export async function downloadUnresolvedCsv(params = {}, token = getStoredToken()) {
  const { text, filename } = await fetchUnresolvedExport(params, token);
  const forBlob = text.startsWith(CSV_BOM) ? text : `${CSV_BOM}${text}`;
  const blob = new Blob([forBlob], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

export const previewWhatsappOpsManualRecovery = (body, token) =>
  whatsappOpsRequest('/manual-recovery/preview', {
    method: 'POST',
    body: JSON.stringify(body || {})
  }, token);

export const startWhatsappOpsManualRecovery = (body, token) =>
  whatsappOpsRequest('/manual-recovery/start', {
    method: 'POST',
    body: JSON.stringify(body || {})
  }, token);

export const getWhatsappOpsManualRecoveryJob = (id, token) =>
  whatsappOpsRequest(`/manual-recovery/${encodeURIComponent(id)}`, { method: 'GET' }, token);

export const cancelWhatsappOpsManualRecoveryJob = (id, token) =>
  whatsappOpsRequest(`/manual-recovery/${encodeURIComponent(id)}/cancel`, { method: 'POST' }, token);

export const listWhatsappOpsManualRecoveryJobs = (params, token) =>
  whatsappOpsRequest(`/manual-recovery${buildWhatsappOpsQuery(params)}`, { method: 'GET' }, token);

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
