/**
 * Webinar certificate generator: load SVG, draw name and date, output PNG/PDF.
 * Used by CertificatesPage and CertificateUnlockCard.
 */
import { jsPDF } from 'jspdf';
import {
  CERTIFICATE_SVG_URL,
  CERTIFICATE_SVG_VERSION,
  CERT_WIDTH,
  CERT_HEIGHT,
  OUTPUT_SCALE,
  OUTPUT_WIDTH,
  OUTPUT_HEIGHT,
  NAME as NAME_CONFIG,
  ISSUED_DATE as ISSUED_DATE_CONFIG,
  EXPIRY_DATE as EXPIRY_DATE_CONFIG,
  CERTIFICATE_ID as CERTIFICATE_ID_CONFIG,
} from './certificateWebinarConfig';

/** Format date for certificate: "21 May 2026". */
export function formatCertificateDate(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) {
    return formatCertificateDate(new Date());
  }
  const day = date.getDate();
  const month = date.toLocaleString('en-IN', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Recipient name: first letter of each word uppercase, rest lowercase. */
export function formatCertificateDisplayName(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/** Expiry = one year after issued date (matches template "Expiry Date" field). */
export function formatCertificateExpiryDate(issuedDateStr) {
  const raw = String(issuedDateStr || '').trim();
  const parsed = raw ? Date.parse(raw) : NaN;
  const base = Number.isFinite(parsed) ? new Date(parsed) : new Date();
  const expiry = new Date(base);
  expiry.setFullYear(expiry.getFullYear() + 1);
  return formatCertificateDate(expiry);
}

function drawTextField(ctx, config, text, scale) {
  const value = String(text || '').trim();
  if (!value) return;
  ctx.fillStyle = config.fillStyle;
  ctx.font = `${config.fontSize * scale}px ${config.fontFamily}`;
  ctx.textAlign = config.textAlign;
  ctx.textBaseline = config.textBaseline;
  ctx.fillText(value, config.x * scale, config.y * scale);
}

/** Load certificate background image (SVG). */
export function loadCertificateImage() {
  const v = CERTIFICATE_SVG_VERSION || '1';
  const candidates = Array.from(
    new Set([
      CERTIFICATE_SVG_URL,
      `/certificate.svg?v=${v}`,
      `/certificate-webinar.svg?v=${v}`,
    ])
  );
  return new Promise((resolve, reject) => {
    let idx = 0;
    let timeout = null;
    const img = new Image();
    const tryNext = () => {
      if (timeout) clearTimeout(timeout);
      if (idx >= candidates.length) {
        reject(new Error('Failed to load certificate image'));
        return;
      }
      timeout = setTimeout(() => {
        idx += 1;
        tryNext();
      }, 20000);
      img.src = candidates[idx];
      idx += 1;
    };
    img.onload = () => {
      if (timeout) clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      tryNext();
    };
    tryNext();
  });
}

/**
 * Draw certificate (background + dynamic values only) to a canvas at OUTPUT dimensions.
 * @param {HTMLImageElement} img - Loaded certificate SVG/image
 * @param {string} name - Recipient name
 * @param {string} issuedDateStr - Issued date value (e.g. "21 May 2026")
 * @param {string} [certificateId] - ID value only (no "Certificate ID:" prefix)
 * @param {string} [expiryDateStr] - Expiry date value; defaults to issued + 1 year
 */
export async function drawCertificateToCanvas(img, name, issuedDateStr, certificateId, expiryDateStr) {
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const scale = OUTPUT_SCALE;
  const issued = issuedDateStr || formatCertificateDate();
  const expiry = expiryDateStr || formatCertificateExpiryDate(issued);
  const displayName = formatCertificateDisplayName(name);

  ctx.drawImage(img, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  ctx.save();

  await document.fonts.load(`${NAME_CONFIG.fontSize * scale}px ${NAME_CONFIG.fontFamily}`);

  ctx.fillStyle = NAME_CONFIG.fillStyle;
  ctx.font = `${NAME_CONFIG.fontSize * scale}px ${NAME_CONFIG.fontFamily}`;
  ctx.textAlign = NAME_CONFIG.textAlign;
  ctx.textBaseline = NAME_CONFIG.textBaseline;
  ctx.fillText(displayName || ' ', NAME_CONFIG.x * scale, NAME_CONFIG.y * scale);

  drawTextField(ctx, ISSUED_DATE_CONFIG, issued, scale);
  drawTextField(ctx, EXPIRY_DATE_CONFIG, expiry, scale);

  if (certificateId && String(certificateId).trim()) {
    drawTextField(ctx, CERTIFICATE_ID_CONFIG, String(certificateId).trim(), scale);
  }

  ctx.restore();

  return canvas;
}

/**
 * Generate certificate and return PNG data URL.
 */
export async function getCertificatePngDataUrl(
  name,
  dateStr = formatCertificateDate(),
  certificateId,
  expiryDateStr
) {
  const img = await loadCertificateImage();
  const canvas = await drawCertificateToCanvas(img, name, dateStr, certificateId, expiryDateStr);
  return canvas.toDataURL('image/png');
}

/** Generate certificate and trigger PNG download. */
export async function downloadCertificatePng(
  name,
  dateStr = formatCertificateDate(),
  certificateId,
  expiryDateStr
) {
  const dataUrl = await getCertificatePngDataUrl(name, dateStr, certificateId, expiryDateStr);
  const safeName = (name || 'Certificate').replace(/[^a-zA-Z0-9-\s]/g, '').replace(/\s+/g, '-').slice(0, 40);
  const datePart = (dateStr || '').replace(/\s+/g, '-');
  const filename = `GuideXpert-Career-Counsellor-Certificate-${safeName}-${datePart}.png`;
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/** Generate certificate and trigger PDF download. */
export async function downloadCertificatePdf(
  name,
  dateStr = formatCertificateDate(),
  certificateId,
  expiryDateStr
) {
  const img = await loadCertificateImage();
  const canvas = await drawCertificateToCanvas(img, name, dateStr, certificateId, expiryDateStr);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [CERT_WIDTH, CERT_HEIGHT],
    compress: true,
  });
  pdf.addImage(imgData, 'PNG', 0, 0, CERT_WIDTH, CERT_HEIGHT);

  const safeName = (name || 'Certificate').replace(/[^a-zA-Z0-9-\s]/g, '').replace(/\s+/g, '-').slice(0, 40);
  const datePart = (dateStr || '').replace(/\s+/g, '-');
  const filename = `GuideXpert-Career-Counsellor-Certificate-${safeName}-${datePart}.pdf`;
  pdf.save(filename);
}
