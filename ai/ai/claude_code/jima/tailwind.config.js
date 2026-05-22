/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          dark: '#0a0a0f',
          card: '#111827',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, transparent 70%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6,182,212,0.5)' },
          '100%': {
            boxShadow:
              '0 0 20px rgba(6,182,212,0.8), 0 0 60px rgba(139,92,246,0.3)',
          },
        },
      },
    },
  },
  plugins: [],
};
