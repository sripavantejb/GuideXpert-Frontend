import { getStoredToken } from './adminApi';
import { getApiBaseUrl } from './apiBaseUrl';

async function callingTeamRequest(endpoint, options = {}) {
  const url = `${getApiBaseUrl()}/admin${endpoint}`;
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(url, { ...options, headers });
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Invalid response' };
    }
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Request failed',
        status: response.status,
        data,
      };
    }
    return { success: true, data, status: response.status };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Network error',
      status: 0,
    };
  }
}

function toQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function buildStatsQuery({ preset, fromDate, toDate } = {}) {
  const params = {};
  if (preset) params.preset = preset;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  return params;
}

export async function getCallingTeamLeads(params = {}) {
  return callingTeamRequest(`/iit-counselling-leads${toQuery(params)}`);
}

export async function getCallingTeamLead(id) {
  return callingTeamRequest(`/iit-counselling-leads/${id}`);
}

export async function patchCallingTeamLeadCrm(id, body) {
  return callingTeamRequest(`/iit-counselling-leads/${id}/crm`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function bulkAssignLeadsToBda({ leadIds, bdaId, reason, respectExistingBda }) {
  return callingTeamRequest('/iit-counselling-leads/bulk-assign', {
    method: 'PATCH',
    body: JSON.stringify({ leadIds, bdaId, reason, respectExistingBda: !!respectExistingBda }),
  });
}

export async function bulkMapLeadsToRespectiveBda({ leadIds, reason }) {
  return callingTeamRequest('/iit-counselling-leads/bulk-assign', {
    method: 'PATCH',
    body: JSON.stringify({ leadIds, mapToRespectiveBda: true, reason }),
  });
}

export async function assignLeadToBda(id, { bdaId, reason }) {
  return callingTeamRequest(`/iit-counselling-leads/${id}/assign-bda`, {
    method: 'PATCH',
    body: JSON.stringify({ bdaId, reason }),
  });
}

export async function reassignLeadToBda(id, { bdaId, reason }) {
  return callingTeamRequest(`/iit-counselling-leads/${id}/reassign-bda`, {
    method: 'PATCH',
    body: JSON.stringify({ bdaId, reason }),
  });
}

export async function getLeadAssignmentHistory(id) {
  return callingTeamRequest(`/iit-counselling-leads/${id}/assignment-history`);
}

export async function listBdas(params = {}) {
  return callingTeamRequest(`/bdas${toQuery(params)}`);
}

export async function createBda(body) {
  return callingTeamRequest('/bdas', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateBda(id, body) {
  return callingTeamRequest(`/bdas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteBda(id) {
  return callingTeamRequest(`/bdas/${id}`, {
    method: 'DELETE',
  });
}

export async function patchBdaStatus(id, status) {
  return callingTeamRequest(`/bdas/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function resetBdaPassword(id, password) {
  return callingTeamRequest(`/bdas/${id}/reset-password`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  });
}

export async function getBdaStats(params = {}) {
  return callingTeamRequest(`/bdas/stats${toQuery(params)}`);
}

export async function getBdaStatsById(id, params = {}) {
  return callingTeamRequest(`/bdas/${id}/stats${toQuery(params)}`);
}

export async function getBdaLeaderboard(params = {}) {
  return callingTeamRequest(`/bdas/leaderboard${toQuery(params)}`);
}

export async function getCallingTeamDashboard(params = {}) {
  return callingTeamRequest(`/bdas/team-dashboard${toQuery(params)}`);
}

export async function getBdaAssignedLeads(id, params = {}) {
  return callingTeamRequest(`/bdas/${id}/assigned-leads${toQuery(params)}`);
}

/** BDA profiles with assigned lead CRM rows (Calling Data section). */
export async function getBdaCallingData(params = {}) {
  return callingTeamRequest(`/bdas/calling-data${toQuery(params)}`);
}

export async function getAutoAssignPreview(params = {}) {
  return callingTeamRequest(`/iit-counselling-leads/auto-assign-preview${toQuery(params)}`);
}

export async function autoAssignLeadsByLanguage({ language, reason, filterParams = {} }) {
  return callingTeamRequest(
    `/iit-counselling-leads/auto-assign-by-language${toQuery(filterParams)}`,
    {
      method: 'POST',
      body: JSON.stringify({ language, reason }),
    }
  );
}
