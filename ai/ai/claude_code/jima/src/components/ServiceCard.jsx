import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ServiceCard({ icon, title, description }) {
  return (
    <motion.div
      variants={item}
      className="glass p-8 flex flex-col items-center text-center group hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-purple/10 transition-all duration-300"
    >
      <div className="text-4xl mb-5 text-brand-cyan group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-100 mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
