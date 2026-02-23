import { forwardRef } from 'react';

/** SVG viewBox from design file: 0 0 842.25 595.5 */
const WIDTH = 842;
const HEIGHT = 595;
const GOLD = '#daa520';

/**
 * Certificate from design SVG: exact design as background, three dynamic overlays only.
 * Ref on root for html2canvas capture.
 */
const CertificatePreview = forwardRef(function CertificatePreview(
  { recipientName = '', date = '', signatureName = '' },
  ref
) {
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
      {/* Layer 1: design SVG (exact match) */}
      <img
        src="/certificate.svg"
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

      {/* Layer 2: Recipient name — center, large script, gold underline */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 282,
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '80%',
        }}
      >
        <div
          style={{
            fontFamily: '"Dancing Script", "Great Vibes", cursive',
            fontSize: 48,
            fontWeight: 700,
            color: '#0d0d0d',
            marginBottom: 6,
            minHeight: 52,
          }}
        >
          {recipientName || '\u00A0'}
        </div>
        <div
          style={{
            width: 320,
            maxWidth: '95%',
            height: 2,
            margin: '0 auto',
            backgroundColor: GOLD,
          }}
        />
      </div>

      {/* Layer 2: Date — bottom-left */}
      <div
        style={{
          position: 'absolute',
          left: 42,
          bottom: 48,
          textAlign: 'left',
          minWidth: 120,
        }}
      >
        <div
          style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: 18,
            color: '#0d0d0d',
            marginBottom: 4,
          }}
        >
          Date
        </div>
        <div
          style={{
            fontSize: 14,
            color: '#1a1a1a',
            fontFamily: 'Georgia, serif',
          }}
        >
          {date || '\u00A0'}
        </div>
      </div>

      {/* Layer 2: Signature — bottom-right: gold line, name, SIGNATURE */}
      <div
        style={{
          position: 'absolute',
          right: 42,
          bottom: 48,
          textAlign: 'right',
          minWidth: 160,
        }}
      >
        <div
          style={{
            width: 130,
            height: 2,
            backgroundColor: GOLD,
            marginLeft: 'auto',
            marginBottom: 6,
          }}
        />
        <div
          style={{
            fontFamily: '"Dancing Script", "Great Vibes", cursive',
            fontSize: 26,
            color: '#0d0d0d',
            marginBottom: 4,
          }}
        >
          {signatureName || '\u00A0'}
        </div>
        <div
          style={{
            fontSize: 9,
            letterSpacing: '0.25em',
            color: '#1a1a1a',
            fontFamily: 'Georgia, serif',
          }}
        >
          SIGNATURE
        </div>
      </div>
    </div>
  );
});

export default CertificatePreview;
