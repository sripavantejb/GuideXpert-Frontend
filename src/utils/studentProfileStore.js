/** Client-side student session, profile, and prediction history. */

const SESSION_KEY = 'gx_student_session_v1';
const PROFILES_KEY = 'gx_student_profiles_v1';
const PREDICTIONS_KEY = 'gx_student_predictions_v1';

export const STUDYING_OPTIONS = [
  { value: 'class_10', label: 'Class 10' },
  { value: 'class_11', label: 'Class 11' },
  { value: 'class_12', label: 'Class 12' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'undergrad', label: 'Undergraduate' },
  { value: 'grad', label: 'Graduate / Postgraduate' },
  { value: 'dropper', label: 'Drop year / Repeater' },
  { value: 'other', label: 'Other' },
];

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getStudentSession() {
  const session = readJson(SESSION_KEY, null);
  if (!session?.phone || !session?.verifiedAt) return null;
  return {
    phone: normalizePhone(session.phone),
    fullName: session.fullName || '',
    verifiedAt: session.verifiedAt,
  };
}

export function setStudentSession(session) {
  if (!session?.phone) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  const next = {
    phone: normalizePhone(session.phone),
    fullName: String(session.fullName || '').trim(),
    verifiedAt: session.verifiedAt || new Date().toISOString(),
  };
  writeJson(SESSION_KEY, next);
  return next;
}

export function clearStudentSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getStudentProfile(phone) {
  const key = normalizePhone(phone);
  if (!key) return null;
  const all = readJson(PROFILES_KEY, {});
  return all[key] || null;
}

export function upsertStudentProfile(phone, profile) {
  const key = normalizePhone(phone);
  if (!key) return null;
  const all = readJson(PROFILES_KEY, {});
  const prev = all[key] || {};
  const next = {
    ...prev,
    ...profile,
    phone: key,
    fullName: String(profile.fullName ?? prev.fullName ?? '').trim(),
    age: profile.age != null && profile.age !== '' ? Number(profile.age) : prev.age ?? null,
    currentlyStudying: profile.currentlyStudying ?? prev.currentlyStudying ?? '',
    city: String(profile.city ?? prev.city ?? '').trim(),
    updatedAt: new Date().toISOString(),
    createdAt: prev.createdAt || new Date().toISOString(),
  };
  all[key] = next;
  writeJson(PROFILES_KEY, all);
  return next;
}

export function listStudentPredictions(phone) {
  const key = normalizePhone(phone);
  if (!key) return [];
  const all = readJson(PREDICTIONS_KEY, {});
  const list = Array.isArray(all[key]) ? all[key] : [];
  return [...list].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

/**
 * @param {string} phone
 * @param {{
 *   type: string,
 *   tool: string,
 *   title: string,
 *   summary?: string,
 *   examId?: string,
 *   payload?: object,
 * }} entry
 */
export function addStudentPrediction(phone, entry) {
  const key = normalizePhone(phone);
  if (!key || !entry?.type || !entry?.title) return null;
  const all = readJson(PREDICTIONS_KEY, {});
  const list = Array.isArray(all[key]) ? all[key] : [];
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: entry.type,
    tool: entry.tool || entry.type,
    title: entry.title,
    summary: entry.summary || '',
    examId: entry.examId || null,
    payload: entry.payload || {},
    createdAt: new Date().toISOString(),
  };
  all[key] = [item, ...list].slice(0, 100);
  writeJson(PREDICTIONS_KEY, all);
  return item;
}

export function studyingLabel(value) {
  return STUDYING_OPTIONS.find((o) => o.value === value)?.label || value || '—';
}

export { normalizePhone };
