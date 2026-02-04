const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://guide-xpert-backend.vercel.app/api';
const ADMIN_TOKEN_KEY = 'guidexpert_admin_token';

export function getStoredToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function adminRequest(endpoint, options = {}, token = getStoredToken()) {
  const url = `${API_BASE_URL}/admin${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const config = { ...options, headers };

  try {
    const response = await fetch(url, config);
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
    const isNetworkError = error.message === 'Failed to fetch' || error.name === 'TypeError';
    const message = isNetworkError
      ? 'Cannot reach server. Make sure the backend is running on port 5000.'
      : (error.message || 'Network error');
    return {
      success: false,
      message,
      status: 0,
      error,
    };
  }
}

export const adminLogin = async (username, password) => {
  return adminRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }, null);
};

export const getAdminLeads = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  if (params.applicationStatus) search.set('applicationStatus', params.applicationStatus);
  if (params.otpVerified !== undefined && params.otpVerified !== '') search.set('otpVerified', String(params.otpVerified));
  if (params.slotBooked !== undefined && params.slotBooked !== '') search.set('slotBooked', String(params.slotBooked));
  if (params.selectedSlot) search.set('selectedSlot', params.selectedSlot);
  if (params.q) search.set('q', params.q);
  search.set('_t', String(Date.now()));
  const query = search.toString();
  return adminRequest(`/leads?${query}`, { method: 'GET' }, token);
};

export const getAdminStats = async (token = getStoredToken()) => {
  return adminRequest('/stats', { method: 'GET' }, token);
};

export const getSlotConfigs = async (token = getStoredToken()) => {
  return adminRequest('/slots', { method: 'GET' }, token);
};

export const updateSlotConfig = async (slotId, enabled, token = getStoredToken()) => {
  return adminRequest(`/slots/${slotId}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  }, token);
};

export const getMeetingAttendance = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  const query = search.toString();
  return adminRequest(`/meeting-attendance${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

/** Request to /api/influencer-links and /api/influencer-analytics (admin auth, no /admin prefix). */
async function influencerRequest(path, options = {}, token = getStoredToken()) {
  const url = `${API_BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
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
      return { success: false, message: data.message || 'Request failed', status: response.status, data };
    }
    return { success: true, data, status: response.status };
  } catch (error) {
    const message = error.message === 'Failed to fetch' ? 'Cannot reach server.' : (error.message || 'Network error');
    return { success: false, message, status: 0, error };
  }
}

export const createInfluencerLink = async (payload, save = false, token = getStoredToken()) => {
  return influencerRequest('/influencer-links', {
    method: 'POST',
    body: JSON.stringify({ ...payload, save }),
  }, token);
};

export const getInfluencerLinks = async (token = getStoredToken()) => {
  return influencerRequest('/influencer-links', { method: 'GET' }, token);
};

export const getInfluencerAnalytics = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  return influencerRequest(`/influencer-analytics${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

export async function getAdminLeadsExport(params = {}, token = getStoredToken()) {
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.selectedSlot) search.set('selectedSlot', params.selectedSlot);
  const query = search.toString();
  const url = `${API_BASE_URL}/admin/leads/export${query ? `?${query}` : ''}`;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) {
    let message = 'Export failed';
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      message = response.statusText || message;
    }
    return { success: false, message, status: response.status };
  }
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  let filename = `guidexpert-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  if (disposition) {
    const match = /filename="?([^"]+)"?/.exec(disposition);
    if (match) filename = match[1];
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  return { success: true };
}
