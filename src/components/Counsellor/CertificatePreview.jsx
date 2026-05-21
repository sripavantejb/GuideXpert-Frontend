import { forwardRef } from 'react';
import {
  ISSUED_DATE,
  EXPIRY_DATE,
  CERTIFICATE_ID,
  CERTIFICATE_SVG_VERSION,
} from '../../pages/webinar/utils/certificateWebinarConfig';
import { formatCertificateExpiryDate } from '../../pages/webinar/utils/certificateWebinar';

/** SVG viewBox from design file: 0 0 842.25 595.5 */
const WIDTH = 842;
const HEIGHT = 595;

/**
 * Certificate from design SVG: labels are baked into the SVG; only dynamic values are overlaid.
 */
const CertificatePreview = forwardRef(function CertificatePreview(
  { recipientName = '', date = '', expiryDate = '', certificateId = '', signatureName = '' },
  ref
) {
  const issued = date || '';
  const expiry = expiryDate || (issued ? formatCertificateExpiryDate(issued) : '');
  const certId = certificateId ? String(certificateId).trim() : '';

  const overlayStyle = (config) => ({
    position: 'absolute',
    left: config.x,
    top: config.y - config.fontSize * 0.82,
    fontSize: config.fontSize,
    fontFamily: config.fontFamily,
    color: config.fillStyle,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  });

  return (
    <div
      ref={ref}
      className="certificate-root"
      style={{
        width: WIDTH,
        height: HEIGHT,
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      }}
    >
      <img
        src={`/certificate.svg?v=${CERTIFICATE_SVG_VERSION}`}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: WIDTH,
          height: HEIGHT,
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {/* Recipient name */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 268,
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '80%',
        }}
      >
        <div
          style={{
            fontFamily: '"Imperial Script", cursive',
            fontSize: 48,
            fontWeight: 400,
            color: '#1f2937',
            minHeight: 52,
          }}
        >
          {recipientName || '\u00A0'}
        </div>
      </div>

      {/* Issued date value (SVG has "Issued Date:" label) */}
      <div style={overlayStyle(ISSUED_DATE)}>{issued || '\u00A0'}</div>

      {/* Expiry date value (SVG has "Expiry Date:" label) */}
      <div style={overlayStyle(EXPIRY_DATE)}>{expiry || '\u00A0'}</div>

      {/* Signature (above "Authorised Signature" in SVG) */}
      {signatureName ? (
        <div
          style={{
            position: 'absolute',
            right: 48,
            bottom: 72,
            textAlign: 'right',
            fontFamily: '"Imperial Script", cursive',
            fontSize: 28,
            color: '#0d0d0d',
          }}
        >
          {signatureName}
        </div>
      ) : null}

      {/* Certificate ID value only (SVG has "Certificate ID:" on the right) */}
      {certId ? <div style={overlayStyle(CERTIFICATE_ID)}>{certId}</div> : null}
    </div>
  );
});

export default CertificatePreview;
