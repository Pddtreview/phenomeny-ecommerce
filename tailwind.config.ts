import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        black: "#2A1B12",
        white: "#FFF8F0",
        primary: "#FF7A00",
        secondary: "#E91E63",
        accent: "#FFC247",
        "gray-light": "#FFF2E5",
        "gray-mid": "#F0DEC8",
        "gray-text": "#6D5447",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
};

export default config;

