/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Single typeface across the whole app — Montserrat
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        // We map "display" to the same family so any old usages keep working
        display: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Page surface — neutral, never warm
        paper: {
          DEFAULT: "#F8FAFC",
          dim: "#EEF2F7",
          line: "#E2E8F0",
        },
        ink: {
          DEFAULT: "#111827",
          soft: "#374151",
          muted: "#6B7280",
        },
        // Backpackervun brand navy — primary brand color (the logo navy)
        navy: {
          50:  "#EAF1F8",
          100: "#CFDDEB",
          200: "#9DBAD7",
          300: "#6A93BC",
          400: "#1D5C8C", // secondary
          500: "#0B3C5D", // ← primary
          600: "#082D45",
          700: "#051E2E",
        },
        // Soft sky accent
        accent: {
          50:  "#EBF4FE",
          100: "#D7E9FD",
          200: "#A5CBF6",
          300: "#7AB1F0",
          400: "#4A90E2", // accent
          500: "#2C73C5",
          600: "#1F58A0",
        },
        // Category tag colors (kept — these are data viz, not brand)
        cat: {
          transport:  "#3B82F6",
          meals:      "#F59E0B",
          attraction: "#10B981",
          hotel:      "#8B5CF6",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 60, 93, 0.04), 0 4px 12px rgba(11, 60, 93, 0.06)",
        card: "0 1px 3px rgba(11, 60, 93, 0.05), 0 8px 24px rgba(11, 60, 93, 0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
