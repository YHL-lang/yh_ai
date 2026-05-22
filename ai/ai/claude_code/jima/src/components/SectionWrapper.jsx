import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function SectionWrapper({ id, children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`py-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}
