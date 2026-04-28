/**
 * Plain JSON-serializable overlay fields for POST/PUT /admin/posters (no stray keys).
 * Mirrors server sanitize rules so Mongoose never sees unexpected shapes.
 */
export function buildOverlayFieldPayload(field, role) {
  const includeXEnd = role === 'name';
  const defaultTextValue = role === 'name' ? 'Sample name' : '98765 43210';
  if (!field || typeof field !== 'object') {
    return includeXEnd
      ? {
          x: 12,
          anchorX: 12,
          anchorType: 'start',
          y: 12,
          textValue: defaultTextValue,
          fontSize: 22,
          color: '#111827',
          fontWeight: '600',
          textAlign: 'left',
        }
      : {
          x: 12,
          anchorX: 12,
          anchorType: 'start',
          y: 24,
          textValue: defaultTextValue,
          fontSize: 18,
          color: '#111827',
          fontWeight: '500',
          textAlign: 'left',
        };
  }
  const x = Number(field.anchorX ?? field.x);
  const y = Number(field.y);
  const defaultWeight = includeXEnd ? '600' : '500';
  const normalizedX = Number.isFinite(x) ? Math.min(100, Math.max(0, x)) : 12;
  const textValue = field.textValue != null ? String(field.textValue).slice(0, 500) : defaultTextValue;
  const out = {
    x: normalizedX,
    anchorX: normalizedX,
    anchorType: ['start', 'end', 'center'].includes(field.anchorType) ? field.anchorType : 'start',
    y: Number.isFinite(y) ? Math.min(100, Math.max(0, y)) : 12,
    textValue,
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
