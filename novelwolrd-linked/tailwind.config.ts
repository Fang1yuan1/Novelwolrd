import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#e5353e",
          dark: "#c9232b",
          light: "#f0565e",
        },
        panel: "#ffffff",
        surface: "#f5f5f5",
        ink: {
          900: "#191919",
          700: "#333333",
          500: "#666666",
          300: "#999999",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "PingFang SC",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        shell: "1600px",
      },
    },
  },
  plugins: [],
};

export default config;
