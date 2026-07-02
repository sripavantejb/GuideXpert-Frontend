/** Max upload size for poster automation SVG templates. */
export const MAX_POSTER_SVG_BYTES = 3 * 1024 * 1024;

/** Same limit as backend MAX_POSTER_SVG_CHARS (markup length after read/trim). */
export const MAX_POSTER_SVG_CHARS = MAX_POSTER_SVG_BYTES;

export function formatPosterSvgLimitLabel() {
  return '3 MB';
}

export function formatPosterSvgSizeMb(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return '0';
  return (n / (1024 * 1024)).toFixed(1);
}
