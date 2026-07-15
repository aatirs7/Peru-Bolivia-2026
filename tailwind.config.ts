import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // quiet bone / terracotta / deep-brown palette
        bone: "#FAF8F4",
        sand: {
          50: "#FAF8F4",
          100: "#F3EFE7",
          200: "#E7DFD2",
          300: "#D5C9B6",
        },
        clay: {
          50: "#F8EFE9",
          100: "#F0DDD1",
          200: "#DFB89F",
          300: "#CC8B63",
          400: "#BC6A3D",
          500: "#A9532D",
          600: "#8F4426",
          700: "#71351E",
          800: "#522716",
        },
        ink: {
          DEFAULT: "#2B2320",
          soft: "#5D5148",
          faint: "#95887B",
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
          600: "#A03B2C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "system-ui", "sans-serif"],
        body: ["var(--font-sans)", "-apple-system", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "-apple-system", "system-ui", "sans-serif"],
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
