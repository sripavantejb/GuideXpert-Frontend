/**
 * Single source of truth for the backend `/api` base URL.
 *
 * In dev, when VITE_API_URL is empty or points at the deployed backend, we use
 * relative `/api` so the Vite proxy sends all traffic to the same origin as
 * `verify-otp` (see api.js). Otherwise counsellor/admin calls would hit
 * production while OTP ran against localhost — JWT secret mismatch → 401.
 */
export function getApiBaseUrl() {
  const isDev = import.meta.env.DEV;
  const envUrl = import.meta.env.VITE_API_URL;
  const productionApi = 'https://guide-xpert-backend.vercel.app/api';
  const useProxyInDev =
    isDev && (!envUrl || envUrl.trim() === '' || envUrl.includes('guide-xpert-backend.vercel.app'));
  return useProxyInDev ? '/api' : (envUrl || productionApi);
}
