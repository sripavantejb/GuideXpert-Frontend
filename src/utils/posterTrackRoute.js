/**
 * Normalizes any `/p/...` path, full URL, or slug to the segment after `/p/`
 * (e.g. `/p/wrong-career` → `wrong-career`). Used for poster download analytics.
 */
export function normalizeAutomatedPosterSlug(input) {
  if (input == null || input === '') return '';
  let s = String(input).trim();
  if (!s) return '';
  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      s = u.pathname || '';
    }
  } catch {
    /* ignore */
  }
  s = s.toLowerCase();
  s = s.split('?')[0].split('#')[0];
  const idx = s.indexOf('/p/');
  if (idx !== -1) {
    s = s.slice(idx + 3);
  } else if (s.startsWith('p/')) {
    s = s.slice(2);
  } else {
    s = s.replace(/^\/+/, '');
  }
  s = s.replace(/^\/+/, '').replace(/\/+$/, '');
  return s.slice(0, 200);
}
