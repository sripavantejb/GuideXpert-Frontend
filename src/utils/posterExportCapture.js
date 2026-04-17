import { getPosterHtml2canvasOptions } from './posterHtml2canvas';
import {
  DEFAULT_POSTER_FRAME_HEIGHT_PX,
  POSTER_WIDTH_PX,
} from './posterExportDimensions';

/**
 * @param {{ width?: number, height?: number }} [frameSize] Must match live root dimensions (design frame).
 */
function resolveFrameSize(frameSize) {
  const width = frameSize?.width ?? POSTER_WIDTH_PX;
  const height = frameSize?.height ?? DEFAULT_POSTER_FRAME_HEIGHT_PX;
  return { width, height };
}

function logExportDebug(liveRoot) {
  if (!import.meta.env.DEV || !(liveRoot instanceof HTMLElement)) return;
  const log = (label, el) => {
    if (!(el instanceof HTMLElement)) return;
    const cs = window.getComputedStyle(el);
    // eslint-disable-next-line no-console -- poster WYSIWYG debugging
    console.debug(`[poster export] ${label}`, {
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      fontFamily: cs.fontFamily,
      width: cs.width,
      height: cs.height,
    });
  };
  log('root', liveRoot);
  // eslint-disable-next-line no-console -- poster WYSIWYG debugging
  console.debug('[poster export] root geometry', {
    offsetWidth: liveRoot.offsetWidth,
    offsetHeight: liveRoot.offsetHeight,
    rect: liveRoot.getBoundingClientRect(),
  });
  liveRoot.querySelectorAll('[data-poster-overlay]').forEach((el, i) => {
    log(`overlay ${el.getAttribute('data-poster-overlay') || i}`, el);
  });
}

/**
 * Rasterizes the poster by cloning the live node off-screen and running html2canvas with scale 1.
 * Uses live root geometry in onclone via getPosterHtml2canvasOptions(originalRoot).
 *
 * @param {HTMLElement} liveRoot
 * @param {{ width?: number, height?: number }} [frameSize] Same pixel size as the live poster root (defaults 1080×DEFAULT).
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function capturePosterToCanvas(liveRoot, frameSize) {
  if (!(liveRoot instanceof HTMLElement)) {
    throw new TypeError('capturePosterToCanvas: expected HTMLElement');
  }

  const { width: fw, height: fh } = resolveFrameSize(frameSize);

  logExportDebug(liveRoot);

  const html2canvas = (await import('html2canvas')).default;

  const host = document.createElement('div');
  host.setAttribute('data-poster-export-host', 'true');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = [
    'position:fixed',
    'left:-12000px',
    'top:0',
    `width:${fw}px`,
    `height:${fh}px`,
    'overflow:hidden',
    'background:#ffffff',
    'pointer-events:none',
    'z-index:-1',
  ].join(';');

  const clone = liveRoot.cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    throw new Error('capturePosterToCanvas: clone failed');
  }

  clone.style.width = `${fw}px`;
  clone.style.height = `${fh}px`;
  clone.style.boxSizing = 'border-box';
  clone.style.margin = '0';
  clone.style.maxWidth = 'none';
  clone.style.minWidth = `${fw}px`;
  clone.style.minHeight = `${fh}px`;
  clone.style.borderRadius = '0';
  clone.style.boxShadow = 'none';

  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

    const canvas = await html2canvas(
      clone,
      getPosterHtml2canvasOptions({
        originalRoot: liveRoot,
        foreignObjectRendering: false,
        scale: 1,
        useCORS: true,
      })
    );
    return canvas;
  } finally {
    host.remove();
  }
}
