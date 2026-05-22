import { Link } from 'react-scroll';
import { FaArrowUp, FaGithub } from 'react-icons/fa';
import { SiBilibili } from 'react-icons/si';
import { MdEmail } from 'react-icons/md';

const socialLinks = [
  { icon: <SiBilibili size={20} />, label: 'Bilibili', href: '#' },
  { icon: <FaGithub size={20} />, label: 'GitHub', href: '#' },
  { icon: <MdEmail size={20} />, label: 'Email', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 pt-12 pb-8">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="gradient-text font-bold text-lg">
            吉马程序员
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="hero"
              smooth
              duration={800}
              className="text-gray-400 hover:text-brand-cyan transition-colors cursor-pointer text-sm"
            >
              首页
            </Link>
            <Link
              to="portfolio"
              smooth
              duration={800}
              offset={-80}
              className="text-gray-400 hover:text-brand-cyan transition-colors cursor-pointer text-sm"
            >
              作品
            </Link>
            <Link
              to="contact"
              smooth
              duration={800}
              offset={-80}
              className="text-gray-400 hover:text-brand-cyan transition-colors cursor-pointer text-sm"
            >
              联系
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-cyan transition-colors"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="text-center text-gray-500 text-xs mt-8">
          &copy; {new Date().getFullYear()} 吉马程序员. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
