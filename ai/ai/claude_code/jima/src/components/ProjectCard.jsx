import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const typeBadgeColors = {
  文章: 'bg-blue-500/20 text-blue-400',
  视频: 'bg-red-500/20 text-red-400',
  项目: 'bg-purple-500/20 text-purple-400',
};

export default function ProjectCard({ title, type, tags, imageUrl, link }) {
  return (
    <motion.div variants={item} className="glass overflow-hidden group cursor-pointer">
      <div className="h-40 bg-card-gradient relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl gradient-text font-bold opacity-30">JM</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-brand-cyan transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FiExternalLink size={22} />
            </a>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadgeColors[type] || 'bg-gray-500/20 text-gray-400'}`}
          >
            {type}
          </span>
        </div>
        <h3 className="text-gray-100 font-semibold mb-3 group-hover:text-brand-cyan transition-colors">
          {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
