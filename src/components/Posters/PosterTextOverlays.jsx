import { useLayoutEffect, useRef, useState } from 'react';
import { normalizeHexForCss } from '../../utils/posterColor';
import { POSTER_OVERLAY_MAX_WIDTH_PX } from '../../utils/posterExportDimensions';

function clampPct(n) {
  const v = Math.min(100, Math.max(0, n));
  return Math.round(v * 100) / 100;
}

function alignTransform(textAlign) {
  if (textAlign === 'center') return 'translateX(-50%)';
  if (textAlign === 'right') return 'translateX(-100%)';
  return 'translateX(0)';
}

const OVERLAY_KEYS = ['name', 'mobile'];

function isCorridorNameField(overlayKey, field) {
  if (overlayKey !== 'name') return false;
  const x = Number(field?.x);
  const xEnd = Number(field?.xEnd);
  return Number.isFinite(x) && Number.isFinite(xEnd) && xEnd > x;
}

/** Layout-width of text (same coordinate system as parent.clientWidth; not affected by ancestor transform scale). */
function measureOverlayTextWidthPx(measureEl) {
  let w = measureEl.offsetWidth;
  if (!w && measureEl.scrollWidth) w = measureEl.scrollWidth;
  if (!w) w = measureEl.getBoundingClientRect().width;
  return Math.ceil(w);
}

/**
 * Right edge capped at xEnd (%). Uses pixel math vs parent layout width so preview scale(transform)
 * does not mix clientWidth (layout) with getBoundingClientRect (viewport).
 */
function computeCorridorLeftPct(rootEl, measureEl, xStart, xEnd) {
  const parent = rootEl?.offsetParent;
  if (!(parent instanceof HTMLElement) || !(measureEl instanceof HTMLElement)) return xStart;
  const W = parent.clientWidth;
  if (W <= 0) return xStart;
  const w = measureOverlayTextWidthPx(measureEl);
  if (w <= 0) return xStart;
  const corridorPx = ((xEnd - xStart) / 100) * W;
  let leftPx;
  if (w <= corridorPx) {
    leftPx = (xStart / 100) * W;
  } else {
    leftPx = (xEnd / 100) * W - w;
  }
  const leftPct = (leftPx / W) * 100;
  return Math.max(0, leftPct);
}

/**
 * Name only: single line, right edge capped at xEnd (%); shifts left when text is long.
 */
function NameCorridorOverlay({
  el,
  text,
  overlayKey,
  interactive,
  isSelected,
  onSelectKey,
  onDragPosition,
  onDragStart,
  onDragEnd,
  containerRef,
}) {
  const rootRef = useRef(null);
  const measureRef = useRef(null);
  const xStart = Number(el.x) || 0;
  const xEnd = Number(el.xEnd);
  const [leftPct, setLeftPct] = useState(xStart);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const m = measureRef.current;
    if (!root || !m) return undefined;
    let cancelled = false;
    const run = () => {
      const r = rootRef.current;
      const meas = measureRef.current;
      if (!r || !meas || cancelled) return;
      setLeftPct(computeCorridorLeftPct(r, meas, xStart, xEnd));
    };
    run();
    const parent = root.offsetParent;
    if (!(parent instanceof HTMLElement)) return undefined;
    const ro = new ResizeObserver(run);
    ro.observe(parent);
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!cancelled) run();
      });
    }
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [xStart, xEnd, text, el.fontSize, el.fontWeight]);

  return (
    <div
      ref={rootRef}
      data-poster-overlay={overlayKey}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={`absolute whitespace-nowrap outline-none select-none touch-none ${
        interactive
          ? isSelected
            ? 'z-10 cursor-grab ring-2 ring-violet-500 ring-offset-1 active:cursor-grabbing'
            : 'z-[5] cursor-pointer hover:ring-1 hover:ring-gray-400'
          : ''
      }`}
      style={{
        left: `${leftPct}%`,
        top: `${Number(el.y) || 0}%`,
        maxWidth: 'none',
        fontFamily: "'Inter', sans-serif",
        fontSize: `${Number(el.fontSize) || 16}px`,
        color: normalizeHexForCss(el.color),
        fontWeight: el.fontWeight || '400',
        textAlign: 'left',
        transform: 'translateX(0)',
        lineHeight: 1.2,
        pointerEvents: interactive ? 'auto' : 'none',
      }}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        onSelectKey?.(overlayKey);
      }}
      onKeyDown={(e) => {
        if (!interactive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectKey?.(overlayKey);
        }
      }}
      onPointerDown={
        interactive && onDragPosition && containerRef
          ? (e) => {
              if (e.button !== 0) return;
              e.stopPropagation();
              e.preventDefault();
              onSelectKey?.(overlayKey);
              onDragStart?.(overlayKey);
              const container = containerRef.current;
              if (!(container instanceof HTMLElement)) return;
              const rect = container.getBoundingClientRect();
              const startX = e.clientX;
              const startY = e.clientY;
              const startLeft = Number(el.x) || 0;
              const startTop = Number(el.y) || 0;
              const target = e.currentTarget;
              target.setPointerCapture(e.pointerId);
              const move = (ev) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                const nx = startLeft + (dx / rect.width) * 100;
                const ny = startTop + (dy / rect.height) * 100;
                onDragPosition(overlayKey, clampPct(nx), clampPct(ny));
              };
              const up = () => {
                try {
                  target.releasePointerCapture(e.pointerId);
                } catch {
                  /* ignore */
                }
                onDragEnd?.();
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
              };
              window.addEventListener('pointermove', move);
              window.addEventListener('pointerup', up);
            }
          : undefined
      }
    >
      <span ref={measureRef} className="inline-block">
        {text}
      </span>
    </div>
  );
}

/**
 * @param {object} props
 * @param {{ x: number, y: number, fontSize: number, color: string, fontWeight: string, textAlign: string, xEnd?: number }} props.nameField
 * @param {{ x: number, y: number, fontSize: number, color: string, fontWeight: string, textAlign: string }} props.mobileField
 * @param {{ name?: string, mobile?: string }} [props.variables]
 * @param {'name'|'mobile'|null} [props.selectedKey]
 * @param {(key: 'name'|'mobile' | null) => void} [props.onSelectKey]
 * @param {(key: 'name'|'mobile', x: number, y: number) => void} [props.onDragPosition]
 * @param {(key: 'name'|'mobile') => void} [props.onDragStart]
 * @param {() => void} [props.onDragEnd]
 * @param {boolean} [props.interactive]
 * @param {React.RefObject<HTMLElement|null>} [props.containerRef]
 */
export default function PosterTextOverlays({
  nameField,
  mobileField,
  variables = {},
  selectedKey = null,
  onSelectKey,
  onDragPosition,
  onDragStart,
  onDragEnd,
  interactive = false,
  containerRef,
}) {
  const cfg = {
    name: {
      field: nameField || {},
      text: variables.name != null ? String(variables.name) : '',
      label: 'Name',
    },
    mobile: {
      field: mobileField || {},
      text: variables.mobile != null ? String(variables.mobile) : '',
      label: 'Mobile',
    },
  };

  return (
    <>
      {OVERLAY_KEYS.map((key) => {
        const el = cfg[key].field;
        const text = cfg[key].text || '\u00a0';
        const isSelected = selectedKey === key;
        if (isCorridorNameField(key, el)) {
          return (
            <NameCorridorOverlay
              key={key}
              el={el}
              text={text}
              overlayKey={key}
              interactive={interactive}
              isSelected={isSelected}
              onSelectKey={onSelectKey}
              onDragPosition={onDragPosition}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              containerRef={containerRef}
            />
          );
        }
        return (
          <div
            key={key}
            data-poster-overlay={key}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            className={`absolute whitespace-pre-wrap break-words outline-none select-none touch-none ${
              interactive
                ? isSelected
                  ? 'z-10 cursor-grab ring-2 ring-violet-500 ring-offset-1 active:cursor-grabbing'
                  : 'z-[5] cursor-pointer hover:ring-1 hover:ring-gray-400'
                : ''
            }`}
            style={{
              left: `${Number(el.x) || 0}%`,
              top: `${Number(el.y) || 0}%`,
              maxWidth: `min(${POSTER_OVERLAY_MAX_WIDTH_PX}px, 90%)`,
              fontFamily: "'Inter', sans-serif",
              fontSize: `${Number(el.fontSize) || 16}px`,
              color: normalizeHexForCss(el.color),
              fontWeight: el.fontWeight || '400',
              textAlign: el.textAlign || 'left',
              transform: alignTransform(el.textAlign),
              lineHeight: 1.2,
              pointerEvents: interactive ? 'auto' : 'none',
            }}
            onClick={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              onSelectKey?.(key);
            }}
            onKeyDown={(e) => {
              if (!interactive) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectKey?.(key);
              }
            }}
            onPointerDown={
              interactive && onDragPosition && containerRef
                ? (e) => {
                    if (e.button !== 0) return;
                    e.stopPropagation();
                    e.preventDefault();
                    onSelectKey?.(key);
                    onDragStart?.(key);
                    const container = containerRef.current;
                    if (!(container instanceof HTMLElement)) return;
                    const rect = container.getBoundingClientRect();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startLeft = Number(el.x) || 0;
                    const startTop = Number(el.y) || 0;
                    const target = e.currentTarget;
                    target.setPointerCapture(e.pointerId);
                    const move = (ev) => {
                      const dx = ev.clientX - startX;
                      const dy = ev.clientY - startY;
                      const nx = startLeft + (dx / rect.width) * 100;
                      const ny = startTop + (dy / rect.height) * 100;
                      onDragPosition(key, clampPct(nx), clampPct(ny));
                    };
                    const up = () => {
                      try {
                        target.releasePointerCapture(e.pointerId);
                      } catch {
                        /* ignore */
                      }
                      onDragEnd?.();
                      window.removeEventListener('pointermove', move);
                      window.removeEventListener('pointerup', up);
                    };
                    window.addEventListener('pointermove', move);
                    window.addEventListener('pointerup', up);
                  }
                : undefined
            }
          >
            {text}
          </div>
        );
      })}
    </>
  );
}
