import { useState, useEffect } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

/**
 * AnimatedElement - Wrapper component for scroll-triggered animations
 * @param {string} variant - Animation variant: 'fadeIn', 'slideUp', 'scaleIn', 'fadeInUp'
 * @param {number} delay - Animation delay in seconds, default 0
 * @param {number} duration - Animation duration in seconds, default 0.4
 * @param {React.ReactNode} children - Child elements to animate
 * @param {string} className - Additional CSS classes
 * @param {Object} style - Additional inline styles
 * @param {number} threshold - Intersection threshold (0-1), default 0.2
 * @param {boolean} once - Whether to animate only once, default true
 */
const AnimatedElement = ({
  variant = 'fadeInUp',
  delay = 0,
  duration = 0.4,
  children,
  className = '',
  style = {},
  threshold = 0.2,
  once = true,
  ...props
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold, once });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const animationClass = isVisible || prefersReducedMotion 
    ? `animate-${variant}` 
    : `animate-${variant}-initial`;

  const animationStyle = {
    ...style,
    animationDelay: prefersReducedMotion ? '0s' : `${delay}s`,
    animationDuration: prefersReducedMotion ? '0s' : `${duration}s`,
    animationFillMode: 'both',
  };

  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
      style={animationStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedElement;
