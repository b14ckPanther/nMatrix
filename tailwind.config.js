/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'logo': ['"Dancing Script"', 'cursive'],
        'sans': ['Exo 2', ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
        'grid': 'linear-gradient(to right, theme(colors.cyan.400/0.1) 1px, transparent 1px), linear-gradient(to bottom, theme(colors.cyan.400/0.1) 1px, transparent 1px)',
        'starfield': "radial-gradient(1.5px 1.5px at 25px 5px, white, transparent), radial-gradient(1.5px 1.5px at 50px 25px, white, transparent), radial-gradient(2px 2px at 150px 70px, white, transparent), radial-gradient(2px 2px at 90px 120px, white, transparent), radial-gradient(2.5px 2.5px at 200px 150px, white, transparent)",
      },
      backgroundSize: {
        'grid-size': '40px 40px',
      },
      colors: {
        'modern-purple': '#8b5cf6',
      },
      gradientColorStops: {
        'hero': ['#38b2ac', '#8b5cf6', '#06b6d4'],
      },
    },
  },
  plugins: [],
}
