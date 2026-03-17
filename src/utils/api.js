import { getStoredUtm } from './utm';

// In dev, use relative /api so Vite proxy forwards to backend (avoids CORS). When .env points at production URL, still use proxy.
const isDev = import.meta.env.DEV;
const envUrl = import.meta.env.VITE_API_URL;
const productionApi = 'https://guide-xpert-backend.vercel.app/api';
const useProxyInDev = isDev && (!envUrl || envUrl.trim() === '' || envUrl.includes('guide-xpert-backend.vercel.app'));
const API_BASE_URL = useProxyInDev ? '/api' : (envUrl || productionApi);

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

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
      data = text ? JSON.parse(text) : null;
    } catch (jsonError) {
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

    const safeData = data ?? {};
    if (!response.ok) {
      return {
        success: false,
        message: safeData.message || 'An error occurred',
        status: response.status,
        data: safeData,
      };
    }

    return {
      success: true,
      data: safeData,
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
  return apiRequest('/send-otp', {
    method: 'POST',
    body: JSON.stringify({
      fullName,
      whatsappNumber,
      occupation,
    }),
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
 * @returns {Promise<{success: boolean, message?: string, data?: {selectedSlot: string, slotDate: Date}, status?: number}>}
 */
export const saveStep3 = async (phone, selectedSlot, slotDate, utm) => {
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
 * Fetch assessment questions by type (1–5). Same shape as Assessment 1 & 2.
 * @param {number} type - 1, 2, 3, 4, or 5
 * @returns {Promise<{success: boolean, data?: { questions: Array<{ id, question, options, correctAnswer }> }, message?: string, status?: number}>}
 */
export const getAssessmentQuestions = async (type) => {
  const t = typeof type === 'number' ? type : parseInt(String(type), 10);
  if (Number.isNaN(t) || t < 1 || t > 5) {
    return { success: false, message: 'Invalid assessment type' };
  }
  return apiRequest(`/assessments?type=${t}`, { method: 'GET' });
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
