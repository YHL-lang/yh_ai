import ParticleCanvas from './ParticleCanvas';
import FloatingBadge from './FloatingBadge';
import { Link } from 'react-scroll';
import { motion } from 'framer-motion';

const floatingBadges = [
  { text: 'React', x: '15%', y: '20%', delay: 0 },
  { text: 'Node.js', x: '80%', y: '15%', delay: 1.5 },
  { text: 'Python', x: '10%', y: '65%', delay: 0.8 },
  { text: 'AI', x: '85%', y: '55%', delay: 2.2 },
  { text: 'Docker', x: '75%', y: '75%', delay: 1.0 },
  { text: 'TypeScript', x: '20%', y: '80%', delay: 3.0 },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-hero-gradient" />
      <ParticleCanvas />

      {floatingBadges.map((badge) => (
        <FloatingBadge
          key={badge.text}
          text={badge.text}
          x={badge.x}
          y={badge.y}
          delay={badge.delay}
        />
      ))}

      <div className="relative z-10 text-center section-container">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <span className="gradient-text">吉马程序员</span>
        </motion.h1>

        <motion.p
          className="text-xl sm:text-2xl text-gray-300 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          全栈开发者 &nbsp;|&nbsp; 技术自媒体 &nbsp;|&nbsp; AI 探索者
        </motion.p>

        <motion.p
          className="text-gray-400 max-w-xl mx-auto mb-10 text-base sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        >
          分享前沿技术洞察，助力每一位开发者持续成长。在代码的世界里，一起探索无限可能。
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
        >
          <Link
            to="portfolio"
            smooth
            offset={-80}
            duration={800}
            className="cursor-pointer inline-block px-8 py-3 rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue text-white font-semibold hover:shadow-lg hover:shadow-brand-cyan/30 transition-shadow active:scale-95"
          >
            探索我的作品
          </Link>
          <Link
            to="contact"
            smooth
            offset={-80}
            duration={800}
            className="cursor-pointer inline-block px-8 py-3 rounded-full border border-white/20 text-gray-300 font-semibold hover:border-brand-cyan hover:text-brand-cyan transition-colors active:scale-95 backdrop-blur-sm"
          >
            与我合作
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-brand-cyan rounded-full" />
        </div>
      </div>
    </section>
  );
}
