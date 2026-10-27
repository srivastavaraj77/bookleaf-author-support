/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f4f7f4',
          100: '#e5ece5',
          200: '#ccdacc',
          300: '#a6c0a6',
          400: '#7a9f7a',
          500: '#588258',
          600: '#436843',
          700: '#365336',
          800: '#2d432d',
          900: '#1b2c1b',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        },
        amber: {
          DEFAULT: '#d97706',
          gold: '#c28833',
        },
        paper: {
          50: '#fdfbf7',
          100: '#f7f4ed',
          200: '#ece6d9',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
