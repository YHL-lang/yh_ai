import { motion } from 'framer-motion';
import ServiceCard from './ServiceCard';
import { services } from '../data/services.jsx';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

export default function Services() {
  return (
    <div className="section-container">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-4 gradient-text"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        我能为你做什么
      </motion.h2>
      <div className="w-24 h-1 bg-gradient-to-r from-brand-cyan to-brand-purple mx-auto mb-12 rounded-full" />

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {services.map((s) => (
          <ServiceCard key={s.title} {...s} />
        ))}
      </motion.div>
    </div>
  );
}
