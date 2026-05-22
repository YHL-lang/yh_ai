import { motion } from 'framer-motion';
import SkillCard from './SkillCard';
import { skillCategories } from '../data/skills.jsx';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export default function Skills() {
  return (
    <div className="section-container">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-4 gradient-text"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        技术栈
      </motion.h2>
      <div className="w-24 h-1 bg-gradient-to-r from-brand-cyan to-brand-purple mx-auto mb-12 rounded-full" />

      <div className="max-w-5xl mx-auto space-y-12">
        {skillCategories.map((category) => (
          <div key={category.name}>
            <h3 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-3">
              <span className="text-brand-cyan">{category.icon}</span>
              {category.name}
            </h3>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {category.skills.map((skill) => (
                <SkillCard key={skill.name} name={skill.name} icon={skill.icon} />
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
