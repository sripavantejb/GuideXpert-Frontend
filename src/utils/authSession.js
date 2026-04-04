const ADMIN_UNAUTHORIZED_EVENT = 'guidexpert:admin-unauthorized';
const WEBINAR_UNAUTHORIZED_EVENT = 'guidexpert:webinar-unauthorized';
const COUNSELLOR_UNAUTHORIZED_EVENT = 'guidexpert:counsellor-unauthorized';

function decodeBase64Url(input) {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return atob(padded);
  } catch {
    return null;
  }
}

export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const json = decodeBase64Url(parts[1]);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isJwtExpired(token) {
  const payload = parseJwtPayload(token);
  const exp = Number(payload?.exp);
  if (!Number.isFinite(exp)) return false;
  return Date.now() >= exp * 1000;
}

export function notifyAdminUnauthorized(detail = {}) {
  window.dispatchEvent(new CustomEvent(ADMIN_UNAUTHORIZED_EVENT, { detail }));
}

export function notifyWebinarUnauthorized(detail = {}) {
  window.dispatchEvent(new CustomEvent(WEBINAR_UNAUTHORIZED_EVENT, { detail }));
}

export function onAdminUnauthorized(listener) {
  window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, listener);
  return () => window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, listener);
}

export function onWebinarUnauthorized(listener) {
  window.addEventListener(WEBINAR_UNAUTHORIZED_EVENT, listener);
  return () => window.removeEventListener(WEBINAR_UNAUTHORIZED_EVENT, listener);
}

export function notifyCounsellorUnauthorized(detail = {}) {
  window.dispatchEvent(new CustomEvent(COUNSELLOR_UNAUTHORIZED_EVENT, { detail }));
}

export function onCounsellorUnauthorized(listener) {
  window.addEventListener(COUNSELLOR_UNAUTHORIZED_EVENT, listener);
  return () => window.removeEventListener(COUNSELLOR_UNAUTHORIZED_EVENT, listener);
}
