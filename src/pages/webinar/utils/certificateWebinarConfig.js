/**
 * Config for webinar certificate (Certified GuideXpert Career Counsellor).
 * Canvas size matches SVG viewBox; text positions tuned for the design.
 * Adjust nameX, nameY, dateX, dateY if the overlay does not align with the template.
 */
export const CERTIFICATE_SVG_URL = '/certificate-webinar.svg';

/** ViewBox from certificate SVG: 0 0 842.25 595.5 (A4 landscape). */
export const CERT_WIDTH = 842;
export const CERT_HEIGHT = 596;

/** Scale factor for PNG/PDF output (2 = high res). */
export const OUTPUT_SCALE = 2;

export const OUTPUT_WIDTH = CERT_WIDTH * OUTPUT_SCALE;
export const OUTPUT_HEIGHT = CERT_HEIGHT * OUTPUT_SCALE;

/** Name: below "This is proudly presented to", centered. Imperial Script for signature-style name. */
export const NAME = {
  x: CERT_WIDTH / 2,
  y: 313,
  fontSize: 48,
  fontFamily: '"Imperial Script", cursive',
  fillStyle: '#1f2937',
  textAlign: 'center',
  textBaseline: 'middle',
};

/** Date: on the underlined blank above "DATE" label. Format: "9 March 2026". */
export const DATE = {
  x: 140,
  y: 460,
  fontSize: 14,
  fontFamily: 'Georgia, "Times New Roman", serif',
  fillStyle: '#374151',
  textAlign: 'left',
  textBaseline: 'alphabetic',
};

/** Unique certificate ID: below the "DATE" label, left-aligned, smaller size. */
export const CERTIFICATE_ID = {
  x: 120,
  y: 508,
  fontSize: 9,
  fontFamily: 'Georgia, "Times New Roman", serif',
  fillStyle: '#374151',
  textAlign: 'left',
  textBaseline: 'alphabetic',
};
