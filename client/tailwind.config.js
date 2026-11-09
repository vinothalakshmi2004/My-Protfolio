/** @type {import('tailwindcss').Config} */

/** rgb(var(--x) / <alpha>) lets classes like `bg-brand/10` work with runtime CSS variables. */
const cssVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    // Default Tailwind breakpoints (mobile-first):
    //   base <640 (phones 320–639) | sm ≥640 | md ≥768 (tablet) | lg ≥1024 (laptop) | xl ≥1280 | 2xl ≥1536 (desktop)
    extend: {
      colors: {
        // Landing-page theme colours — driven by settings.theme via <ThemeColors /> (see utils/color.js)
        brand: {
          DEFAULT: cssVar('--color-brand'),
          light: cssVar('--color-brand-light'),
          dark: cssVar('--color-brand-dark'),
        },
        accent: {
          DEFAULT: cssVar('--color-accent'),
          light: cssVar('--color-accent-light'),
        },
        // Fixed palette for the admin dashboard UI
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
