import DOMPurify from 'dompurify';

/** Sanitize stored SVG for safe injection (strip script/on* handlers). */
export function sanitizePosterSvg(svg) {
  if (!svg || typeof svg !== 'string') return '';
  return DOMPurify.sanitize(svg.trim(), {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_ATTR: ['preserveAspectRatio', 'viewBox'],
  });
}
