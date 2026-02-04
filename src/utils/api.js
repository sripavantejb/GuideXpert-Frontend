import { getStoredUtm } from './utm';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://guide-xpert-backend.vercel.app/api';

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
    let data;
    
    try {
      data = await response.json();
    } catch (jsonError) {
      // If response is not JSON, get text instead
      const text = await response.text();
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
      return {
        success: false,
        message: data.message || 'An error occurred',
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
 * Verify OTP code
 * @param {string} phone - Phone number
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<{success: boolean, message?: string, verified?: boolean, status?: number}>}
 */
export const verifyOtp = async (phone, otp) => {
  return apiRequest('/verify-otp', {
    method: 'POST',
    body: JSON.stringify({
      phone,
      otp,
    }),
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
