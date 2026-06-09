import { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * Recharts needs a positive width/height. Percent-based sizing often yields -1 when
 * the parent is still laying out (flex/grid). Measure the container first.
 */
export default function AdminChartFrame({ height = 256, children, className = '' }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;

    const update = () => {
      const nextWidth = Math.floor(node.getBoundingClientRect().width);
      if (nextWidth > 0) setWidth(nextWidth);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`w-full min-w-0 ${className}`.trim()}
      style={{ height, minHeight: height }}
    >
      {width > 0 ? (
        <ResponsiveContainer width={width} height={height}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
