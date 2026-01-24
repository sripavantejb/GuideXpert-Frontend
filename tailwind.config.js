/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: {
            50: '#f0f5fa',
            100: '#e0ebf5',
            200: '#c2d7eb',
            300: '#85b3d9',
            400: '#4d8ec7',
            500: '#003366',
            600: '#003366',
            700: '#003366',
            800: '#003366',
            900: '#003366',
          },
        },
        accent: {
          yellow: {
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
          },
          gold: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
}

