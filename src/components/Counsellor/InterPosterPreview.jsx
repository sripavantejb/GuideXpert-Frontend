import { forwardRef, useState, useRef } from 'react';

const WIDTH = 810;
const HEIGHT = 810;

const NAME_MAX_LEN = 50;

const FallbackInterSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={WIDTH}
    height={HEIGHT}
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, pointerEvents: 'none' }}
  >
    <rect width={WIDTH} height={HEIGHT} fill="#fef3c7" />
    <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fill="#92400e" fontFamily="sans-serif" fontSize="24">Loading…</text>
  </svg>
);

const NAME_ANCHOR = { x: 14, y: 712, maxWidth: 320, fontSize: 20, fontWeight: 700, color: '#003366' };
const PHONE_ANCHOR = { x: 644, y: 720, maxWidth: 140, fontSize: 20, fontWeight: 700, color: '#003366' };

const InterPosterPreview = forwardRef(function InterPosterPreview(
  { fullName = '', mobileNumber = '', forExport = false, onExportImageLoad },
  ref
) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const exportImageLoadFired = useRef(false);
  const displayName = String(fullName || '').trim().slice(0, NAME_MAX_LEN) || '\u00A0';

  return (
    <div
      ref={ref}
      className="inter-poster-root"
      style={{
        width: WIDTH,
        height: HEIGHT,
        position: 'relative',
        overflow: forExport ? 'visible' : 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        ...(forExport ? { fontSize: 16 } : {}),
      }}
    >
      <FallbackInterSvg />
      {!imageError && (
        <img
          src="/interposter.svg"
          alt=""
          onLoad={() => {
            setImageLoaded(true);
            if (forExport && onExportImageLoad && !exportImageLoadFired.current) {
              exportImageLoadFired.current = true;
              onExportImageLoad();
            }
          }}
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

      {/* Name — above "Certified GuideXpert Counsellor" (which is at y≈757) */}
      <div style={{
        position: 'absolute',
        left: NAME_ANCHOR.x,
        top: NAME_ANCHOR.y,
        maxWidth: NAME_ANCHOR.maxWidth,
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: 'sans-serif',
          fontSize: NAME_ANCHOR.fontSize,
          fontWeight: NAME_ANCHOR.fontWeight,
          color: NAME_ANCHOR.color,
          lineHeight: 1.35,
          whiteSpace: 'nowrap',
          overflow: 'visible',
          textAlign: 'left',
        }}>
          {displayName}
        </div>
      </div>

      {/* Phone — right of phone icon (circle centered at x≈615, y≈729) */}
      <div style={{
        position: 'absolute',
        left: PHONE_ANCHOR.x,
        top: PHONE_ANCHOR.y,
        maxWidth: PHONE_ANCHOR.maxWidth,
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: PHONE_ANCHOR.fontSize,
          fontWeight: PHONE_ANCHOR.fontWeight,
          color: PHONE_ANCHOR.color,
          lineHeight: 1.35,
          whiteSpace: 'nowrap',
          overflow: 'visible',
          textAlign: 'left',
        }}>
          {mobileNumber ? mobileNumber : '\u00A0'}
        </div>
      </div>
    </div>
  );
});

export default InterPosterPreview;
export { WIDTH as INTER_POSTER_WIDTH, HEIGHT as INTER_POSTER_HEIGHT };

export const INTER_POSTER_EXPORT_LAYOUT = {
  name: {
    x: 14, y: 712, maxWidth: 320,
    fontSize: 20, minFontSize: 12, fontWeight: 700,
    color: '#003366', fontFamily: 'sans-serif', textAlign: 'left',
  },
  phone: {
    x: 644, y: 720, maxWidth: 140,
    fontSize: 20, minFontSize: 12, fontWeight: 700,
    color: '#003366',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textAlign: 'left',
  },
};
