/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#F0F4F8',
        card: '#FFFFFF',
        card2: '#F1F5F9',
        card3: '#E8EEF5',
        accent: '#00C98A',
        'accent-dim': '#00A873',
        blue: '#4F9DFF',
        amber: '#D97706',
        danger: '#EF4444',
        pink: '#EC4899',
        muted: '#94A3B8',
        'text-muted': '#64748B',
        'text-primary': '#1E293B',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0,201,138,0.4), 0 0 40px rgba(0,201,138,0.2)',
        'glow-green-lg': '0 0 30px rgba(0,201,138,0.6), 0 0 60px rgba(0,201,138,0.3)',
        'card': '0 2px 16px rgba(0,0,0,0.08)',
      },
      animation: {
        'orb-pulse': 'orbPulse 2.5s ease-in-out infinite',
        'orb-ring': 'orbRing 2.5s ease-in-out infinite',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'typing': 'typing 1.2s ease-in-out infinite',
      },
      keyframes: {
        orbPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,229,160,0.5), 0 0 40px rgba(0,229,160,0.25)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 35px rgba(0,229,160,0.8), 0 0 70px rgba(0,229,160,0.4)', transform: 'scale(1.06)' },
        },
        orbRing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.3)', opacity: '0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
