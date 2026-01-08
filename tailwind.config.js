/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        soft: {
          green: '#d4f4dd',
          blue: '#e3f2fd',
          peach: '#ffe4e1',
          yellow: '#fff9c4',
        }
      },
      borderRadius: {
        'card': '16px',
      },
    },
  },
  plugins: [],
}
