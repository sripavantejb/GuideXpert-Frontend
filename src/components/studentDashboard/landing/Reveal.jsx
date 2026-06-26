import { motion } from 'framer-motion';
import { fadeUp, defaultViewport } from './motion';

export default function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={fadeUp}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
