/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        qhysync: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c3d6ff',
          300: '#94b5ff',
          400: '#5e8aff',
          500: '#3b61ff',
          600: '#233eff',
          700: '#1a2bd1',
          800: '#1b26a8',
          900: '#1a2384',
          950: '#0c104e',
        },
        dark: {
          base: '#090d16',
          card: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          text: '#f8fafc',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.8, boxShadow: '0 0 15px rgba(59, 97, 255, 0.4)' },
          '50%': { opacity: 1, boxShadow: '0 0 30px rgba(59, 97, 255, 0.8)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' }
        },
        'fadeIn': {
          'from': { opacity: 0, transform: 'translateY(6px)' },
          'to': { opacity: 1, transform: 'translateY(0)' }
        },
        'slideUp': {
          'from': { opacity: 0, transform: 'translateY(20px)' },
          'to': { opacity: 1, transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
