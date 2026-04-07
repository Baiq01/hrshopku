/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Soft pink brand palette
        primary: '#e8b4c9', // main brand color (soft pink)
        accent: '#f9e1e9',  // very light pink accent
        brandpink: {
          50:  '#fdf7fa',
          100: '#fbeff4',
          200: '#f6dbe6',
          300: '#f0c6d7',
          400: '#e9adc6',
          500: '#e093b5',
          600: '#d374a0',
          700: '#b45389',
          800: '#8e3e6e',
          900: '#6a2d52',
        }
      },
      borderRadius: {
        'xl': '1rem',
      },
      boxShadow: {
        card: '0 6px 20px rgba(0,0,0,0.06)'
      }
    },
  },
  plugins: [],
}