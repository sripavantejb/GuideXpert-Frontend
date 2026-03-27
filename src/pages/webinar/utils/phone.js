/** Last 10 digits for storage scoping and API; null if not a usable phone. */
export function normalizeWebinarPhone10(phone) {
  if (phone == null || phone === '') return null;
  const d = String(phone).replace(/\D/g, '');
  return d.length >= 10 ? d.slice(-10) : null;
}
