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
        bg: '#0A0B1A',
        card: '#111228',
        card2: '#181A35',
        card3: '#1E2040',
        accent: '#00E5A0',
        'accent-dim': '#00B882',
        blue: '#4F9DFF',
        amber: '#FBBF24',
        danger: '#F87171',
        pink: '#F472B6',
        muted: '#4B5280',
        'text-muted': '#8892B0',
        'text-primary': '#E8EAF6',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0,229,160,0.5), 0 0 40px rgba(0,229,160,0.3)',
        'glow-green-lg': '0 0 30px rgba(0,229,160,0.7), 0 0 60px rgba(0,229,160,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
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
