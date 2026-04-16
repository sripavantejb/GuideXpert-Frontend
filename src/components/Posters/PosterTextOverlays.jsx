function clampPct(n) {
  return Math.min(100, Math.max(0, n));
}

function alignTransform(textAlign) {
  if (textAlign === 'center') return 'translateX(-50%)';
  if (textAlign === 'right') return 'translateX(-100%)';
  return 'translateX(0)';
}

const OVERLAY_KEYS = ['name', 'mobile'];

/**
 * @param {object} props
 * @param {{ x: number, y: number, fontSize: number, color: string, fontWeight: string, textAlign: string }} props.nameField
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
        return (
          <div
            key={key}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            className={`absolute max-w-[90%] whitespace-pre-wrap break-words outline-none select-none touch-none ${
              interactive
                ? isSelected
                  ? 'z-10 cursor-grab ring-2 ring-violet-500 ring-offset-1 active:cursor-grabbing'
                  : 'z-[5] cursor-pointer hover:ring-1 hover:ring-gray-400'
                : ''
            }`}
            style={{
              left: `${Number(el.x) || 0}%`,
              top: `${Number(el.y) || 0}%`,
              fontSize: `${Number(el.fontSize) || 16}px`,
              color: el.color || '#000',
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
