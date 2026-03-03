import { forwardRef, useState, useRef } from 'react';

/** Holi poster: 810×1440 (viewBox 0 0 810 ~1440) */
const WIDTH = 810;
const HEIGHT = 1440;

const NAME_MAX_LEN = 50;

/** Lightweight fallback when the Holi SVG is still loading */
const FallbackHoliSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={WIDTH}
    height={HEIGHT}
    viewBox="0 0 810 1440"
    style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, pointerEvents: 'none' }}
  >
    <defs>
      <linearGradient id="holiFallbackBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="50%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#fcd34d" />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#holiFallbackBg)" />
    <text x="405" y="720" textAnchor="middle" fill="#92400e" fontFamily="sans-serif" fontSize="32">Loading…</text>
  </svg>
);

/**
 * Holi poster from /holiposter.svg with overlay at bottom-east: name, phone, "Certified Career Counsellor".
 * Theme-suited styling; overflow-safe (ellipsis, max length).
 */
const HoliPosterPreview = forwardRef(function HoliPosterPreview(
  { fullName = '', mobileNumber = '', forExport = false, onExportImageLoad },
  ref
) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const exportImageLoadFired = useRef(false);

  const displayName = String(fullName || '').trim().slice(0, NAME_MAX_LEN) || '\u00A0';

  // Bottom-east block: right-aligned, fixed padding from right and bottom.
  // Use bottom positioning + fixed height so the block never extends past poster bottom (avoids clipping in html2canvas).
  const blockRight = 24;
  const blockBottom = forExport ? 28 : 24;
  const blockMaxWidth = 380;
  const textBlockHeight = 250;
  const paddingV = forExport ? 18 : 14;
  const paddingH = 20;
  const lineGap = 8;

  const fontFamily = '"Source Sans 3", sans-serif';
  const nameFontSize = 34;
  const phoneFontSize = 26;
  const taglineFontSize = forExport ? 30 : 32;
  const nameLineHeight = 1.5;
  const phoneLineHeight = 1.5;
  const taglineLineHeight = 1.6;
  const nameMinHeight = Math.ceil(nameFontSize * nameLineHeight);
  const phoneMinHeight = Math.ceil(phoneFontSize * phoneLineHeight);
  const taglineMinHeight = Math.ceil(taglineFontSize * taglineLineHeight);

  return (
    <div
      ref={ref}
      className="holi-poster-root"
      style={{
        width: WIDTH,
        height: HEIGHT,
        position: 'relative',
        overflow: forExport ? 'visible' : 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        fontFamily,
        ...(forExport ? { fontSize: 16 } : {}),
      }}
    >
      <FallbackHoliSvg />
      {!imageError && (
        <img
          src="/holiposter.svg"
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

      {/* Text block: bottom-east corner. Fixed height + bottom positioning so export never clips. */}
      <div
        style={{
          position: 'absolute',
          right: blockRight,
          bottom: blockBottom,
          height: textBlockHeight,
          maxWidth: blockMaxWidth,
          width: '100%',
          padding: `${paddingV}px ${paddingH}px`,
          paddingBottom: forExport ? paddingV + 16 : paddingV + 10,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          direction: 'ltr',
          overflow: forExport ? 'visible' : 'hidden',
          fontFamily,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: nameFontSize,
            fontWeight: 700,
            color: '#1f2937',
            lineHeight: nameLineHeight,
            minHeight: nameMinHeight,
            marginBottom: lineGap,
            whiteSpace: 'nowrap',
            overflow: forExport ? 'visible' : 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'right',
            boxSizing: 'border-box',
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            fontFamily,
            fontSize: phoneFontSize,
            fontWeight: 500,
            color: '#374151',
            lineHeight: phoneLineHeight,
            minHeight: phoneMinHeight,
            marginBottom: lineGap,
            whiteSpace: 'nowrap',
            overflow: forExport ? 'visible' : 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'right',
            boxSizing: 'border-box',
          }}
        >
          {mobileNumber ? `+91 ${mobileNumber}` : '\u00A0'}
        </div>
        <div
          style={{
            fontFamily,
            fontSize: taglineFontSize,
            fontWeight: 800,
            fontStyle: 'normal',
            color: '#b45309',
            lineHeight: taglineLineHeight,
            minHeight: taglineMinHeight,
            whiteSpace: 'nowrap',
            overflow: forExport ? 'visible' : 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'right',
            boxSizing: 'border-box',
          }}
        >
          Certified Career Counsellor
        </div>
      </div>
    </div>
  );
});

export default HoliPosterPreview;
export { WIDTH as HOLI_POSTER_WIDTH, HEIGHT as HOLI_POSTER_HEIGHT };
