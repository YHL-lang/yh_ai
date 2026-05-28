import { motion } from 'framer-motion';
import StatCounter from './StatCounter';

const stats = [
  { end: 5, suffix: '万+', label: '全平台粉丝' },
  { end: 200, suffix: '+', label: '文章 / 视频' },
  { end: 8, suffix: '年+', label: '开发经验' },
  { end: 50, suffix: '+', label: '开源项目' },
];

export default function About() {
  return (
    <div className="section-container">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-4 gradient-text"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        关于我
      </motion.h2>
      <div className="w-24 h-1 bg-gradient-to-r from-brand-cyan to-brand-purple mx-auto mb-12 rounded-full" />

      <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
        <motion.div
          className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 rounded-2xl border-2 border-brand-cyan/30 animate-glow" />
          <div className="absolute inset-2 rounded-2xl overflow-hidden">
            <img
              src="https://picsum.photos/seed/jima/400/400"
              alt="吉马"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>

        <motion.div
          className="text-gray-300 space-y-4"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-lg leading-relaxed">
            你好，我是吉马，一名全栈开发者与技术自媒体创作者。8
            年来深耕前端、后端与 AI
            领域，致力于用通俗易懂的方式分享前沿技术知识。
          </p>
          <p className="text-gray-400 leading-relaxed">
            在 Bilibili、微信公众号、掘金等平台持续输出高质量技术内容，累计影响超过
            5 万开发者。我相信每一个技术难题背后，都有一个简单的解释。
          </p>
          <p className="text-gray-400 leading-relaxed">
            除了内容创作，我还为多家企业提供技术培训与架构咨询服务，帮助团队提升技术实力和工程效率。
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
        {stats.map((s) => (
          <StatCounter
            key={s.label}
            end={s.end}
            suffix={s.suffix}
            label={s.label}
          />
        ))}
      </div>
    </div>
  );
}
