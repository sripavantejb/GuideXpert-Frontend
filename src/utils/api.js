import { getStoredUtm } from './utm';
import { notifyWebinarUnauthorized } from './authSession';
import { getApiBaseUrl } from './apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const config = { ...options, headers };

  // Log request in development
  if (import.meta.env.DEV) {
    console.log(`[API Request] ${options.method || 'GET'} ${endpoint}`, {
      url,
      body: options.body ? JSON.parse(options.body) : undefined,
    });
  }

  try {
    const response = await fetch(url, config);
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error('[API] Non-JSON response:', text);
      return {
        success: false,
        message: 'Invalid response from server',
        status: response.status,
        data: { raw: text },
      };
    }

    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${endpoint}`, {
        status: response.status,
        ok: response.ok,
        data,
      });
    }

    if (!response.ok) {
      const authHeader = options?.headers?.Authorization || options?.headers?.authorization;
      const hasBearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ');
      const isWebinarEndpoint =
        endpoint.startsWith('/webinar-progress') || endpoint.startsWith('/webinar-assessment');
      if (response.status === 401 && hasBearer && isWebinarEndpoint) {
        notifyWebinarUnauthorized({
          endpoint,
          status: 401,
          code: data && typeof data === 'object' ? data.code : undefined,
        });
      }
      const fromBody =
        data && typeof data === 'object'
          ? data.message || data.error || (typeof data.detail === 'string' ? data.detail : null)
          : null;
      const byStatus =
        response.status === 502 || response.status === 503 || response.status === 504
          ? import.meta.env.DEV
            ? 'Service unavailable. Check VITE_PROXY_TARGET (default is the deployed backend) or run local backend on port 5000 with VITE_PROXY_TARGET=http://localhost:5000.'
            : 'Service temporarily unavailable. Please try again in a moment.'
          : response.status === 404
            ? 'API endpoint not found. Check VITE_API_URL or the /api proxy.'
            : null;
      return {
        success: false,
        message: fromBody || byStatus || `Request failed (${response.status})`,
        status: response.status,
        data: data,
      };
    }

    return {
      success: true,
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error('[API Request Error]', endpoint, error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      status: 0,
      error: error,
    };
  }
}

/**
 * Send OTP to WhatsApp number
 * @param {string} fullName - User's full name
 * @param {string} whatsappNumber - WhatsApp phone number
 * @param {string} occupation - User's occupation
 * @returns {Promise<{success: boolean, message?: string, status?: number}>}
 */
export const sendOtp = async (fullName, whatsappNumber, occupation) => {
  const body = {
    fullName,
    whatsappNumber,
    occupation,
  };
  return apiRequest('/send-otp', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * Verify OTP code. Same method as registration form; for counsellor login pass { counsellorLogin: true }, for webinar pass { webinarLogin: true } to get token in response.
 * @param {string} phone - Phone number
 * @param {string} otp - 6-digit OTP code
 * @param {{ counsellorLogin?: boolean, webinarLogin?: boolean }} [options] - counsellorLogin or webinarLogin: true for token + user on success
 * @returns {Promise<{success: boolean, message?: string, data?: { verified?: boolean, allowedAccess?: boolean, token?: string, user?: object }, status?: number}>}
 */
export const verifyOtp = async (phone, otp, options = {}) => {
  const phoneStr = String(phone ?? '');
  const body = {
    phone: phoneStr,
    whatsappNumber: phoneStr,
    otp: String(otp ?? ''),
  };
  if (options.counsellorLogin === true) {
    body.counsellorLogin = true;
  }
  if (options.webinarLogin === true) {
    body.webinarLogin = true;
  }
  return apiRequest('/verify-otp', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * Save Step 1 data to MongoDB
 * @param {string} fullName - User's full name
 * @param {string} whatsappNumber - WhatsApp phone number
 * @param {string} occupation - User's occupation
 * @param {{ utm_source?: string, utm_medium?: string, utm_campaign?: string, utm_content?: string }} [utm] - Optional first-touch UTM data
 * @returns {Promise<{success: boolean, message?: string, status?: number}>}
 */
export const saveStep1 = async (fullName, whatsappNumber, occupation, utm) => {
  const payload = {
    fullName,
    whatsappNumber,
    occupation,
    phone: whatsappNumber,
  };
  if (utm && typeof utm === 'object') {
    if (utm.utm_source != null) payload.utm_source = utm.utm_source;
    if (utm.utm_medium != null) payload.utm_medium = utm.utm_medium;
    if (utm.utm_campaign != null) payload.utm_campaign = utm.utm_campaign;
    if (utm.utm_content != null) payload.utm_content = utm.utm_content;
  }
  return apiRequest('/save-step1', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Fetch available demo slots (dynamic by day/time in IST)
 * @returns {Promise<{success: boolean, data?: {slots: Array<{id: string, label: string, date: string}>}, status?: number}>}
 */
export const getDemoSlots = async () => {
  return apiRequest('/demo-slots', {
    method: 'GET',
  });
};

/**
 * Save Step 2 data to MongoDB (OTP verification)
 * @param {string} phone - Phone number
 * @param {{ utm_source?: string, utm_medium?: string, utm_campaign?: string, utm_content?: string }} [utm] - Optional first-touch UTM data
 * @returns {Promise<{success: boolean, message?: string, status?: number}>}
 */
export const saveStep2 = async (phone, utm) => {
  const payload = { phone };
  if (utm && typeof utm === 'object') {
    if (utm.utm_source != null) payload.utm_source = utm.utm_source;
    if (utm.utm_medium != null) payload.utm_medium = utm.utm_medium;
    if (utm.utm_campaign != null) payload.utm_campaign = utm.utm_campaign;
    if (utm.utm_content != null) payload.utm_content = utm.utm_content;
  }
  return apiRequest('/save-step2', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Save Step 3 data to MongoDB (Slot booking)
 * @param {string} phone - Phone number
 * @param {string} selectedSlot - 'SATURDAY_7PM' or 'SUNDAY_3PM'
 * @param {string|Date} slotDate - ISO date string or Date object for the slot
 * @param {{ utm_source?: string, utm_medium?: string, utm_campaign?: string, utm_content?: string }} [utm] - Optional first-touch UTM data
 * @param {{ scheduleOsviOutbound?: boolean }} [options] - Counselor Apply: schedule OSVI outbound ~2 min after save (processed by backend cron)
 * @returns {Promise<{success: boolean, message?: string, data?: {selectedSlot: string, slotDate: Date}, status?: number}>}
 */
export const saveStep3 = async (phone, selectedSlot, slotDate, utm, options = {}) => {
  const payload = {
    phone,
    selectedSlot,
    slotDate: slotDate instanceof Date ? slotDate.toISOString() : slotDate,
  };
  if (utm && typeof utm === 'object') {
    if (utm.utm_source != null) payload.utm_source = utm.utm_source;
    if (utm.utm_medium != null) payload.utm_medium = utm.utm_medium;
    if (utm.utm_campaign != null) payload.utm_campaign = utm.utm_campaign;
    if (utm.utm_content != null) payload.utm_content = utm.utm_content;
  }
  if (options.scheduleOsviOutbound === true) {
    payload.scheduleOsviOutbound = true;
  }
  return apiRequest('/save-step3', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Check registration status by phone number
 * @param {string} phone - Phone number
 * @returns {Promise<{success: boolean, isRegistered?: boolean, registeredAt?: Date, slotInfo?: Object, status?: number}>}
 */
export const checkRegistrationStatus = async (phone) => {
  return apiRequest(`/check-registration/${phone}`, {
    method: 'GET',
  });
};

/**
 * Save post-registration data (interest level and email)
 * @param {string} phone - Phone number
 * @param {number} interestLevel - Interest level from 1 to 5
 * @param {string} email - User's email address
 * @param {{ utm_source?: string, utm_medium?: string, utm_campaign?: string, utm_content?: string }} [utm] - Optional first-touch UTM data
 * @returns {Promise<{success: boolean, message?: string, status?: number}>}
 */
export const savePostRegistrationData = async (phone, interestLevel, email, utm) => {
  const payload = { phone, interestLevel, email };
  if (utm && typeof utm === 'object') {
    if (utm.utm_source != null) payload.utm_source = utm.utm_source;
    if (utm.utm_medium != null) payload.utm_medium = utm.utm_medium;
    if (utm.utm_campaign != null) payload.utm_campaign = utm.utm_campaign;
    if (utm.utm_content != null) payload.utm_content = utm.utm_content;
  }
  return apiRequest('/save-post-registration', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Submit application form
 * @param {Object} formData - Application form data (may include utm_source, utm_medium, utm_campaign, utm_content)
 * @param {string} formData.fullName - User's full name
 * @param {string} formData.whatsappNumber - WhatsApp phone number
 * @param {string} formData.occupation - User's occupation
 * @param {string} formData.demoInterest - 'YES_SOON' or 'MAYBE_LATER'
 * @param {string} formData.selectedSlot - 'SATURDAY_7PM' or 'SUNDAY_3PM' (optional if MAYBE_LATER)
 * @returns {Promise<{success: boolean, message?: string, status?: number}>}
 */
export const submitApplication = async (formData) => {
  const payload = { ...formData };
  const utm = getStoredUtm();
  if (utm) {
    if (payload.utm_source == null) payload.utm_source = utm.utm_source;
    if (payload.utm_medium == null) payload.utm_medium = utm.utm_medium;
    if (payload.utm_campaign == null) payload.utm_campaign = utm.utm_campaign;
    if (payload.utm_content == null) payload.utm_content = utm.utm_content;
  }
  return apiRequest('/submit-application', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Check demo meet join eligibility (booked slot window: 5 min before start until slot end).
 * @param {string} mobileNumber - 10-digit (or normalizable) mobile
 * @returns {Promise<{success: boolean, message?: string, data?: { status?: string, message?: string, joinOpensAtLabel?: string, slotStartLabel?: string }, status?: number}>}
 */
export const checkMeetingDemoEligibility = async (mobileNumber) => {
  return apiRequest('/meeting/demo-eligibility', {
    method: 'POST',
    body: JSON.stringify({ mobileNumber }),
  });
};

/**
 * Register for meeting (saves name and mobile, then redirect to Meet link on success)
 * @param {string} name - User's full name
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {Promise<{success: boolean, message?: string, data?: Object, status?: number}>}
 */
export const registerForMeeting = async (name, mobileNumber) => {
  return apiRequest('/meeting/register', {
    method: 'POST',
    body: JSON.stringify({ name, mobileNumber }),
  });
};

/**
 * Register for training meeting (saves name and mobile to training attendance, then redirect to training Meet link)
 * @param {string} name - User's full name
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {Promise<{success: boolean, message?: string, data?: Object, status?: number}>}
 */
export const registerForTraining = async (name, mobileNumber) => {
  return apiRequest('/training/register', {
    method: 'POST',
    body: JSON.stringify({ name, mobileNumber }),
  });
};

/**
 * Submit training feedback form.
 * @param {Object} payload - { name, mobileNumber, whatsappNumber, email, addressOfCommunication, occupation, dateOfBirth, gender, educationQualification, yearsOfExperience }
 * @returns {Promise<{success: boolean, message?: string, data?: Object, status?: number}>}
 */
export const submitTrainingFeedback = async (payload) => {
  return apiRequest('/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Submit training form (interest/feedback) — fullName, mobileNumber, email, occupation, sessionRating 1–5, suggestions optional.
 * @param {Object} payload - { fullName, mobileNumber, email, occupation, sessionRating, suggestions? }
 * @returns {Promise<{success: boolean, message?: string, data?: Object, status?: number}>}
 */
export const submitTrainingFormResponse = async (payload) => {
  return apiRequest('/training-form', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Check if this mobile already submitted the public training form (live or legacy DB row).
 * @param {string} phone - Phone string (digits normalized to 10)
 * @returns {Promise<{ success: boolean, submitted?: boolean, message?: string, status?: number }>}
 */
export const checkTrainingFormSubmitted = async (phone) => {
  const digits = String(phone ?? '')
    .replace(/\D/g, '')
    .slice(-10)
    .slice(0, 10);
  if (digits.length !== 10) {
    return { success: false, submitted: false, message: 'Valid 10-digit mobile required' };
  }
  const result = await apiRequest(`/training-form/check/${encodeURIComponent(digits)}`, {
    method: 'GET',
  });
  if (!result.success) {
    return {
      success: false,
      submitted: false,
      message: result.message,
      status: result.status,
    };
  }
  const body = result.data;
  const submitted = typeof body?.submitted === 'boolean' ? body.submitted : false;
  return { success: true, submitted };
};

/**
 * Check if mobile number is eligible for poster download (exists in training feedbacks).
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {Promise<{success: boolean, eligible?: boolean, message?: string, data?: Object, status?: number}>}
 */
export const checkPosterEligibility = async (mobileNumber) => {
  return apiRequest('/counsellor/poster-eligibility', {
    method: 'POST',
    body: JSON.stringify({ mobileNumber: String(mobileNumber || '').replace(/\D/g, '').slice(0, 10) }),
  });
};

/**
 * Check if mobile number exists in AssessmentSubmission3 (training completed).
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {Promise<{success: boolean, eligible?: boolean, data?: { exists?: boolean, phone?: string }, message?: string, status?: number}>}
 */
export const checkAssessment3Eligibility = async (mobileNumber) => {
  const phone = String(mobileNumber || '').replace(/\D/g, '').slice(0, 10);
  const result = await apiRequest(`/assessment-3/check?phone=${encodeURIComponent(phone)}`, {
    method: 'GET',
  });
  if (!result.success) return result;
  const payload = result.data?.data ?? result.data;
  return {
    ...result,
    eligible: Boolean(payload?.exists ?? result.data?.eligible ?? false),
  };
};

export const checkActivationEligibility = async (mobileNumber) => {
  const phone = String(mobileNumber || '').replace(/\D/g, '').slice(0, 10);
  const result = await apiRequest(`/assessment-3/check-activation?phone=${encodeURIComponent(phone)}`, {
    method: 'GET',
  });
  if (!result.success) return result;
  const payload = result.data?.data ?? result.data;
  return {
    ...result,
    eligible: Boolean(payload?.exists ?? result.data?.eligible ?? false),
  };
};

/**
 * Submit counsellor assessment (after OTP verification).
 * @param {string} name - User's full name
 * @param {string} phone - 10-digit phone number
 * @param {Object} answers - Map of question id to answer (e.g. { q1: "...", q11: "..." })
 * @returns {Promise<{success: boolean, message?: string, data?: { score, maxScore }, status?: number}>}
 */
export const submitAssessment = async (name, phone, answers) => {
  return apiRequest('/assessment/submit', {
    method: 'POST',
    body: JSON.stringify({ name, phone, answers }),
  });
};

/**
 * Submit counsellor assessment 2 (after OTP verification).
 * @param {string} name - User's full name
 * @param {string} phone - 10-digit phone number
 * @param {Object} answers - Map of question id to answer (q1–q15)
 * @returns {Promise<{success: boolean, message?: string, data?: { score, maxScore }, status?: number}>}
 */
export const submitAssessment2 = async (name, phone, answers) => {
  return apiRequest('/assessment-2/submit', {
    method: 'POST',
    body: JSON.stringify({ name, phone, answers }),
  });
};

/**
 * Submit counsellor assessment 3 (after OTP verification).
 * @param {string} name - User's full name
 * @param {string} phone - 10-digit phone number
 * @param {Object} answers - Map of question id to answer (q1–q20)
 * @returns {Promise<{success: boolean, message?: string, data?: { score, maxScore }, status?: number}>}
 */
export const submitAssessment3 = async (name, phone, answers) => {
  return apiRequest('/assessment-3/submit', {
    method: 'POST',
    body: JSON.stringify({ name, phone, answers }),
  });
};

/**
 * Submit counsellor assessment 4 (after OTP verification).
 */
export const submitAssessment4 = async (name, phone, answers) => {
  return apiRequest('/assessment-4/submit', {
    method: 'POST',
    body: JSON.stringify({ name, phone, answers }),
  });
};

/**
 * Submit counsellor assessment 5 (after OTP verification).
 */
export const submitAssessment5 = async (name, phone, answers) => {
  return apiRequest('/assessment-5/submit', {
    method: 'POST',
    body: JSON.stringify({ name, phone, answers }),
  });
};

/**
 * Submit webinar in-panel assessment (a1–a5). Saves an attempt to DB.
 * @param {string} assessmentId - 'a1' | 'a2' | 'a3' | 'a4' | 'a5'
 * @param {{ score: number, total: number, results: Array<{ questionId, text?, correct, userAnswer, correctAnswer }>, answers: Object }} payload
 * @param {string} [webinarToken] - Optional webinar JWT (from useWebinarAuth) to associate submission with user
 * @returns {Promise<{ success: boolean, message?: string, data?: Object, status?: number }>}
 */
export const submitWebinarAssessment = async (assessmentId, payload, webinarToken) => {
  const headers = { 'Content-Type': 'application/json' };
  if (webinarToken && typeof webinarToken === 'string') {
    headers.Authorization = `Bearer ${webinarToken}`;
  }
  return apiRequest('/webinar-assessment/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      assessmentId,
      score: payload.score,
      total: payload.total,
      results: payload.results || [],
      answers: payload.answers || {},
    }),
  });
};

/**
 * Fetch webinar assessment attempt history (latest first).
 * @param {string} assessmentId - 'a1' | 'a2' | 'a3' | 'a4' | 'a5'
 * @param {string} [webinarToken] - Webinar JWT (required for user history)
 * @param {number} [limit=5]
 * @returns {Promise<{ success: boolean, message?: string, data?: { attempts: Array<{ score: number, total: number, submittedAt: string }> }, status?: number }>}
 */
export const getWebinarAssessmentHistory = async (assessmentId, webinarToken, limit = 5) => {
  const headers = { 'Content-Type': 'application/json' };
  if (webinarToken && typeof webinarToken === 'string') {
    headers.Authorization = `Bearer ${webinarToken}`;
  }
  const safeLimit = Math.max(1, Math.min(20, Number(limit) || 5));
  return apiRequest(
    `/webinar-assessment/history?assessmentId=${encodeURIComponent(assessmentId)}&limit=${safeLimit}`,
    {
      method: 'GET',
      headers,
    }
  );
};

const ASSESSMENT_UTM_KEY = 'guidexpert_assessment_utm';

/**
 * Store UTM for current assessment session (sessionStorage). Call on assessment page load.
 * @param {{ utm_source?: string, utm_medium?: string, utm_campaign?: string, utm_content?: string }} utm
 */
export const setAssessmentUtm = (utm) => {
  if (typeof sessionStorage === 'undefined' || !utm || typeof utm !== 'object') return;
  try {
    sessionStorage.setItem(ASSESSMENT_UTM_KEY, JSON.stringify(utm));
  } catch (e) {
    console.warn('[setAssessmentUtm]', e);
  }
};

/**
 * Get stored assessment UTM from session (for submit payload).
 */
export const getAssessmentUtm = () => {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ASSESSMENT_UTM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Submit Career DNA assessment (after OTP). Sends name, phone, answers, UTM, and optional email/school/class.
 */
export const submitCareerDnaAssessment = async (name, phone, answers, utm = null, extra = {}) => {
  const body = { name, phone, answers, ...extra };
  if (utm && typeof utm === 'object') {
    if (utm.utm_source != null) body.utm_source = utm.utm_source;
    if (utm.utm_medium != null) body.utm_medium = utm.utm_medium;
    if (utm.utm_campaign != null) body.utm_campaign = utm.utm_campaign;
    if (utm.utm_content != null) body.utm_content = utm.utm_content;
  }
  return apiRequest('/assessment-career-dna/submit', { method: 'POST', body: JSON.stringify(body) });
};

/**
 * Submit Course Fit assessment (after OTP). Sends name, phone, answers, UTM, and optional email/school/class.
 */
export const submitCourseFitAssessment = async (name, phone, answers, utm = null, extra = {}) => {
  const body = { name, phone, answers, ...extra };
  if (utm && typeof utm === 'object') {
    if (utm.utm_source != null) body.utm_source = utm.utm_source;
    if (utm.utm_medium != null) body.utm_medium = utm.utm_medium;
    if (utm.utm_campaign != null) body.utm_campaign = utm.utm_campaign;
    if (utm.utm_content != null) body.utm_content = utm.utm_content;
  }
  return apiRequest('/assessment-course-fit/submit', { method: 'POST', body: JSON.stringify(body) });
};

/**
 * Create or update a webinar certificate record (for view-by-ID).
 * @param {{ certificateId?: string, fullName: string, dateIssued: string, mobileNumber?: string }} payload - Use mobileNumber for one ID per user; use certificateId for legacy upsert.
 * @returns {Promise<{success: boolean, data?: { certificateId, fullName, dateIssued } | { success: true, data: ... }, status?: number}>}
 */
export const createCertificateRecord = async (payload) => {
  return apiRequest('/certificate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Get or create a certificate for the current user (by mobile). Returns the same certificate ID for the same mobile.
 * @param {{ fullName: string, dateIssued: string, mobileNumber: string }} params
 * @returns {Promise<{success: boolean, data?: { certificateId, fullName, dateIssued }, status?: number}>}
 */
export const getOrCreateCertificateForUser = async ({ fullName, dateIssued, mobileNumber }) => {
  return apiRequest('/certificate', {
    method: 'POST',
    body: JSON.stringify({ fullName, dateIssued, mobileNumber: String(mobileNumber ?? '').trim() }),
  });
};

/**
 * Migrate existing certificate (by mobile) from legacy UUID to short GX id.
 * @param {string} mobileNumber - 10-digit mobile
 * @returns {Promise<{success: boolean, data?: { certificateId } }>}
 */
export const migrateCertificateToShortId = async (mobileNumber) => {
  return apiRequest('/certificate/migrate-short-id', {
    method: 'POST',
    body: JSON.stringify({ mobileNumber: String(mobileNumber ?? '').trim() }),
  });
};

/**
 * Get certificate by ID (public).
 * @param {string} id - certificateId
 * @returns {Promise<{success: boolean, data?: { certificateId, fullName, dateIssued }, status?: number}>}
 */
export const getCertificateById = async (id) => {
  return apiRequest(`/certificate/${encodeURIComponent(id)}`, { method: 'GET' });
};

/**
 * Get predicted colleges from the public College Predictor API (no auth).
 * Same request/response shape as the counsellor endpoint for consistent UI handling.
 * @param {{ offset?: number, limit?: number, entrance_exam_name_enum: string, admission_category_name_enum: string, cutoff_from: number, cutoff_to: number, reservation_category_code: string, branch_codes?: string[], districts?: string[], sort_order?: string }} params
 * @returns {Promise<{ success: boolean, data?: { total_no_of_colleges: number, admission_category_name: string, colleges: object[], _demo?: boolean }, message?: string, status?: number }>}
 */
export const getPredictedCollegesPublic = async (params = {}) => {
  const { offset = 0, limit = 10, ...body } = params;
  const query = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  return apiRequest(`/college-predictor/colleges?${query.toString()}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

// ——— Webinar Progress ———

export const syncWebinarProgress = async (token, payload) => {
  return apiRequest('/webinar-progress/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
};

export const getWebinarProgress = async (token) => {
  return apiRequest('/webinar-progress', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
};

export const recordCertificateDownload = async (token) => {
  return apiRequest('/webinar-progress/certificate-downloaded', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
};

export const syncWebinarProgressBeacon = (token, payload) => {
  const url = `${API_BASE_URL}/webinar-progress/sync`;
  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // best-effort on page unload
  }
};

/**
 * Predict rank/percentile from public rank predictor API.
 * @param {{ examId: string, score: number, options?: Record<string, unknown> }} payload
 * @returns {Promise<{ success: boolean, data?: object, message?: string, status?: number }>}
 */
export const predictRankPublic = async (payload) => {
  const result = await apiRequest('/rank-predictor/predict', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!result.success) {
    const errorMessage = result?.data?.error?.message || result.message || 'Could not generate prediction.';
    return {
      ...result,
      message: errorMessage,
    };
  }

  return {
    ...result,
    // Backend returns: { success: true, data: {...prediction} }
    // apiRequest wraps that as result.data, so unwrap once here.
    data: result?.data?.data || result.data,
  };
};
