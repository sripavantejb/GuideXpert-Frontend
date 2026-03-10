/**
 * Webinar certificate generator: load SVG, draw name and date, output PNG/PDF.
 * Used by CertificatesPage and CertificateUnlockCard.
 */
import { jsPDF } from 'jspdf';
import {
  CERTIFICATE_SVG_URL,
  CERT_WIDTH,
  CERT_HEIGHT,
  OUTPUT_SCALE,
  OUTPUT_WIDTH,
  OUTPUT_HEIGHT,
  NAME as NAME_CONFIG,
  DATE as DATE_CONFIG,
  CERTIFICATE_ID as CERTIFICATE_ID_CONFIG,
} from './certificateWebinarConfig';

/** Format date for certificate: "9 March 2026". */
export function formatCertificateDate(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  const day = date.getDate();
  const month = date.toLocaleString('en-IN', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Load certificate background image (SVG). */
export function loadCertificateImage() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => reject(new Error('Certificate image load timeout')), 20000);
    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load certificate image'));
    };
    img.src = CERTIFICATE_SVG_URL;
  });
}

/**
 * Draw certificate (background + name + date + optional certificateId) to a canvas at OUTPUT dimensions.
 * @param {HTMLImageElement} img - Loaded certificate SVG/image
 * @param {string} name - Recipient name (from training form)
 * @param {string} dateStr - Formatted date string (e.g. from formatCertificateDate)
 * @param {string} [certificateId] - Unique certificate ID to draw below the date
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function drawCertificateToCanvas(img, name, dateStr, certificateId) {
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const scale = OUTPUT_SCALE;

  ctx.drawImage(img, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  ctx.save();

  // Ensure Imperial Script (name font) is loaded before drawing so canvas renders it correctly
  await document.fonts.load(`${NAME_CONFIG.fontSize * scale}px ${NAME_CONFIG.fontFamily}`);

  ctx.fillStyle = NAME_CONFIG.fillStyle;
  ctx.font = `${NAME_CONFIG.fontSize * scale}px ${NAME_CONFIG.fontFamily}`;
  ctx.textAlign = NAME_CONFIG.textAlign;
  ctx.textBaseline = NAME_CONFIG.textBaseline;
  ctx.fillText(String(name || ' ').trim() || ' ', NAME_CONFIG.x * scale, NAME_CONFIG.y * scale);

  ctx.fillStyle = DATE_CONFIG.fillStyle;
  ctx.font = `${DATE_CONFIG.fontSize * scale}px ${DATE_CONFIG.fontFamily}`;
  ctx.textAlign = DATE_CONFIG.textAlign;
  ctx.textBaseline = DATE_CONFIG.textBaseline;
  ctx.fillText(dateStr || formatCertificateDate(), DATE_CONFIG.x * scale, DATE_CONFIG.y * scale);

  if (certificateId && String(certificateId).trim()) {
    ctx.fillStyle = CERTIFICATE_ID_CONFIG.fillStyle;
    ctx.font = `${CERTIFICATE_ID_CONFIG.fontSize * scale}px ${CERTIFICATE_ID_CONFIG.fontFamily}`;
    ctx.textAlign = CERTIFICATE_ID_CONFIG.textAlign;
    ctx.textBaseline = CERTIFICATE_ID_CONFIG.textBaseline;
    ctx.fillText('Certificate ID: ' + String(certificateId).trim(), CERTIFICATE_ID_CONFIG.x * scale, CERTIFICATE_ID_CONFIG.y * scale);
  }

  ctx.restore();

  return canvas;
}

/**
 * Generate certificate and return PNG data URL.
 * @param {string} name
 * @param {string} [dateStr] - Optional; defaults to today formatted
 * @param {string} [certificateId] - Unique certificate ID
 */
export async function getCertificatePngDataUrl(name, dateStr = formatCertificateDate(), certificateId) {
  const img = await loadCertificateImage();
  const canvas = await drawCertificateToCanvas(img, name, dateStr, certificateId);
  return canvas.toDataURL('image/png');
}

/**
 * Generate certificate and trigger PNG download.
 * @param {string} name
 * @param {string} [dateStr]
 * @param {string} [certificateId]
 */
export async function downloadCertificatePng(name, dateStr = formatCertificateDate(), certificateId) {
  const dataUrl = await getCertificatePngDataUrl(name, dateStr, certificateId);
  const safeName = (name || 'Certificate').replace(/[^a-zA-Z0-9-\s]/g, '').replace(/\s+/g, '-').slice(0, 40);
  const datePart = (dateStr || '').replace(/\s+/g, '-');
  const filename = `GuideXpert-Career-Counsellor-Certificate-${safeName}-${datePart}.png`;
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Generate certificate and trigger PDF download.
 * @param {string} name
 * @param {string} [dateStr]
 * @param {string} [certificateId]
 */
export async function downloadCertificatePdf(name, dateStr = formatCertificateDate(), certificateId) {
  const img = await loadCertificateImage();
  const canvas = await drawCertificateToCanvas(img, name, dateStr, certificateId);
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
