import { forwardRef, useRef, useState } from 'react';

const WIDTH = 810;
const HEIGHT = 1012.5;
const NAME_MAX_LEN = 50;

const FallbackGxSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={WIDTH}
    height={HEIGHT}
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, pointerEvents: 'none' }}
  >
    <rect width={WIDTH} height={HEIGHT} fill="#f8fafc" />
    <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fill="#334155" fontFamily="sans-serif" fontSize="24">Loading…</text>
  </svg>
);

const NAME_ANCHOR = { x: 782, y: 894, maxWidth: 300, fontSize: 24, fontWeight: 600, color: '#f0e0b6' };
const PHONE_ANCHOR = { x: 782, y: 928, maxWidth: 260, fontSize: 22, fontWeight: 600, color: '#f0e0b6' };

const GxPosterPreview = forwardRef(function GxPosterPreview(
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
      style={{
        width: WIDTH,
        height: HEIGHT,
        position: 'relative',
        overflow: forExport ? 'visible' : 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      }}
    >
      <FallbackGxSvg />
      {!imageError && (
        <img
          src="/gx-poster.svg"
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

      <div style={{ position: 'absolute', right: WIDTH - NAME_ANCHOR.x, top: NAME_ANCHOR.y, maxWidth: NAME_ANCHOR.maxWidth, pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'sans-serif',
          fontSize: NAME_ANCHOR.fontSize,
          fontWeight: NAME_ANCHOR.fontWeight,
          color: NAME_ANCHOR.color,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'visible',
          textAlign: 'right',
        }}>
          {displayName}
        </div>
      </div>

      <div style={{ position: 'absolute', right: WIDTH - PHONE_ANCHOR.x, top: PHONE_ANCHOR.y, maxWidth: PHONE_ANCHOR.maxWidth, pointerEvents: 'none' }}>
        <div style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: PHONE_ANCHOR.fontSize,
          fontWeight: PHONE_ANCHOR.fontWeight,
          color: PHONE_ANCHOR.color,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'visible',
          textAlign: 'right',
        }}>
          {mobileNumber ? mobileNumber : '\u00A0'}
        </div>
      </div>
    </div>
  );
});

export default GxPosterPreview;
export { WIDTH as GX_POSTER_WIDTH, HEIGHT as GX_POSTER_HEIGHT };

export const GX_POSTER_EXPORT_LAYOUT = {
  name: {
    x: NAME_ANCHOR.x,
    y: NAME_ANCHOR.y,
    maxWidth: NAME_ANCHOR.maxWidth,
    fontSize: NAME_ANCHOR.fontSize,
    minFontSize: 14,
    fontWeight: NAME_ANCHOR.fontWeight,
    color: NAME_ANCHOR.color,
    fontFamily: 'sans-serif',
    textAlign: 'right',
  },
  phone: {
    x: PHONE_ANCHOR.x,
    y: PHONE_ANCHOR.y,
    maxWidth: PHONE_ANCHOR.maxWidth,
    fontSize: PHONE_ANCHOR.fontSize,
    minFontSize: 14,
    fontWeight: PHONE_ANCHOR.fontWeight,
    color: PHONE_ANCHOR.color,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textAlign: 'right',
  },
};
