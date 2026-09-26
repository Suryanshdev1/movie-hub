/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brutal: {
          bg: '#f5f5f0',
          black: '#0a0a0a',
          red: '#e8291c',
          white: '#ffffff',
        }
      },
      boxShadow: {
        'brutal-sm': '3px 3px 0px 0px rgba(10,10,10,1)',
        'brutal': '6px 6px 0px 0px rgba(10,10,10,1)',
        'brutal-lg': '10px 10px 0px 0px rgba(10,10,10,1)',
        'brutal-red': '6px 6px 0px 0px rgba(232,41,28,1)',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}