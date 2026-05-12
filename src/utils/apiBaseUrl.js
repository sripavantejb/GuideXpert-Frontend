/**
 * Single source of truth for the backend `/api` base URL.
 *
 * In dev, when VITE_API_URL is empty or points at the deployed backend, we use
 * relative `/api` so the Vite proxy sends all traffic to the same origin as
 * `verify-otp` (see api.js). Otherwise counsellor/admin calls would hit
 * production while OTP ran against localhost — JWT secret mismatch → 401.
 *
 * If VITE_API_URL is set to an origin without `/api` (e.g. `https://…vercel.app`),
 * `/api` is appended so `/admin/...` requests hit `…/api/admin/...` correctly.
 *
 * In dev, if VITE_API_URL points at localhost/127.0.0.1, we still use relative `/api`
 * so traffic goes through the Vite proxy (VITE_PROXY_TARGET). A bare browser request
 * to localhost:5000 fails with ERR_CONNECTION_REFUSED when the API is down or the
 * port differs. Set VITE_DIRECT_LOCAL_API=true to force a direct absolute URL instead.
 */
export function getApiBaseUrl() {
  const isDev = import.meta.env.DEV;
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  const productionApi = 'https://guide-xpert-backend.vercel.app/api';
  const directLocal =
    String(import.meta.env.VITE_DIRECT_LOCAL_API || '').toLowerCase() === 'true';
  const pointsAtLoopback = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/i.test(
    envUrl
  );
  const useProxyInDev =
    isDev &&
    !directLocal &&
    (!envUrl ||
      envUrl.includes('guide-xpert-backend.vercel.app') ||
      pointsAtLoopback);
  if (useProxyInDev) return '/api';
  const raw = envUrl || productionApi;
  const noTrailing = raw.replace(/\/+$/, '');
  return noTrailing.endsWith('/api') ? noTrailing : `${noTrailing}/api`;
}
