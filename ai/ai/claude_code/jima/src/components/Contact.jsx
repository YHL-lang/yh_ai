import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';
import { SiBilibili } from 'react-icons/si';
import { MdEmail } from 'react-icons/md';

const socialLinks = [
  { icon: <SiBilibili size={26} />, label: 'Bilibili', href: '#' },
  { icon: <FaGithub size={26} />, label: 'GitHub', href: '#' },
  { icon: <MdEmail size={26} />, label: 'Email', href: 'mailto:jima@example.com' },
];

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('jima@example.com');
    } catch {
      // fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="section-container">
      <motion.div
        className="max-w-3xl mx-auto glass p-12 text-center relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-card-gradient" />
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
            让我们一起创造价值
          </h2>
          <p className="text-gray-400 mb-10 max-w-lg mx-auto">
            无论你是对技术课程感兴趣，还是希望开展企业培训或内容合作，都欢迎与我联系。
          </p>

          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="text-gray-300 font-mono text-lg">
              jima@example.com
            </span>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-all duration-300 ${
                copied
                  ? 'bg-green-500/20 text-green-400'
                  : 'hover:bg-gray-800 text-gray-400 hover:text-brand-cyan'
              }`}
              aria-label="复制邮箱"
            >
              {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-8">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-cyan transition-colors p-2 hover:scale-110 transform duration-200"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
