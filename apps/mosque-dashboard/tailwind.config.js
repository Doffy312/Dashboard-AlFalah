import formsPlugin from '@tailwindcss/forms';
import containerQueriesPlugin from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b131a", // Deep dark blue background
        surface: "#111a24", // Slightly lighter dark blue for cards
        "surface-variant": "#1a2432", // Lighter variant for hovers/borders
        primary: "#10b981", // Emerald green
        "primary-container": "rgba(16, 185, 129, 0.1)", // Transparent emerald
        "on-primary": "#ffffff",
        secondary: "#059669",
        "secondary-container": "rgba(5, 150, 105, 0.1)",
        error: "#f43f5e",
        "error-container": "rgba(244, 63, 94, 0.1)",
        tertiary: "#3b82f6", // Blue accent
        "tertiary-container": "rgba(59, 130, 246, 0.1)",
        "on-surface": "#ffffff",
        "on-surface-variant": "#9ca3af",
        outline: "#374151",
        "outline-variant": "rgba(255, 255, 255, 0.05)",
        // Keep some of the old ones just in case to prevent breaking
        "surface-dim": "#0b131a",
        "surface-bright": "#1a2432",
        "primary-fixed": "#10b981",
        "on-error": "#ffffff",
        "emerald-deep": "#047857",
        "light-bg": "#f8fafc",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        base: "4px",
        md: "24px",
        lg: "32px",
        "container-max": "1440px",
        gutter: "24px",
        "sidebar-width": "280px",
        sm: "16px",
        xs: "8px",
        xl: "48px"
      },
      fontFamily: {
        "label-md": ["Inter"],
        "body-md": ["Inter"],
        "headline-lg-mobile": ["Inter"],
        "display-lg": ["Inter"],
        "body-sm": ["Inter"],
        "title-md": ["Inter"],
        "headline-lg": ["Inter"],
        headline: ["Inter"],
        display: ["Inter"],
        body: ["Inter"],
        label: ["Inter"],
        playfair: ['"Playfair Display"', "serif"],
      },
      fontSize: {
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "title-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }]
      }
    },
  },
  plugins: [
    formsPlugin,
    containerQueriesPlugin
  ],
}
