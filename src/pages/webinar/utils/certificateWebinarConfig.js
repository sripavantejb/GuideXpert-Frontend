/**
 * Config for webinar certificate (Certified GuideXpert Career Counsellor).
 * Canvas size matches SVG viewBox; text positions tuned for the design.
 * Labels (Issued Date, Expiry Date, Certificate ID, Authorised Signature) live in the SVG — only values are drawn here.
 */
/** Bump when replacing public/certificate.svg so browsers refetch the background. */
export const CERTIFICATE_SVG_VERSION = 'certificate123a';

export const CERTIFICATE_SVG_URL = `/certificate.svg?v=${CERTIFICATE_SVG_VERSION}`;

/** ViewBox from certificate SVG: 0 0 842.25 595.5 (A4 landscape). */
export const CERT_WIDTH = 842;
export const CERT_HEIGHT = 596;

/** Scale factor for PNG/PDF output (2 = high res). */
export const OUTPUT_SCALE = 2;

export const OUTPUT_WIDTH = CERT_WIDTH * OUTPUT_SCALE;
export const OUTPUT_HEIGHT = CERT_HEIGHT * OUTPUT_SCALE;

const VALUE_FONT = 'Georgia, "Times New Roman", serif';
const VALUE_COLOR = '#1a1a1a';

/** Name: below "This is proudly presented to", centered. */
export const NAME = {
  x: CERT_WIDTH / 2,
  y: 300,
  fontSize: 48,
  fontFamily: '"Imperial Script", cursive',
  fillStyle: '#1f2937',
  textAlign: 'center',
  textBaseline: 'middle',
};

/** Issued date value — immediately right of SVG "Issued Date:" (same row). */
export const ISSUED_DATE = {
  x: 196,
  y: 464,
  fontSize: 13,
  fontFamily: VALUE_FONT,
  fillStyle: VALUE_COLOR,
  textAlign: 'left',
  textBaseline: 'alphabetic',
};

/** Expiry date value — immediately right of SVG "Expiry Date:" (row below divider line). */
export const EXPIRY_DATE = {
  x: 196,
  y: 488,
  fontSize: 13,
  fontFamily: VALUE_FONT,
  fillStyle: VALUE_COLOR,
  textAlign: 'left',
  textBaseline: 'alphabetic',
};

/** Certificate ID value — directly after SVG "Certificate ID:" label on the right. */
export const CERTIFICATE_ID = {
  x: 652,
  y: 505,
  fontSize: 11,
  fontFamily: VALUE_FONT,
  fillStyle: VALUE_COLOR,
  textAlign: 'left',
  textBaseline: 'alphabetic',
};

/** @deprecated Use ISSUED_DATE — kept for imports that still reference DATE */
export const DATE = ISSUED_DATE;
