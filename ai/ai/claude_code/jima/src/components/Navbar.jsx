import { Link } from 'react-scroll';
import { useState, useEffect } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import { navLinks } from '../data/navLinks';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass !rounded-none !border-t-0 !border-l-0 !border-r-0 bg-brand-dark/80'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container flex items-center justify-between h-16">
        <Link
          to="hero"
          smooth
          duration={800}
          className="text-xl font-bold gradient-text cursor-pointer select-none"
        >
          吉马程序员
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              smooth
              spy
              offset={-80}
              duration={800}
              activeClass="text-brand-cyan"
              className="text-gray-300 hover:text-brand-cyan transition-colors cursor-pointer text-sm font-medium uppercase tracking-wider"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          className="md:hidden text-gray-300 hover:text-brand-cyan transition-colors text-2xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass !rounded-none border-t-0 border-l-0 border-r-0 bg-brand-dark/95">
          <div className="section-container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                smooth
                offset={-80}
                duration={800}
                activeClass="text-brand-cyan"
                className="text-gray-300 hover:text-brand-cyan transition-colors cursor-pointer text-sm font-medium uppercase tracking-wider"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
