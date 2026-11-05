/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#8098fb',
          500: '#6272f8',
          600: '#4f52ee',
          700: '#4040d4',
          800: '#3535ab',
          900: '#302f87',
          950: '#1e1d52',
        },
        brand: {
          orange: '#ff6b35',
          teal:   '#00b4d8',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f8f9fc',
          subtle:  '#f1f3f9',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter var', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .04)',
        'card-hover': '0 8px 24px -4px rgb(0 0 0 / .10), 0 2px 8px -2px rgb(0 0 0 / .06)',
        nav:   '0 1px 0 0 rgb(0 0 0 / .06)',
        btn:   '0 1px 2px 0 rgb(0 0 0 / .08)',
        soft:  '0 4px 16px -2px rgb(79 82 238 / .16)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease both',
        'fade-in':   'fadeIn 0.25s ease both',
        'scale-in':  'scaleIn 0.2s ease both',
        'slide-down':'slideDown 0.2s ease both',
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn:   { from: { opacity: 0, transform: 'scale(.96)' }, to: { opacity: 1, transform: 'none' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'none' } },
      },
    },
  },
  plugins: [],
}
