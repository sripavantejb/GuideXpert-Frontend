 import { forwardRef, useState, useRef } from 'react';

/** Inter poster: 810×1440 (viewBox 0 0 810 ~1440) */
const WIDTH = 810;
const HEIGHT = 1440;

const NAME_MAX_LEN = 50;

/** Lightweight fallback when the inter poster SVG is still loading */
const FallbackInterSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={WIDTH}
    height={HEIGHT}
    viewBox="0 0 810 1440"
    style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, pointerEvents: 'none' }}
  >
    <defs>
      <linearGradient id="interFallbackBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#fde68a" />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#interFallbackBg)" />
    <text x="405" y="720" textAnchor="middle" fill="#92400e" fontFamily="sans-serif" fontSize="32">Loading…</text>
  </svg>
);

/**
 * Inter poster from /interposter.svg with left-aligned overlay: name and number only.
 * Poster design already has "Certified GuideXpert Counsellor" at the bottom; we place name/number above it.
 * forExport: fixed top so clone/crop does not cut text.
 */
const InterPosterPreview = forwardRef(function InterPosterPreview(
  { fullName = '', mobileNumber = '', forExport = false, onExportImageLoad },
  ref
) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const exportImageLoadFired = useRef(false);

  const displayName = String(fullName || '').trim().slice(0, NAME_MAX_LEN) || '\u00A0';

  // Left-aligned block: name + number only, placed above the poster's existing "Certified GuideXpert Counsellor" text.
  // Export block is taller (larger padding/minHeights); position by bottom so it aligns with preview (bottom: 160).
  const textLeft = 80;
  const textMaxWidth = 500;
  const textBlockBottom = 160;
  const exportBlockHeight = 204; // forExport layout: padding 24+24, name 16+72+6, lineGap 10, phone 4+44+4
  const textBlockTopExport = HEIGHT - 160 - exportBlockHeight;
  const textContainerPaddingTop = forExport ? 24 : 20;
  const textContainerPaddingBottom = forExport ? 24 : 20;
  const textContainerPaddingH = 20;
  const nameFontSize = 42;
  const phoneFontSize = 30;
  const lineGap = 10;
  const nameMinHeight = forExport ? 72 : 58;
  const namePaddingTop = forExport ? 16 : 0;
  const namePaddingBottom = forExport ? 6 : 0;
  const linePaddingVertical = forExport ? 4 : 0;
  const nameOverflow = forExport ? 'visible' : 'hidden';
  const textContainerOverflow = forExport ? 'visible' : 'hidden';

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

      {/* Left-aligned text block — forExport: fixed top so crop does not cut text */}
      <div
        style={{
          position: 'absolute',
          left: textLeft,
          ...(forExport ? { top: textBlockTopExport } : { bottom: textBlockBottom }),
          maxWidth: textMaxWidth,
          width: '100%',
          padding: `${textContainerPaddingTop}px ${textContainerPaddingH}px ${textContainerPaddingBottom}px ${textContainerPaddingH}px`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          direction: 'ltr',
          overflow: textContainerOverflow,
        }}
      >
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: nameFontSize,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.3,
            marginBottom: lineGap,
            minHeight: nameMinHeight,
            paddingTop: namePaddingTop,
            paddingBottom: namePaddingBottom,
            whiteSpace: 'nowrap',
            overflow: nameOverflow,
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'left',
            boxSizing: 'border-box',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: phoneFontSize,
            fontWeight: 600,
            color: '#fef08a',
            lineHeight: 1.3,
            minHeight: 44,
            paddingTop: linePaddingVertical,
            paddingBottom: linePaddingVertical,
            whiteSpace: 'nowrap',
            overflow: forExport ? 'visible' : 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'left',
            boxSizing: 'border-box',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {mobileNumber ? `+91 ${mobileNumber}` : '\u00A0'}
        </div>
      </div>
    </div>
  );
});

export default InterPosterPreview;
export { WIDTH as INTER_POSTER_WIDTH, HEIGHT as INTER_POSTER_HEIGHT };

/** Layout for canvas drawing (mobile download); must match forExport block position. */
export const INTER_POSTER_EXPORT_LAYOUT = {
  blockTop: HEIGHT - 160 - 204,
  textLeft: 80,
  paddingH: 20,
};
