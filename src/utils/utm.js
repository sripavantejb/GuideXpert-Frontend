/**
 * UTM capture utilities for first-touch attribution.
 * Persists UTM parameters from the URL to localStorage only on first visit.
 */

const UTM_STORAGE_KEY = 'guidexpert_utm_first_touch';

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

/**
 * Parse UTM parameters from the current URL (or provided search string).
 * @param {string} [search=window.location.search] - Query string to parse
 * @returns {{ utm_source?: string, utm_medium?: string, utm_campaign?: string, utm_content?: string }}
 */
export function parseUtmFromUrl(search = typeof window !== 'undefined' ? window.location.search : '') {
  const params = new URLSearchParams(search);
  const result = {};
  for (const key of UTM_PARAMS) {
    const value = params.get(key);
    if (value != null && value.trim() !== '') {
      result[key] = value.trim();
    }
  }
  return result;
}

/**
 * Get stored first-touch UTM from localStorage (if any).
 * @returns {{ utm_source?: string, utm_medium?: string, utm_campaign?: string, utm_content?: string } | null}
 */
export function getStoredUtm() {
  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const result = {};
    for (const key of UTM_PARAMS) {
      if (parsed[key] != null && typeof parsed[key] === 'string') {
        result[key] = parsed[key];
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

/**
 * Capture UTM from current URL and save to localStorage only if not already set (first-touch).
 * Call once on registration page load.
 */
export function captureUtmFirstTouch() {
  if (typeof window === 'undefined') return;
  const fromUrl = parseUtmFromUrl();
  if (Object.keys(fromUrl).length === 0) return;
  if (getStoredUtm() != null) return;
  try {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fromUrl));
  } catch (e) {
    console.warn('[UTM] Failed to store first-touch UTM', e);
  }
}
