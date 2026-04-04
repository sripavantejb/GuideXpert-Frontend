/**
 * Flatten Django REST Framework–style field errors: { branch_codes: ["msg"] } → readable string.
 * @param {unknown} data
 * @returns {string|null}
 */
export function flattenDrfFieldErrors(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const skip = new Set(['http_status_code', 'res_status', 'success', 'detail']);
  const lines = [];
  for (const [key, val] of Object.entries(data)) {
    if (skip.has(key)) continue;
    if (Array.isArray(val) && val.every((x) => typeof x === 'string')) {
      lines.push(`${key}: ${val.join(' ')}`);
    } else if (val != null && typeof val === 'object' && !Array.isArray(val)) {
      const inner = flattenDrfFieldErrors(val);
      if (inner) lines.push(`${key}: ${inner}`);
    } else if (typeof val === 'string' && val.trim()) {
      lines.push(`${key}: ${val}`);
    }
  }
  return lines.length ? lines.join(' ') : null;
}

/**
 * @param {Record<string, string>} errorMessagesMap - e.g. ERROR_MESSAGES from page
 * @param {object} [errData]
 * @param {string} [fallbackMessage]
 * @param {{ preferResponseFirst?: boolean }} [options] - CollegePredictorPage uses response before mapped status
 */
export function formatPredictorClientError(errorMessagesMap, errData, fallbackMessage, options = {}) {
  const { preferResponseFirst = false } = options;
  const resStatus = errData?.res_status;
  const resp = errData?.response;

  if (preferResponseFirst) {
    if (resp != null && String(resp).trim()) return String(resp);
    if (resStatus && errorMessagesMap[resStatus]) return errorMessagesMap[resStatus];
  } else {
    if (resStatus && errorMessagesMap[resStatus]) return errorMessagesMap[resStatus];
    if (resp != null && String(resp).trim()) return String(resp);
  }

  const drf = flattenDrfFieldErrors(errData);
  if (drf) return drf;
  return fallbackMessage || 'Something went wrong. Please try again.';
}
