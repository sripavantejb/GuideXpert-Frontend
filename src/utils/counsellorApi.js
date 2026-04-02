// Use deployed backend by default (same as api.js and adminApi.js)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://guide-xpert-backend.vercel.app/api';

const COUNSELLOR_TOKEN_KEY = 'guidexpert_counsellor_token';
const COUNSELLOR_USER_KEY = 'guidexpert_counsellor_user';
const COUNSELLOR_ACCESS_FORM_KEY = 'guidexpert_counsellor_access_form';

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

export function getCounsellorAccessForm() {
  try {
    const raw = localStorage.getItem(COUNSELLOR_ACCESS_FORM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCounsellorAccessForm(accessForm) {
  if (accessForm && typeof accessForm === 'object') {
    localStorage.setItem(COUNSELLOR_ACCESS_FORM_KEY, JSON.stringify(accessForm));
  } else {
    localStorage.removeItem(COUNSELLOR_ACCESS_FORM_KEY);
  }
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

export const loginWithPhone = async (phone) => {
  return counsellorRequest('/login-with-phone', {
    method: 'POST',
    body: JSON.stringify({ phone }),
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

/**
 * Get predicted colleges via the backend proxy.
 * When `params.exam` is set (e.g. "KCET", "JEE"), the backend routes to CollegeDost per-exam endpoints.
 * Without `exam`, falls back to the legacy earlywave/NW predictor.
 *
 * @param {{ exam?: string, offset?: number, limit?: number, entrance_exam_name_enum?: string, admission_category_name_enum?: string, cutoff_from: number, cutoff_to: number, reservation_category_codes?: string[], reservation_category_code?: string, branch_codes?: string[], districts?: string[], sort_order?: string }} params
 * @param {string} [token]
 */
export const getPredictedColleges = async (params = {}, token = getCounsellorToken()) => {
  const { offset = 0, limit = 10, ...body } = params;
  const query = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  return counsellorRequest(`/college-predictor/colleges?${query.toString()}`, {
    method: 'POST',
    body: JSON.stringify(body),
  }, token);
};

/** GET /api/counsellor/assessment-links — returns careerDna and courseFit links. */
export const getAssessmentLinks = async (token = getCounsellorToken()) => {
  return counsellorRequest('/assessment-links', { method: 'GET' }, token);
};

/** GET /api/counsellor/assessment-results?type=career-dna|course-fit&page=&limit= */
export const getAssessmentResults = async (type, params = {}, token = getCounsellorToken()) => {
  const search = new URLSearchParams({ type });
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  return counsellorRequest(`/assessment-results?${search.toString()}`, { method: 'GET' }, token);
};

/** GET /api/counsellor/assessment-results/:id?type=career-dna|course-fit */
export const getAssessmentResultById = async (id, type, token = getCounsellorToken()) => {
  return counsellorRequest(`/assessment-results/${encodeURIComponent(id)}?type=${encodeURIComponent(type)}`, { method: 'GET' }, token);
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
};

// —— Announcements (notifications) ——
export const getAnnouncements = async (token = getCounsellorToken()) => {
  return counsellorRequest('/announcements', { method: 'GET' }, token);
};

export const getAnnouncement = async (id, token = getCounsellorToken()) => {
  return counsellorRequest(`/announcements/${encodeURIComponent(id)}`, { method: 'GET' }, token);
};

export const markAnnouncementRead = async (id, token = getCounsellorToken()) => {
  return counsellorRequest(`/announcements/${encodeURIComponent(id)}/read`, { method: 'POST' }, token);
};

export const markAllAnnouncementsRead = async (token = getCounsellorToken()) => {
  return counsellorRequest('/announcements/read-all', { method: 'POST' }, token);
};

// —— Announcements Feed ——
export const getAnnouncementsFeed = async (params = {}, token = getCounsellorToken()) => {
  const search = new URLSearchParams();
  if (params.filter) search.set('filter', params.filter);
  if (params.q) search.set('q', params.q);
  if (params.page != null) search.set('page', String(params.page));
  if (params.limit != null) search.set('limit', String(params.limit));
  const query = search.toString();
  return counsellorRequest(`/announcements/feed${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

export const setAnnouncementReaction = async (id, reactionType, token = getCounsellorToken()) => {
  return counsellorRequest(`/announcements/${encodeURIComponent(id)}/react`, {
    method: 'POST',
    body: JSON.stringify({ reactionType: reactionType || null }),
  }, token);
};

export const acknowledgeAnnouncement = async (id, token = getCounsellorToken()) => {
  return counsellorRequest(`/announcements/${encodeURIComponent(id)}/acknowledge`, { method: 'POST' }, token);
};

export const getAnnouncementEngagement = async (id, token = getCounsellorToken()) => {
  return counsellorRequest(`/announcements/${encodeURIComponent(id)}/engagement`, { method: 'GET' }, token);
};

/**
 * GET /api/counsellor/webinar-progress — same WebinarProgress document as admin detail for this counsellor's phone.
 * @param {string} [token]
 */
export const getCounsellorWebinarProgress = async (token = getCounsellorToken()) => {
  return counsellorRequest('/webinar-progress', { method: 'GET' }, token);
};
