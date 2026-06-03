import { getApiBaseUrl } from './apiBaseUrl';

const TOKEN_KEY = 'guidexpert_one_on_one_counselor_token';
const USER_KEY = 'guidexpert_one_on_one_counselor_user';

export function getOocToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setOocToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getOocUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setOocUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function toQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

async function oocRequest(endpoint, options = {}, token = getOocToken()) {
  const url = `${getApiBaseUrl()}/one-on-one-counselor${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const response = await fetch(url, { ...options, headers });
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Request failed',
        status: response.status,
        data,
      };
    }
    return { success: true, status: response.status, data };
  } catch (err) {
    return { success: false, message: err.message || 'Network error', status: 0 };
  }
}

export const oocLogin = (email, password) =>
  oocRequest('/login', { method: 'POST', body: JSON.stringify({ email, password }) }, null);

export const oocMe = () => oocRequest('/me', { method: 'GET' });

export const oocStats = () => oocRequest('/stats', { method: 'GET' });

export const oocUpdateProfile = (body) =>
  oocRequest('/profile', { method: 'PATCH', body: JSON.stringify(body) });

export const oocListSlots = () => oocRequest('/slots', { method: 'GET' });

export const oocToggleSlot = (id) =>
  oocRequest(`/slots/${encodeURIComponent(id)}/toggle`, { method: 'PATCH' });

export const oocListBookings = (params = {}) =>
  oocRequest(`/bookings${toQuery(params)}`, { method: 'GET' });

export const oocPatchBookingStatus = (id, bookingStatus) =>
  oocRequest(`/bookings/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ bookingStatus }),
  });

export const oocPatchBookingRemarks = (id, counselorRemarks) =>
  oocRequest(`/bookings/${encodeURIComponent(id)}/remarks`, {
    method: 'PATCH',
    body: JSON.stringify({ counselorRemarks }),
  });
