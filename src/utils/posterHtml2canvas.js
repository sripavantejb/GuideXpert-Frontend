/**
 * html2canvas 1.x cannot parse modern CSS functions (e.g. oklab) used by Tailwind v4.
 * After clone, rewrite computed colors to rgb()/rgba and strip ring/shadows that embed oklab.
 *
 * Overlay text uses % + transform translateX(%), which html2canvas rasterizes incorrectly.
 * applyFrozenOverlayRects copies live pixel geometry from the source DOM onto the clone,
 * scales boxes if the clone subtree size differs, and copies typography from the live node.
 *
 * @param {HTMLElement} root
 * @param {Document} doc
 */
function sanitizeCloneForHtml2canvas(root, doc) {
  const win = doc.defaultView;
  if (!win) return;

  const walk = (el) => {
    if (!el || el.nodeType !== 1) return;
    if (el.namespaceURI === 'http://www.w3.org/2000/svg' || el.tagName === 'SVG' || el.closest('svg')) {
      return;
    }

    const cs = win.getComputedStyle(el);
    el.style.color = cs.color;
    el.style.backgroundColor = cs.backgroundColor;
    el.style.borderTopColor = cs.borderTopColor;
    el.style.borderRightColor = cs.borderRightColor;
    el.style.borderBottomColor = cs.borderBottomColor;
    el.style.borderLeftColor = cs.borderLeftColor;
    el.style.boxShadow = 'none';
    el.style.outline = 'none';
    el.style.textShadow = 'none';
    el.style.filter = 'none';

    for (const child of el.children) walk(child);
  };

  walk(root);
}

/**
 * html2canvas skips our HTML sanitizer inside <svg>; SVG text/fills may still use oklab or vars.
 * Copy computed fill/stroke (as resolved rgb) onto the clone so rasterization matches the preview.
 *
 * @param {HTMLElement} clonedRoot
 * @param {Document} clonedDoc
 */
function sanitizeSvgSubtreeForHtml2canvas(clonedRoot, clonedDoc) {
  const win = clonedDoc.defaultView;
  if (!win) return;

  const svgRoots = clonedRoot.querySelectorAll('svg');
  for (const svg of svgRoots) {
    const walk = (el) => {
      if (!el || el.nodeType !== 1) return;
      const tag = el.tagName && el.tagName.toLowerCase();
      try {
        const cs = win.getComputedStyle(el);
        if (cs.fill && cs.fill !== 'none') {
          el.setAttribute('fill', cs.fill);
        }
        if (cs.stroke && cs.stroke !== 'none') {
          el.setAttribute('stroke', cs.stroke);
        }
        if (tag === 'text' || tag === 'tspan') {
          if (cs.fill && cs.fill !== 'none') {
            el.style.fill = cs.fill;
          }
        }
      } catch {
        /* ignore */
      }
      for (const ch of el.children) walk(ch);
    };
    walk(svg);
  }
}

const OVERLAY_KEYS = ['name', 'mobile'];

/**
 * Match html2canvas output to on-screen layout by copying measured boxes from the live root.
 * Scales when the cloned capture root width/height differs from the on-screen root (subpixel/DPR).
 *
 * @param {HTMLElement} originalRoot
 * @param {HTMLElement} clonedRoot
 */
export function applyFrozenOverlayRects(originalRoot, clonedRoot) {
  const origRect = originalRoot.getBoundingClientRect();
  const cloneRect = clonedRoot.getBoundingClientRect();
  const sx = origRect.width > 0 && cloneRect.width > 0 ? cloneRect.width / origRect.width : 1;
  const sy = origRect.height > 0 && cloneRect.height > 0 ? cloneRect.height / origRect.height : 1;

  const origWin = originalRoot.ownerDocument?.defaultView;

  for (const k of OVERLAY_KEYS) {
    const orig = originalRoot.querySelector(`[data-poster-overlay="${k}"]`);
    const clone = clonedRoot.querySelector(`[data-poster-overlay="${k}"]`);
    if (!(orig instanceof HTMLElement) || !(clone instanceof HTMLElement)) continue;
    const r = orig.getBoundingClientRect();
    const relLeft = (r.left - origRect.left) * sx;
    const relTop = (r.top - origRect.top) * sy;
    const w = r.width * sx;
    const h = r.height * sy;

    clone.style.left = `${relLeft}px`;
    clone.style.top = `${relTop}px`;
    clone.style.width = `${w}px`;
    clone.style.minHeight = `${h}px`;
    clone.style.height = 'auto';
    clone.style.transform = 'none';
    clone.style.maxWidth = 'none';
    clone.style.right = 'auto';
    clone.style.bottom = 'auto';
    clone.style.boxSizing = 'border-box';

    if (origWin) {
      const cs = origWin.getComputedStyle(orig);
      clone.style.fontWeight = cs.fontWeight;
      clone.style.fontFamily = cs.fontFamily;
      clone.style.fontSize = cs.fontSize;
      clone.style.lineHeight = cs.lineHeight;
      clone.style.letterSpacing = cs.letterSpacing;
      clone.style.textTransform = cs.textTransform;
      clone.style.fontStyle = cs.fontStyle;
      clone.style.color = cs.color;
      clone.style.textAlign = cs.textAlign;
    }
  }
}

/**
 * @param {Partial<import('html2canvas').Options> & {
 *   originalRoot?: HTMLElement | (() => HTMLElement | null | undefined)
 * }} [base]
 * @returns {import('html2canvas').Options}
 */
export function getPosterHtml2canvasOptions(base = {}) {
  const { originalRoot, onclone: userOnClone, ...rest } = base;
  return {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    foreignObjectRendering: true,
    ...rest,
    onclone: (clonedDoc, clonedElement) => {
      if (typeof userOnClone === 'function') {
        userOnClone(clonedDoc, clonedElement);
      }
      if (clonedElement instanceof HTMLElement) {
        sanitizeCloneForHtml2canvas(clonedElement, clonedDoc);
        sanitizeSvgSubtreeForHtml2canvas(clonedElement, clonedDoc);
      }
      const root = typeof originalRoot === 'function' ? originalRoot() : originalRoot;
      if (root instanceof HTMLElement && clonedElement instanceof HTMLElement) {
        applyFrozenOverlayRects(root, clonedElement);
      }
    },
  };
}
