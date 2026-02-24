import { forwardRef, useState } from 'react';

/** Poster template: 9:16 (viewBox 0 0 810 1440) */
const WIDTH = 810;
const HEIGHT = 1440;

/** Lightweight fallback poster (9:16) when the main SVG is too large or still loading */
const FallbackPosterSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={WIDTH}
    height={HEIGHT}
    viewBox="0 0 810 1440"
    style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, pointerEvents: 'none' }}
  >
    <defs>
      <linearGradient id="posterBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fefce8" />
        <stop offset="50%" stopColor="#fef9c3" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>
    </defs>
    <rect width="810" height="1440" fill="url(#posterBg)" />
    <rect x="24" y="24" width="762" height="1392" fill="none" stroke="#b45309" strokeWidth="3" rx="8" />
    <text x="405" y="280" textAnchor="middle" fill="#1c1917" fontFamily="Georgia, serif" fontSize="56" fontWeight="700">All the Best</text>
    <text x="405" y="340" textAnchor="middle" fill="#57534e" fontFamily="Georgia, serif" fontSize="24">GuideXpert Counsellor</text>
  </svg>
);

/**
 * Poster from /downloadcertificate.svg with overlay for counsellor name.
 * Uses a lightweight fallback so the poster is never blank (main SVG is ~52MB and may not load).
 * Ref on root for html2canvas capture (PNG/PDF).
 * Root keeps overflow:hidden so export is exactly 810x1440 with no clipped overflow.
 */
const PosterPreview = forwardRef(function PosterPreview(
  { fullName = '', mobileNumber = '' },
  ref
) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      ref={ref}
      className="poster-root"
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
      {/* Layer 1a: fallback poster (always visible so it's never blank) */}
      <FallbackPosterSvg />
      {/* Layer 1b: full template — when loaded it covers fallback (may be slow/fail if file is huge) */}
      {!imageError && (
        <img
          src="/downloadcertificate.svg"
          alt=""
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: WIDTH,
            height: HEIGHT,
            objectFit: 'fill',
            display: 'block',
            pointerEvents: 'none',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* Layer 2: Text only — over poster's blue box; left-aligned, one line each; kept inside bounds for PNG/PDF */}
      <div
        style={{
          position: 'absolute',
          left: 360,
          bottom: 64,
          width: 432,
          padding: '20px 18px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          direction: 'ltr',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: 38,
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.35,
            marginBottom: 8,
            minHeight: 52,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'left',
            boxSizing: 'border-box',
          }}
        >
          {fullName || '\u00A0'}
        </div>
        <div
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 28,
            fontWeight: 400,
            color: '#ffffff',
            lineHeight: 1.35,
            marginBottom: 8,
            minHeight: 40,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'left',
            boxSizing: 'border-box',
          }}
        >
          {mobileNumber ? `+91 ${mobileNumber}` : '\u00A0'}
        </div>
        <div
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 24,
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#eab308',
            lineHeight: 1.35,
            minHeight: 34,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'left',
            boxSizing: 'border-box',
          }}
        >
          Certified Career Counsellor
        </div>
      </div>
    </div>
  );
});

export default PosterPreview;
