import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function FloatingParticles({ count = 18, className = '', dark = true }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: `${(i * 17 + 11) % 100}%`,
        y: `${(i * 23 + 7) % 100}%`,
        size: 2 + (i % 4),
        delay: (i % 6) * 0.4,
        duration: 4 + (i % 5),
      })),
    [count]
  );

  const fill = dark ? 'rgba(52, 211, 153, 0.35)' : 'rgba(16, 185, 129, 0.25)';

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: fill }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
