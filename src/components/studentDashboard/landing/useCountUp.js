import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export function useCountUp(target, { duration = 2200, suffix = '', decimals = 0 } = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(progress);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString('en-IN');

  return { ref, display: `${formatted}${suffix}` };
}
