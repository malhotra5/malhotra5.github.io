/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        dark: '#252934',
        accent: '#04C2C9',
        pink: '#E31B6D',
        'gray-text': '#616161',
      },
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
        open: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
