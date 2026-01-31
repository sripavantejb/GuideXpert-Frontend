const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Send OTP for Google Meet registration
 */
export const sendMeetOtp = async (name, email, mobile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/meet/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, mobile }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP. Please try again.',
    };
  }
};

/**
 * Verify OTP and register for Google Meet
 * Returns { success, data? } on success, or { success: false, message, status? } on failure.
 */
export const verifyMeetOtp = async (mobile, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/meet/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile, otp }),
    });

    let data;
    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }

    if (!response.ok) {
      console.error('Error verifying OTP:', response.status, data);
      return {
        success: false,
        message: data.message || 'Failed to verify OTP. Please try again.',
        status: response.status,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify OTP. Please try again.',
      status: undefined,
    };
  }
};

/**
 * Mark user as joined (called before redirecting to Meet)
 */
export const markUserJoined = async (mobile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/meet/mark-joined/${mobile}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Don't throw error - this is best effort before redirect
      console.warn('Failed to mark as joined:', data.message);
      return { success: false };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error marking as joined:', error);
    // Don't block the redirect if this fails
    return { success: false };
  }
};
