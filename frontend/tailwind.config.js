/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact Color Palette Extracted From JAN YATRA Logo
        navy: {
          50: '#eef3fb',
          100: '#d5e2f7',
          200: '#adc7f0',
          300: '#75a3e6',
          400: '#3878da',
          500: '#1756be',
          600: '#0b3f9b',
          700: '#06307a',
          800: '#00205B', // Primary Logo Navy Blue
          900: '#02163d',
          950: '#010c24',
        },
        saffron: {
          50: '#fff5ee',
          100: '#ffe6d6',
          200: '#ffc9ab',
          300: '#ffa275',
          400: '#ff6f38',
          500: '#F46522', // Primary Logo Saffron Orange
          600: '#e04910',
          700: '#ba350d',
          800: '#942c12',
          900: '#772713',
        },
        forest: {
          50: '#f0fbf4',
          100: '#daf6e4',
          200: '#b7ecc9',
          300: '#84dda5',
          400: '#4bc57a',
          500: '#25a85b',
          600: '#188947',
          700: '#0D6938', // Primary Logo Forest Green
          800: '#0f532f',
          900: '#0e4528',
          950: '#062615',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 32, 91, 0.08)',
        saffron: '0 4px 20px 0 rgba(244, 101, 34, 0.35)',
        forest: '0 4px 20px 0 rgba(13, 105, 56, 0.30)',
        navy: '0 4px 20px 0 rgba(0, 32, 91, 0.35)',
      }
    },
  },
  plugins: [],
}
