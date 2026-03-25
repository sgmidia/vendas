/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#4647d3',
        'primary-dim': '#3939c7',
        'primary-container': '#9396ff',
        'on-primary': '#f4f1ff',
        'on-primary-container': '#0a0081',
        'secondary': '#00628c',
        'secondary-container': '#a4d8ff',
        'on-secondary': '#e9f4ff',
        'tertiary': '#006947',
        'tertiary-container': '#69f6b8',
        'on-tertiary-container': '#005a3c',
        'surface': '#faf4ff',
        'surface-dim': '#d8ceff',
        'surface-bright': '#faf4ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f4eeff',
        'surface-container': '#ece4ff',
        'surface-container-high': '#e6deff',
        'surface-container-highest': '#e1d8ff',
        'surface-variant': '#e1d8ff',
        'surface-tint': '#4647d3',
        'on-surface': '#302950',
        'on-surface-variant': '#5e5680',
        'outline': '#79719d',
        'outline-variant': '#b0a7d6',
        'error': '#b41340',
        'error-container': '#f74b6d',
        'on-error': '#ffefef',
        'background': '#faf4ff',
        'on-background': '#302950',
        'inverse-surface': '#0f072e',
        'inverse-primary': '#8083ff'
      },
      fontFamily: {
        'headline': ['Manrope', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'label': ['Inter', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px'
      },
      boxShadow: {
        'card': '0 20px 40px rgba(48, 41, 80, 0.06)',
        'card-sm': '0 8px 24px rgba(48, 41, 80, 0.04)'
      }
    }
  },
  plugins: []
};
