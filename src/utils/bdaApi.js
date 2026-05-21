import { notifyBdaUnauthorized } from './authSession';
import { getApiBaseUrl } from './apiBaseUrl';

const BDA_TOKEN_KEY = 'guidexpert_bda_token';
const BDA_USER_KEY = 'guidexpert_bda_user';

export function getBdaToken() {
  return localStorage.getItem(BDA_TOKEN_KEY);
}

export function setBdaToken(token) {
  if (token) localStorage.setItem(BDA_TOKEN_KEY, token);
  else localStorage.removeItem(BDA_TOKEN_KEY);
}

export function getBdaUser() {
  try {
    const raw = localStorage.getItem(BDA_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setBdaUser(user) {
  if (user) localStorage.setItem(BDA_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(BDA_USER_KEY);
}

function toQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

async function bdaRequest(endpoint, options = {}, token = getBdaToken()) {
  const url = `${getApiBaseUrl()}/bda${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
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
    if (response.status === 401) {
      notifyBdaUnauthorized();
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

export async function bdaLogin(login, password) {
  const res = await bdaRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  }, null);
  if (res.success && res.data?.data?.token) {
    setBdaToken(res.data.data.token);
    setBdaUser(res.data.data.user);
  }
  return res;
}

export async function bdaMe() {
  return bdaRequest('/me');
}

export async function bdaLogout() {
  await bdaRequest('/logout', { method: 'POST' });
  setBdaToken(null);
  setBdaUser(null);
}

export async function getBdaDashboardStats() {
  return bdaRequest('/dashboard/stats');
}

export async function getBdaLeads(params = {}) {
  const res = await bdaRequest(`/leads${toQuery(params)}`);
  if (res.success) {
    return {
      success: true,
      data: res.data?.data || [],
      pagination: res.data?.pagination || res.pagination,
    };
  }
  return res;
}

export async function getBdaLead(id) {
  return bdaRequest(`/leads/${id}`);
}

export async function updateBdaLead(id, body) {
  return bdaRequest(`/leads/${id}/update`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function getBdaLeadHistory(id) {
  return bdaRequest(`/leads/${id}/history`);
}
