/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paper-white': '#F9FAFB',
        'mint-glaze': 'rgba(34, 197, 94, 0.25)',
        'coral-wash': 'rgba(244, 63, 94, 0.25)',
        'amber-glaze': 'rgba(245, 158, 11, 0.25)',
        'mint-solid': '#22c55e',
        'coral-solid': '#f43f5e',
        'amber-solid': '#f59e0b',
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
