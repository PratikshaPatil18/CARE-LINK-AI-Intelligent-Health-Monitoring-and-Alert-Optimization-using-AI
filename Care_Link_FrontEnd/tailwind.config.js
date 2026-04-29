/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        healthcare: {
          primary: '#2563eb',    // Professional blue
          secondary: '#0891b2',  // Calm cyan
          accent: '#10b981',     // Trustworthy green
          dark: '#1e293b',       // Deep slate
          light: '#f8fafc',      // Clean white-blue
        },
        medical: {
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
        },
      },
      fontSize: {
        // Larger base sizes for elderly users
        'base': '18px',
        'lg': '20px',
        'xl': '22px',
        '2xl': '26px',
        '3xl': '32px',
        '4xl': '38px',
        '5xl': '48px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'hover': '0 8px 20px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

