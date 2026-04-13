import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        gold: "#C8860A",
        "gold-dark": "#A86D08",
        "gold-light": "#F0A500",
        "sacred-orange": "#D4722A",
        cream: "#FDFAF5",
        warm: "#FFF8EE",
        muted: "#6B5E4E",
      },
      fontFamily: {
        cormorant: ["Cormorant Garamond", "serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
};

export default config;

