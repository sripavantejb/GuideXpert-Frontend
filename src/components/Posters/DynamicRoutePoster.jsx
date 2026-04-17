import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import PosterSvgLayer from './PosterSvgLayer';
import PosterTextOverlays from './PosterTextOverlays';
import { usePosterByRoute } from './usePosterByRoute';

function parseSvgAspectRatio(svg) {
  if (!svg || typeof svg !== 'string') return 3 / 4;
  const m = svg.match(/viewBox\s*=\s*["']\s*([\d.\s-]+)\s*["']/i);
  if (!m) return 3 / 4;
  const parts = m[1].trim().split(/\s+/).map(Number);
  if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) return parts[2] / parts[3];
  return 3 / 4;
}

/**
 * Fetches poster config for the current route (or `route` override) and renders SVG + name & mobile overlays.
 *
 * @param {{ route?: string, variables?: { name?: string, mobile?: string }, className?: string, wrapClassName?: string }} props
 */
export default function DynamicRoutePoster({ route: routeOverride, variables = {}, className = '', wrapClassName = '' }) {
  const location = useLocation();
  const route = routeOverride ?? location.pathname;
  const { poster, loading } = usePosterByRoute(route, true);

  const aspect = useMemo(() => (poster ? parseSvgAspectRatio(poster.svgTemplate) : 3 / 4), [poster]);

  const vars = useMemo(
    () => ({
      name: variables.name != null ? String(variables.name) : '',
      mobile: variables.mobile != null ? String(variables.mobile) : '',
    }),
    [variables.name, variables.mobile]
  );

  if (loading || !poster?.svgTemplate) {
    return null;
  }

  return (
    <div className={wrapClassName}>
      <div
        className={`relative mx-auto w-full overflow-hidden rounded-lg ${className}`}
        style={{ aspectRatio: `${aspect}` }}
      >
        <PosterSvgLayer svgTemplate={poster.svgTemplate} className="absolute inset-0 h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full" />
        <PosterTextOverlays
          nameField={poster.nameField}
          mobileField={poster.mobileField}
          variables={vars}
          interactive={false}
        />
      </div>
    </div>
  );
}
