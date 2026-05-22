import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

export default function SkillCard({ name, icon }) {
  return (
    <motion.div
      variants={item}
      className="glass flex flex-col items-center gap-3 p-5 cursor-default hover:border-brand-cyan/30 hover:shadow-lg hover:shadow-brand-cyan/10 transition-all duration-300 group"
    >
      <div className="text-3xl text-gray-400 group-hover:text-brand-cyan transition-colors duration-300">
        {icon}
      </div>
      <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
        {name}
      </span>
    </motion.div>
  );
}
