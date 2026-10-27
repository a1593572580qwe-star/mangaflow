import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#faf9f6",
          100: "#f5f3ef",
          200: "#eae6df",
          300: "#ded7cb",
          400: "#cfc4b2",
          500: "#b8a992",
        },
        ink: {
          50: "#f4f4f5",
          100: "#e4e4e7",
          200: "#d4d4d8",
          300: "#a1a1aa",
          400: "#71717a",
          500: "#52525b",
          600: "#3f3f46",
          700: "#27272a",
          800: "#18181b",
          900: "#0f0f11",
          950: "#09090b",
        },
        vermilion: {
          50: "#fff1f1",
          100: "#ffdfdf",
          200: "#ffc5c5",
          300: "#f99b9b",
          400: "#f36464",
          500: "#e63939",
          600: "#cf2323",
          700: "#ab1919",
          800: "#8c1818",
          900: "#741b1b",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Noto Sans SC'",
          "sans-serif",
        ],
        mono: ["Consolas", "Monaco", "'Courier New'", "monospace"],
        manga: ["'Noto Sans SC'", "'Hiragino Sans GB'", "'Microsoft YaHei'", "sans-serif"],
      },
      boxShadow: {
        manga: "0 2px 0 0 rgba(15, 15, 17, 0.9)",
        "manga-lg": "0 4px 0 0 rgba(15, 15, 17, 0.9)",
        "manga-card": "2px 2px 0 0 rgba(15, 15, 17, 0.8)",
      },
    },
  },
  plugins: [],
};
export default config;
