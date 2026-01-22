import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "background-light": "var(--color-background-light)",
        "background-dark": "var(--color-background-dark)",
        "surface-light": "var(--color-surface-light)",
        "surface-dark": "var(--color-surface-dark)",
        "text-light": "var(--color-text-light)",
        "text-dark": "var(--color-text-dark)",
        "text-muted-light": "var(--color-text-muted-light)",
        "text-muted-dark": "var(--color-text-muted-dark)",
        "border-light": "var(--color-border-light)",
        "border-dark": "var(--color-border-dark)",
        "card-light": "var(--color-card-light)",
        "card-dark": "var(--color-card-dark)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
      },
      boxShadow: {
        'subtle': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
        'subtle-dark': '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
      },
      height: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}