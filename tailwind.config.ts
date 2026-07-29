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
          DEFAULT: "#e4393c",
          dark: "#c62d30",
          light: "#ea5f61",
        },
        panel: "#ffffff",
        surface: "#f4f4f5",
        ink: {
          900: "#1c1c1e",
          700: "#3a3a3d",
          500: "#6b6b6f",
          300: "#a3a3a7",
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
