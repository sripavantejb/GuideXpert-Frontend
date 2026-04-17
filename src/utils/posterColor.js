const DEFAULT_HEX = '#111827';

/**
 * Expand #rgb to #rrggbb; lowercase.
 * @param {string} hex
 * @returns {string|null}
 */
function expandShorthandHex(hex) {
  const m = String(hex).trim().match(/^#([0-9a-fA-F]{3})$/);
  if (!m) return null;
  const [a, b, c] = m[1].split('');
  return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
}

/**
 * Valid #rrggbb only.
 * @param {string} hex
 * @returns {string|null}
 */
function parseSixDigitHex(hex) {
  const m = String(hex).trim().match(/^#([0-9a-fA-F]{6})$/);
  if (!m) return null;
  return `#${m[1].toLowerCase()}`;
}

/**
 * Value safe for `<input type="color">` (must be #rrggbb).
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeHexForColorInput(value) {
  const six = parseSixDigitHex(value);
  if (six) return six;
  const three = expandShorthandHex(value);
  if (three) return three;
  return DEFAULT_HEX;
}

/**
 * Safe CSS color for inline styles (preview / export). Falls back if invalid.
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeHexForCss(value) {
  return normalizeHexForColorInput(value);
}

/**
 * Normalize overlay field colors from API or local state.
 * @param {{ color?: string } | null | undefined} field
 * @returns {{ color: string }}
 */
export function normalizeOverlayFieldColors(field) {
  if (!field || typeof field !== 'object') return { color: DEFAULT_HEX };
  return {
    ...field,
    color: normalizeHexForCss(field.color),
  };
}
