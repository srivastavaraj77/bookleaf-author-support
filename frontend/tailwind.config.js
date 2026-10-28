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
          50: '#f2f7f3',
          100: '#e1ede4',
          200: '#c5dccb',
          300: '#9ec4a7',
          400: '#72a57e',
          500: '#50885e',
          600: '#3c6e49',
          700: '#31573c',
          800: '#2a4632',
          900: '#172c1e',
          950: '#0c1810',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#080d19',
        },
        amber: {
          DEFAULT: '#d97706',
          gold: '#c28833',
          foil: '#b45309',
        },
        paper: {
          50: '#fdfcf9',
          100: '#f8f6f0',
          200: '#efebe1',
          300: '#e2dcce',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 2px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.07), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
