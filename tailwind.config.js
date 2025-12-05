/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'soft-blue': {
          50: '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7', // Main soft blue
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0f3a53',
        },
        'soft-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Main soft green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        white: '#ffffff', // Explicitly define white
      },
    },
  },
  plugins: [],
};
export default config;
