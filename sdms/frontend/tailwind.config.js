/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#eef1f7',
          100: '#d6dded',
          200: '#adbadb',
          300: '#8497c3',
          400: '#5c74a8',
          500: '#3d5488',
          600: '#2b3f6b',
          700: '#1f2f52',
          800: '#1B2A4A',
          900: '#131f38',
          950: '#0c1425',
        },
        brass: {
          50: '#fdf8e9',
          100: '#f9edc0',
          200: '#f2da85',
          300: '#e9c34b',
          400: '#d9ae30',
          500: '#C9A227',
          600: '#a97f1e',
          700: '#87611b',
          800: '#6d4d1c',
          900: '#5c411c',
        },
        success: { 50: '#eaf7f0', 500: '#2F8F5B', 600: '#24734a' },
        warning: { 50: '#fdf2e3', 500: '#E08E23', 600: '#bb731a' },
        danger: { 50: '#fbeaea', 500: '#D64545', 600: '#b53535' },
        surface: {
          light: '#F7F8FA',
          dark: '#0F172A',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(27,42,74,0.06), 0 1px 3px 0 rgba(27,42,74,0.08)',
        'card-hover': '0 4px 12px -2px rgba(27,42,74,0.12), 0 2px 6px -2px rgba(27,42,74,0.08)',
      },
      borderRadius: {
        xl2: '0.875rem',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
