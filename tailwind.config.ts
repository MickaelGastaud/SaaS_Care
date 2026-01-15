module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#d85940',
          light: '#e57560',
          dark: '#c04330'
        },
        secondary: {
          DEFAULT: '#74ccc3',
          light: '#8fd9d1',
          dark: '#5cb8ae'
        },
        accent: {
          DEFAULT: '#a5fce8',
          light: '#b8fded',
          dark: '#92fbe3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}