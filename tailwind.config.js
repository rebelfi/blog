const tokens = require('@contentful/f36-tokens');
const { fontFamily } = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

const contentfulColors = Object.entries(tokens).reduce((acc, [key, value]) => {
  if (/^#[0-9A-F]{6}$/i.test(value)) {
    acc[key] = value;
  }
  return acc;
}, {});

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      // Include default Tailwind colors
      ...colors,
      // Include Contentful tokens
      ...contentfulColors,
      // RebelFi brand colors
      'rebel-purple': {
        50: '#faf7ff',
        100: '#f2ebfe',
        200: '#e8dafe',
        300: '#d5bbfc',
        400: '#bd8bf8',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c22ce',
        800: '#681da8',
        900: '#581c87',
      },
      'rebel-pink': {
        50: '#fef7f7',
        100: '#feecec',
        200: '#fdd8d8',
        300: '#fab8b8',
        400: '#f68989',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
      // Keep existing colors for compatibility
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
    },
    extend: {
      maxWidth: {
        '8xl': '90rem',
      },
      letterSpacing: {
        snug: '-0.011em',
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xl': '1.75rem',
        '4xl': '2.5rem',
      },
      lineHeight: {
        tighter: 1.1,
      },
      fontFamily: {
        sans: ['var(--font-roboto)', ...fontFamily.sans],
      },
      backgroundImage: {
        'gradient-rebel': 'linear-gradient(135deg, #9333ea 0%, #ef4444 100%)',
        'gradient-rebel-subtle': 'linear-gradient(135deg, #a855f7 0%, #f68989 50%, #fbbf24 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1e1b4b 0%, #581c87 100%)',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
