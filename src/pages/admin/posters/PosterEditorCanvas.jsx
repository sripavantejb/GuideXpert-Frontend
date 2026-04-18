import { useMemo, useRef, useState, memo, forwardRef, useCallback, useLayoutEffect } from 'react';
import PosterSvgLayer from '../../../components/Posters/PosterSvgLayer';
import PosterTextOverlays from '../../../components/Posters/PosterTextOverlays';
import {
  getDesignFrameSize,
  POSTER_PREVIEW_MAX_WIDTH_PX,
  POSTER_WIDTH_PX,
} from '../../../utils/posterExportDimensions';

const MIN_PREVIEW_WIDTH_PX = 120;

const GUIDE_THRESHOLD = 1.8;

/** Shows where the name text’s right edge is capped (corridor mode); admin preview only. */
function NameEndXGuide({ xEndPct }) {
  if (xEndPct == null || !Number.isFinite(xEndPct)) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[14]" aria-hidden>
      <div
        className="absolute top-0 bottom-0 w-0 border-l-2 border-dashed border-amber-500"
        style={{ left: `${xEndPct}%` }}
      />
      <div
        className="absolute top-1 z-[1] -translate-x-1/2 rounded bg-amber-500 px-1.5 py-0.5 text-center text-[0.5625rem] font-semibold uppercase tracking-wide text-white shadow-sm ring-1 ring-amber-600/30"
        style={{ left: `${xEndPct}%` }}
      >
        End X
      </div>
    </div>
  );
}

function GuideLines({ verticalPcts, horizontalPcts }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[15]" aria-hidden>
      {verticalPcts.map((pct) => (
        <div
          key={`v-${pct}`}
          className="absolute top-0 bottom-0 w-px bg-violet-500/75"
          style={{ left: `${pct}%` }}
        />
      ))}
      {horizontalPcts.map((pct) => (
        <div
          key={`h-${pct}`}
          className="absolute left-0 right-0 h-px bg-violet-500/75"
          style={{ top: `${pct}%` }}
        />
      ))}
    </div>
  );
}

const PosterEditorCanvas = forwardRef(function PosterEditorCanvas(
  {
    svgTemplate,
    nameField,
    mobileField,
    variables,
    selectedKey,
    onSelectKey,
    onUpdateFieldPosition,
    emptyHint,
    onFileDrop,
  },
  forwardedRef
) {
  const containerRef = useRef(null);
  const setContainerRef = useCallback(
    (node) => {
      containerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );
  const outerMeasureRef = useRef(null);
  const hasSvg = Boolean(svgTemplate && svgTemplate.trim());
  const designFrame = useMemo(() => getDesignFrameSize(svgTemplate), [svgTemplate]);
  /** Capped to POSTER_PREVIEW_MAX_WIDTH_PX so scale matches public `/p/` preview (getPreviewFrameSize). */
  const [slotWidthPx, setSlotWidthPx] = useState(POSTER_PREVIEW_MAX_WIDTH_PX);
  const [dragging, setDragging] = useState(null);

  useLayoutEffect(() => {
    if (!hasSvg) return;
    const el = outerMeasureRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) {
        setSlotWidthPx(
          Math.min(POSTER_PREVIEW_MAX_WIDTH_PX, Math.max(MIN_PREVIEW_WIDTH_PX, w))
        );
      }
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasSvg, svgTemplate]);

  const guideLines = useMemo(() => {
    if (!dragging) return { v: [], h: [] };
    const { key, x, y } = dragging;
    const other = key === 'name' ? mobileField : nameField;
    const v = new Set();
    const h = new Set();
    if (Math.abs(x - 50) < GUIDE_THRESHOLD) v.add(50);
    if (Math.abs(y - 50) < GUIDE_THRESHOLD) h.add(50);
    if (other && Math.abs(x - Number(other.x)) < GUIDE_THRESHOLD) v.add(Math.round(Number(other.x) * 100) / 100);
    if (other && Math.abs(y - Number(other.y)) < GUIDE_THRESHOLD) h.add(Math.round(Number(other.y) * 100) / 100);
    return { v: [...v], h: [...h] };
  }, [dragging, nameField, mobileField]);

  /** Same validity as corridor layout in PosterTextOverlays (xEnd > x). */
  const nameEndXGuidePct = useMemo(() => {
    const xf = nameField;
    if (!xf || typeof xf !== 'object') return null;
    const x = Number(xf.x);
    const xe = Number(xf.xEnd);
    if (!Number.isFinite(x) || !Number.isFinite(xe) || xe <= x) return null;
    return Math.round(xe * 100) / 100;
  }, [nameField]);

  const handleDragPosition = (key, x, y) => {
    setDragging({ key, x, y });
    onUpdateFieldPosition(key, x, y);
  };

  const handleDragStart = (key) => {
    const f = key === 'name' ? nameField : mobileField;
    if (f) setDragging({ key, x: f.x, y: f.y });
  };

  const endDrag = () => setDragging(null);

  const previewScale = hasSvg ? slotWidthPx / POSTER_WIDTH_PX : 0;
  const scaledOuterHeight = hasSvg
    ? Math.max(1, Math.round(designFrame.height * previewScale * 1000) / 1000)
    : 0;

  return (
    <div className="relative flex min-h-[360px] flex-col" onClick={() => onSelectKey?.(null)}>
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-500 ring-1 ring-gray-200/80 shadow-sm backdrop-blur-sm">
          Live preview
        </span>
        <span className="hidden text-xs text-gray-400 sm:inline">
          Click name or mobile · drag to align · typography in the inspector
        </span>
      </div>

      <div
        className={`flex flex-1 flex-col items-center justify-center rounded-2xl border border-gray-200/90 bg-[linear-gradient(180deg,#f1f5f9_0%,#e2e8f0_100%)] p-4 sm:p-8 ${
          hasSvg ? 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          e.preventDefault();
          onFileDrop?.(e);
        }}
      >
        {!hasSvg && (
          <div className="flex max-w-sm flex-col items-center text-center">
            <p className="text-sm font-medium text-slate-700">{emptyHint || 'Upload an SVG to start'}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Only <strong className="font-medium text-slate-700">name</strong> and{' '}
              <strong className="font-medium text-slate-700">mobile number</strong> appear as text—you position and style
              them here.
            </p>
          </div>
        )}

        {hasSvg ? (
          <div
            ref={outerMeasureRef}
            className="relative mx-auto w-full overflow-hidden rounded-xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]"
            style={{ height: scaledOuterHeight, maxWidth: POSTER_PREVIEW_MAX_WIDTH_PX }}
          >
            <div
              ref={setContainerRef}
              className="relative overflow-hidden bg-white"
              style={{
                width: designFrame.width,
                height: designFrame.height,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                boxSizing: 'border-box',
                WebkitTextSizeAdjust: '100%',
                textSizeAdjust: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <PosterSvgLayer
                svgTemplate={svgTemplate}
                className="absolute inset-0 h-full w-full overflow-hidden [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
              />
              <NameEndXGuide xEndPct={nameEndXGuidePct} />
              {dragging && <GuideLines verticalPcts={guideLines.v} horizontalPcts={guideLines.h} />}
              <PosterTextOverlays
                nameField={nameField}
                mobileField={mobileField}
                variables={variables}
                selectedKey={selectedKey}
                onSelectKey={onSelectKey}
                containerRef={containerRef}
                onDragStart={handleDragStart}
                onDragPosition={handleDragPosition}
                onDragEnd={endDrag}
                interactive
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default memo(PosterEditorCanvas);
