import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // warm andean palette
        sand: {
          50: "#FBF7F0",
          100: "#F6EFE2",
          200: "#EDE1CC",
          300: "#E0CEB0",
        },
        clay: {
          50: "#FBEEE6",
          100: "#F6DCCB",
          200: "#EBB794",
          300: "#DE8F5F",
          400: "#CF6B35",
          500: "#B8542F",
          600: "#9C4426",
          700: "#7C351F",
          800: "#5C2817",
        },
        ink: {
          DEFAULT: "#2D2420",
          soft: "#5C4F45",
          faint: "#8A7A6D",
        },
        andes: {
          100: "#DCE7DD",
          400: "#5F8268",
          600: "#3E5C4B",
          800: "#2A4034",
        },
        gold: {
          100: "#F7E8C8",
          400: "#D9A441",
          600: "#B07E24",
        },
        alert: {
          100: "#FADFDB",
          600: "#B3402F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(45,36,32,0.06), 0 8px 24px -12px rgba(45,36,32,0.18)",
        hero: "0 2px 4px rgba(92,40,23,0.08), 0 16px 40px -16px rgba(92,40,23,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
