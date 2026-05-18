import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E87F24',
          dark: '#B85F0E',
          light: '#F4A561',
        },
        secondary: {
          DEFAULT: '#73A5CA',
          dark: '#4A7A9B',
          light: '#A3C4DE',
        },
        accent: {
          DEFAULT: '#FFC81E',
          dark: '#CC9E00',
          light: '#FFD966',
        },
        surface: {
          DEFAULT: '#FEFDDF',
          dark: '#1A1A0F',
        },
        brand: {
          text: '#1A1206',
          'text-dark': '#F5F0DC',
          card: '#FFFEF0',
          'card-dark': '#252510',
          border: '#E8E5C0',
          'border-dark': '#3A3A1A',
        },
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'scroll-left': 'scrollLeft 40s linear infinite',
        'scroll-right': 'scrollRight 40s linear infinite',
        'scroll-left-slow': 'scrollLeft 60s linear infinite',
        'scroll-right-slow': 'scrollRight 60s linear infinite',
        'scroll-left-fast': 'scrollLeft 20s linear infinite',
        'scroll-right-fast': 'scrollRight 20s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-left': 'fadeLeft 0.6s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scrollRight: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeLeft: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [typography],
};

export default config;
