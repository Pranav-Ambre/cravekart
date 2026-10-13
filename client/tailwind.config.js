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
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // Main Brand Orange
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          DEFAULT: '#F97316',
        },
        secondary: {
          DEFAULT: '#242424',
          light: '#333333',
        },
        surface: '#FFFFFF',
        background: '#FAFAF8',
        dark: {
          primary: '#222222',
          secondary: '#737373',
          muted: '#9CA3AF',
        },
        border: '#E5E7EB',
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(249, 115, 22, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 30px 0 rgba(0, 0, 0, 0.08)',
        'modal': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
