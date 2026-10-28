/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Ink Navy (Primary brand identity)
        ink: {
          50: '#f2f5f9',
          100: '#e1e8f0',
          200: '#c5d3e3',
          300: '#9bb5cf',
          400: '#6d92b8',
          500: '#4c749f',
          600: '#3a5c83',
          700: '#2f4a6b',
          800: '#1e324a',
          900: '#112033',
          950: '#0a1424',
        },
        // Muted Teal (Secondary publishing accent)
        teal: {
          50: '#f0f7f7',
          100: '#daf0f0',
          200: '#b8e2e3',
          300: '#87cfd1',
          400: '#51b4b7',
          500: '#34979b',
          600: '#277a7e',
          700: '#226266',
          800: '#1f4f52',
          900: '#1d4245',
          950: '#0e2628',
        },
        // Warm Ivory & Neutral Canvas
        ivory: {
          50: '#fdfdfb',
          100: '#fcfbf7', // Warm ivory page background
          200: '#f5f3eb',
          300: '#ebe6d9',
          400: '#ded7c3',
          500: '#ccbf9f',
        },
        // Burnished Brass / Restrained Amber (Highlights)
        brass: {
          50: '#fdf9f2',
          100: '#f8eedc',
          200: '#f1dab6',
          300: '#e7c088',
          400: '#d9a154',
          500: '#c7852c',
          600: '#b16a22',
          700: '#8e4f1d',
          800: '#733f1c',
          900: '#5f3519',
        },
        // Semantic aliases
        leaf: {
          50: '#f0f7f7',
          100: '#daf0f0',
          200: '#b8e2e3',
          300: '#87cfd1',
          400: '#51b4b7',
          500: '#34979b',
          600: '#277a7e',
          700: '#226266',
          800: '#1f4f52',
          900: '#112033',
          950: '#0a1424',
        },
        amber: {
          DEFAULT: '#c7852c',
          gold: '#c7852c',
          foil: '#b16a22',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(10, 20, 36, 0.03)',
        'xs': '0 1px 2px 0 rgba(10, 20, 36, 0.05)',
        'subtle': '0 1px 3px 0 rgba(10, 20, 36, 0.04), 0 1px 2px -1px rgba(10, 20, 36, 0.04)',
        'card': '0 2px 8px -1px rgba(10, 20, 36, 0.05), 0 2px 4px -2px rgba(10, 20, 36, 0.04)',
        'elevated': '0 12px 28px -6px rgba(10, 20, 36, 0.09), 0 8px 12px -6px rgba(10, 20, 36, 0.04)',
      }
    },
  },
  plugins: [],
}
