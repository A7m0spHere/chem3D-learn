import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F7FAF9",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#2A9D8F",
          dark: "#1F6F68",
        },
        accent: "#F4A261",
        text: {
          primary: "#1F2933",
          secondary: "#64748B",
        },
        border: "#DDE7E4",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        panel: "0 14px 36px rgba(31, 41, 51, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
