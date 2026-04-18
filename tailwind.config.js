/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#09090b',
          1: '#111113',
          2: '#18181b',
          3: '#232326',
          4: '#2c2c30',
        },
        line: {
          subtle:   'rgba(255,255,255,0.06)',
          default:  'rgba(255,255,255,0.10)',
          emphasis: 'rgba(255,255,255,0.20)',
        },
        ink: {
          primary:   '#ffffff',
          secondary: '#a1a1aa',
          tertiary:  '#52525b',
          muted:     '#3f3f46',
        },
        accent: {
          DEFAULT: '#EF4444',
          muted:   'rgba(239,68,68,0.10)',
          glow:    'rgba(239,68,68,0.20)',
          strong:  'rgba(239,68,68,0.30)',
        },
        success: '#34d399',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        'glow-red':    '0 0 20px rgba(239,68,68,0.25)',
        'glow-red-sm': '0 0 10px rgba(239,68,68,0.15)',
        'modal':       '0 24px 48px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0px rgba(239,68,68,0.3)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(239,68,68,0)' },
        },
        'score-bump': {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        'screen-enter': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'logo-scale': {
          '0%':   { transform: 'scale(0.6)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'wordmark-in': {
          '0%':   { opacity: '0', letterSpacing: '0.2em' },
          '100%': { opacity: '1', letterSpacing: '-0.02em' },
        },
        'confetti-fall': {
          '0%':   { transform: 'translate(0, 0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'var(--tx, 40px) var(--ty, 80px) rotate(var(--r, 180deg))', opacity: '0' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'flash-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(52,211,153,0.5)' },
          '60%':  { boxShadow: '0 0 0 12px rgba(52,211,153,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(52,211,153,0)' },
        },
        'slide-left': {
          '0%':   { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-right': {
          '0%':   { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'pulse-ring':    'pulse-ring 1.5s ease-in-out infinite',
        'score-bump':    'score-bump 0.2s ease-out',
        'screen-enter':  'screen-enter 0.2s ease-out',
        'logo-scale':    'logo-scale 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        'wordmark-in':   'wordmark-in 0.5s ease-out forwards',
        'confetti-fall': 'confetti-fall 1.2s ease-out forwards',
        'shimmer':       'shimmer 2s linear infinite',
        'flash-ring':    'flash-ring 0.4s ease-out',
        'slide-left':    'slide-left 0.18s ease-out',
        'slide-right':   'slide-right 0.18s ease-out',
      },
    },
  },
  plugins: [],
}
