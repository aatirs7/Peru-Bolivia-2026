import type { Config } from "tailwindcss";

// Core surfaces/text/accents are CSS variables (RGB triplets in globals.css)
// so dark mode flips the whole app; andes/gold/alert accents stay literal and
// get targeted dark: overrides where used.
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bone: v("--c-bg"),
        card: v("--c-card"),
        sand: {
          50: v("--c-bg"),
          100: v("--c-panel"),
          200: v("--c-line"),
          300: v("--c-line-2"),
        },
        clay: {
          50: v("--c-clay-50"),
          100: v("--c-clay-100"),
          200: v("--c-clay-200"),
          300: v("--c-clay-300"),
          400: v("--c-clay-400"),
          500: v("--c-clay-500"),
          600: v("--c-clay-600"),
          700: v("--c-clay-700"),
          800: v("--c-clay-800"),
        },
        ink: {
          DEFAULT: v("--c-ink"),
          soft: v("--c-ink-soft"),
          faint: v("--c-ink-faint"),
        },
        andes: {
          100: "#E2E9E2",
          400: "#6B8A72",
          600: "#44604F",
          800: "#2D4237",
        },
        gold: {
          100: "#F4E9D2",
          400: "#C9973E",
          600: "#9C7422",
        },
        alert: {
          100: "#F6E2DE",
          300: "#DA8E7B",
          600: "#A03B2C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43,35,32,0.04), 0 6px 20px -12px rgba(43,35,32,0.10)",
        lift: "0 2px 6px rgba(43,35,32,0.06), 0 12px 32px -16px rgba(43,35,32,0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
