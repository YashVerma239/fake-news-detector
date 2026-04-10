/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: {
          900: '#050508',
          800: '#0c0c14',
          700: '#12121e',
          600: '#1a1a2e',
          500: '#16213e',
        },
        accent: {
          blue:   '#3b82f6',
          indigo: '#6366f1',
          purple: '#8b5cf6',
          cyan:   '#06b6d4',
        },
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':   'spin 3s linear infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                   to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        glow:    { from: { boxShadow: '0 0 5px #3b82f6' },   to: { boxShadow: '0 0 20px #6366f1, 0 0 40px #3b82f640' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};