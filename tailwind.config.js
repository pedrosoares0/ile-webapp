/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#414141',
        'brand-white': '#FCFCFC',
        'brand-beige': '#fef7e7',
        'nav-active-start': '#F48490',
        'nav-active-end': '#F48490', // User mentioned #F48490 to #F48490, I'll use a gradient if needed
        'finance-start': '#E8F8E4',
        'finance-end': '#C9FCC2',
        'events-start': '#C9FCC2',
        'events-end': '#FCE8C3',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
