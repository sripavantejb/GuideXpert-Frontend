/** Canonical design width for automated posters (public preview + PNG/PDF export). */
export const POSTER_WIDTH_PX = 1080;

/**
 * Max width of the on-screen preview card (CSS px). Design is authored at POSTER_WIDTH_PX; preview is scaled to fit up to this width (admin + /p/).
 * Higher value = larger on-screen text/art vs the same stored fontSize (export stays 1080-wide).
 */
export const POSTER_PREVIEW_MAX_WIDTH_PX = 720;

/** Do not shrink the preview slot below this (keeps drag/scale usable). */
export const POSTER_PREVIEW_MIN_SLOT_PX = 200;

/** 4:5 poster height at 1080px width (fallback when SVG is missing or invalid). */
export const DEFAULT_POSTER_FRAME_HEIGHT_PX = Math.round(POSTER_WIDTH_PX / (4 / 5));

/**
 * Parses width/height from the first SVG viewBox and returns width/height ratio (wide / tall).
 * Matches admin editor geometry ({@see PosterEditorCanvas}).
 */
export function parsePosterSvgAspectRatio(svg) {
  if (!svg || typeof svg !== 'string') return 3 / 4;
  const m = svg.match(/viewBox\s*=\s*["']\s*([\d.\s-]+)\s*["']/i);
  if (!m) return 3 / 4;
  const parts = m[1].trim().split(/\s+/).map(Number);
  if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) return parts[2] / parts[3];
  return 3 / 4;
}

/**
 * Logical design frame: fixed width 1080, height from template aspect (matches admin % overlay space).
 */
export function getDesignFrameSize(svgTemplate) {
  const aspect = parsePosterSvgAspectRatio(svgTemplate);
  const width = POSTER_WIDTH_PX;
  const height = Math.round(width / aspect);
  return { width, height, aspect };
}

/**
 * Preview viewport: scale design to fit `slotWidthPx` wide (capped by POSTER_PREVIEW_MAX_WIDTH_PX, floored by POSTER_PREVIEW_MIN_SLOT_PX).
 * Pass the measured column width on `/p/` so the preview uses all available space instead of a tiny fixed thumbnail.
 */
export function getPreviewFrameSize(svgTemplate, slotWidthPx = POSTER_PREVIEW_MAX_WIDTH_PX) {
  const { width: designWidth, height: designHeight } = getDesignFrameSize(svgTemplate);
  const raw = Number(slotWidthPx);
  const slot = Number.isFinite(raw)
    ? Math.min(
        POSTER_PREVIEW_MAX_WIDTH_PX,
        Math.max(POSTER_PREVIEW_MIN_SLOT_PX, Math.floor(raw))
      )
    : POSTER_PREVIEW_MAX_WIDTH_PX;
  const scale = slot / designWidth;
  return {
    previewWidth: slot,
    previewHeight: Math.round(designHeight * scale),
    scale,
    designWidth,
    designHeight,
  };
}

/** @deprecated Use getPreviewFrameSize(svgTemplate) for dynamic height. */
export const POSTER_PREVIEW_WIDTH_PX = POSTER_PREVIEW_MAX_WIDTH_PX;
/** @deprecated Use getPreviewFrameSize(svgTemplate).previewHeight */
export const POSTER_PREVIEW_HEIGHT_PX = Math.round(
  (POSTER_PREVIEW_MAX_WIDTH_PX / POSTER_WIDTH_PX) * DEFAULT_POSTER_FRAME_HEIGHT_PX
);
/** @deprecated Use getPreviewFrameSize(svgTemplate).scale */
export const POSTER_PREVIEW_SCALE = POSTER_PREVIEW_MAX_WIDTH_PX / POSTER_WIDTH_PX;

/** Max overlay width as fraction of poster width (matches former max-w-[90%]). */
export const POSTER_OVERLAY_MAX_WIDTH_PX = Math.round(POSTER_WIDTH_PX * 0.9);
