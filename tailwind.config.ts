import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        black: "#1A1A1A",
        white: "#FFFFFF",
        "gray-light": "#F5F5F5",
        "gray-mid": "#E8E8E8",
        "gray-text": "#666666",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
};

export default config;

