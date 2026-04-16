import { notifyAdminUnauthorized } from './authSession';
import { getApiBaseUrl } from './apiBaseUrl';

const ADMIN_TOKEN_KEY = 'guidexpert_admin_token';

/** Base URL used for admin API (e.g. to show on login page in dev). */
export function getAdminApiBaseUrl() {
  return getApiBaseUrl();
}

export function getStoredToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function adminRequest(endpoint, options = {}, token = getStoredToken()) {
  const url = `${getApiBaseUrl()}/admin${endpoint}`;
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
      if (response.status === 401) {
        notifyAdminUnauthorized({ endpoint, status: 401 });
      }
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
      ? `Cannot reach server. Check API URL (${getApiBaseUrl()}) and network connectivity.`
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

/** GET /admin/admins — list admins (super admin only). Returns { success, data: admins[] }. */
export const listAdmins = async (token = getStoredToken()) => {
  return adminRequest('/admins', { method: 'GET' }, token);
};

/** POST /admin/admins — create admin (super admin only). Payload: { username, password, name?, isSuperAdmin?, sectionAccess? }. */
export const createAdmin = async (payload, token = getStoredToken()) => {
  return adminRequest('/admins', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
};

/** DELETE /admin/admins/:id — remove admin (super admin only). Cannot delete self. */
export const deleteAdmin = async (id, token = getStoredToken()) => {
  return adminRequest(`/admins/${encodeURIComponent(id)}`, { method: 'DELETE' }, token);
};

/** PATCH /admin/admins/:id/password — reset another admin's password (super admin only). Payload: { newPassword }. */
export const resetAdminPassword = async (id, payload, token = getStoredToken()) => {
  return adminRequest(`/admins/${encodeURIComponent(id)}/password`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
};

/** PATCH /admin/me/password — change own password. Payload: { currentPassword, newPassword }. */
export const changeMyPassword = async (payload, token = getStoredToken()) => {
  return adminRequest('/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
};

export const getAdminLeads = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  if (params.firstJoinedFrom) search.set('firstJoinedFrom', params.firstJoinedFrom);
  else if (params.from) search.set('from', params.from);
  if (params.firstJoinedTo) search.set('firstJoinedTo', params.firstJoinedTo);
  else if (params.to) search.set('to', params.to);
  if (params.applicationStatus) search.set('applicationStatus', params.applicationStatus);
  if (params.otpVerified !== undefined && params.otpVerified !== '') search.set('otpVerified', String(params.otpVerified));
  if (params.slotBooked !== undefined && params.slotBooked !== '') search.set('slotBooked', String(params.slotBooked));
  if (params.demoAttended !== undefined && params.demoAttended !== '') search.set('demoAttended', String(params.demoAttended));
  if (params.assessmentWritten === true || params.assessmentWritten === 'true') search.set('assessmentWritten', 'true');
  if (params.activationCompleted === true || params.activationCompleted === 'true') search.set('activationCompleted', 'true');
  if (params.selectedSlot) search.set('selectedSlot', params.selectedSlot);
  if (params.slotDate && typeof params.slotDate === 'string' && params.slotDate.trim()) search.set('slotDate', params.slotDate);
  if (params.q) search.set('q', params.q);
  if (params.utm_content) search.set('utm_content', params.utm_content);
  search.set('_t', String(Date.now()));
  const query = search.toString();
  return adminRequest(`/leads?${query}`, { method: 'GET' }, token);
};

export const getAdminStats = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  const query = search.toString();
  return adminRequest(`/stats${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

export const getLead = async (id, token = getStoredToken()) => {
  return adminRequest(`/leads/${encodeURIComponent(id)}`, { method: 'GET' }, token);
};

export const updateLeadNotes = async (id, adminNotes, token = getStoredToken()) => {
  return adminRequest(`/leads/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ adminNotes: adminNotes ?? '' }),
  }, token);
};

/**
 * Partial update for a lead. Payload may include adminNotes, leadStatus, leadDescription.
 */
export const updateLead = async (id, payload, token = getStoredToken()) => {
  const body = {};
  if (payload.adminNotes !== undefined) body.adminNotes = payload.adminNotes ?? '';
  if (payload.leadStatus !== undefined) body.leadStatus = payload.leadStatus ?? '';
  if (payload.leadDescription !== undefined) body.leadDescription = payload.leadDescription ?? '';
  return adminRequest(`/leads/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }, token);
};

/** PATCH /admin/leads/:id/slot — body: { slotDate: "YYYY-MM-DD", selectedSlot: "MONDAY_7PM" } */
export const updateLeadSlotBooking = async (id, payload, token = getStoredToken()) => {
  return adminRequest(`/leads/${encodeURIComponent(id)}/slot`, {
    method: 'PATCH',
    body: JSON.stringify({
      slotDate: payload?.slotDate,
      selectedSlot: payload?.selectedSlot,
    }),
  }, token);
};

export const getSlotConfigs = async (token = getStoredToken()) => {
  return adminRequest('/slots', { method: 'GET' }, token);
};

/** GET /admin/slots/for-date?date=YYYY-MM-DD — slots available on that date. Returns data.slots or []. */
export const getSlotsForDate = async (date, token = getStoredToken()) => {
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    return [];
  }
  const res = await adminRequest(`/slots/for-date?date=${encodeURIComponent(date.trim())}`, { method: 'GET' }, token);
  const slots = res?.data?.data?.slots || res?.data?.slots;
  if (!res.success || !Array.isArray(slots)) return [];
  return slots;
};

export const updateSlotConfig = async (slotId, enabled, token = getStoredToken()) => {
  return adminRequest(`/slots/${slotId}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  }, token);
};

/** GET /admin/slots/overrides?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const getSlotOverrides = async (from, to, token = getStoredToken()) => {
  const params = new URLSearchParams({ from, to });
  return adminRequest(`/slots/overrides?${params}`, { method: 'GET' }, token);
};

/** PUT /admin/slots/overrides — body: { date, slotId, enabled } */
export const setSlotOverride = async (date, slotId, enabled, token = getStoredToken()) => {
  return adminRequest('/slots/overrides', {
    method: 'PUT',
    body: JSON.stringify({ date, slotId, enabled }),
  }, token);
};

/** GET /admin/slots/booking-counts?from=YYYY-MM-DD&to=YYYY-MM-DD — per-date counts */
export const getSlotBookingCounts = async (from, to, token = getStoredToken()) => {
  const params = new URLSearchParams({ from, to });
  return adminRequest(`/slots/booking-counts?${params}`, { method: 'GET' }, token);
};

export const getMeetingAttendance = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.q) search.set('q', params.q);
  if (params.uniqueByMobile !== undefined) search.set('uniqueByMobile', String(params.uniqueByMobile));
  if (params.dedupeMode) search.set('dedupeMode', params.dedupeMode);
  const query = search.toString();
  return adminRequest(`/meeting-attendance${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

export const getTrainingAttendance = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.q) search.set('q', params.q);
  if (params.uniqueByMobile !== undefined) search.set('uniqueByMobile', String(params.uniqueByMobile));
  if (params.dedupeMode) search.set('dedupeMode', params.dedupeMode);
  const query = search.toString();
  return adminRequest(`/training-attendance${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

export const getTrainingFeedback = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.q) search.set('q', params.q);
  if (params.gender) search.set('gender', params.gender);
  if (params.occupation) search.set('occupation', params.occupation);
  const query = search.toString();
  return adminRequest(`/training-feedback${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

export const getTrainingFormResponses = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.q) search.set('q', params.q);
  if (params.sessionRating != null) search.set('sessionRating', params.sessionRating);
  const query = search.toString();
  return adminRequest(`/training-form-responses${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

/** GET /admin/assessment-submissions — list with pagination. Returns { submissions, total }. options: { from, to, q }. */
export const getAssessmentSubmissions = async (page = 1, limit = 50, optionsOrToken = {}, token = getStoredToken()) => {
  const options = typeof optionsOrToken === 'string' ? {} : optionsOrToken;
  const actualToken = typeof optionsOrToken === 'string' ? optionsOrToken : token;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (options.from != null) params.set('from', options.from);
  if (options.to != null) params.set('to', options.to);
  if (options.q != null && String(options.q).trim() !== '') params.set('q', String(options.q).trim());
  return adminRequest(`/assessment-submissions?${params}`, { method: 'GET' }, actualToken);
};

/** GET /admin/assessment-2-submissions — list with pagination. Returns { submissions, total }. options: { from, to, q }. */
export const getAssessment2Submissions = async (page = 1, limit = 50, optionsOrToken = {}, token = getStoredToken()) => {
  const options = typeof optionsOrToken === 'string' ? {} : optionsOrToken;
  const actualToken = typeof optionsOrToken === 'string' ? optionsOrToken : token;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (options.from != null) params.set('from', options.from);
  if (options.to != null) params.set('to', options.to);
  if (options.q != null && String(options.q).trim() !== '') params.set('q', String(options.q).trim());
  return adminRequest(`/assessment-2-submissions?${params}`, { method: 'GET' }, actualToken);
};

/** GET /admin/assessment-submissions/:id — single submission with questionResults. */
export const getAssessmentSubmissionById = async (id, token = getStoredToken()) => {
  return adminRequest(`/assessment-submissions/${encodeURIComponent(id)}`, { method: 'GET' }, token);
};

/** GET /admin/assessment-2-submissions/:id — single submission with questionResults. */
export const getAssessment2SubmissionById = async (id, token = getStoredToken()) => {
  return adminRequest(`/assessment-2-submissions/${encodeURIComponent(id)}`, { method: 'GET' }, token);
};

/** GET /admin/assessment-3-submissions — list with pagination. Returns { submissions, total }. options: { from, to, q }. */
export const getAssessment3Submissions = async (page = 1, limit = 50, optionsOrToken = {}, token = getStoredToken()) => {
  const options = typeof optionsOrToken === 'string' ? {} : optionsOrToken;
  const actualToken = typeof optionsOrToken === 'string' ? optionsOrToken : token;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (options.from != null) params.set('from', options.from);
  if (options.to != null) params.set('to', options.to);
  if (options.q != null && String(options.q).trim() !== '') params.set('q', String(options.q).trim());
  return adminRequest(`/assessment-3-submissions?${params}`, { method: 'GET' }, actualToken);
};

/** GET /admin/assessment-3-submissions/:id — single submission with questionResults. */
export const getAssessment3SubmissionById = async (id, token = getStoredToken()) => {
  return adminRequest(`/assessment-3-submissions/${encodeURIComponent(id)}`, { method: 'GET' }, token);
};

/** GET /admin/assessment-4-submissions — list with pagination. options: { from, to, q }. */
export const getAssessment4Submissions = async (page = 1, limit = 50, optionsOrToken = {}, token = getStoredToken()) => {
  const options = typeof optionsOrToken === 'string' ? {} : optionsOrToken;
  const actualToken = typeof optionsOrToken === 'string' ? optionsOrToken : token;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (options.from != null) params.set('from', options.from);
  if (options.to != null) params.set('to', options.to);
  if (options.q != null && String(options.q).trim() !== '') params.set('q', String(options.q).trim());
  return adminRequest(`/assessment-4-submissions?${params}`, { method: 'GET' }, actualToken);
};

/** GET /admin/assessment-4-submissions/:id — single submission with questionResults. */
export const getAssessment4SubmissionById = async (id, token = getStoredToken()) => {
  return adminRequest(`/assessment-4-submissions/${encodeURIComponent(id)}`, { method: 'GET' }, token);
};

/** GET /admin/assessment-5-submissions — list with pagination. options: { from, to, q }. */
export const getAssessment5Submissions = async (page = 1, limit = 50, optionsOrToken = {}, token = getStoredToken()) => {
  const options = typeof optionsOrToken === 'string' ? {} : optionsOrToken;
  const actualToken = typeof optionsOrToken === 'string' ? optionsOrToken : token;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (options.from != null) params.set('from', options.from);
  if (options.to != null) params.set('to', options.to);
  if (options.q != null && String(options.q).trim() !== '') params.set('q', String(options.q).trim());
  return adminRequest(`/assessment-5-submissions?${params}`, { method: 'GET' }, actualToken);
};

/** GET /admin/assessment-5-submissions/:id — single submission with questionResults. */
export const getAssessment5SubmissionById = async (id, token = getStoredToken()) => {
  return adminRequest(`/assessment-5-submissions/${encodeURIComponent(id)}`, { method: 'GET' }, token);
};

/** GET /admin/missing-leads — list with pagination. Leads in Assessment 3 not in activation form. options: { from, to, q }. */
export const getMissingLeads = async (page = 1, limit = 50, optionsOrToken = {}, token = getStoredToken()) => {
  const options = typeof optionsOrToken === 'string' ? {} : optionsOrToken;
  const actualToken = typeof optionsOrToken === 'string' ? optionsOrToken : token;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (options.from != null) params.set('from', options.from);
  if (options.to != null) params.set('to', options.to);
  if (options.q != null && String(options.q).trim() !== '') params.set('q', String(options.q).trim());
  return adminRequest(`/missing-leads?${params}`, { method: 'GET' }, actualToken);
};

// —— Announcements ——
export const getAnnouncements = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  const query = search.toString();
  return adminRequest(`/announcements${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

export const getAnnouncementById = async (id, token = getStoredToken()) => {
  return adminRequest(`/announcements/${encodeURIComponent(id)}`, { method: 'GET' }, token);
};

export const getAnnouncementAnalytics = async (id, token = getStoredToken()) => {
  return adminRequest(`/announcements/${encodeURIComponent(id)}/analytics`, { method: 'GET' }, token);
};

export const createAnnouncement = async (payload, token = getStoredToken()) => {
  return adminRequest('/announcements', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
};

export const updateAnnouncement = async (id, payload, token = getStoredToken()) => {
  return adminRequest(`/announcements/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
};

export const deleteAnnouncement = async (id, token = getStoredToken()) => {
  return adminRequest(`/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' }, token);
};

export const publishAnnouncement = async (id, token = getStoredToken()) => {
  return adminRequest(`/announcements/${encodeURIComponent(id)}/publish`, { method: 'POST' }, token);
};

export const unpublishAnnouncement = async (id, token = getStoredToken()) => {
  return adminRequest(`/announcements/${encodeURIComponent(id)}/unpublish`, { method: 'POST' }, token);
};

/** Request to /api/influencer-links and /api/influencer-analytics (admin auth, no /admin prefix). */
async function influencerRequest(path, options = {}, token = getStoredToken()) {
  const url = `${getApiBaseUrl()}${path}`;
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
      if (response.status === 401) {
        notifyAdminUnauthorized({ endpoint: path, status: 401 });
      }
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

export const deleteInfluencerLink = async (id, token = getStoredToken()) => {
  return influencerRequest(`/influencer-links/${id}`, { method: 'DELETE' }, token);
};

export const updateInfluencerLink = async (id, payload, token = getStoredToken()) => {
  return influencerRequest(`/influencer-links/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
};

export const getInfluencerAnalytics = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  return influencerRequest(`/influencer-analytics${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

export const getInfluencerAnalyticsTrend = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  const query = search.toString();
  return influencerRequest(`/influencer-analytics/trend${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

// ——— Webinar Progress (Admin) ———

function appendWebinarProgressFilterParams(search, params) {
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  if (params.search) search.set('search', params.search);
  if (params.sort) search.set('sort', params.sort);
  if (params.filterMode) search.set('filterMode', params.filterMode);
  if (params.firstJoinedFrom) search.set('firstJoinedFrom', params.firstJoinedFrom);
  else if (params.from) search.set('from', params.from);
  if (params.firstJoinedTo) search.set('firstJoinedTo', params.firstJoinedTo);
  else if (params.to) search.set('to', params.to);
  if (params.activeOn) search.set('activeOn', params.activeOn);
  if (params.modulesMin != null && params.modulesMin !== '') search.set('modulesMin', String(params.modulesMin));
  if (params.modulesMax != null && params.modulesMax !== '') search.set('modulesMax', String(params.modulesMax));
  if (params.modulesBucket) search.set('modulesBucket', params.modulesBucket);
  if (params.progressMin != null && params.progressMin !== '') search.set('progressMin', String(params.progressMin));
  if (params.progressMax != null && params.progressMax !== '') search.set('progressMax', String(params.progressMax));
  if (params.lastActiveModule) search.set('lastActiveModule', params.lastActiveModule);
  if (params.activity) search.set('activity', params.activity);
  if (params.status) {
    const s = Array.isArray(params.status) ? params.status.join(',') : params.status;
    if (s) search.set('status', s);
  }
}

export const getWebinarProgressList = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  appendWebinarProgressFilterParams(search, params);
  const query = search.toString();
  return adminRequest(`/webinar-progress${query ? `?${query}` : ''}`, { method: 'GET', cache: 'no-store' }, token);
};

export const getWebinarProgressStats = async (paramsOrToken = {}, token = getStoredToken()) => {
  const params = typeof paramsOrToken === 'string' ? {} : (paramsOrToken || {});
  const actualToken = typeof paramsOrToken === 'string' ? paramsOrToken : token;
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  const query = search.toString();
  return adminRequest(`/webinar-progress/stats${query ? `?${query}` : ''}`, { method: 'GET', cache: 'no-store' }, actualToken);
};

export const getWebinarProgressDetail = async (phone, token = getStoredToken()) => {
  return adminRequest(`/webinar-progress/${encodeURIComponent(phone)}`, { method: 'GET', cache: 'no-store' }, token);
};

export const getWebinarUserAssessments = async (phone, token = getStoredToken()) => {
  return adminRequest(`/webinar-progress/${encodeURIComponent(phone)}/assessments`, { method: 'GET', cache: 'no-store' }, token);
};

export const adminUpdateWebinarProgress = async (phone, payload, token = getStoredToken()) => {
  return adminRequest(`/webinar-progress/${encodeURIComponent(phone)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    cache: 'no-store',
  }, token);
};

export const bulkWebinarProgress = async (payload, token = getStoredToken()) => {
  return adminRequest('/webinar-progress/bulk', {
    method: 'POST',
    body: JSON.stringify(payload),
    cache: 'no-store',
  }, token);
};

export const getWebinarProgressExport = async (paramsOrToken = {}, token = getStoredToken()) => {
  const params = typeof paramsOrToken === 'string' || paramsOrToken == null ? {} : paramsOrToken;
  const actualToken = typeof paramsOrToken === 'string' ? paramsOrToken : token;
  const search = new URLSearchParams();
  appendWebinarProgressFilterParams(search, params);
  const query = search.toString();
  const url = `${getApiBaseUrl()}/admin/webinar-progress/export${query ? `?${query}` : ''}`;
  const headers = {};
  if (actualToken) headers.Authorization = `Bearer ${actualToken}`;
  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) {
    if (response.status === 401) {
      notifyAdminUnauthorized({ endpoint: '/admin/webinar-progress/export', status: 401 });
    }
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
  let filename = `webinar-progress-${new Date().toISOString().slice(0, 10)}.csv`;
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

export async function getAdminLeadsExport(params = {}, token = getStoredToken()) {
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.selectedSlot) search.set('selectedSlot', params.selectedSlot);
  if (params.slotDate && String(params.slotDate).trim()) search.set('slotDate', String(params.slotDate).trim());
  if (params.utm_content) search.set('utm_content', params.utm_content);
  const query = search.toString();
  const url = `${getApiBaseUrl()}/admin/leads/export${query ? `?${query}` : ''}`;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) {
    if (response.status === 401) {
      notifyAdminUnauthorized({ endpoint: '/admin/leads/export', status: 401 });
    }
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

/** POST /admin/blogs — create blog (admin). */
export const adminCreateBlog = async (payload, token = getStoredToken()) => {
  return adminRequest(
    '/blogs',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token
  );
};

/** PUT /admin/blogs/:id — update blog (admin). */
export const adminUpdateBlog = async (id, payload, token = getStoredToken()) => {
  return adminRequest(
    `/blogs/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    token
  );
};

/** DELETE /admin/blogs/:id — delete blog (admin). */
export const adminDeleteBlog = async (id, token = getStoredToken()) => {
  return adminRequest(`/blogs/${encodeURIComponent(id)}`, { method: 'DELETE' }, token);
};

/** GET /admin/app-settings/osvi — get OSVI toggle state. */
export const getOsviSetting = async (token = getStoredToken()) => {
  return adminRequest('/app-settings/osvi', { method: 'GET' }, token);
};

/**
 * PATCH /admin/app-settings/osvi — update OSVI settings (super-admin only).
 * @param {boolean|{enabled?: boolean, osviAbandonedDelayMs?: number}} input
 */
export const setOsviSetting = async (input, token = getStoredToken()) => {
  const body =
    typeof input === 'boolean'
      ? { enabled: input }
      : (input && typeof input === 'object' ? input : {});
  return adminRequest('/app-settings/osvi', { method: 'PATCH', body: JSON.stringify(body) }, token);
};

/** GET /osvi/call-sessions — list CRM-stored OSVI call sessions (admin auth, no /admin prefix). */
export const getOsviCallSessionsData = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', params.page);
  if (params.limit != null) search.set('limit', params.limit);
  const query = search.toString();
  const url = `${getApiBaseUrl()}/osvi/call-sessions${query ? `?${query}` : ''}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(url, { method: 'GET', headers });
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Invalid response' };
    }
    if (!response.ok) {
      if (response.status === 401) {
        notifyAdminUnauthorized({ endpoint: '/osvi/call-sessions', status: 401 });
      }
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
      ? `Cannot reach server. Check API URL (${getApiBaseUrl()}) and network connectivity.`
      : (error.message || 'Network error');
    return {
      success: false,
      message,
      status: 0,
      error,
    };
  }
};

/** GET /admin/poster-downloads — paginated poster download events. Pass includeStats: true to also get chart aggregates (one round trip). */
export const getPosterDownloads = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', String(params.page));
  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.posterKey) search.set('posterKey', params.posterKey);
  if (params.q) search.set('q', params.q);
  if (params.counsellorId) search.set('counsellorId', params.counsellorId);
  if (params.includeStats === true) search.set('includeStats', '1');
  const query = search.toString();
  return adminRequest(`/poster-downloads${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

/** GET /admin/poster-downloads/stats — aggregates by poster and day. */
export const getPosterDownloadStats = async (params = {}, token = getStoredToken()) => {
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  const query = search.toString();
  return adminRequest(`/poster-downloads/stats${query ? `?${query}` : ''}`, { method: 'GET' }, token);
};

/** GET /admin/posters — list poster templates. */
export const listPosterTemplates = async (token = getStoredToken()) => {
  return adminRequest('/posters', { method: 'GET' }, token);
};

/** GET /admin/posters/:id */
export const getPosterTemplate = async (id, token = getStoredToken()) => {
  return adminRequest(`/posters/${encodeURIComponent(id)}`, { method: 'GET' }, token);
};

/** POST /admin/posters — body: { name, route, svgTemplate, elements } */
export const createPosterTemplate = async (payload, token = getStoredToken()) => {
  return adminRequest('/posters', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
};

/** PUT /admin/posters/:id */
export const updatePosterTemplate = async (id, payload, token = getStoredToken()) => {
  return adminRequest(`/posters/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token);
};

/** DELETE /admin/posters/:id */
export const deletePosterTemplate = async (id, token = getStoredToken()) => {
  return adminRequest(`/posters/${encodeURIComponent(id)}`, { method: 'DELETE' }, token);
};

/** POST /admin/posters/:id/publish */
export const publishPosterTemplate = async (id, token = getStoredToken()) => {
  return adminRequest(`/posters/${encodeURIComponent(id)}/publish`, { method: 'POST' }, token);
};

/** POST /admin/posters/:id/unpublish */
export const unpublishPosterTemplate = async (id, token = getStoredToken()) => {
  return adminRequest(`/posters/${encodeURIComponent(id)}/unpublish`, { method: 'POST' }, token);
};
