/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'prestake-blue': '#1a1a1a',
        'prestake-green': '#00d4aa',
        'prestake-purple': '#8b5cf6',
      },
    },
  },
  plugins: [],
}
