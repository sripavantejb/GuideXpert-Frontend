import { forwardRef, useRef, useState } from 'react';

/** Matches public/inter-results-poster.svg viewBox (0 0 810 ~810). */
const WIDTH = 810;
const HEIGHT = 810;
const NAME_MAX_LEN = 50;

const FallbackInterResultsSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={WIDTH}
    height={HEIGHT}
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, pointerEvents: 'none' }}
  >
    <rect width={WIDTH} height={HEIGHT} fill="#fefce8" />
    <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fill="#713f12" fontFamily="sans-serif" fontSize="24">Loading…</text>
  </svg>
);

/** Bottom-right name / phone — same geometry as SID; yellow text. */
const INTER_RESULTS_POSTER_ACCENT = '#FACC15';
const NAME_ANCHOR = { x: 768, y: 680, maxWidth: 330, fontSize: 24, fontWeight: 600, color: INTER_RESULTS_POSTER_ACCENT };
const PHONE_ANCHOR = { x: 768, y: 714, maxWidth: 290, fontSize: 22, fontWeight: 600, color: INTER_RESULTS_POSTER_ACCENT };

const InterResultsPosterPreview = forwardRef(function InterResultsPosterPreview(
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
      <FallbackInterResultsSvg />
      {!imageError && (
        <img
          src="/inter-results-poster.svg"
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

export default InterResultsPosterPreview;
export { WIDTH as INTER_RESULTS_POSTER_WIDTH, HEIGHT as INTER_RESULTS_POSTER_HEIGHT };

export const INTER_RESULTS_POSTER_EXPORT_LAYOUT = {
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
