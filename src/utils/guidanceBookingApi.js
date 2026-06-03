import { getApiBaseUrl } from './apiBaseUrl';

async function guidanceRequest(endpoint, options = {}) {
  const url = `${getApiBaseUrl()}/guidance-booking${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
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
        ...data,
      };
    }
    return { success: true, status: response.status, ...data };
  } catch (err) {
    return { success: false, message: err.message || 'Network error', status: 0 };
  }
}

export const checkGuidanceMobile = (mobileNumber) =>
  guidanceRequest('/check-mobile', {
    method: 'POST',
    body: JSON.stringify({ mobileNumber }),
  });

export const getGuidanceActiveSlots = () => guidanceRequest('/active-slots', { method: 'GET' });

export const bookGuidanceSlot = (payload) =>
  guidanceRequest('/book-slot', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
