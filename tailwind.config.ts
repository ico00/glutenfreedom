import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        /**
         * EXISTING COLORS (NE DIRATI)
         * koristiš ih već u appu
         */
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },

        neutral: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },

        /**
         * GLUTEN FREEDOM – SEMANTIČKE BOJE
         * NOVI namespace → nema konflikta
         */
        gf: {
          bg: {
            DEFAULT: "#F9FAF7",
            card: "#FFFFFF",
            soft: "#E6E1D6",
          },

          safe: "#3FAE6C",
          caution: "#E6B566",
          risk: "#C96A6A",

          cta: {
            DEFAULT: "#3C7D7B",
            hover: "#326A68",
          },

          text: {
            primary: "#2F3A34",
            secondary: "#6B7C73",
            muted: "#9CA6A0",
          },
        },
      },
    },
  },

  plugins: [],
};

export default config;
