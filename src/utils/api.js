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
 * @returns {Promise<{success: boolean, message?: string, status?: number}>}
 */
export const saveStep1 = async (fullName, whatsappNumber, occupation) => {
  return apiRequest('/save-step1', {
    method: 'POST',
    body: JSON.stringify({
      fullName,
      whatsappNumber,
      occupation,
      phone: whatsappNumber,
    }),
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
 * @returns {Promise<{success: boolean, message?: string, status?: number}>}
 */
export const saveStep2 = async (phone) => {
  return apiRequest('/save-step2', {
    method: 'POST',
    body: JSON.stringify({
      phone,
    }),
  });
};

/**
 * Save Step 3 data to MongoDB (Slot booking)
 * @param {string} phone - Phone number
 * @param {string} selectedSlot - 'SATURDAY_7PM' or 'SUNDAY_3PM'
 * @param {string|Date} slotDate - ISO date string or Date object for the slot
 * @returns {Promise<{success: boolean, message?: string, data?: {selectedSlot: string, slotDate: Date}, status?: number}>}
 */
export const saveStep3 = async (phone, selectedSlot, slotDate) => {
  return apiRequest('/save-step3', {
    method: 'POST',
    body: JSON.stringify({
      phone,
      selectedSlot,
      slotDate: slotDate instanceof Date ? slotDate.toISOString() : slotDate,
    }),
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
 * @returns {Promise<{success: boolean, message?: string, status?: number}>}
 */
export const savePostRegistrationData = async (phone, interestLevel, email) => {
  return apiRequest('/save-post-registration', {
    method: 'POST',
    body: JSON.stringify({
      phone,
      interestLevel,
      email,
    }),
  });
};

/**
 * Submit application form
 * @param {Object} formData - Application form data
 * @param {string} formData.fullName - User's full name
 * @param {string} formData.whatsappNumber - WhatsApp phone number
 * @param {string} formData.occupation - User's occupation
 * @param {string} formData.demoInterest - 'YES_SOON' or 'MAYBE_LATER'
 * @param {string} formData.selectedSlot - 'SATURDAY_7PM' or 'SUNDAY_3PM' (optional if MAYBE_LATER)
 * @returns {Promise<{success: boolean, message?: string, status?: number}>}
 */
export const submitApplication = async (formData) => {
  return apiRequest('/submit-application', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
};
