import { motion } from 'framer-motion';

export default function FloatingBadge({ text, x, y, delay }) {
  return (
    <motion.div
      className="absolute hidden sm:block glass px-4 py-2 text-sm font-medium text-brand-cyan select-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.span
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, delay }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}
