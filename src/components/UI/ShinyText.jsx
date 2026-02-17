import { useState, useCallback, useEffect, useRef } from 'react';

const ShinyText = ({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = 'left',
  delay = 0,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const spanRef = useRef(null);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);
  const rafRef = useRef(null);
  const directionRef = useRef(direction === 'left' ? 1 : -1);

  const animationDuration = speed * 1000;
  const delayDuration = delay * 1000;

  const setPosition = useCallback((p) => {
    if (spanRef.current) {
      spanRef.current.style.backgroundPosition = `${150 - p * 2}% center`;
    }
  }, []);

  useEffect(() => {
    const tick = (time) => {
      if (disabled || isPaused) {
        lastTimeRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;
      elapsedRef.current += deltaTime;

      if (yoyo) {
        const cycleDuration = animationDuration + delayDuration;
        const fullCycle = cycleDuration * 2;
        const cycleTime = elapsedRef.current % fullCycle;

        if (cycleTime < animationDuration) {
          const p = (cycleTime / animationDuration) * 100;
          setPosition(directionRef.current === 1 ? p : 100 - p);
        } else if (cycleTime < cycleDuration) {
          setPosition(directionRef.current === 1 ? 100 : 0);
        } else if (cycleTime < cycleDuration + animationDuration) {
          const reverseTime = cycleTime - cycleDuration;
          const p = 100 - (reverseTime / animationDuration) * 100;
          setPosition(directionRef.current === 1 ? p : 100 - p);
        } else {
          setPosition(directionRef.current === 1 ? 0 : 100);
        }
      } else {
        const cycleDuration = animationDuration + delayDuration;
        const cycleTime = elapsedRef.current % cycleDuration;

        if (cycleTime < animationDuration) {
          const p = (cycleTime / animationDuration) * 100;
          setPosition(directionRef.current === 1 ? p : 100 - p);
        } else {
          setPosition(directionRef.current === 1 ? 100 : 0);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [disabled, isPaused, yoyo, animationDuration, delayDuration, setPosition]);

  useEffect(() => {
    directionRef.current = direction === 'left' ? 1 : -1;
    elapsedRef.current = 0;
    setPosition(directionRef.current === 1 ? 0 : 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsPaused(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsPaused(false);
  }, [pauseOnHover]);

  const gradientStyle = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: '200% auto',
    backgroundPosition: direction === 'left' ? '150% center' : '-50% center',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <span
      ref={spanRef}
      className={`inline-block ${className}`}
      style={gradientStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
    </span>
  );
};

export default ShinyText;
