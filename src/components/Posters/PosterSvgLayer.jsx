import { memo, useMemo } from 'react';
import { sanitizePosterSvg } from './sanitizePosterSvg';

/**
 * Memoized SVG layer — only re-sanitizes when `svgTemplate` string changes.
 */
function PosterSvgLayer({ svgTemplate, className = 'w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block' }) {
  const html = useMemo(() => sanitizePosterSvg(svgTemplate), [svgTemplate]);
  if (!html) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-500 text-sm ${className}`}>
        No SVG uploaded
      </div>
    );
  }
  return (
    <div
      className={className}
      style={{ pointerEvents: 'none', lineHeight: 0 }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default memo(PosterSvgLayer);
