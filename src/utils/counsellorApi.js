// Use deployed backend by default (same as api.js and adminApi.js)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://guide-xpert-backend.vercel.app/api';

const COUNSELLOR_TOKEN_KEY = 'guidexpert_counsellor_token';
const COUNSELLOR_USER_KEY = 'guidexpert_counsellor_user';

export function getCounsellorToken() {
  return localStorage.getItem(COUNSELLOR_TOKEN_KEY);
}

export function setCounsellorToken(token) {
  if (token) localStorage.setItem(COUNSELLOR_TOKEN_KEY, token);
  else localStorage.removeItem(COUNSELLOR_TOKEN_KEY);
}

export function getCounsellorUser() {
  try {
    const raw = localStorage.getItem(COUNSELLOR_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCounsellorUser(user) {
  if (user) localStorage.setItem(COUNSELLOR_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(COUNSELLOR_USER_KEY);
}

async function counsellorRequest(endpoint, options = {}, token = getCounsellorToken()) {
  const url = `${API_BASE_URL}/counsellor${endpoint}`;
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
    const message = error.message === 'Failed to fetch' ? 'Cannot reach server.' : (error.message || 'Network error');
    return { success: false, message, status: 0, error };
  }
}

export const counsellorLogin = async (email, password) => {
  return counsellorRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, null);
};

export const getStudents = async (params = {}, token = getCounsellorToken()) => {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  if (params.q) search.set('q', params.q);
  if (params.course) search.set('course', params.course);
  if (params.status) search.set('status', params.status);
  if (params.joinedFrom) search.set('joinedFrom', params.joinedFrom);
  if (params.joinedTo) search.set('joinedTo', params.joinedTo);
  if (params.deleted !== undefined && params.deleted !== '') search.set('deleted', String(params.deleted));
  const query = search.toString();
  return counsellorRequest(`/students${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

export const getStudent = async (id, token = getCounsellorToken()) => {
  return counsellorRequest(`/students/${encodeURIComponent(id)}`, { method: 'GET' }, token);
};

export const createStudent = async (payload, token = getCounsellorToken()) => {
  return counsellorRequest('/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
};

export const updateStudent = async (id, payload, token = getCounsellorToken()) => {
  return counsellorRequest(`/students/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
};

export const deleteStudent = async (id, token = getCounsellorToken()) => {
  return counsellorRequest(`/students/${encodeURIComponent(id)}`, { method: 'DELETE' }, token);
};

export const restoreStudent = async (id, token = getCounsellorToken()) => {
  return counsellorRequest(`/students/${encodeURIComponent(id)}/restore`, { method: 'POST' }, token);
};

export const bulkUpdateStatus = async (ids, status, token = getCounsellorToken()) => {
  return counsellorRequest('/students/bulk-status', {
    method: 'PATCH',
    body: JSON.stringify({ ids, status }),
  }, token);
};

export const bulkDeleteStudents = async (ids, token = getCounsellorToken()) => {
  return counsellorRequest('/students/bulk', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  }, token);
};

export const exportStudents = async (params = {}, token = getCounsellorToken()) => {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.course) search.set('course', params.course);
  if (params.status) search.set('status', params.status);
  if (params.joinedFrom) search.set('joinedFrom', params.joinedFrom);
  if (params.joinedTo) search.set('joinedTo', params.joinedTo);
  if (params.deleted !== undefined && params.deleted !== '') search.set('deleted', String(params.deleted));
  const query = search.toString();
  const exportUrl = `${API_BASE_URL}/counsellor/students/export${query ? `?${query}` : ''}`;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(exportUrl, { method: 'GET', headers });
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
  let filename = `students-export-${new Date().toISOString().slice(0, 10)}.csv`;
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
