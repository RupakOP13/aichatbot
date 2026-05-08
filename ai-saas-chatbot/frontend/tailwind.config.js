module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0effe',
          100: '#d9d5fd',
          200: '#b3abfc',
          300: '#a29bfe',
          400: '#8c82f7',
          500: '#6c5ce7',
          600: '#5a4bd4',
          700: '#483abe',
          800: '#362aa8',
          900: '#1a1a3e',
          950: '#0a0a1a',
        },
        surface: {
          primary: '#0a0a1a',
          secondary: '#111128',
          tertiary: '#1a1a3e',
          elevated: '#1e1e45',
        }
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(108, 92, 231, 0.15)',
        'glow-lg': '0 0 60px rgba(108, 92, 231, 0.25)',
        'inner-glow': 'inset 0 0 30px rgba(108, 92, 231, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideInUp 0.4s ease forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      }
    }
  },
  plugins: []
};
