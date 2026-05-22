import { motion } from 'framer-motion';
import PlatformStat from './PlatformStat';
import TestimonialCard from './TestimonialCard';
import { SiBilibili } from 'react-icons/si';
import { FaGithub, FaWeixin } from 'react-icons/fa';
import { SiJuejin } from 'react-icons/si';

const platforms = [
  { icon: <SiBilibili size={28} />, name: 'Bilibili', count: '3.2万', label: '粉丝' },
  { icon: <FaWeixin size={28} />, name: '微信公众号', count: '1.5万', label: '订阅' },
  { icon: <SiJuejin size={28} />, name: '掘金', count: '8千', label: '关注' },
  { icon: <FaGithub size={28} />, name: 'GitHub', count: '2千', label: 'Stars' },
];

const testimonials = [
  {
    quote: '吉马的课程让我从零基础到成功转行，讲解清晰又实用。强烈推荐！',
    author: '小李',
    role: '前端开发者',
  },
  {
    quote: '企业培训效果超出预期，团队在架构设计上有了显著提升。',
    author: '王总',
    role: '某科技公司 CTO',
  },
  {
    quote: '关注吉马两年了，每篇文章都是干货满满，是我每天必看的技术号。',
    author: '阿强',
    role: '全栈工程师',
  },
];

export default function SocialProof() {
  return (
    <div className="section-container">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-4 gradient-text"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        影响力
      </motion.h2>
      <div className="w-24 h-1 bg-gradient-to-r from-brand-cyan to-brand-purple mx-auto mb-12 rounded-full" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
        {platforms.map((p) => (
          <PlatformStat key={p.name} {...p} />
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t) => (
          <TestimonialCard key={t.author} {...t} />
        ))}
      </div>
    </div>
  );
}
