/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'light-gray': '#d7d7d7', 
        'light-grey':'#e2e2e2',
      },
    },
  },
  plugins: [],
}

