/**
 * Plain JSON-serializable overlay fields for POST/PUT /admin/posters (no stray keys).
 * Mirrors server sanitize rules so Mongoose never sees unexpected shapes.
 */
export function buildOverlayFieldPayload(field, role) {
  const includeXEnd = role === 'name';
  if (!field || typeof field !== 'object') {
    return includeXEnd
      ? { x: 12, y: 12, fontSize: 22, color: '#111827', fontWeight: '600', textAlign: 'left' }
      : { x: 12, y: 24, fontSize: 18, color: '#111827', fontWeight: '500', textAlign: 'left' };
  }
  const x = Number(field.x);
  const y = Number(field.y);
  const defaultWeight = includeXEnd ? '600' : '500';
  const out = {
    x: Number.isFinite(x) ? Math.min(100, Math.max(0, x)) : 12,
    y: Number.isFinite(y) ? Math.min(100, Math.max(0, y)) : 12,
    fontSize: Number.isFinite(Number(field.fontSize)) ? Math.min(400, Math.max(4, Number(field.fontSize))) : 20,
    color: field.color != null ? String(field.color).slice(0, 32) : '#111827',
    fontWeight: field.fontWeight != null ? String(field.fontWeight).slice(0, 32) : defaultWeight,
    textAlign: ['left', 'center', 'right', 'justify'].includes(field.textAlign) ? field.textAlign : 'left',
  };
  if (includeXEnd) {
    const xe = Number(field.xEnd);
    if (Number.isFinite(xe)) {
      const xEnd = Math.min(100, Math.max(0, xe));
      if (xEnd > out.x) out.xEnd = xEnd;
    }
  }
  return out;
}
