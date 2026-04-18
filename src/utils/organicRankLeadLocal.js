/** Client-side snapshot of organic rank predictor lead (student workspace). Version bump if shape changes. */
const STORAGE_KEY = 'gx_organic_rank_lead_v1';

/**
 * @typedef {Object} OrganicRankLeadSnapshot
 * @property {string} examId
 * @property {string} examName
 * @property {number} score
 * @property {string} [difficulty]
 * @property {string} phoneLast4
 * @property {string} fullName
 * @property {boolean} otpVerified
 * @property {string} capturedAt - ISO string
 */

/**
 * @param {OrganicRankLeadSnapshot} payload
 */
export function saveOrganicRankLeadSnapshot(payload) {
  try {
    const raw = JSON.stringify({ ...payload, capturedAt: payload.capturedAt || new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* quota / private mode */
  }
}

/** @returns {OrganicRankLeadSnapshot | null} */
export function readOrganicRankLeadSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.examId !== 'string' || typeof parsed.examName !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearOrganicRankLeadSnapshot() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
