import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'IRAN Sans X'", "'Vazir'", "sans-serif"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: ["class", '[data-theme="dark"]'],
  plugins: [heroui({
      addCommonColors: true,
    })],
}

module.exports = config;