import { useState } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { projects } from '../data/portfolio';

const filters = ['全部', '文章', '视频', '项目'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('全部');

  const filtered =
    activeFilter === '全部'
      ? projects
      : projects.filter((p) => p.type === activeFilter);

  return (
    <div className="section-container">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-4 gradient-text"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        精选作品
      </motion.h2>
      <div className="w-24 h-1 bg-gradient-to-r from-brand-cyan to-brand-purple mx-auto mb-8 rounded-full" />

      <div className="flex justify-center gap-4 mb-12">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === f
                ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-lg shadow-brand-cyan/20'
                : 'glass text-gray-400 hover:text-gray-200 hover:border-white/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        key={activeFilter}
      >
        {filtered.map((p) => (
          <ProjectCard key={p.title} {...p} />
        ))}
      </motion.div>
    </div>
  );
}
