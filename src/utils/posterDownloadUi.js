/**
 * Only iOS Safari needs the full-screen long-press / share flow for poster saves.
 * `<a download>` works on desktop, Android, and non-iOS browsers for blob/data URLs.
 *
 * Do not use ontouchstart, matchMedia, or broad "mobile" UA — those false-positive on PCs.
 */
export function isIOSDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPhone|iPod|iPad/i.test(ua)) return true;
  // iPadOS 13+ Safari reports as Mac
  if (navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1) {
    return true;
  }
  return false;
}
