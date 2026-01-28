const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
